const pdfConverterUtility = require('../index.js');
const fsModule = require('fs');
const pathModule = require('path');

// This module facilitates the generation of PDF documents from various sources.

// Configuration for output file paths and content.
const OUTPUT_DIRECTORY = __dirname;
const PDF_FORMAT_TYPE = 'pdf';
const DEFAULT_ENCODING = 'utf-8';

// Helper function to handle stream events
const attachStreamHandlers = (outputStream, outputName) => {
    outputStream.on('finish', () => {
        console.log(`[PROCESS_COMPLETE] Successfully generated: ${outputName}`);
    });
    outputStream.on('error', (err) => {
        console.error(`[ERROR_OCCURRED] Failed to generate ${outputName}:`, err.message);
        // Optionally, delete the partially created file here
        fsModule.unlink(outputName, (unlinkErr) => {
            if (unlinkErr) console.error(`[CLEANUP_ERROR] Could not delete partial file ${outputName}:`, unlinkErr.message);
        });
    });
};

// --- Scenario 1: Converting a remote web page to PDF ---
// This section demonstrates how to create a PDF from a given URL.
const remoteSourceUrl = 'http://nodejs.org/api/all.html';
const webPageOutputFilename = pathModule.join(OUTPUT_DIRECTORY, "remote_api_doc.pdf");

console.log(`[INITIATING] Starting PDF generation from URL: ${remoteSourceUrl}`);

try {
    const urlProcessingStream = pdfConverterUtility.spawn(PDF_FORMAT_TYPE, remoteSourceUrl);
    const urlOutputStream = fsModule.createWriteStream(webPageOutputFilename);

    // Ensure proper event handling for the output stream
    attachStreamHandlers(urlOutputStream, webPageOutputFilename);

    urlProcessingStream.stdout.pipe(urlOutputStream);
} catch (procError) {
    console.error(`[SPAWN_ERROR] Could not initiate URL conversion process:`, procError.message);
}


// --- Scenario 2: Converting a local HTML file to PDF ---
// This part illustrates generating a PDF from an existing file on the disk.
const localHtmlSourcePath = pathModule.join(OUTPUT_DIRECTORY, 'sample.html'); // Assuming 'sample.html' exists
const diskFileOutputFilename = pathModule.join(OUTPUT_DIRECTORY, "local_document_export.pdf");

console.log(`[INITIATING] Starting PDF generation from local file: ${localHtmlSourcePath}`);

// A simple check if the source file exists before proceeding.
if (!fsModule.existsSync(localHtmlSourcePath)) {
    console.warn(`[WARNING] Source file not found: ${localHtmlSourcePath}. Skipping local file conversion.`);
} else {
    try {
        const fileProcessingStream = pdfConverterUtility.spawn(PDF_FORMAT_TYPE, localHtmlSourcePath);
        const fileOutputStream = fsModule.createWriteStream(diskFileOutputFilename);

        attachStreamHandlers(fileOutputStream, diskFileOutputFilename);

        fileProcessingStream.stdout.pipe(fileOutputStream);
    } catch (procError) {
        console.error(`[SPAWN_ERROR] Could not initiate local file conversion process:`, procError.message);
    }
}


// --- Scenario 3: Converting an HTML string directly to PDF ---
// This block shows how to feed raw HTML content as a string for PDF creation.
const inlineHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="${DEFAULT_ENCODING}">
        <title>Generated Document</title>
        <style>body { font-family: sans-serif; margin: 20px; }</style>
    </head>
    <body>
        <h2>Hello, PDF World!</h2>
        <p>This document was generated directly from an HTML string provided at runtime.</p>
        <p><em>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.</em></p>
    </body>
    </html>
`;
const stringInputOutputFilename = pathModule.join(OUTPUT_DIRECTORY, "dynamic_content_output.pdf");

console.log(`[INITIATING] Starting PDF generation from an inline HTML string.`);

try {
    const contentInputProcessor = pdfConverterUtility.spawn(PDF_FORMAT_TYPE);
    const contentOutputStream = fsModule.createWriteStream(stringInputOutputFilename);

    attachStreamHandlers(contentOutputStream, stringInputOutputFilename);

    contentInputProcessor.stdout.pipe(contentOutputStream);
    contentInputProcessor.stdin.end(inlineHtmlContent, DEFAULT_ENCODING);
} catch (procError) {
    console.error(`[SPAWN_ERROR] Could not initiate string content conversion process:`, procError.message);
}

// End of PDF generation examples.