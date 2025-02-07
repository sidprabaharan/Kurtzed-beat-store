const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    try {
        const { beatId } = JSON.parse(event.body);
        const beats = [
            { id: 1, name: "Chill Vibes", price: 2000 },
            { id: 2, name: "Trap Banger", price: 3500 }
        ];

        const beat = beats.find(b => b.id === beatId);
        if (!beat) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Beat not found" })
            };
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: beat.name,
                        },
                        unit_amount: beat.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://my-beats-store-bucket.s3.us-east-1.amazonaws.com/success.html',
            cancel_url: 'https://my-beats-store-bucket.s3.us-east-1.amazonaws.com/cancel.html',
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error creating session", error: error.message })
        };
    }
};
