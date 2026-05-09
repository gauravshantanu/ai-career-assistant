import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callAI(system, user, history = []) {
  const messages = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: user },
  ];
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1500,
    messages,
  });
  return response.choices[0].message.content;
}

function langSuffix(lang) {
  return lang && lang !== "English"
    ? `\n\nIMPORTANT: Write ENTIRE response in ${lang}.`
    : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { tool, data, lang } = req.body;
  const L = langSuffix(lang);

  try {
    let result = "";

    if (tool === "resume") {
      result = await callAI(
        `Expert resume coach. Review resume vs job description.\n1. MATCH SCORE (/10)\n2. TOP 3 IMPROVED BULLET POINTS\n3. SKILL GAPS\n4. QUICK WINS\nBe specific and direct.${L}`,
        `RESUME:\n${data.resume}\n\nJOB DESCRIPTION:\n${data.jd}`
      );
    } else if (tool === "interview") {
      result = await callAI(
        `Senior interviewer for ${data.level} ${data.role} ${data.type} interview. Give feedback on the answer then ask next question. After 5 questions give score out of 10.${L}`,
        data.answer,
        data.history || []
      );
    } else if (tool === "cover") {
      result = await callAI(
        `Write a compelling ${data.tone} cover letter. 3-4 paragraphs. Never start with 'I am writing to'. Be human and specific.${L}`,
        `Candidate: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || "the company"}\nJob:\n${data.jd}\nAbout me:\n${data.about}`
      );
    } else if (tool === "linkedin") {
      result = await callAI(
        `Write a compelling LinkedIn post. Type: ${data.ptype}. Style: ${data.style}. Add 3-5 hashtags at end. Max 300 words.${L}`,
        `Topic: ${data.topic}`
      );
    } else if (tool === "decoder") {
      result = await callAI(
        `Decode this job posting:\n1. WHAT THEY REALLY WANT\n2. MUST-HAVE vs NICE-TO-HAVE\n3. RED FLAGS\n4. WHAT TO HIGHLIGHT\n5. SALARY ESTIMATE (INR)\n6. 3 SMART QUESTIONS to ask${L}`,
        `Job posting:\n${data.jd}`
      );
    } else if (tool === "apply") {
      const cover = await callAI(
        `Write a 3-paragraph cover letter. Never start with 'I am writing to'.${L}`,
        `Candidate: ${data.name}\nJob:\n${data.jd}\nResume:\n${data.resume}`
      );
      const email = await callAI(
        `Write a short application email body (3-4 sentences).${L}`,
        `Candidate: ${data.name}\nJob:\n${data.jd.slice(0, 500)}`
      );
      const points = await callAI(
        `Give exactly 5 bullet points: strongest things this candidate should emphasise.${L}`,
        `Job:\n${data.jd}\nCandidate:\n${data.resume}`
      );
      result = JSON.stringify({ cover, email, points });
    } else if (tool === "jobs") {
      result = await callAI(
        `Analyze this profile: 1) Top 5 skills to highlight 2) Best 5 job titles to search 3) Top 10 companies to target.${L}`,
        `Resume/Role: ${(data.resume || data.role || "").slice(0, 1000)}\nLocation: ${data.location || "India"}\nExperience: ${data.exp}`
      );
    } else if (tool === "career") {
      result = await callAI(
        `Senior career counselor. Create detailed roadmap:\n🎯 WHERE YOU ARE NOW\n🚀 NEXT STEP (6-12 months)\n📈 MID-TERM (1-3 years)\n🏆 LONG-TERM (3-5 years)\nInclude salary (INR), skills, certifications.${L}`,
        `Role: ${data.role}\nExperience: ${data.exp}\nSkills: ${data.skills}\nGoal: ${data.goal || "Not specified"}\nIndustry: ${data.industry}\nTimeline: ${data.timeline}`
      );
    } else if (tool === "salary_worth") {
      result = await callAI(
        `Salary expert for Indian job market.\n💰 SALARY RANGE (min/mid/max LPA)\n📊 MARKET BENCHMARK\n🏆 TOP PAYING COMPANIES\n📈 FACTORS that increase salary\n💡 NEGOTIATION LEVERAGE\nUse specific INR/LPA numbers.${L}`,
        `Role: ${data.role}\nExperience: ${data.exp}\nCity: ${data.city}\nSkills: ${data.skills}\nCompany: ${data.company || "General market"}`
      );
    } else if (tool === "salary_script") {
      result = await callAI(
        `Write a salary negotiation script:\n📞 OPENING LINE\n💪 VALUE STATEMENT\n💬 EXACT WORDS\n🔄 HANDLING OBJECTIONS\n✅ CLOSING\nNatural and confident.${L}`,
        `Offer: ${data.offer} LPA\nExpecting: ${data.expect} LPA\nRole: ${data.role}\nExperience: ${data.exp}\nAchievements: ${data.achievements}`
      );
    } else if (tool === "salary_email") {
      result = await callAI(
        `Write a professional counter offer email. Polite but firm. 3-4 paragraphs.${L}`,
        `Name: ${data.name}\nCompany: ${data.company}\nRole: ${data.role}\nOffer: ${data.offer} LPA\nCounter: ${data.counter} LPA\nReason: ${data.reason}`
      );
    } else {
      return res.status(400).json({ error: "Unknown tool" });
    }

    res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "AI call failed" });
  }
}
