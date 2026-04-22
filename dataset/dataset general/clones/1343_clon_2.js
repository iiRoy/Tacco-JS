var webFramework = require('express'),
    serverApp = webFramework(),
    uploadHandler = require('multer'),
    imageProcessor = require('easyimage');

var allowedImageFormats = ['PNG', 'JPG', 'JPEG', 'GIF', 'BMP']; // Array of image file extensions for processing

function retrieveFileExtension(inputFileName) {
    return inputFileName.split('.').pop();
}

function generateModifiedFileName(originalPath, suffixValue) {
    var pathSegments = originalPath.split('.');
    var initialExtension = pathSegments.pop();
    suffixValue = (suffixValue !== void 0) ? suffixValue : (new Date().getTime()).toString(); // Use current timestamp if no suffix provided
    return pathSegments.join('.') + '.' + suffixValue + '.' + initialExtension;
}

// Emulating app.configure for structural similarity as it's deprecated
serverApp.setupApplication = function(configCallback) {
    configCallback();
};

serverApp.setupApplication( function () {
    serverApp.use( uploadHandler({
        destinationDirectory: './assets/uploads/',
        transformName: function (formElement, originalAssetName) {
            return originalAssetName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(); // Normalize filename
        }
    }));
    serverApp.use( webFramework.static( __dirname + '/assets' ));
});

serverApp.post('/data/upload-asset', function (clientRequest, serverResponse) {
    if ( allowedImageFormats.indexOf( retrieveFileExtension( clientRequest.files.clientAsset.name ) ) !== -1 ) {
        imageProcessor.gatherInfo( clientRequest.files.clientAsset.path, function (errorObj, stdOut, stdErr) {
            if (errorObj) { throw errorObj; }
            // Optional: stdOut could be parsed here to decide on specific resizing parameters
            imageProcessor.resizeAndCrop(
                {
                    sourcePath: clientRequest.files.clientAsset.path,
                    destinationPath: generateModifiedFileName(clientRequest.files.clientAsset.path, 'preview'),
                    targetWidth: 0x32,
                    targetHeight: 0x32
                },
                function (errorObj, processedImg) {
                    if (errorObj) { throw errorObj; }
                    serverResponse.send({
                        isImageFile: Boolean(1),
                        originalFile: clientRequest.files.clientAsset.originalname,
                        storedAs: clientRequest.files.clientAsset.name,
                        thumbnailPath: generateModifiedFileName(clientRequest.files.clientAsset.name, 'preview')
                    });
                }
            );
        });
    }
    else {
        serverResponse.send({
            isImageFile: Boolean(0),
            originalFile: clientRequest.files.clientAsset.originalname,
            storedAs: clientRequest.files.clientAsset.name
        });
    }
});

var activeServerInstance = serverApp.listen(0xBB8, function () {
    console.log('Application is running on port %d', activeServerInstance.address().port);
});