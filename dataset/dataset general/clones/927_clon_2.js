var httpFramework = require('express'),
    applicationInstance = httpFramework(),
    fileOperations = require('fs'),
    cloudStorageApi = require('knox');

var dataStream = require('stream'),
    graphicsProcessor = require('inkscape');

// Configure the web application settings.
applicationInstance.configure(function() {
    // Serve static assets from the 'public' directory.
    applicationInstance.use(httpFramework["static"](__dirname + '/public'));

    // Enable parsing of incoming request bodies (e.g., JSON, URL-encoded).
    applicationInstance.use(httpFramework.bodyParser());

    // Mount the application's router middleware.
    applicationInstance.use(applicationInstance.router);
    return; // Explicit return, though not strictly necessary here.
});

// Initialize the cloud storage client based on environment variables or configuration file.
if (process.env['CLOUD_ACCESS_KEY_ID']) {
    var remoteClient = cloudStorageApi.createClient({
        key: process.env['CLOUD_ACCESS_KEY_ID'],
        secret: process.env['CLOUD_SECRET_ACCESS_KEY'],
        bucket: process.env['CLOUD_BUCKET_NAME']
    });
} else {
    // Fallback to a local configuration file if environment variables are not set.
    var configuration = require('./conf');
    var remoteClient = cloudStorageApi.createClient(configuration.aws);
}

// Define a route for handling incoming POST requests to the root path.
applicationInstance.post('/', function(requestPayload, serverResponse, nextRoute) {

    // Extract unique identifier from the request body.
    var contentIdentifier = requestPayload.body.id;
    var vectorFormatName = contentIdentifier + '.svg';
    var rasterFormatName = contentIdentifier + '.png';

    // Construct full paths for temporary files.
    var vectorTemporaryPath = __dirname + '/tmp/' + vectorFormatName;
    var rasterTemporaryPath = __dirname + '/tmp/' + rasterFormatName;

    // Define the SVG XML document type declaration.
    var svgDocumentDeclaration = '<?xml version=\"1.0" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">';
    // Decode the base64 encoded SVG source from the request.
    var decodedVectorData = new Buffer(requestPayload.body.source, 'base64').toString();
    // Combine declaration and decoded content.
    var finalVectorSource = svgDocumentDeclaration + decodedVectorData;

    // Write the SVG data to a temporary file.
    fileOperations.writeFile(vectorTemporaryPath, finalVectorSource, function(writeError) {
        if (writeError) {
            console.error("Error writing SVG file:", writeError);
        }

        // Create a writable stream for the PNG output.
        var pngOutputStream = fileOperations.createWriteStream(rasterTemporaryPath);
        // Attach a listener for the stream's close event.
        pngOutputStream.on('close', processCompletionCallback);

        // Create a readable stream from the temporary SVG file.
        var svgInputStream = fileOperations.createReadStream(vectorTemporaryPath);

        // Pipe the SVG content through Inkscape for conversion to PNG, then to the output stream.
        svgInputStream
            .pipe(new graphicsProcessor(['-e'])) // Use Inkscape to export.
            .pipe(pngOutputStream);

        // Callback function executed once the PNG file has been fully written.
        function processCompletionCallback() {
            remoteClient.putFile(rasterTemporaryPath, rasterFormatName, {
                'Content-Type': 'image/png'
            }, function(uploadError, s3Response) {
                if (uploadError) {
                    console.error("Error uploading PNG to S3:", uploadError);
                }
                if (s3Response) {
                    console.info('PNG successfully stored in Amazon S3 bucket.');
                    s3Response.resume(); // Ensure data is consumed from the response.
                    s3Response.on('end', function() {
                        console.info('Cloud upload connection terminated.');
                        // Clean up temporary SVG file.
                        fileOperations.unlink(vectorTemporaryPath, function(cleanupErrorSvg) {
                            if (cleanupErrorSvg) console.error("Error deleting temp SVG:", cleanupErrorSvg);
                            // Clean up temporary PNG file.
                            fileOperations.unlink(rasterTemporaryPath, function(cleanupErrorPng) {
                                if (cleanupErrorPng) console.error("Error deleting temp PNG:", cleanupErrorPng);
                                return; // End of cleanup.
                            });
                        });
                    });
                }
            });
        }
    });

    // Respond to the client, indicating success.
    serverResponse.format({
        json: function() {
            serverResponse.send('Vector and Raster files processed and saved.\n');
        }
    });

});


// Determine the listening port for the server.
var servicePort = process.env['SERVICE_PORT'] || 4444;

// Export a function to start the server.
module.exports.initializeService = function() {
    console.info('Starting graphics conversion service on port ' + servicePort);
    return applicationInstance.listen(servicePort);
};
// Immediately start the service upon module load.
module.exports.initializeService();