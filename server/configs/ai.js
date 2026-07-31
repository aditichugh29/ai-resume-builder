import { OpenAI } from "openai";
import "dotenv/config";

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // THE TRAILING SLASH AT THE END IS MANDATORY:
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", 
});

export default ai;