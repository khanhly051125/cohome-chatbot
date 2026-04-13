module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history } = req.body || {};
  if (!message) return res.status(400).json({ reply: 'Thiếu tin nhắn' });

  const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn của CoHome Decor - shop nội thất và trang trí nhà cửa tại Đà Nẵng.
Sản phẩm: thảm trải sàn, đèn trang trí, bình hoa, đồng hồ treo tường, nến thơm, tranh treo tường.
Trả lời thân thiện, ngắn gọn bằng tiếng Việt.
Hotline: 079 666 9883. Website: cohomedecor.com`;

  const contents = [
    ...(Array.isArray(history) ? history : []),
    { role: 'user', parts: [{ text: message }] }
  ];

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents
    })
  });

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
    || data?.error?.message
    || 'Bạn thử lại nhé!';

  return res.status(200).json({ reply });
}
