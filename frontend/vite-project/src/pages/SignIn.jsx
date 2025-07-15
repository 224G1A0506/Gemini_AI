import React, { useContext, useState } from 'react'
import bg from "../assets/4.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from 'axios'

function SignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const {serverUrl,userData, setUserData}=useContext(userDataContext)
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [loading,setLoading]=useState("")
    const [password, setPassword] = useState("")
    const [err,setErr]=useState("")

    const handleSignIn = async(e) => {
        e.preventDefault()
        setErr("")
        setLoading(true)
        try{
            let result=await axios.post(`${serverUrl}/api/auth/signin`,{
                email,password
            },{withCredentials:true})
            setUserData(result.data)
            setLoading(false)
            navigate("/")

        } catch (error){
            console.log(error)
            setLoading(false)
            setUserData(null)

            if(error.response && error.response.data && error.response.data.message){
                setErr(error.response.data.message)
            } else {
                setErr("An unexpected error occurred.")
            }

        }
        
    }

    return (
        <div 
            className='w-full h-[100vh] bg-cover bg-no-repeat flex justify-center items-center' 
            style={{
                backgroundImage: `url(${bg})`,
                backgroundPosition: 'center 20%'
            }} 
        >
            <form 
                className='w-[90%] h-[500px] max-w-[500px] bg-[#00000069] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[30px] rounded-lg p-8 px-[20px]'
                onSubmit={handleSignIn}
            >
                <h1 className='text-white text-[32px] font-bold text-center mb-[30px]'>
                    Sign In to <span className='text-blue-400'>Virtual Assistant</span>
                </h1>
                
                <input 
                    type="email" 
                    placeholder='Email' 
                    className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
                    required 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email}
                />
                
                <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative'>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder='Password' 
                        className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]' 
                        required 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                    />
                    {!showPassword && (
                        <IoEye 
                            className='absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer' 
                            onClick={() => setShowPassword(true)}
                        />
                    )}
                    {showPassword && (
                        <IoEyeOff 
                            className='absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer' 
                            onClick={() => setShowPassword(false)}
                        />
                    )}
                </div>
                {err.length>0 && <p className='text-red-500'>
                    *{err}</p>}
                
                <button 
                    type="submit"
                    className='min-w-[150px] h-[60px] mt-[30px] bg-white text-black font-semibold rounded-full text-[19px] cursor-pointer hover:bg-gray-100 transition-colors' disabled={loading}
                >
                   {loading?"Loading...":" Sign In"}
                </button>
                
                <p className='text-white text-[18px] cursor-pointer' onClick={() => navigate("/signup")}>
                    Want to create a new account? <span className='text-blue-400 hover:text-blue-300'>Sign Up</span>
                </p>
            </form>
        </div>
    )
}

export default SignIn