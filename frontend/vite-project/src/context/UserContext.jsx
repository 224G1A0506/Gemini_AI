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