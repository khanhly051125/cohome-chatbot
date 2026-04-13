export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history } = req.body;

  const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn của CoHome Decor - thương hiệu nội thất và trang trí nhà cửa cao cấp tại Đà Nẵng, Việt Nam.
Website: cohomedecor.com
Hotline: 079 666 9883
Messenger: m.me/co.homedecordanang
Slogan: "Tinh tế trong từng chi tiết – mang đến không gian sống hiện đại và ấm cúng"

DANH MỤC SẢN PHẨM CoHome Decor:
- Đèn trang trí: đèn trần, đèn thả, đèn cây, đèn bàn, đèn tường – phong cách hiện đại, Bắc Âu, vintage
- Tranh trang trí: tranh canvas, tranh treo tường, tranh bộ nhiều tấm
- Gương trang trí: gương tròn, gương oval, gương khung gỗ, gương khung kim loại
- Đồng hồ treo tường: phong cách tối giản, hiện đại, vintage
- Vật phẩm phong thủy & decor: tượng trang trí, bình hoa, lọ sứ, khay gỗ
- Nội thất nhỏ: kệ treo tường, giá sách, bàn phụ, ghế trang trí
- Phụ kiện nhà bếp & phòng khách: khăn trải bàn, gối trang trí, thảm trải sàn

CHÍNH SÁCH:
- Giao hàng toàn quốc, miễn phí nội thành Đà Nẵng cho đơn từ 500k
- Đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất
- Khách mới đăng ký email nhận mã giảm 10%
- Thanh toán: chuyển khoản, COD, ví điện tử

PHONG CÁCH TRẢ LỜI:
- Thân thiện, nhiệt tình, ngắn gọn, bằng tiếng Việt
- Dùng emoji nhẹ nhàng như ✨ 🏠 💛 để thêm cảm xúc
- Nếu khách hỏi về sản phẩm cụ thể, tư vấn nhiệt tình và gợi ý xem thêm tại website hoặc liên hệ hotline
- Nếu khách hỏi về giá, trả lời rằng giá dao động tùy mẫu và mời khách xem tại cohomedecor.com/san-pham hoặc nhắn Messenger để được báo giá chính xác
- Nếu câu hỏi HOÀN TOÀN không liên quan đến nội thất, trang trí, nhà cửa, mua sắm hoặc CoHome Decor (ví dụ: toán học, chính trị, y tế, lập trình...) thì trả lời: "Mình chỉ có thể tư vấn về nội thất và trang trí nhà cửa thôi ạ 🏠 Bạn có câu hỏi nào về sản phẩm của CoHome không?"
- KHÔNG bịa đặt giá cụ thể nếu không chắc chắn`;

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
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
        })
      }
    );
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, mình chưa hiểu câu hỏi. Bạn có thể hỏi lại hoặc liên hệ hotline 079 666 9883 nhé!';
    res.status(200).json({ reply });
  } catch (e) {
    res.status(200).json({ reply: 'Xin lỗi, có lỗi xảy ra. Vui lòng liên hệ hotline 079 666 9883 để được hỗ trợ nhé!' });
  }
}
