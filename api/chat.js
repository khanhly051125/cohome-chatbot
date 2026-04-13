export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history } = req.body;

  const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn của CoHome Decor - thương hiệu decor & nội thất cao cấp tại Đà Nẵng.
Website: cohomedecor.com | Hotline: 079 666 9883 | Messenger: m.me/co.homedecordanang
Slogan: "Tinh tế trong từng chi tiết – mang đến không gian sống hiện đại và ấm cúng"

DANH MỤC SẢN PHẨM:
1. BÌNH HOA: bình sứ, bình thủy tinh, bình gốm thủ công, nhiều size và màu sắc, giá từ 150.000đ
2. ĐÈN: đèn bàn, đèn cây, đèn thả trần, đèn tường – phong cách Bắc Âu, hiện đại, vintage. Ví dụ: Đèn Bàn Thân Uốn Nghệ Thuật Chao Vải Xếp Nếp 332.000đ
3. ĐỒNG HỒ: đồng hồ treo tường tối giản, vintage, hiện đại, nhiều kích thước
4. LỊCH: lịch treo tường phong cách tối giản, lịch để bàn
5. NẾN THƠM: nến thơm handmade, nến soy wax, nhiều mùi hương, phù hợp làm quà tặng
6. THẢM: thảm trải sàn phòng khách, phòng ngủ, nhiều họa tiết và kích thước

CHÍNH SÁCH:
- Giao hàng toàn quốc, miễn phí nội thành Đà Nẵng đơn từ 500.000đ
- Đổi trả 7 ngày nếu lỗi nhà sản xuất
- Khách mới đăng ký email nhận mã giảm 10%
- Thanh toán: chuyển khoản, COD, ví điện tử

CÁCH TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, thân thiện, ngắn gọn, dùng emoji nhẹ nhàng
- Nếu hỏi về sản phẩm: tư vấn nhiệt tình, gợi ý xem tại cohomedecor.com/san-pham
- Nếu hỏi về giá: nêu mức giá tham khảo nếu biết, mời xem website hoặc nhắn Messenger để báo giá chính xác
- Nếu hỏi hoàn toàn ngoài lề (toán, lập trình, y tế, chính trị...): trả lời "Mình chỉ tư vấn về decor và nội thất thôi ạ 🏠 Bạn cần tìm sản phẩm gì không?"
- KHÔNG được trả lời "xin lỗi mình chưa hiểu" với các câu hỏi liên quan đến sản phẩm, mua sắm, trang trí nhà cửa`;

  const messages = [...(history || []), { role: 'user', parts: [{ text: message }] }];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages,
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      }
    );
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Xin lỗi, mình bị gián đoạn một chút. Bạn vui lòng liên hệ hotline 079 666 9883 hoặc nhắn Messenger nhé!';
    res.status(200).json({ reply });
  } catch(e) {
    res.status(200).json({ reply: 'Hiện tại mình gặp sự cố kỹ thuật. Vui lòng liên hệ 079 666 9883 để được hỗ trợ nhé!' });
  }
}
