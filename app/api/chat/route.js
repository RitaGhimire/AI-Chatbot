import { NextResponse } from "next/server"; //two libraries for our one response AI
import OpenAI from "openai";
const systemPrompt = `You are an AI-powered customer support assistant for HeadStartAI, a platform that provides AI-driven interviews for software development to do ai power interviews for swe jobs'
HeadStarter AI offers AI-powered interviews for software engineering positions
Our platform helps candidates practice and prepare for real job interviews.
We cover a wide range of topics including algorithms, data structures, system design, and behavioral questions
Users can access our services through our website or mobile app'
If asked about technical issues, guide users to our troubleshooting page or suggest contacting our technical support team
Always maintain user privacy and do not share personal information
If youre unsure about any information, its okay to say you dont know and offer to connect the user with a human representative
Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStartAI users.`

export async function POST(req){ //FUNCTION FOR ONE ROUTED REQUEST
    const openai = new OpenAI() //this is declaring openAI
    const data = await req.json() //this is trying to get the json data from your request
    const completion = await openai.chat.completions.create({ //chat completion from your request
        messages: [ //the await function is there so it doesn't block your code while you're waiting, multiple requests can be sent at the same time.
            {
            role: 'system', //putting system prompt for messages
            content: systemPrompt,
        },
        ...data, //await pachi you finally get your data
    ],
    model: 'gpt-4o-mini', //used a gpt model and streamed it.
    stream: true,
     })
     //outputting the response using stream response
    const stream = new ReadableStream({
    async startTransition(controller){ //initiates the stream
        const encoder = new TextDecoder()
        try{
            for await(const chunk of completion){ //waits for every chunks that completion sends, openAI sends completion as chuncks
                const content = chunk.choices[0]?.delta?.content //extracting every content from chunks
                if (content){
                    const text = encoder.encode(content) //if we have the content 
                    controller.enqueue(text) // sent it to controller
                }

            }
        }
        catch(err){
            controller.error(err)
         } finally{
controller.close()
            }
        },
    })
    return new NextResponse(stream) //returning the stream
}



