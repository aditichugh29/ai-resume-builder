import ai from "../configs/ai.js";

import Resume from "../models/Resume.js";



// Controller for enhancing a resume's professional summary

// POST: /api/ai/enhance-pro-sum

export const enhanceProfessionalSummary = async (req, res) => {

  try {

    const { userContent } = req.body;



    if (!userContent) {

      return res.status(400).json({

        message: "Missing required fields",

      });

    }



    // Aapka model aur API key

// Pehle yeh tha:

// const modelToUse = process.env.OPENAI_MODEL || "gemini-1.5-flash";



// Isko isse replace kar do:

const modelToUse = "gemini-3.5-flash";

const apiKey = process.env.OPENAI_API_KEY;

    // Seedha Google ke official API URL par request bhej rahe hain

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;



    const promptText = `You are an expert resume writer. Improve the professional summary of a resume. Keep it to 1-2 sentences, highlight key skills, experience, and career objectives. Make it compelling, ATS-friendly, and do not add any false information. Return only the improved summary as plain text.\n\nProfessional Summary:\n${userContent}`;



    const response = await fetch(url, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

      },

      body: JSON.stringify({

        contents: [

          {

            parts: [{ text: promptText }],

          },

        ],

      }),

    });



    const data = await response.json();



    // Agar API ne error return kiya toh actual error console mein dikhega

    if (!response.ok) {

      console.error("Google API Error Details:", data);

      throw new Error(data.error?.message || "Failed to generate AI response");

    }



    // JSON response se actual text nikalna

    const enhancedContent = data.candidates[0].content.parts[0].text;



    return res.status(200).json({

      enhancedContent,

    });

  } catch (error) {

    console.error("AI API Error:", error);

    return res.status(400).json({

      message: error.message,

    });

  }

};



// Controller for enhancing a resume's job description

// POST: /api/ai/enhance-job-desc

export const enhanceJobDescription = async (req, res) => {

  try {

    const { userContent } = req.body;



    if (!userContent) {

      return res.status(400).json({

        message: "Missing required fields",

      });

    }



    // Wahi same Gemini 3.5 Flash model

    const modelToUse = "gemini-3.5-flash";

    const apiKey = process.env.OPENAI_API_KEY;



    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;



    const response = await fetch(url, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

      },

      body: JSON.stringify({

        contents: [

          {

            parts: [{ text: userContent }], // Prompt frontend se ban kar aa raha hai

          },

        ],

      }),

    });



    const data = await response.json();



    if (!response.ok) {

      console.error("Google API Error Details:", data);

      throw new Error(data.error?.message || "Failed to generate AI response");

    }



    const enhancedContent = data.candidates[0].content.parts[0].text;



    return res.status(200).json({

      enhancedContent,

    });

  } catch (error) {

    console.error("AI API Error:", error);

    return res.status(400).json({

      message: error.message,

    });

  }

};



// Controller for uploading a resume

// POST: /api/ai/upload-resume

export const uploadResume = async (req, res) => {

  try {

    const { resumeText, title } = req.body;

    const userId = req.userId || req.user?._id;



    if (!resumeText) {

      return res.status(400).json({

        message: "Missing required fields",

      });

    }



    const systemPrompt = "you are an expert AI agent to extract data from resume.";

    const userPrompt = `extract data from this resume : ${resumeText} Provide data in following JSON format with no additional text before or after:

{

  "professional_summary": "",

  "skills": [],

  "personal_info": {

    "fullName": "",

    "profession": "",

    "email": "",

    "phone": "",

    "location": "",

    "linkedin": "",

    "website": "",

    "image": ""

  },

  "experience": [

    {

      "company": "",

      "position": "",

      "start_date": "",

      "end_date": "",

      "description": "",

      "is_current": false

    }

  ],

  "projects": [

    {

      "name": "",

      "type": "",

      "description": ""

    }

  ],

  "education": [

    {

      "institution": "",

      "degree": "",

      "field": "",

      "graduation_date": "",

      "gpa": ""

    }

  ]

}`;



const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;



 // 🔥 USING GOOGLE'S CURRENT 2026 DEFAULT MODEL 🔥

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.OPENAI_API_KEY}`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json"

      },

// ... the rest of the code stays exactly the same

      body: JSON.stringify({

        contents: [

          {

            parts: [

              { text: combinedPrompt }

            ]

          }

        ]

      })

    });



    if (!response.ok) {

        const errorData = await response.text();

        throw new Error(`Google API Error: ${response.status} - ${errorData}`);

    }



    const data = await response.json();

   

    // Native Gemini returns data in a slightly different structure

    let extractedData = data.candidates[0].content.parts[0].text;



    // Clean markdown backticks if Gemini includes them

    extractedData = extractedData.replace(/```json/g, "").replace(/```/g, "").trim();



    const parsedData = JSON.parse(extractedData);

   

    const newResume = await Resume.create({

      userId,

      title: title || "Uploaded Resume",

      ...parsedData,

    });



    return res.status(200).json({

      resumeId: newResume._id,

    });

  } catch (error) {

    console.log("🔥 BACKEND CRASH REASON:", error);



    return res.status(400).json({

      message: error.message,

    });

  }


};