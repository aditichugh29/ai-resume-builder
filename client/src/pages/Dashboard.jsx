import React, { useState, useEffect } from 'react';
import { FilePenLineIcon, Plus, TrashIcon, PencilIcon, UploadCloud, XIcon, LoaderCircleIcon } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from "../configs/api.js";
import * as pdfjsLib from "pdfjs-dist";

// This tells Vite to safely bundle the local worker from your node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();
import Tesseract from 'tesseract.js';

// Setup PDF worker

const Dashboard = () => {
    const { user, token } = useSelector(state => state.auth);
    const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];
    
    const [allResumes, setAllResumes] = useState([]);
    const [showCreateResume, setShowCreateResume] = useState(false);
    const [showUploadResume, setShowUploadResume] = useState(false);
    const [title, setTitle] = useState('');
    const [resume, setResume] = useState(null);
    const [editResumeId, setEditResumeId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("Upload..."); // New state for OCR status
    const navigate = useNavigate();

    const loadAllResumes = async () => {
        try {
            const { data } = await api.get('/api/users/resumes', {
                headers: { Authorization: token }
            });
            setAllResumes(data.resumes);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const createResume = async (event) => {
        event.preventDefault();
        try {
            const { data } = await api.post('/api/resumes/create', { title }, {
                headers: { Authorization: token }
            });
            setAllResumes([...allResumes, data.resume]);
            setTitle('');
            setShowCreateResume(false);
            navigate(`/app/builder/${data.resume._id}`);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const uploadResume = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            return toast.error("Please enter a resume title");
        }

        if (!resume) {
            return toast.error("Please select a PDF file");
        }

        setIsLoading(true);
        setLoadingStatus("Reading PDF...");
        
        try {
            console.log("Starting PDF extraction for:", resume.name);
            const arrayBuffer = await resume.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let extractedText = "";
            
            // 1. Try Standard Text Extraction First (Fast)
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item) => item.str).join(" ");
                extractedText += pageText + "\n";
            }

            console.log("STANDARD EXTRACTION LENGTH:", extractedText.trim().length);

            // 2. If no text found, trigger OCR Fallback (Slower but reads images)
            if (extractedText.trim().length === 0) {
                console.log("No text layer found. Switching to OCR...");
                toast("Image PDF detected. Running OCR scanner... this may take a moment.", { icon: '🔍' });
                setLoadingStatus("Running OCR Scanner...");

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    
                    // Render page to a hidden canvas at high scale for better OCR accuracy
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                    
                    // Run Tesseract OCR on the canvas
                    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
                    extractedText += text + "\n";
                }
                
                console.log("OCR EXTRACTION LENGTH:", extractedText.trim().length);
            }

            // 3. Final validation before sending to backend
            if (extractedText.trim().length === 0) {
                toast.error("OCR failed. The document might be blank or unreadable.");
                setIsLoading(false);
                return;
            }

            setLoadingStatus("Saving to Database...");

            const { data } = await api.post(
                "/api/ai/upload-resume",
                { title, resumeText: extractedText },
                { headers: { Authorization: token } }
            );

            toast.success("Resume uploaded successfully");
            setTitle("");
            setResume(null);
            setShowUploadResume(false);
            navigate(`/app/builder/${data.resumeId}`);

        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || error.message || "Extraction failed");
        }

        setIsLoading(false);
        setLoadingStatus("Uploading...");
    };

    const editTitle = async (event) => {
        event.preventDefault();
        try {
            const { data } = await api.put(
                `/api/resumes/update/${editResumeId}`,
                { resumeData: { title: title } },
                { headers: { Authorization: token } }
            );
            setAllResumes(allResumes.map((res) => res._id === editResumeId ? { ...res, title: title } : res));
            setEditResumeId('');
            setTitle('');
            toast.success(data.message);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const deleteResume = async (resumeId) => {
        const confirm = window.confirm('Are you sure you want to delete this resume?');
        if (confirm) {
            try {
                const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, {
                    headers: { Authorization: token }
                });
                setAllResumes(allResumes.filter(res => res._id !== resumeId));
                toast.success(data.message);
            } catch (error) {
                toast.error(error?.response?.data?.message || error.message);
            }
        }
    };

    useEffect(() => {
        if (token) {
            loadAllResumes();
        }
    }, [token]);

    return (
        <div>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>
                    Welcome, {user?.name || "Joe Doe"}!
                </p>
                
                <div className='flex gap-4'>
                    <button onClick={() => setShowCreateResume(true)} className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
                        <Plus className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
                        <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Create Resume</p>
                    </button>
                    
                    <button onClick={() => setShowUploadResume(true)} className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
                        <UploadCloud className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full' />
                        <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>Upload Existing</p>
                    </button>
                </div>

                <hr className='border-t border-slate-300 my-6 sm:w-[305px]' />
                
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
                    {allResumes.map((resume, index) => {
                        const baseColor = colors[index % colors.length];
                        return (
                            <button key={resume._id || index} onClick={() => navigate(`/app/builder/${resume._id}`)} className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer' style={{background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`, borderColor: baseColor + '40'}}>
                                <FilePenLineIcon className="size-7 group-hover:scale-105 transition-all" style={{color: baseColor}}/>
                                <p className='text-sm group-hover:scale-105 transition-all px-2 text-center'>{resume.title}</p>
                                
                                <p className='absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center' style={{color: baseColor + '90'}}>
                                    Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                                </p>
                                <div onClick={e => e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
                                    <TrashIcon onClick={() => deleteResume(resume._id)} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors cursor-pointer'/>
                                    <PencilIcon onClick={() => { setEditResumeId(resume._id); setTitle(resume.title); }} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors cursor-pointer'/>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Create Resume Modal */}
                {showCreateResume && (
                    <div onClick={() => setShowCreateResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
                        <form onSubmit={createResume} onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                            <h2 className='text-xl font-bold mb-4'>Create a Resume</h2>
                            <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 border rounded focus:border-green-600 ring-green-600' required/>
                            <button type="submit" className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>
                                Create Resume
                            </button>
                            <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setShowCreateResume(false); setTitle(''); }} />
                        </form>
                    </div>
                )}
               
                {/* Upload Resume Modal */}
                {showUploadResume && (
                    <div onClick={() => setShowUploadResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
                        <form onSubmit={uploadResume} onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                            <h2 className='text-xl font-bold mb-4'>Upload Resume</h2>
                            <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 border rounded focus:border-green-600 ring-green-600' required/>
                            <div>
                                <label htmlFor='resume-input' className="block text-sm text-slate-700">
                                    Select Resume File
                                    <div className='flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-green-500 hover:text-green-700 cursor-pointer transition-colors'>
                                        {resume ? (
                                            <p className='text-green-700'>{resume.name}</p>
                                        ) : (
                                            <>
                                                <UploadCloud className='size-14 stroke-1'/>
                                                <p>Upload Resume</p>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e) => setResume(e.target.files[0])} />
                            </div>
                            <button type='submit' disabled={isLoading} className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center gap-2'>
                                {isLoading && <LoaderCircleIcon className='animate-spin size-4 text-white'/>}
                                {loadingStatus}
                            </button>
                            <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setShowUploadResume(false); setTitle(''); setResume(null); }} />
                        </form>
                    </div>
                )}

                {/* Edit Resume Title Modal */}
                {editResumeId && (
                    <div onClick={() => setEditResumeId('')} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
                        <form onSubmit={editTitle} onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                            <h2 className='text-xl font-bold mb-4'>Edit Resume Title</h2>
                            <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 border rounded focus:border-green-600 ring-green-600' required/>
                            <button type='submit' className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>
                                Update
                            </button>
                            <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setEditResumeId(''); setTitle(''); }} />
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;