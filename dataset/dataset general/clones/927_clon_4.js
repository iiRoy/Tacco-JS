const httpModule = require('http');
const pathModule = require('path');
const fsPromises = require('fs/promises');
const childProcess = require('child_process');
const awsSDK = require('aws-sdk');
const temporaryFiles = require('tmp-promise');

let storageService;

async function configureStorageAccess() {
    if (process.env['ACCESS_KEY_ID_FOR_STORAGE']) {
        awsSDK.config.update({
            accessKeyId: process.env['ACCESS_KEY_ID_FOR_STORAGE'],
            secretAccessKey: process.env['SECRET_KEY_FOR_STORAGE'],
            region: process.env['STORAGE_REGION'] || 'us-east-1'
        });
        storageService = new awsSDK.S3({ params: { Bucket: process.env['STORAGE_BUCKET_NAME'] } });
    } else {
        let localSettings;
        try {
            localSettings = require('./system_settings');
        } catch (error) {
            console.error("Local configuration file 'system_settings.js' not found or invalid.");
            process.exit(1);
        }
        awsSDK.config.update({
            accessKeyId: localSettings.storageCredentials.id,
            secretAccessKey: localSettings.storageCredentials.secret,
            region: localSettings.storageCredentials.region || 'us-east-1'
        });
        storageService = new awsSDK.S3({ params: { Bucket: localSettings.storageCredentials.bucket } });
    }
}

async function processRequest(incoming, outgoing) {
    if (incoming.method === 'GET' && incoming.url.startsWith('/public/')) {
        const assetPath = pathModule.join(__dirname, incoming.url);
        try {
            const assetContent = await fsPromises.readFile(assetPath);
            let mimeType = 'application/octet-stream';
            if (incoming.url.endsWith('.html')) mimeType = 'text/html';
            else if (incoming.url.endsWith('.css')) mimeType = 'text/css';
            else if (incoming.url.endsWith('.js')) mimeType = 'application/javascript';
            else if (incoming.url.endsWith('.png')) mimeType = 'image/png';
            else if (incoming.url.endsWith('.svg')) mimeType = 'image/svg+xml';

            outgoing.writeHead(200, { 'Content-Type': mimeType });
            outgoing.end(assetContent);
        } catch (error) {
            outgoing.writeHead(404, { 'Content-Type': 'text/plain' });
            outgoing.end('Resource not located');
        }
        return;
    }

    if (incoming.method === 'POST' && incoming.url === '/') {
        let payloadAccumulator = '';
        for await (const dataChunk of incoming) {
            payloadAccumulator += dataChunk.toString();
        }

        let parsedData;
        try {
            parsedData = JSON.parse(payloadAccumulator);
        } catch (e) {
            outgoing.writeHead(400, { 'Content-Type': 'application/json' });
            outgoing.end(JSON.stringify({ outcome: 'Malformed JSON provided' }));
            return;
        }

        const uniqueKey = parsedData.id;
        const graphicsSource = parsedData.source;

        if (!uniqueKey || !graphicsSource) {
            outgoing.writeHead(400, { 'Content-Type': 'application/json' });
            outgoing.end(JSON.stringify({ outcome: 'Required "id" or "source" fields are absent' }));
            return;
        }

        const vectorFileIdentifier = `${uniqueKey}.vector`;
        const rasterFileIdentifier = `${uniqueKey}.raster`;

        let temporaryVectorGraphicsFile, temporaryRasterGraphicsFile;

        try {
            const { path: vectorPath, cleanup: cleanVector } = await temporaryFiles.file({ postfix: '.svg' });
            const { path: rasterPath, cleanup: cleanRaster } = await temporaryFiles.file({ postfix: '.png' });
            temporaryVectorGraphicsFile = vectorPath;
            temporaryRasterGraphicsFile = rasterPath;

            const svgPreamble = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
            const decodedContent = Buffer.from(graphicsSource, 'base64').toString('utf8');
            const completeSvgContent = svgPreamble + decodedContent;

            await fsPromises.writeFile(temporaryVectorGraphicsFile, completeSvgContent, 'utf8');

            await new Promise((resolveConversion, rejectConversion) => {
                const converterProcess = childProcess.spawn('inkscape', ['-o', temporaryRasterGraphicsFile, temporaryVectorGraphicsFile]);

                converterProcess.on('error', (err) => {
                    console.error('Inkscape execution error:', err);
                    rejectConversion(new Error('Failed to initiate Inkscape process. Verify Inkscape installation and PATH.'));
                });

                converterProcess.on('close', (exitCode) => {
                    if (exitCode === 0) {
                        resolveConversion();
                    } else {
                        console.error(`Inkscape transformation failed with code ${exitCode}`);
                        rejectConversion(new Error(`Inkscape transformation failed: ${exitCode}`));
                    }
                });
            });

            const rasterDataBuffer = await fsPromises.readFile(temporaryRasterGraphicsFile);

            const uploadDirective = {
                Key: rasterFileIdentifier,
                Body: rasterDataBuffer,
                ContentType: 'image/png'
            };
            await storageService.upload(uploadDirective).promise();
            console.log('Raster graphic successfully archived to cloud storage.');

            outgoing.writeHead(200, { 'Content-Type': 'application/json' });
            outgoing.end(JSON.stringify({ outcome: 'Graphics files processed and archived' }));

        } catch (error) {
            console.error('Processing sequence error:', error);
            outgoing.writeHead(500, { 'Content-Type': 'application/json' });
            outgoing.end(JSON.stringify({ outcome: 'Processing encountered an error', explanation: error.message }));
        } finally {
            if (temporaryVectorGraphicsFile) {
                try {
                    await fsPromises.unlink(temporaryVectorGraphicsFile);
                } catch (e) { console.warn('Failed to purge temporary vector file:', e.message); }
            }
            if (temporaryRasterGraphicsFile) {
                try {
                    await fsPromises.unlink(temporaryRasterGraphicsFile);
                } catch (e) { console.warn('Failed to purge temporary raster file:', e.message); }
            }
        }
    } else {
        outgoing.writeHead(404, { 'Content-Type': 'application/json' });
        outgoing.end(JSON.stringify({ outcome: 'Requested path not available' }));
    }
}

let activeServerInstance;
async function commenceOperation() {
    await configureStorageAccess();

    const servicePort = process.env['SERVICE_PORT'] || 4444;
    activeServerInstance = httpModule.createServer(processRequest);

    activeServerInstance.listen(servicePort, () => {
        console.log(`Graphics processing service initiating on port ${servicePort}`);
    });
}

commenceOperation();