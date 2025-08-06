// netlify/functions/getGcsSignedUrl.js
// Returns a signed URL for uploading to Google Cloud Storage

const { Storage } = require('@google-cloud/storage');

const bucketName = process.env.GCS_BUCKET_NAME;
const keyFilename = process.env.GCS_KEYFILE_PATH; // Path to your service account key JSON

const storage = new Storage({ keyFilename });

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { fileName, contentType } = JSON.parse(event.body);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires,
      contentType
    });
    // Public URL for download/view
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(fileName)}`;
    return {

      statusCode: 200,
      body: JSON.stringify({ url, publicUrl })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get signed URL' })
    };
  }
};
