import React, { useState } from "react";
import { Briefcase, Plus, Sparkles, Trash2, Loader2 } from "lucide-react"; // Maine Loader2 ko upar hi merge kar diya hai
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../configs/api";

const ExperienceForm = ({ data, onChange }) => {
  const { token } = useSelector(state => state.auth);
  const [generatingIndex, setGeneratingIndex] = useState(-1);

  const addExperience = () => {
    const newExperience = {
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
    };

    onChange([...data, newExperience]);
  };

  // 👇 Yahan aayega apka AI Enhance wala function 👇
  const generateDescription = async (index) => {
    const experience = data[index];

    if (!experience.description || experience.description.trim() === "") {
      toast.error("Please write a few words about your job first!");
      return;
    }

    try {
      setGeneratingIndex(index); 
      
      const prompt = `You are an expert resume writer. Enhance this job description: "${experience.description}" for the position of ${experience.position} at ${experience.company}. 
Make it sound professional, highlight achievements, use strong action verbs, and keep it ATS-friendly.
CRITICAL INSTRUCTION: Return ONLY the enhanced bullet points. DO NOT include any introductory text. Just give me the raw text.`;

      const response = await api.post(
        '/api/ai/enhance-job-desc',
        { userContent: prompt },
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      const enhancedText = response.data.enhancedContent;
      const updatedData = [...data];
      updatedData[index].description = enhancedText;

      // Data save kar diya gaya parent component mein
      onChange(updatedData);
      toast.success("Job description enhanced!");
      
    } catch (error) {
      console.error("FULL ERROR DETAILS:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to enhance description.";
      toast.error(errorMessage);
    } finally {
      setGeneratingIndex(-1); 
    }
  };

  // Iske neeche aapke baaki functions honge jaise (handleExperienceChange, removeExperience) 
  // aur aapka return () jisme HTML/JSX hai.
  const removeExperience = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };
// Component ke andar sabse upar (jahan baaki states hain) yeh line zaroor honi chahiye:
// const { token } = useSelector(state => state.auth);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Briefcase className="size-5" />
            Professional Experience
          </h3>
          <p className="text-sm text-gray-500">
            Add your job experience
          </p>
        </div>

        <button
          type="button"
          onClick={addExperience}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Plus className="size-4" />
          Add Experience
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No work experience added yet.</p>
          <p className="text-sm">
            Click "Add Experience" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((experience, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium">
                  Experience #{index + 1}
                </h4>

                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={experience.company}
                  onChange={(e) =>
                    updateExperience(index, "company", e.target.value)
                  }
                  className="px-3 py-2 border rounded-lg"
                />

                <input
                  type="text"
                  placeholder="Job Title"
                  value={experience.position}
                  onChange={(e) =>
                    updateExperience(index, "position", e.target.value)
                  }
                  className="px-3 py-2 border rounded-lg"
                />

                <input
                  type="month"
                  value={experience.start_date}
                  onChange={(e) =>
                    updateExperience(index, "start_date", e.target.value)
                  }
                  className="px-3 py-2 border rounded-lg"
                />

                <input
                  type="month"
                  value={experience.end_date}
                  onChange={(e) =>
                    updateExperience(index, "end_date", e.target.value)
                  }
                  className="px-3 py-2 border rounded-lg disabled:bg-gray-100"
                disabled={experience.is_current}

                />
              </div>

            
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={experience.is_current|| false}
                  onChange={(e) =>
                  {  updateExperience(index, "is_current", e.target.checked?true:false)
                  }} 
                />
                <span className='text-sm text-gray-700'>Currently working here</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   
                <label className="text-sm font-medium text-gray-700">"Job Description"</label>
                <button onClick={()=>generateDescription(index)} disabled={generatingIndex===index || !experience.position || !experience.company} className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hocer:bg-purple-200 transition-colors disabled:opacity-50">
                  {generatingIndex===index ?(<Loader2 className="w-3 h-3 animate-spin" />
                  ):(
                    <Sparkles className="w-3 h-3" />
                  )}

                    Enhance with AI
               </button>
                </div>
                 <textarea
                placeholder="Describe your key responsibilties and achievements..."
                value={experience.description || ""}
                onChange={(e) =>
                  updateExperience(index, "description", e.target.value)
                }
                className="w-full text-sm px-3 py-2 border rounded-lg resize-none"
                rows={4}
              />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceForm;