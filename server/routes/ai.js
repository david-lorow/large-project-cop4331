const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');

const router = express.Router();

// POST /api/ai/review
// Streams an AI-generated resume review back to the client as chunked plain text.
router.post('/review', protect, async (req, res) => {
  const { resumeId, mode, company, position, jobDescription, targetJob, additionalContext } = req.body;

  if (!resumeId) return res.status(400).json({ message: 'resumeId is required.' });
  if (!mode || !['tailoring', 'review'].includes(mode)) {
    return res.status(400).json({ message: 'mode must be "tailoring" or "review".' });
  }

  let resume;
  try {
    resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  } catch {
    return res.status(400).json({ message: 'Invalid resumeId.' });
  }
  if (!resume) return res.status(404).json({ message: 'Resume not found.' });

  const resumeText = resume.extractedText || 'No text extracted from this resume.';

  let systemPrompt, userContent;

  if (mode === 'tailoring') {
    if (!company || !position || !jobDescription) {
      return res.status(400).json({ message: 'company, position, and jobDescription are required for tailoring mode.' });
    }
    systemPrompt =
      'You are a professional resume coach. Analyze the provided resume against the job description and suggest specific, actionable edits to better align the resume with the role. Focus on keywords, phrasing, and relevant experience highlighting.';
    userContent =
      `Company: ${company}\nPosition: ${position}\nJob Description:\n${jobDescription}\n\nResume Content:\n${resumeText}\n\nProvide specific suggested changes to tailor this resume for this role.`;
  } else {
    systemPrompt =
      'You are a professional resume coach. Review this resume holistically and provide actionable suggestions to improve clarity, impact, and professionalism. Consider the target job field when giving feedback.';
    userContent =
      `Target Job: ${targetJob || 'Not specified'}\nAdditional Info: ${additionalContext || 'None'}\n\nResume:\n${resumeText}\n\nGive a structured review with suggested improvements.`;
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        stream: true,
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('OpenAI API error:', errText);
      return res.status(502).end();
    }

    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete last line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload);
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) res.write(text);
        } catch {
          // malformed SSE line — skip
        }
      }
    }

    res.end();
  } catch (err) {
    console.error('AI review error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'AI review failed.' });
    else res.end();
  }
});

module.exports = router;
