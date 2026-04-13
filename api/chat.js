export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history } = req.body;

  const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn của CoHome Decor - shop nội thất và trang trí nhà cửa tại Việt Nam.
Hãy tư vấn thân thiện, nhiệt tình, ngắn gọn bằng tiếng Việt.
Nếu khách hỏi về sản phẩm cụ thể mà bạn không chắc, hãy mời khách nhắn tin fanpage hoặc gọi hotline.
Website: cohomedecor.com`;

  const messages = [...(history || []), { role: 'user', parts: [{ text: message }] }];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages
      })
    }
  );

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, mình chưa hiểu câu hỏi. Bạn có thể hỏi lại không?';
  res.status(200).json({ reply });
}
