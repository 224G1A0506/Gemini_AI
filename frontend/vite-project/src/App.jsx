import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/Customize2';


function App() {
  const context = useContext(userDataContext)
  
  // Safety check - if context is not available, show loading or error
  if (!context) {
    return <div>Context not available - check UserContext provider</div>
  }
  
  const { userData, setUserData } = context
  
  console.log('App context:', context)
  console.log('App userData:', userData)
  
  return (
    <Routes>
      <Route path='/' element={(userData?.assistantImage && userData?.assistantName)?<Home/>:<Navigate to={"/customize"}/>}/>
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
      <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signup"}/>}/>
      <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signup"}/>}/>
    </Routes>
  )
}

export default App