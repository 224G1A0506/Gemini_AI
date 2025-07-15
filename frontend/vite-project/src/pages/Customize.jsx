import React, { useState, useRef } from 'react'
import { RiImageAddFill } from "react-icons/ri";
import image1 from '../assets/1.png'
import image2 from '../assets/3.png'
import image3 from '../assets/4.png'
import image4 from '../assets/2.png'
import image5 from '../assets/5.png'
import image6 from '../assets/6.png'
import image7 from '../assets/7.png'
import Card from '../components/Card'
import { useContext } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom';
import { MdKeyboardBackspace } from 'react-icons/md'

function Customize() {
const {serverUrl,userData, setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage}=useContext(userDataContext)
  const navigate=useNavigate()
  // Remove inputImage and handleImage for upload
  // const inputImage=useRef()
  // const handleImage=(e)=>{ ... }
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-black via-[#101010] to-[#030353] flex justify-center items-center flex-col relative'>
      <button
        onClick={() => navigate('/')}
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
        aria-label="Back to Home"
      >
        <MdKeyboardBackspace size={32} color="#fff" />
      </button>
      <h1 className='text-white mb-[40px] text-[30px] text-center p-[20px]'>Select your <span className='text-blue-400 hover:shadow-blue-950'>Assistant Image</span>
        </h1>
      <div className='w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[20px]'>

      <Card image={image1}/>
      <Card image={image2}/>
      <Card image={image3}/>
      <Card image={image4}/>
      <Card image={image5}/>
      <Card image={image6}/>
      <Card image={image7}/>
      {/* Removed add image/upload card and file input */}
      </div>
      {selectedImage && selectedImage !== "input" && <button className='min-w-[150px] h-[60px] mt-[30px] bg-white text-black font-semibold rounded-full text-[19px] cursor-pointer hover:bg-gray-100 transition-colors cursor-pointer' onClick={()=>{
        navigate("/customize2")
      }}>Next</button>}
        
    </div>
  )
}

export default Customize