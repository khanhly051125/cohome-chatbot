// api/chat.js — CoHome Decor Chatbot Backend
// Deploy lên Vercel, thêm ANTHROPIC_API_KEY vào Environment Variables

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { message, history = [] } = req.body || {};

    if (!message) {
      return res.status(400).json({ reply: 'Thiếu tin nhắn' });
    }

    const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn của CoHome Decor — thương hiệu nội thất & trang trí cao cấp tại Đà Nẵng, Việt Nam.

Website: https://cohomedecor.com
Hotline: 079 666 9883
Địa chỉ: Đà Nẵng, Việt Nam

Sản phẩm CoHome Decor bao gồm:
- Đèn trang trí (đèn thả, đèn bàn, đèn sàn, đèn gương)
- Thảm trải sàn (thảm phòng khách, phòng ngủ, thảm lông)
- Nến thơm & đế nến trang trí
- Tranh treo tường (tranh canvas, tranh khung, tranh trừu tượng)
- Đồng hồ treo tường & để bàn
- Gương trang trí (gương tròn, gương khung mây, gương cỡ lớn)
- Phụ kiện trang trí (bình hoa, khay, tượng trang trí, kệ gỗ)
- Vỏ gối & chăn mền cao cấp
- Bộ bàn ghế nhỏ & kệ đa năng

Phong cách thiết kế: Scandinavian, Japandi, Boho, Minimalist, Wabi-sabi

Chính sách:
- Giao hàng toàn quốc
- Đổi trả trong 7 ngày
- Khách mới nhận mã giảm 10% khi đăng ký email

Quy tắc trả lời:
1. Luôn trả lời bằng tiếng Việt, thân thiện, tự nhiên
2. Tư vấn dựa trên nhu cầu của khách (phòng ngủ, phòng khách, văn phòng...)
3. Gợi ý 1-3 sản phẩm phù hợp với nhu cầu
4. Khi khách hỏi về giá, hướng dẫn vào website hoặc nhắn hotline
5. Nếu câu hỏi không liên quan đến nội thất / trang trí / CoHome, lịch sự từ chối và quay lại chủ đề tư vấn
6. Câu trả lời ngắn gọn, không quá 150 từ
7. Dùng emoji nhẹ nhàng để thêm cảm xúc (không lạm dụng)`;

    // Convert history sang format Claude
    const claudeMessages = history
      .filter(m => m.role && m.content)
      .map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));

    // Thêm tin nhắn mới nhất
    claudeMessages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // Nhanh & rẻ nhất, phù hợp chatbot
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: claudeMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API error:', data);
      return res.status(200).json({ reply: 'Xin lỗi, hệ thống đang bận. Bạn thử lại sau nhé! 💛' });
    }

    const reply = data?.content?.[0]?.text || 'Bạn thử lại nhé!';
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(200).json({
      reply: 'Hệ thống đang bận, bạn thử lại sau nhé 💛'
    });
  }
}
