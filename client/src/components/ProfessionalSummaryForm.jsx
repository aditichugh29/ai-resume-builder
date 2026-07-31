import { Loader2, Sparkles } from 'lucide-react'
import React, { useState } from 'react' // Grouped imports
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import api from '../configs/api'

const ProfessionalSummaryForm = ({ data, onChange, setResumeData }) => {
  const { token } = useSelector(state => state.auth)
  const [isGenerating, setIsGenerating] = useState(false)

 const generateSummary = async () => {
  if (!data || data.trim() === "") {
    toast.error("Please write a few words first!");
    return;
  }

  // 1. CHECK IF TOKEN EXISTS
  console.log("1. Current Token from Redux:", token);
  
  if (!token) {
    toast.error("You are not logged in! Token is missing.");
    return;
  }

  try {
    setIsGenerating(true);
    const prompt = `Enhance my professional summary: "${data}"`;
    
    const payload = { userContent: prompt };
    console.log("2. Sending payload to backend:", payload);

    const response = await api.post(
      '/api/ai/enhance-pro-sum',
      payload,
      { headers: { Authorization: `Bearer ${token}` } } 
      // ^ If this still gives 401, remove the `Bearer ` part.
    );
    
    console.log("3. Backend Success Response:", response.data);
    
    const enhancedText = response.data.enhancedContent;
    onChange(enhancedText); 
    setResumeData(prev => ({
      ...prev,
      professional_summary: enhancedText
    }));
    
    toast.success("Summary enhanced!");
  } catch (error) {
    // 4. PRINT EXACT BACKEND ERROR
    console.error("4. Backend Error Details:", error.response?.data);
    toast.error(error?.response?.data?.message || "Failed to generate summary.");
  } finally {
    setIsGenerating(false);
  }
}

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
            Professional Summary
          </h3>
          <p className='text-sm text-gray-500'>Add Summary for your resume here</p>
        </div>
        
        {/* FIX 4: Added type="button" to prevent accidental page refreshes */}
        <button 
          type="button" 
          disabled={isGenerating} 
          onClick={generateSummary} 
          className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'
        >
          {isGenerating ? (<Loader2 className='size-4 animate-spin'/>) : (<Sparkles className='size-4' />)}
          {isGenerating ? "Enhancing..." : "AI Enhance"}
        </button>
      </div>
      
      <div className='mt-6'>
        <textarea 
          value={data || ""} 
          onChange={(e) => onChange(e.target.value)} 
          rows={7} 
          className='w-full p-3 px-4 mt-2 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none' 
          placeholder='Write a compelling professional summary that highlights your key strength and career objectives...'
        />
        <p className='text-xs text-gray-500 max-w-4/5 mx-auto text-center'>
          Tip: Keep it concise (3-4 sentences) and focus on your most relevant achievements and skills.
        </p>
      </div>
    </div>
  )
}

export default ProfessionalSummaryForm