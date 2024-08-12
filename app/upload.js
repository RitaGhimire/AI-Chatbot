import { NextResponse } from "next/server";
import AWS from 'aws-sdk';
import { OpenSearchClient } from '@aws-sdk/client-opensearch';
import { getEmbedding } from './api/chat/utils'; // Utility to generate embeddings

const s3 = new AWS.S3();
const openSearchClient = new OpenSearchClient({ region: 'us-west-2' });

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');
    const fileName = file.name;
    const fileContent = await file.text();

    // Step 1: Upload to S3
    const s3Params = {
        Bucket: 'your-s3-bucket-name',
        Key: fileName,
        Body: fileContent,
    };
    try {
        await s3.upload(s3Params).promise();
        console.log('File uploaded to S3 successfully');
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        return NextResponse.json({ error: "S3 upload failed" }, { status: 500 });
    }

    // Step 2: Generate embedding for the document
    const embedding = await getEmbedding(fileContent);

    // Step 3: Store the embedding in OpenSearch
    const openSearchParams = {
        index: 'documents',
        body: {
            embedding: embedding,
            content: fileContent,
            fileName: fileName,
        }
    };
    try {
        await openSearchClient.index(openSearchParams);
        console.log('Document indexed in OpenSearch');
    } catch (err) {
        console.error('Error indexing document in OpenSearch:', err);
        return NextResponse.json({ error: "OpenSearch indexing failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
