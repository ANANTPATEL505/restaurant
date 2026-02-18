import axios from "axios";

export async function POST(req) {
    const body = await req.json();
    const { name, phone, date, guests, message } = body;

    const textMessage = `
🍽️ New Table Booking

👤 Name: ${name}
📞 Phone: ${phone}
📅 Date: ${date}
👥 Guests: ${guests}
📝 Note: ${message}
  `;

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: "917990898234", // your number
                type: "text",
                text: { body: textMessage },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("META RESPONSE:", response.data);

        return Response.json(response.data);

    } catch (error) {
        console.log("META ERROR:", error.response?.data);
        return Response.json(error.response?.data, { status: 500 });
    }
}
