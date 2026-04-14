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
Trả lời thân thiện, ngắn gọn bằng tiếng Việt. Gợi ý sản phẩm phù hợp khi có thể.
Hotline: 079 666 9883. Website: cohomedecor.com`;

  // Chuyển history từ Gemini format → Groq/OpenAI format
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  if (Array.isArray(history)) {
    for (const h of history) {
      const role = h.role === 'model' ? 'assistant' : 'user';
      const content = h.parts?.[0]?.text || '';
      if (content) messages.push({ role, content });
    }
  }
  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // model mạnh nhất, vẫn free
        max_tokens: 1024,
        temperature: 0.7,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(200).json({ reply: 'Xin lỗi, hệ thống đang bận. Vui lòng gọi 079 666 9883!' });
    }

    const reply = data?.choices?.[0]?.message?.content || 'Bạn thử lại nhé!';
    return res.status(200).json({ reply });

  } catch (e) {
    console.error('Fetch error:', e);
    return res.status(200).json({ reply: 'Xin lỗi, có lỗi xảy ra. Vui lòng gọi 079 666 9883 để được hỗ trợ!' });
  }
};
