import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Initial chat session with context
export const AIChatBotCode = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: `as i want answer of following question by analyzing the data give with it,if no data available related to that question then give proper answer for that also.
data:{
  "home": {
    "overview": {
      "tagline": "Unlocking Efficiency, Elevating Real Estate",
      "founded": 2015,
      "mission": "Optimize and streamline operations for real estate clients globally, exceeding expectations and fostering excellence.",
      "global_presence": ["UAE", "India", "Netherlands", "Singapore", "UK"],
      "expertise": ["Yardi", "Real Estate Consulting"]
    },
    "metrics": {
      "years_experience": "10+",
      "client_satisfaction": "98%"
    },
    "services": [
      "Helpdesk Support",
      "Custom Development",
      "Yardi Data Connect",
      "Yardi Implementation",
      "Data Migration",
      "Training & Onboarding",
      "Health Check",
      "Process Enhancement",
      "Operational Efficiency"
    ]
  },
  "company_overview": {
    "founded": 2015,
    "core_specialization": "Yardi Clients – Real estate management and investment software",
    "mission": "Crafting customized solutions aligned with client needs for optimal Yardi utilization.",
    "vision": "To be the preferred global partner for Yardi users, enabling efficiency and growth.",
    "milestones": {
      "2015": "Founded in Dubai with Yardi Support and development projects.",
      "2016": "First implementation project and first employee hired.",
      "2018": "Started offshore delivery in Mumbai, India.",
      "2019": "Expanded to Amsterdam, Netherlands.",
      "2020": "Increased offshore deliveries.",
      "2022": "Opened office in Singapore.",
      "2023": "Expanded to London, UK."
    },
    "strengths": [
      "Expertise & Specialization in Yardi",
      "Client-Centric Approach",
      "Global Footprint",
      "Driving Innovation"
    ]
  },
  "team": {
    "description": "Team of experienced consultants in Yardi, MRI, JD Edwards, Oracle Financials, and SAP.",
    "members": [
      { "name": "Yogesh Shah", "role": "Founder & CEO" },
      { "name": "Pooja Shah", "role": "Vice President" },
      { "name": "Jay Panicker", "role": "Regional Director" },
      { "name": "Harshit Agrawal", "role": "Project Manager" },
      { "name": "Sameer Aiyer", "role": "Senior Technical Lead" }
    ]
  }
}
question: "what is goal of company". include question, answer: direct answer. in json format.`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `{
  "question": "What is the goal of the company?",
  "answer": "The company's goal is to optimize and streamline operations for real estate clients globally, exceeding expectations and fostering excellence. Also, the vision is to be the preferred global partner for Yardi users, enabling efficiency and growth."
}`,
        },
      ],
    },
  ],
});
