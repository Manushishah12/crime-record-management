const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const chatWithAI = async (req, res) => {
  try {
    const { question, caseData, evidence } = req.body;

    const prompt = `
You are a professional police investigation assistant.

CASE DETAILS:
Case Number: ${caseData.caseNumber}
Crime Type: ${caseData.crimeType}
Description: ${caseData.description}
Location: ${caseData.location}
Status: ${caseData.status}

CRIMINAL:
${caseData.criminal?.name || "Unknown"}

ASSIGNED OFFICER:
${caseData.assignedOfficer?.name || "Unassigned"}

TIMELINE:
${JSON.stringify(caseData.timeline, null, 2)}

EVIDENCE:
${JSON.stringify(evidence, null, 2)}

OFFICER QUESTION:
${question}

Answer only using the information provided above.
Keep answers short and professional.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    res.json({
      answer: completion.choices[0].message.content,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "AI request failed",
    });
  }
};

module.exports = {
  chatWithAI,
};