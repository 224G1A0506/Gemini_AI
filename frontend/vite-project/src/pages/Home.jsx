import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import axios from 'axios';
import './Home.css';

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [assistantResponse, setAssistantResponse] = useState('');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // [{role: 'user'|'assistant', text: string}]
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const recognitionRef = useRef(null);
  const [pendingYoutubeUrl, setPendingYoutubeUrl] = useState(null);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-black' : 'bg-white';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate('/signin');
    } catch (error) {
      console.log(error);
      setUserData(null);
    }
  };

  // Speak function using Web Speech API
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = language;
    // Use a specific female voice for certain assistant names or images
    const femaleNames = ['siri', 'alexa', 'emma', 'olivia', 'sophia', 'ava', 'mia'];
    const assistantName = (userData?.assistantName || '').toLowerCase();
    // Check image for female
    let isFemaleImage = false;
    if (userData?.assistantImage) {
      const match = userData.assistantImage.match(/([0-9]+)\.png$/);
      if (match && ['1', '2', '6', '7'].includes(match[1])) {
        isFemaleImage = true;
      }
    }
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    if (femaleNames.includes(assistantName) || isFemaleImage) {
      // Try to pick a female voice for the selected language
      selectedVoice = voices.find(v => v.lang === language && v.gender === 'female')
        || voices.find(v => v.lang === language && v.name.toLowerCase().includes('female'))
        || voices.find(v => v.lang === language && v.name.toLowerCase().includes('zira'))
        || voices.find(v => v.lang === language && v.name.toLowerCase().includes('susan'))
        || voices.find(v => v.lang === language && v.name.toLowerCase().includes('samantha'))
        || voices.find(v => v.lang === language && v.voiceURI && v.voiceURI.toLowerCase().includes('female'))
        || voices.find(v => v.lang === language && v.localService && v.gender === 'female')
        || voices.find(v => v.lang === language && v.name);
    }
    if (!selectedVoice) {
      // Fallback: pick any voice for the selected language
      selectedVoice = voices.find(v => v.lang === language);
    }
    if (!selectedVoice && language !== 'en-US') {
      // Fallback: try English if no voice for the selected language
      selectedVoice = voices.find(v => v.lang === 'en-US');
      utterance.lang = 'en-US';
      console.warn('No voice found for', language, 'falling back to English');
    }
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Initialize recognition only once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = async (event) => {
      // Use the best alternative (highest confidence)
      let bestResult = event.results[event.results.length - 1][0];
      for (let i = 1; i < event.results[event.results.length - 1].length; i++) {
        if (event.results[event.results.length - 1][i].confidence > bestResult.confidence) {
          bestResult = event.results[event.results.length - 1][i];
        }
      }
      const transcript = bestResult.transcript.trim();
      console.log('Transcript:', transcript);

      if (transcript) {
        setChatHistory((prev) => [...prev, { role: 'user', text: transcript }]);
        setLoading(true);
        const data = await getGeminiResponse(transcript);
        setLoading(false);
        if (!data || !data.response) {
          setAssistantResponse("Sorry, I couldn't understand or process your request.");
          setChatHistory((prev) => [...prev, { role: 'assistant', text: "Sorry, I couldn't understand or process your request." }]);
          speak("Sorry, I couldn't understand or process your request.");
          return;
        }
        setAssistantResponse(data.response || '');
        setChatHistory((prev) => [...prev, { role: 'assistant', text: data.response || '' }]);
        if (data.response) speak(data.response);

        // Robust logging for debugging
        console.log('Gemini response:', data);
        const cleanType = (data.type || '').toLowerCase().replace(/_/g, '-');
        const cleanUserInput = (data.userInput || '').replace(userData?.assistantName || '', '').replace(/youtube/gi, '').replace(/play/gi, '').trim();
        const encodedQuery = encodeURIComponent(cleanUserInput);
        setPendingYoutubeUrl(null); // Reset before each action
        // Contact mapping for demo
        const contactMap = {
          kiran: '9876543210',
          // Add more contacts as needed
        };
        if (
          cleanType === "youtube-search" || cleanType === "youtube-play" ||
          (cleanType === "general" && cleanUserInput.toLowerCase().includes("youtube"))
        ) {
          let url = '';
          if (encodedQuery) {
            url = `https://www.youtube.com/results?search_query=${encodedQuery}`;
          } else {
            url = `https://www.youtube.com/`;
          }
          setPendingYoutubeUrl(url);
          // Try to open, but also show link in UI
          window.open(url, '_blank');
        } else if (
          cleanType === "google-search"
        ) {
          window.open(`https://www.google.com/search?q=${encodedQuery}`, '_blank');
        } else if (cleanType === "instagram-open") {
          window.open('https://www.instagram.com', '_blank');
        } else if (cleanType === "facebook-open") {
          window.open('https://www.facebook.com', '_blank');
        } else if (cleanType === "call") {
          // Try to extract the contact name from userInput
          let number = '1234567890'; // default fallback
          const match = (data.userInput || '').toLowerCase().match(/call\s+(\w+)/);
          if (match && contactMap[match[1]]) {
            number = contactMap[match[1]];
          }
          window.open(`tel:${number}`);
        }
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e);
    };

    recognitionRef.current = recognition;
    // Do not start automatically
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [userData, getGeminiResponse, language]);

  // Toggle listening on button click
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Toggle theme
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className={`w-full h-[100vh] flex flex-row ${theme === 'dark' ? 'bg-gradient-to-t from-black via-[#101010] to-[#030353]' : 'bg-gradient-to-t from-white via-gray-100 to-indigo-100'}`}>
      {/* Sidebar (minimal, expandable) */}
      <aside className={`h-full w-20 flex flex-col items-center py-6 px-2 border-r ${theme === 'dark' ? 'bg-[#18122B]/95 border-[#312e81]' : 'bg-white/95 border-gray-200'} shadow-2xl z-30 relative`}>
        {/* Menu button */}
        <button
          className="mb-4 p-2 rounded-full bg-slate-200 hover:bg-slate-300 text-violet-700 text-2xl shadow transition-all"
          onClick={() => setSidebarOpen(true)}
          title="Show menu"
        >
          ☰
        </button>
        {/* Expanded sidebar overlay */}
        {sidebarOpen && (
          <div className={`fixed inset-0 z-40 bg-black/30`} onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed top-0 left-0 h-full w-80 flex flex-col gap-4 py-6 px-4 border-r ${theme === 'dark' ? 'bg-[#18122B]/95 border-[#312e81]' : 'bg-white/95 border-gray-200'} shadow-2xl z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-lg text-violet-700">🗨️ Conversation</span>
            <button className="text-gray-500 hover:text-red-500 text-2xl font-bold" onClick={() => setSidebarOpen(false)}>&times;</button>
          </div>
          {/* Theme toggle */}
          <button
            className={`mb-2 px-4 py-2 rounded-full shadow font-bold text-lg ${theme === 'dark' ? 'bg-white text-violet-700' : 'bg-violet-700 text-white'} hover:scale-105 transition-all`}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
          {/* Language selector */}
          <div className="mb-4 w-full flex flex-col items-center">
            <label htmlFor="lang-select" className="text-xs font-semibold text-violet-700 mb-1">Language</label>
            <select
              id="lang-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-36 px-2 py-1 rounded bg-violet-50 text-violet-900 border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="hi-IN">Hindi</option>
              <option value="te-IN">Telugu</option>
              <option value="fr-FR">French</option>
              <option value="es-ES">Spanish</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="ru-RU">Russian</option>
              <option value="zh-CN">Chinese (Mandarin)</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
            </select>
          </div>
          {/* Customize and Logout */}
      <button
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-base bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow hover:scale-105 hover:shadow-xl transition-all"
        onClick={() => navigate('/customize')}
      >
            <span role="img" aria-label="magic">✨</span>
            Customize
      </button>
         <button
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-base bg-gradient-to-r from-slate-500 to-slate-700 text-white shadow hover:scale-105 hover:shadow-xl transition-all"
            onClick={handleLogOut}
      >
            <span role="img" aria-label="logout">🚪</span>
        Log out
      </button>
          {/* Conversation history */}
          <div className="flex-1 mt-4 w-full flex flex-col gap-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {chatHistory.length === 0 && <div className="text-gray-400 text-center mt-8">No conversation yet.</div>}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-5 py-3 max-w-[80%] text-base shadow-md
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white self-end'
                      : theme === 'dark' ? 'bg-[#ede9fe]/80 text-gray-900 self-start' : 'bg-gray-100 text-gray-900 self-start'}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      {/* Main area */}
      <main className="flex-1 flex flex-col items-center justify-center relative gap-[15px]">
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img
          src={userData?.assistantImage}
            className={`h-full object-cover transition-all duration-300 ${listening || speaking ? 'assistant-avatar-animate' : ''}`}
            alt="Assistant"
          />
        </div>
        {/* Start/Stop Listening Button (now below avatar) */}
        <button
          className={`mt-6 px-8 py-4 rounded-full font-semibold text-lg shadow-lg ${listening ? 'bg-indigo-600 text-white' : 'bg-violet-100 text-violet-700'} hover:bg-indigo-700 hover:text-white transition-all`}
          onClick={toggleListening}
        >
          {listening ? <span className="font-bold">● Listening...</span> : <span className="font-bold">► Start Listening</span>}
        </button>
        {/* Loader spinner */}
        {loading && (
          <div className="flex flex-col items-center mt-4">
            <div className="loader-spinner mb-2"></div>
            <span className="text-violet-300 font-semibold">Thinking...</span>
      </div>
        )}
        <h1 className={`text-[20px] font-semibold mt-6 ${theme === 'dark' ? 'text-white' : 'text-violet-900'}`}>
        I'm {userData?.assistantName}
      </h1>
        {/* Assistant response UI (single latest response) */}
        {assistantResponse && (
          <div className={`mt-8 flex flex-col items-center gap-4 p-6 rounded-xl shadow-lg max-w-lg ${theme === 'dark' ? 'bg-white/10' : 'bg-violet-100/80'}`}>
            <div className={`text-xl font-medium text-center ${theme === 'dark' ? 'text-white' : 'text-violet-900'}`}>{assistantResponse}</div>
            {pendingYoutubeUrl && (
              <a
                href={pendingYoutubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-6 py-2 rounded-full bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition-all text-lg"
              >
                Open YouTube
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
