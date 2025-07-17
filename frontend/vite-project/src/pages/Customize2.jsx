import React, { useContext, useState } from 'react'
import axios from 'axios'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdKeyboardBackspace } from 'react-icons/md'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom';

function Customize2() {
    const navigate = useNavigate()
    const { userData, backendImage, selectedImage, serverUrl, setUserData } = useContext(userDataContext)
    const [assistantName, setAssistantName] = useState(userData?.assistantName || "")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleUpdateAssistant = async () => {
        setError("")
        setLoading(true)
        try {
            let formData = new FormData()
            formData.append("assistantName", assistantName)
            if (backendImage) {
                formData.append("assistantImage", backendImage)
            } else if (selectedImage) {
                formData.append("imageUrl", selectedImage)
            }
            const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true }) // Required for authentication cookies
            setUserData(result.data)
            setLoading(false)
            navigate("/")
        } catch (error) {
            setLoading(false)
            setError("Failed to update assistant. Please try again.")
        }
    }

    return (
        <div className='w-full h-[100vh] bg-gradient-to-t from-black via-[#101010] to-[#030353] flex justify-center items-center flex-col relative'>
            <button
                onClick={() => navigate('/customize')}
                style={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                aria-label="Back to Customize"
            >
                <MdKeyboardBackspace size={32} color="#fff" />
            </button>
            <h1 className='text-white text-[30px]'>Enter your <span className='text-blue-400'>Assistant Name</span></h1>
            <div className='w-[300px] h-[50px] mt-[20px] relative'>
                <input type="text" className='w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 pl-[10px] text-[18px] rounded-full' placeholder='eg. siri' required onChange={(e) => {
                    setAssistantName(e.target.value)
                }} value={assistantName} />
                {assistantName && (
                    <button className='min-w-[300px] h-[60px] mt-[30px] bg-white text-black font-semibold rounded-full text-[19px] cursor-pointer hover:bg-gray-100 transition-colors' onClick={handleUpdateAssistant} disabled={loading}>
                        {loading ? "Creating..." : "Finally Create Your Assistant"}
                    </button>
                )}
                <div className='absolute right-2 top-2 text-white text-[20px] px-[10px] py-[10px] rounded-full bg-white text-black'>
                    <BsFillPersonFill />
                </div>
                {error && <div className='text-red-500 mt-2'>{error}</div>}
            </div>
        </div>
    )
}

export default Customize2