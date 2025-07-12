// app/api/scrape-chat/route.js
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Helper to validate URLs
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export async function POST(req) {
  try {
    const { url, question } = await req.json();

    // ✅ Validate inputs
    if (!url || !question || !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // ✅ Timeout fetch in 10s
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // ✅ Sanitize and truncate scraped content
    const scrapedText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000); // Gemini has token limits

    // ✅ Generate prompt
    const prompt = `You are answering on behalf of the website owner or platform team.
Speak in a **warm, friendly, and professional tone**. Always use **"we"** or **"our platform"**, never refer to "the website".
❌ Wrong: "The website provides..."  
✅ Correct: "We provide..." or "Our platform offers..."
---
### 🔧 How to Answer:
- Use **clear and well-structured Markdown** (headings, bullet points, bold where useful).
- Be **concise, factual, and easy to understand** — especially for students, parents, and new users.
- If the user’s tone or persona is clear (e.g., parent, rural student, beginner), **adjust your language accordingly** to match their context.
- If the question implies **offline or accessibility concerns**, clearly state whether the platform is fully online, and show empathy for limited resources.
- If the question is about trust, guarantees, or pricing, **set realistic expectations** without overpromising.
- Avoid robotic answers. Respond like a helpful guide, not a legal disclaimer.
---
### ⚠️ Fallback Instructions:
If the content **does not contain** the requested information:
- Do **not fabricate or assume anything**.
- Politely say:  
  **"Thanks for your question! We currently don't have information on that, but we're always working to improve and expand our platform."**
---
### 🔄 Final Output Instructions:
- Only base your answer on this content:  
  ${scrapedText}
- Answer this question in Markdown:  
  ${question}
`;

    // ✅ Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const geminiData = await geminiRes.json();

    const answer =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Thanks for your question! We currently don't have information on that, but we're always working to improve and expand our platform.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Scrape-Chat API error:", err.message);
    return NextResponse.json(
      { answer: "Sorry, we couldn't process your request at the moment." },
      { status: 500 }
    );
  }
}

// // app/api/scrape-chat/route.js (for App Router)
// import { NextResponse } from "next/server";
// import * as cheerio from "cheerio";

// export async function POST(req) {
//   const { url, question } = await req.json();

//   try {
//     const res = await fetch(url);
//     const html = await res.text();
//     const $ = cheerio.load(html);
//     const scrapedText = $("body")
//       .text()
//       .replace(/\s+/g, " ")
//       .trim()
//       .slice(0, 8000); // Truncate if needed
//     console.log(scrapedText);
//     const prompt = `You are answering on behalf of the website owner or platform team.
// Speak in a **warm, friendly, and professional tone**. Always use **"we"** or **"our platform"**, never refer to "the website".
// ❌ Wrong: "The website provides..."
// ✅ Correct: "We provide..." or "Our platform offers..."
// ---
// ### 🔧 How to Answer:
// - Use **clear and well-structured Markdown** (headings, bullet points, bold where useful).
// - Be **concise, factual, and easy to understand** — especially for students, parents, and new users.
// - If the user’s tone or persona is clear (e.g., parent, rural student, beginner), **adjust your language accordingly** to match their context.
// - If the user asks for career help, **use their preferences** (e.g., “I like science but hate math”) to **suggest roles or explain how the platform helps**.
// - If the question implies **offline or accessibility concerns**, clearly state whether the platform is fully online, and show empathy for limited resources.
// - If the question is about trust, guarantees, or pricing, **set realistic expectations** without overpromising.
// - Avoid robotic answers. Respond like a helpful guide, not a legal disclaimer.
// ---
// ### ⚠️ Fallback Instructions:
// If the content **does not contain** the requested information:
// - Do **not fabricate or assume anything**.
// - Politely say:
//   **"Thanks for your question! We currently don't have information on that, but we're always working to improve and expand our platform."**
// ---
// ### 🔄 Final Output Instructions:
// - Only base your answer on this content:
//   ${scrapedText}
// - Answer this question in Markdown:
//   ${question}
// `;

//     // Send to Gemini
//     const geminiRes = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: prompt,
//                 },
//               ],
//             },
//           ],
//         }),
//       }
//     );

//     const geminiData = await geminiRes.json();
//     console.log(geminiData);

//     const answer =
//       geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

//     return NextResponse.json({ answer });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { answer: "Failed to fetch or process the URL." },
//       { status: 500 }
//     );
//   }
// }
