import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Untitled Resume",
      trim: true,
    },

    public: {
      type: Boolean,
      default: false,
    },

    template: {
      type: String,
      default: "classic",
    },

    accent_color: {
      type: String,
      default: "#3B82F6",
    },

    professional_summary: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    personal_info: {
      fullName: {
        type: String,
        default: "",
      },
      profession: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
      image: {
        type: String,
        default: "",
      },
    },

    experience: {
      type: [
        {
          company: {
            type: String,
            default: "",
          },
          position: {
            type: String,
            default: "",
          },
          start_date: {
            type: String,
            default: "",
          },
          end_date: {
            type: String,
            default: "",
          },
          description: {
            type: String,
            default: "",
          },
          is_current: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },

    projects: {
      type: [
        {
          name: {
            type: String,
            default: "",
          },
          type: {
            type: String,
            default: "",
          },
          description: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    education: {
      type: [
        {
          institution: {
            type: String,
            default: "",
          },
          degree: {
            type: String,
            default: "",
          },
          field: {
            type: String,
            default: "",
          },
          graduation_date: {
            type: String,
            default: "",
          },
          gpa: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const Resume = mongoose.model("Resume", ResumeSchema);

export default Resume;