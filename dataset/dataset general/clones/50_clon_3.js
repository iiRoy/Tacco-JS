var PngEncoder = require('pngjs');
var PngDecoder = require('png-js');
var CollectionUtils = require('underscore');
var FlowControl = require('async');
var FileSystem = require('fs');
var DirectoryCreator = require('mkdirp');
var SpatialLayoutEngine = require('./rectangle_sheet.js');

/**
 * Extracts the base file name from a given file path string.
 * @param {string} fullPath - The complete path to a file.
 * @returns {string} The file name without the directory part.
 */
function getFileNameFromPath(fullPath) {
    if (typeof fullPath !== 'string' || fullPath.length === 0) {
        return '';
    }
    const lastSlashIndex = fullPath.lastIndexOf('/');
    return (lastSlashIndex === -1) ? fullPath : fullPath.substring(lastSlashIndex + 1);
}

var SpriteAssembler = function(configuration) {
    // Validate input configuration
    if (!configuration || typeof configuration !== 'object') {
        throw new Error("Configuration object is required for SpriteAssembler.");
    }

    if (configuration.imageSources && configuration.inputDirectoryPath) {
        throw new Error("Provide either an array of image paths OR a source directory, not both.");
    }
    if (!configuration.imageSources && !configuration.inputDirectoryPath) {
        throw new Error("Either 'imageSources' array or 'inputDirectoryPath' string must be provided.");
    }
    if (!configuration.outputSpriteFilePath || !configuration.outputCssFilePath) {
        throw new Error("Both 'outputSpriteFilePath' and 'outputCssFilePath' are mandatory.");
    }

    this.cssClassPrefix = configuration.cssClassPrefix || '';
    this.inputDirectoryPath = configuration.inputDirectoryPath;
    this.imageSources = configuration.imageSources;
    this.outputSpriteFilePath = configuration.outputSpriteFilePath;
    this.relativeSpriteUrl = configuration.relativeSpriteUrl;
    this.outputCssFilePath = configuration.outputCssFilePath;
    this.spriteBaseName = getFileNameFromPath(configuration.outputSpriteFilePath);

    // Initial step: gather dimensions and prepare for layout
    this.initializeImageData();
};

SpriteAssembler.prototype.initializeImageData = function() {
    let rawImagePaths;
    const currentInstance = this;

    if (this.imageSources) {
        rawImagePaths = this.imageSources;
    } else {
        try {
            rawImagePaths = FileSystem.readdirSync(this.inputDirectoryPath);
        } catch (error) {
            console.error(`Failed to read directory: ${this.inputDirectoryPath}. Error: ${error.message}`);
            rawImagePaths = []; // Ensure it's an array for subsequent operations
        }
    }

    // Filter for PNG files only
    let pngFiles = CollectionUtils.filter(rawImagePaths, function(fileName) {
        return fileName.toLowerCase().endsWith('.png');
    });

    if (pngFiles.length === 0) {
        console.warn("No PNG images found to process.");
        this.processedImages = [];
        this.layoutManager = new SpatialLayoutEngine({ width: 0, height: 0 });
        return;
    }

    console.log(`Processing ${pngFiles.length} PNG images...`);

    let imageDetailsList = [];
    const baseDirPrefix = this.inputDirectoryPath ? `${this.inputDirectoryPath}/` : '';

    CollectionUtils.each(pngFiles, function(fileName) {
        const fullImagePath = baseDirPrefix + fileName;
        try {
            const imageDataReader = PngDecoder.load(fullImagePath);
            imageDetailsList.push({
                originalName: fileName,
                fullPath: fullImagePath,
                width: imageDataReader.width,
                height: imageDataReader.height
            });
        } catch (e) {
            console.error(`Could not load image ${fullImagePath}: ${e.message}`);
        }
    });

    // Sort images by height in descending order for better packing efficiency
    imageDetailsList.sort((imgA, imgB) => imgB.height - imgA.height);

    let totalCalculatedWidth = 0;
    // Estimate maximum sheet height; a common heuristic is 1.5x the tallest image
    const estimatedSheetHeight = imageDetailsList.length > 0 ? Math.ceil(imageDetailsList[0].height * 1.5) : 0;

    CollectionUtils.each(imageDetailsList, function(imgData) {
        totalCalculatedWidth += imgData.width;
    });

    this.layoutManager = new SpatialLayoutEngine({ width: totalCalculatedWidth, height: estimatedSheetHeight });
    this.processedImages = imageDetailsList;
};

SpriteAssembler.prototype.generateSpriteSheet = function(completionCallback) {
    const currentContext = this;
    if (!this.processedImages || this.processedImages.length === 0) {
        console.warn("No images to pack. Skipping sprite sheet generation.");
        completionCallback && completionCallback([]);
        return;
    }

    this.layoutManager.pack(this.processedImages, function(layoutResults) {
        currentContext.renderSpriteImage(layoutResults);

        currentContext.generateCssDefinitions(currentContext.relativeSpriteUrl, currentContext.spriteBaseName, layoutResults, function(cssDataObjects) {
            const cssOutputLines = [];
            CollectionUtils.each(cssDataObjects, function(cssEntry) {
                // Construct each CSS rule using template literals
                cssOutputLines.push(`${currentContext.cssClassPrefix}.${cssEntry.name} {`);
                cssOutputLines.push(`  width: ${cssEntry.width}px;`);
                cssOutputLines.push(`  height: ${cssEntry.height}px;`);
                cssOutputLines.push(`  background-image: url(${currentContext.relativeSpriteUrl}${currentContext.spriteBaseName});`);
                cssOutputLines.push(`  background-position: -${cssEntry.x}px -${cssEntry.y}px;`);
                cssOutputLines.push(`}`);
            });

            const outputDirectory = currentContext.outputSpriteFilePath.substring(0, currentContext.outputSpriteFilePath.lastIndexOf('/'));

            if (!FileSystem.existsSync(outputDirectory)) {
                DirectoryCreator.sync(outputDirectory);
            }

            FileSystem.writeFile(currentContext.outputCssFilePath, cssOutputLines.join('\n\n'), function(err) {
                if (err) {
                    console.error(`Error saving CSS file to ${currentContext.outputCssFilePath}:`, err);
                    throw err;
                }
                console.log(`CSS file saved to: ${currentContext.outputCssFilePath}`);

                completionCallback && completionCallback(cssDataObjects);
            });
        });
    });
};

