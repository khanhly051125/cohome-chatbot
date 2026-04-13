export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history } = req.body || {};
  if (!message) return res.status(400).json({ reply: 'Thiếu nội dung tin nhắn' });

  const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn của CoHome Decor - shop nội thất và trang trí nhà cửa tại Đà Nẵng.
Sản phẩm: thảm trải sàn, đèn trang trí, bình hoa, đồng hồ treo tường, nến thơm, tranh treo tường.
Trả lời thân thiện, ngắn gọn bằng tiếng Việt. Nếu khách hỏi ngoài lề thì trả lời vui rồi dẫn về trang trí nhà.
Hotline: 079 666 9883. Website: cohomedecor.com`;

  const contents = [
    ...(Array.isArray(history) ? history : []),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  contents: [
    {
      role: "user",
      parts: [{ text: SYSTEM_PROMPT + "\n\nKhách: " + message }]
    }
  ]
})
      }
    );
    const data = await response.json();
    console.log("Gemini data:", JSON.stringify(data));
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Bạn thử lại nhé!';
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ reply: 'Lỗi hệ thống, thử lại sau nhé!' });
  }
}
