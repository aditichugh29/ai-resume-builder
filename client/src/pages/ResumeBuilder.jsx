import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print"; // Added this import
import {
  ArrowLeftIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileText,
  FolderIcon,
  GraduationCap,
  Share2Icon,
  Sparkles,
  User,
} from "lucide-react";
import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummaryForm from "../components/ProfessionalSummaryForm";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";
import { useSelector } from "react-redux";
import api from "../configs/api";
import toast from "react-hot-toast";
const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector(state => state.auth);
  
  // 1. Create a reference for the PDF generator
  const resumeRef = useRef();

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  });

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/get/${resumeId}`, {
        headers: { Authorization: token }
      });
      
      if (data.resume) {
        setResumeData(data.resume);
        document.title = data.resume.title;
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    loadExistingResume();
  }, [resumeId]);

const changeResumeVisibility = async () => {
  try {
    // 1. Check karein ki resumeId mil bhi raha hai ya nahi
    console.log("1. Resume ID:", resumeId); 

    const formData = new FormData();
    formData.append("resumeData", JSON.stringify({ public: !resumeData.public }));
    
    // Console log ko bhi sahi route ke sath update kar diya ('resumes')
    console.log("2. Sending Request to:", `/api/resumes/update/${resumeId}`);

    // 🔥 Fix: Syntax theek kiya aur headers (token) wapas add kiya
    const { data } = await api.put(`/api/resumes/update/${resumeId}`, formData, {
      headers: { Authorization: `Bearer ${token}` } // Agar token sirf 'token' ke roop mein bhejte hain, toh `Authorization: token` kar lijiye
    });

    // 3. State update
    setResumeData(prev => ({ 
      ...prev, 
      public: !prev.public 
    }));
    
    toast.success(data?.message || "Visibility updated successfully!");
    
  } catch (error) {
    // 4. Error Handling
    console.error("3. Full Error Details:", error.response?.data || error.message);
    toast.error(error?.response?.data?.message || "Failed to update visibility");
  }
};
  const handleShare = () => {
    const frontendUrl = window.location.href.split("/app/")[0];
    const resumeUrl = `${frontendUrl}/view/${resumeId}`;

    if (navigator.share) {
      navigator.share({
        title: "My Resume",
        text: "Check out my resume!",
        url: resumeUrl,
      });
    } else {
      alert("Share not supported on this browser.");
    }
  };

  // 2. Set up the PDF download function
 const downloadResume = useReactToPrint({
    contentRef: resumeRef, // Pass the ref directly like this
    documentTitle: resumeData?.title || 'My_Resume',
  });
 const saveResume=async()=>
 {
  try {
    let updatedResumeData=structuredClone(resumeData)

    //remove image
    if(typeof resumeData.personal_info.image==='object')
    {
      delete updatedResumeData.personal_info.image
    }
    const formData=new FormData();
    // You don't necessarily need this next line anymore since it's going in the URL, but it doesn't hurt!
    formData.append("resumeId",resumeId) 
    formData.append('resumeData',JSON.stringify(updatedResumeData))
    removeBackground && formData.append("removeBackground","yes");
    typeof resumeData.personal_info.image==='object' && formData.append("image",resumeData.personal_info.image)
    
    // 🔥 THE FIX: Change quotes to backticks and add /${resumeId}
    const{data}=await api.put(`/api/resumes/update/${resumeId}`,formData,{headers:{Authorization:token}})
    
    setResumeData(data.resume)
    toast.success(data.message)
  } catch (error) {
    // This will print the actual error from the backend instead of a generic Axios error
    const backendMessage = error.response?.data?.message || error.message;
    console.error("Backend rejected the save because:", error.response?.data);
    
    // Optional: show it in a toast so you can see it on the screen!
    // toast.error(backendMessage); 
  }
 }
  return (
    <div>
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to="/app"
          className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Panel */}
          <div className="relative lg:col-span-5 rounded-lg overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1">
              {/* Progress Bar */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />
              <hr
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000"
                style={{
                  width: `${(activeSectionIndex * 100) / (sections.length - 1)}%`,
                }}
              />

              {/* Section Navigation */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">
                <div className="flex items-center gap-2">
                  <TemplateSelector
                    selectedTemplate={resumeData.template}
                    onChange={(template) =>
                      setResumeData((prev) => ({ ...prev, template }))
                    }
                  />

                  <ColorPicker
                    selectedColor={resumeData.accent_color}
                    onChange={(color) =>
                      setResumeData((prev) => ({ ...prev, accent_color: color }))
                    }
                  />
                </div>   
                
                <div className="flex items-center">
                  {activeSectionIndex !== 0 && (
                    <button
                      onClick={() => setActiveSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0))}
                      className="flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (activeSectionIndex < sections.length - 1) {
                        setActiveSectionIndex(activeSectionIndex + 1);
                      }
                    }}
                    disabled={activeSectionIndex === sections.length - 1}
                    className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium transition-all ${
                      activeSectionIndex === sections.length - 1
                        ? "opacity-50 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form content */}
              <div className="space-y-6">
                {activeSection.id === 'personal' && (
                  <PersonalInfoForm
                    data={resumeData.personal_info}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, personal_info: data }))}
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                  />
                )}
                {activeSection.id === 'summary' && (
                  <ProfessionalSummaryForm 
                    data={resumeData.professional_summary}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, professional_summary: data }))} 
                    setResumeData={setResumeData}
                  />
                )}
                {activeSection.id === 'experience' && (
                  <ExperienceForm 
                    data={resumeData.experience}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, experience: data }))} 
                  />
                )}
                {activeSection.id === 'education' && (
                  <EducationForm 
                    data={resumeData.education}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, education: data }))} 
                  />
                )}
                {activeSection.id === 'skills' && (
                  <SkillsForm 
                    data={resumeData.skills}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, skills: data }))} 
                  />
                )}
                {activeSection.id === "projects" && (
                  <ProjectForm
                    data={resumeData.projects}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, projects: data }))}
                  />
                )}
              </div>

              <button onClick={()=> {toast.promise(saveResume,{loading:'Saving...'})}} className="bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm">
                Save Changes
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 max-lg:mt-6">
            <div className="relative w-full mb-4">
              <div className="flex items-center justify-end gap-2">
                {resumeData.public && (
                  <button onClick={handleShare} className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors">
                    <Share2Icon className="size-4" />
                    Share
                  </button>
                )}
                <button onClick={changeResumeVisibility} className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors">
                  {resumeData.public ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  {resumeData.public ? 'Public' : 'Private'}
                </button>
                <button onClick={downloadResume} className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors">
                  <DownloadIcon className="size-4" />Download 
                </button>
              </div>
            </div>
            
            {/* 3. Wrap ResumePreview in a div and attach the ref */}
            <div ref={resumeRef} className="bg-white w-full h-full min-h-[297mm]">
              <ResumePreview 
                data={resumeData} 
                template={resumeData.template}
                accentColor={resumeData.accent_color} 
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;