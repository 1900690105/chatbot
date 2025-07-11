# AI-Powered Website Content Chatbot (with Gemini)

This project is an intelligent chatbot that takes a website URL, scrapes the content, and answers user questions about the site using Google's Gemini AI model. It's designed to assist users with informative, personalized, and empathetic responses — making it ideal for platforms like career guidance, edtech services, or business assistants.

## 🚀 Features

- 🌐 Accepts any website URL and scrapes relevant textual content
- 🤖 Uses Gemini (via Google Generative AI API) to generate contextual answers
- 🧠 Handles diverse queries with empathy (e.g., accessibility, fear of failure, career help)
- 🔍 Evaluated against emotional, ethical, and practical test cases
- 💬 Real-time Q&A form with clean UI using React + Tailwind CSS
- 📜 Structured prompt system to maintain helpful and human-like tone

---

## 🧱 Tech Stack

| Layer         | Technology                            |
|---------------|----------------------------------------|
| Frontend      | Next.js (App Router), React, Tailwind  |
| Backend       | Node.js, Next.js API routes            |
| AI            | Gemini Pro via Google Generative AI    |
| Scraping      | Cheerio or similar (HTML parsing)      |
| Deployment    | Vercel / Netlify / Firebase Hosting    |

---

## 🧑‍💻 How It Works

1. **User Inputs:**
   - Enters website URL
   - Asks a question

2. **Backend:**
   - Scrapes content using fetch + HTML parser
   - Sends a structured prompt to Gemini API along with the user question
   - Receives AI-generated answer

3. **Frontend:**
   - Displays the response clearly in a chat-like interface

---

## 🛠️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/gemini-site-chatbot.git
cd gemini-site-chatbot
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file and add your Gemini API key:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Optional: Add `NEXT_PUBLIC_BASE_URL`, if needed for deployment context.

---

## 📂 Project Structure

```
.
├── components/
│   └── ChatBotForm.jsx         # Input form for URL and question
├── pages/
│   └── api/
│       └── scrape-chat.js      # API route for scraping and Gemini
├── utils/
│   └── scrape.js               # Helper to scrape site content
├── .env.local
├── README.md
└── package.json
```

---

## 💡 Example Prompts

```txt
Q: I'm a rural student with poor internet. How can your platform help me?
Q: I'm not sure if I'm good enough to get hired anywhere.
Q: Can AI take my job?
Q: Why should I choose your platform over others?
Q: Do you offer scholarships or refunds?
```

---

## 📊 Evaluation Criteria Used

* ✅ Emotional understanding (tone, empathy)
* ✅ Clarity of answers
* ✅ Ethical transparency (bias, fairness)
* ✅ Persuasive explanation (value proposition)
* ✅ Handling hard or skeptical questions

---

## ✅ To-Do (Optional Enhancements)

* [ ] Add streaming response UI (like typing indicator)
* [ ] Use embedding + vector DB for better semantic memory
* [ ] Multi-page scrape support
* [ ] Rate-limiting / abuse protection

---

## 📄 License

MIT © \[Your Name]

---

## 🙌 Acknowledgements

* [Google Gemini API](https://ai.google.dev)
* [Cheerio for scraping](https://cheerio.js.org/)
* Inspired by real-world user testing and conversational UX best practices.

```

---

Would you like:
- A PDF version of this README?
- A logo + badge design to go along with the repo?
- A GitHub Actions CI template for this project?

Let me know!
```
