import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { booking, userEmail } = await req.json();

    if (!booking || !userEmail || !booking.hotelId) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    // Проверяем URL, если его нет - используем локальный
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Создаем Stripe-сессию
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail, // Можно закомментировать, если есть проблемы
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: booking.name,
              description: `Бронирование в ${booking.city}`,
            },
            unit_amount: booking.totalPrice * 100, // Stripe требует сумму в центах
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/bookings?success=true&bookingId=${booking.hotelId}`,
      cancel_url: `${BASE_URL}/bookings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Ошибка Stripe:", error);
    return NextResponse.json({ error: "Ошибка при создании платежа" }, { status: 500 });
  }
}
