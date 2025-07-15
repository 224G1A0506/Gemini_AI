import User from "../models/user.model.js"
import geminiResponse from "../gemini.js"
import uploadOnCloudinary  from "../config/cloudinary.js"
   
import moment from "moment"
import { exec } from "child_process";
import axios from "axios"

export const getCurrentUser=async (req,res)=>{
    try{
        const userId=req.userId
        const user=await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        return res.status(200).json(user)
    }catch (error){
        return res.status(400).json({message:"get current user error"})
    }

}
export const updateAssistant=async (req,res)=>{
    try{
        const userId=req.userId
        const {assistantName,imageUrl}=req.body
        let assistantImage;
        if(req.file){
            assistantImage=await uploadOnCloudinary(req.file.path)
        }else{
            assistantImage=imageUrl
        }
        const user=await User.findByIdAndUpdate(req.userId,{
            assistantName,assistantImage
        },{new:true}).select("-password")
        return res.status(200).json(user)
        
    } catch (error){
        return res.status(400).json({message:"update assistant name error"})
    }
}
export const askToAssistant=async (req,res)=>{
    try{
        const user=await User.findById(req.userId)
        const {command}=req.body
        const userName=user.name
        const assistantName=user.assistantName
        const result=await geminiResponse(command,assistantName,userName)
        console.log('Gemini raw result:', result);
        if (!result || typeof result !== 'string' || !result.trim()) {
            return res.status(200).json({
                type: 'general',
                userInput: command,
                response: "Sorry, I couldn't get a response from the assistant. Please try again later."
            });
        }
        const jsonMatch=result.match(/{[\s\S]*}/)
        if(!jsonMatch){
            // Fallback: return the raw result as the assistant's response
            return res.status(200).json({
                type: 'general',
                userInput: command,
                response: result ? result.trim() : "Sorry, I couldn't understand or process your request."
            });
        }
            const gemResult=JSON.parse(jsonMatch[0])
            const type=gemResult.type
           switch(type){
            case 'get-date':
            case 'get_date':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:`current date is ${moment().format('YYYY-MM-DD')}`
                });
                case 'get-time':
                case 'get_time':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:`current time is ${moment().format('hh:mm A')}`
                });
                case 'get-day':
                case 'get_day':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:`Today is ${moment().format('dddd')}`
                });
                case 'get-month':
                case 'get_month':
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:`current month is ${moment().format('MMMM')}`
                });
                case 'youtube-search':
                case 'youtube-play':
                case 'general':
                case 'calculator_open':
                case 'instagram_open':
                case 'facebook_open':
                case 'google_search':
                    return res.json({
                        type,
                        userInput:gemResult.userInput,
                        response:gemResult.response
                    });
                case 'news': {
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: "News feature is temporarily unavailable."
                    });
                }
                case 'weather': {
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: "Weather feature is temporarily unavailable."
                    });
                }
                case 'open_settings':
                    exec('start ms-settings:', (err) => {
                        if (err) console.error(err);
                    });
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: 'Opening Windows Settings.'
                    });
                case 'open_cmd':
                    exec('start cmd', (err) => {
                        if (err) console.error(err);
                    });
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: 'Opening Command Prompt.'
                    });
                case 'open_calculator':
                    exec('start calc', (err) => {
                        if (err) console.error(err);
                    });
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: 'Opening Calculator.'
                    });
                case 'open_notepad':
                    exec('start notepad', (err) => {
                        if (err) console.error(err);
                    });
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: 'Opening Notepad.'
                    });
                case 'open_explorer':
                    exec('start explorer', (err) => {
                        if (err) console.error(err);
                    });
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: 'Opening File Explorer.'
                    });
                case 'open_control_panel':
                    exec('start control', (err) => {
                        if (err) console.error(err);
                    });
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: 'Opening Control Panel.'
                    });
                case 'open_task_manager':
                    exec('start taskmgr', (err) => {
                        if (err) console.error(err);
                    });
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: 'Opening Task Manager.'
                    });
                    default:
                        return res.status(400).json({response:"I didn't understand that command."})
           }
        }

    catch (error){
        return res.status(500).json({response:"ask assistant error"})
    }
}