import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// Controller for creating a new resume
// POST: /api/resume/create
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    const newResume = await Resume.create({
      userId,
      title: title || "Untitled Resume",
    });

    return res.status(201).json({
      message: "Resume created successfully",
      resume: newResume,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Controller for deleting a resume
// DELETE: /api/resume/delete/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const deletedResume = await Resume.findOneAndDelete({
      _id: resumeId,
      userId,
    });

    if (!deletedResume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Controller for getting resume by id
// GET: /api/resume/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const resumeObj = resume.toObject();
    delete resumeObj.__v;
    delete resumeObj.createdAt;
    delete resumeObj.updatedAt;

    return res.status(200).json({
      resume: resumeObj,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Controller for getting public resume by id
// GET: /api/resume/public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      public: true,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const resumeObj = resume.toObject();
    delete resumeObj.__v;

    return res.status(200).json({
      resume: resumeObj,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Controller for updating a resume
// PUT: /api/resume/update/:resumeId
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;
    const { resumeData, removeBackground } = req.body;
    const image = req.file;

    let resumeDataCopy = {};
    if (resumeData) {
      resumeDataCopy = typeof resumeData === 'string' 
        ? JSON.parse(resumeData) 
        : structuredClone(resumeData);
    }

    // Security: Prevent users from overriding critical database fields
    delete resumeDataCopy.userId;
    delete resumeDataCopy._id;
    delete resumeDataCopy.createdAt;

    if (image) {
      const imageBufferData = fs.readFileSync(image.path);

      // Handle multipart form-data boolean strings safely
      const shouldRemoveBg = removeBackground === 'true' || removeBackground === true;

      const response = await imagekit.upload({
        file: imageBufferData,
        fileName: "user-resume.png",
        transformation: {
          pre: "w-300,h-300" + (shouldRemoveBg ? ",e-bgremove" : ""),
        },
      });

      // Safely assign image URL ensuring personal_info exists
      resumeDataCopy.personal_info = {
        ...(resumeDataCopy.personal_info || {}),
        image: response.url,
      };

      // Clean up the uploaded file from the server
      fs.unlinkSync(image.path);
    }

 const updatedResume = await Resume.findOneAndUpdate(
  { _id: resumeId, userId },
  { $set: resumeDataCopy }, 
  {
    returnDocument: 'after', // ✅ Naya aur sahi tareeqa
    runValidators: true,
  }
 );
    if (!updatedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({
      message: "Resume updated successfully",
      resume: updatedResume,
    });
  } catch (error) {
    // Clean up file if it crashed during the process
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(400).json({
      message: error.message,
    });
  }
};

// Controller for getting all resumes of the logged-in user
// GET: /api/resume

export const getUserResumes = async (req, res) => {
  try {
    const userId = req.userId;

    const resumes = await Resume.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      resumes,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};