/**
 * Transfers pixel data from a source image into a specific region of the main sprite canvas.
 * @param {Object} targetPngCanvas - The main PngEncoder instance representing the sprite sheet.
 * @param {Object} sourceImageData - Details of the image to blit, including its position (x, y) and dimensions.
 * @param {Function} taskCompletionCallback - Callback function to signal completion.
 */
SpriteAssembler.prototype.blitImagePixels = function(targetPngCanvas, sourceImageData, taskCompletionCallback) {
    FileSystem.createReadStream(sourceImageData.fullPath)
        .pipe(new PngEncoder.PNG({
            filterType: 4 // Optimal filter type for PNG encoding
        }))
        .on('parsed', function() {
            const destinationX = sourceImageData.x;
            const destinationY = sourceImageData.y;
            const sourceImageWidth = sourceImageData.width;
            const sourceImageHeight = sourceImageData.height;
            const sourcePixelBuffer = this.data; // 'this' refers to the parsed PNG instance

            // Calculate the starting index in the target PNG's data array
            let targetBufferStartIndex = (destinationY * targetPngCanvas.width + destinationX) * 4;

            for (let row = 0; row < sourceImageHeight; row++) {
                let currentTargetRowIndex = targetBufferStartIndex + (row * targetPngCanvas.width * 4);
                let currentSourceRowIndex = row * sourceImageWidth * 4;

                for (let col = 0; col < sourceImageWidth; col++) {
                    const sourcePixelOffset = currentSourceRowIndex + (col * 4);
                    const targetPixelOffset = currentTargetRowIndex + (col * 4);

                    // Copy RGBA channels
                    targetPngCanvas.data[targetPixelOffset] = sourcePixelBuffer[sourcePixelOffset];       // Red
                    targetPngCanvas.data[targetPixelOffset + 1] = sourcePixelBuffer[sourcePixelOffset + 1]; // Green
                    targetPngCanvas.data[targetPixelOffset + 2] = sourcePixelBuffer[sourcePixelOffset + 2]; // Blue
                    targetPngCanvas.data[targetPixelOffset + 3] = sourcePixelBuffer[sourcePixelOffset + 3]; // Alpha
                }
            }
            taskCompletionCallback(null, true);
        })
        .on('error', (err) => {
            console.error(`Error parsing image ${sourceImageData.fullPath}:`, err);
            taskCompletionCallback(err);
        });
};

SpriteAssembler.prototype.renderSpriteImage = function(packedImageLayouts) {
    if (!this.layoutManager) {
        console.error("Layout manager not initialized. Cannot render sprite image.");
        return;
    }

    const finalSpriteCanvas = new PngEncoder.PNG({
        width: this.layoutManager.width,
        height: this.layoutManager.height,
        colorType: 6 // RGBA
    });

    const currentScope = this;
    const processingTasks = [];

    CollectionUtils.each(packedImageLayouts, function(imageLayout) {
        processingTasks.push(function(nextTask) {
            currentScope.blitImagePixels(finalSpriteCanvas, imageLayout, function(err, result) {
                if (err) console.error(`Failed to blit image ${imageLayout.originalName}: ${err}`);
                nextTask(err); // Pass error to async series
            });
        });
    });

    FlowControl.series(processingTasks, function(err) {
        if (err) {
            console.error("One or more images failed to be processed into the sprite sheet.");
            // Depending on desired behavior, could stop here or continue.
        }
        finalSpriteCanvas.pack().pipe(FileSystem.createWriteStream(currentScope.outputSpriteFilePath));
        console.log(`Sprite sheet saved to: ${currentScope.outputSpriteFilePath}`);
    });
};

SpriteAssembler.prototype.generateCssDefinitions = function(relativeSpritePath, spriteFileName, imageLayouts, cssReadyCallback) {
    const cssEntryList = [];

    // Ensure relative path is treated as empty string if falsy (e.g., 0, null, undefined)
    const effectiveRelativePath = relativeSpritePath || '';

    CollectionUtils.each(imageLayouts, function(layoutItem) {
        const cleanedImageName = getFileNameFromPath(layoutItem.originalName).replace(/\.png$/i, '');
        const cssObject = {
            name: cleanedImageName,
            width: layoutItem.width,
            height: layoutItem.height,
            spriteFileName: spriteFileName,
            x: layoutItem.x,
            y: layoutItem.y
        };
        cssEntryList.push(cssObject);
    });

    cssReadyCallback(cssEntryList);
};

module.exports = SpriteAssembler;