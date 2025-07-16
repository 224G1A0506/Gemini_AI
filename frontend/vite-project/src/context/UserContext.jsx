import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const userDataContext = createContext();

function UserContext({ children }) {
    const serverUrl = "http://localhost:8000";
    const [userData, setUserData] = useState(null);
    
  const [frontendImage,setFrontendImage]=useState(null)
  const [backendImage,setBackendImage]=useState(null)
  const [selectedImage,setSelectedImage]=useState(null)

    const handleCurrentUser = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/current`, {
                withCredentials: true
            });
            setUserData(result.data);
            console.log(result.data)
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Not logged in, set userData to null, don't log as error
                setUserData(null);
            } else {
                console.error('Error fetching user data:', error);
            }
        }
    };
    const getGeminiResponse=async (command)=>{
        const cmd = command.trim().toLowerCase();

        // 1. YouTube: play/search
        const ytPlayMatch = cmd.match(/(?:open youtube and play|play|search)\s+(.+?)(?:\s+song|\s+video)?(?:\s+on youtube)?$/i);
        if (ytPlayMatch && ytPlayMatch[1]) {
            const query = encodeURIComponent(ytPlayMatch[1].trim());
            const url = `https://www.youtube.com/results?search_query=${query}`;
            window.open(url, '_blank');
            return { response: `Searching and playing \"${ytPlayMatch[1].trim()}\" on YouTube!` };
        }
        if (cmd.includes('open youtube')) {
            window.open('https://www.youtube.com/', '_blank');
            return { response: 'Opening YouTube for you!' };
        }

        // 2. Google: search
        const googleMatch = cmd.match(/(?:search|google)\s+(.+?)(?:\s+on google)?$/i);
        if (googleMatch && googleMatch[1]) {
            const query = encodeURIComponent(googleMatch[1].trim());
            const url = `https://www.google.com/search?q=${query}`;
            window.open(url, '_blank');
            return { response: `Searching Google for \"${googleMatch[1].trim()}\"!` };
        }
        if (cmd.includes('open google')) {
            window.open('https://www.google.com/', '_blank');
            return { response: 'Opening Google for you!' };
        }

        // 3. Social Media
        if (cmd.includes('open facebook')) {
            window.open('https://www.facebook.com/', '_blank');
            return { response: 'Opening Facebook for you!' };
        }
        if (cmd.includes('open instagram')) {
            window.open('https://www.instagram.com/', '_blank');
            return { response: 'Opening Instagram for you!' };
        }
        if (cmd.includes('open twitter')) {
            window.open('https://twitter.com/', '_blank');
            return { response: 'Opening Twitter for you!' };
        }
        const instaSearch = cmd.match(/search\s+(.+)\s+on instagram/);
        if (instaSearch && instaSearch[1]) {
            const query = encodeURIComponent(instaSearch[1].trim());
            window.open(`https://www.instagram.com/explore/tags/${query}/`, '_blank');
            return { response: `Searching Instagram for #${instaSearch[1].trim()}` };
        }
        const fbSearch = cmd.match(/search\s+(.+)\s+on facebook/);
        if (fbSearch && fbSearch[1]) {
            const query = encodeURIComponent(fbSearch[1].trim());
            window.open(`https://www.facebook.com/search/top/?q=${query}`, '_blank');
            return { response: `Searching Facebook for ${fbSearch[1].trim()}` };
        }
        const twitterSearch = cmd.match(/search\s+(.+)\s+on twitter/);
        if (twitterSearch && twitterSearch[1]) {
            const query = encodeURIComponent(twitterSearch[1].trim());
            window.open(`https://twitter.com/search?q=${query}`, '_blank');
            return { response: `Searching Twitter for ${twitterSearch[1].trim()}` };
        }

        // 4. General websites
        const openSite = cmd.match(/open\s+([a-z0-9\.-]+)\s*(\.com|\.org|\.in|\.net)?/);
        if (openSite && openSite[1]) {
            let domain = openSite[1];
            let tld = openSite[2] || '.com';
            if (!domain.startsWith('http')) domain = 'https://' + domain + tld;
            window.open(domain, '_blank');
            return { response: `Opening ${domain}` };
        }

        // 5. Time/Date
        if (cmd.includes('what time is it') || cmd.includes("current time")) {
            const now = new Date();
            return { response: `The current time is ${now.toLocaleTimeString()}` };
        }
        if (cmd.includes("what's the date") || cmd.includes("what is the date") || cmd.includes("today's date")) {
            const now = new Date();
            return { response: `Today's date is ${now.toLocaleDateString()}` };
        }

        // 6. Weather (demo)
        const weatherMatch = cmd.match(/weather in ([a-zA-Z ]+)/);
        if (cmd.includes("weather") && weatherMatch && weatherMatch[1]) {
            return { response: `Sorry, live weather is not available in this demo. But you asked for weather in ${weatherMatch[1].trim()}.` };
        }
        if (cmd.includes("weather")) {
            return { response: "Sorry, live weather is not available in this demo." };
        }

        // 7. Jokes/Fun
        if (cmd.includes("joke")) {
            const jokes = [
                "Why did the computer show up at work late? It had a hard drive!",
                "Why do programmers prefer dark mode? Because light attracts bugs!",
                "Why did the developer go broke? Because he used up all his cache!"
            ];
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            return { response: joke };
        }
        if (cmd.includes("inspire") || cmd.includes("motivate")) {
            const quotes = [
                "Believe you can and you're halfway there.",
                "The only way to do great work is to love what you do.",
                "Success is not final, failure is not fatal: It is the courage to continue that counts."
            ];
            const quote = quotes[Math.floor(Math.random() * quotes.length)];
            return { response: quote };
        }

        // Fallback to backend
        try{
            const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{
               command},{withCredentials:true}
        )
        return result.data
        }
        catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        handleCurrentUser();
        // Adding empty dependency array to prevent infinite loop
    }, []);

    const value = {
        serverUrl,userData, setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse
    };

    return (
        <userDataContext.Provider value={value}>
            {children}
        </userDataContext.Provider>
    );
}

export default UserContext;