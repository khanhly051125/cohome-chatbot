export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { message, history } = req.body;

    const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn của CoHome Decor - shop nội thất và trang trí nhà cửa tại Đà Nẵng, Việt Nam.
Sản phẩm gồm: thảm trải sàn, đèn trang trí, bình hoa, đồng hồ treo tường, nến thơm, tranh treo tường và các đồ decor nhà cửa.
Hãy tư vấn thân thiện, nhiệt tình, ngắn gọn bằng tiếng Việt.
Nếu khách hỏi linh tinh ngoài lề (ví dụ "ăn cơm chưa?"), hãy trả lời vui vẻ tự nhiên rồi dẫn về chủ đề trang trí nhà.
Hotline: 079 666 9883. Website: cohomedecor.com`;

    const contents = [
      ...(history || []),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: contents
        })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Mình đang gặp chút vấn đề, bạn thử lại nhé!';
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ reply: 'Xin lỗi, hệ thống lỗi nhẹ. Thử lại sau nhé!' });
  }
}
