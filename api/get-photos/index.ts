import {APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2} from 'aws-lambda';
import {S3} from 'aws-sdk';

const s3 = new S3();
const bucketName = process.env.PHOTO_BUCKET_NAME!;

async function generateUrl(object: S3.Object): Promise<{ filename: string, url: string}> {
    const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: bucketName,
        Key: object.Key!,
        Expires: (24*69*69)
    });

    return {
        filename: object.Key!,
        url
    }
}

export async function getPhotos(event: APIGatewayProxyEventV2, context: Context):Promise<APIGatewayProxyStructuredResultV2> {
    console.log(`I got the bucket name and it is ${bucketName}`);
    try {
        const {Contents: results} = await s3.listObjects({Bucket: bucketName}).promise();
        const photos = await Promise.all(results!.map(result => generateUrl(result)));

        return {
            statusCode: 200,
            body: JSON.stringify(photos)
        };

    } catch (error: unknown) { 
        let body;
        if (error instanceof Error) {
            body = error.message;
        }

        return {
            statusCode: 500,
            body: body
        };
    }
}