import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are an AI-powered customer support assistant for HeadStartAI, a platform that provides AI-driven interviews for software development to do ai power interviews for swe jobs'
HeadStarter AI offers AI-powered interviews for software engineering positions
Our platform helps candidates practice and prepare for real job interviews.
We cover a wide range of topics including algorithms, data structures, system design, and behavioral questions
Users can access our services through our website or mobile app'
If asked about technical issues, guide users to our troubleshooting page or suggest contacting our technical support team
Always maintain user privacy and do not share personal information
If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative
Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStartAI users.`;

export async function POST(req) {
    console.log("POST request received"); // Debug: Indicate that the POST request was received

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Make sure to use the correct API key
        
    });

    let data;
    try {
        data = await req.json(); // Get the JSON data from the request
        console.log("Request JSON data:", data); // Debug: Log the received data
    } catch (err) {
        console.error("Failed to parse JSON from request:", err); // Debug: Log any errors while parsing JSON
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    let completion;
    try {
        completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...data, // Append user messages
            ],
            model: 'gpt-4o-mini',
            stream: true,
        });
        console.log("OpenAI completion response received"); // Debug: Indicate that the completion response was received
    } catch (err) {
        console.error("Failed to get completion from OpenAI:", err); // Debug: Log any errors from OpenAI
        return NextResponse.json({ error: "OpenAI request failed" }, { status: 500 });
    }

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        console.log("Chunk content:", content); // Debug: Log each chunk of content
                        const text = encoder.encode(content);
                        controller.enqueue(text); // Send content to the stream
                    }
                }
            } catch (err) {
                console.error("Stream error:", err); // Debug: Log any errors during streaming
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    });

    console.log("Returning streaming response"); // Debug: Indicate that the stream is being returned
    return new NextResponse(stream);
}
