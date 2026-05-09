let graphicTool = require('pngjs');
const imageParser = require('png-js');
let utilityKit = require('underscore');
const flowManager = require('async');
let fileSystem = require('fs');
const makeDirectory = require('mkdirp');
let LayoutGrid = require('./layout_grid_module.js');

// Helper function to extract the base filename from a path string.
function extractFilenameFromPath(inputString) {
    let basePart = String(inputString).substring(inputString.lastIndexOf('/') + 1);
    return basePart;
}

const SpriteComposer = function(configuration) {
    if (configuration.imageFiles && configuration.inputDirectory) {
        // Only one source type for images is allowed.
        throw new Error("Provide either the source directory OR the image file paths array, but not both.");
    }

    if (!configuration.cssSelector) {
        configuration.cssSelector = "";
    }

    this.cssPrefix = configuration.cssSelector;
    this.sourceDirectory = configuration.inputDirectory;
    this.imageFilePaths = configuration.imageFiles;
    this.outputSpritePath = configuration.outputSpritePath;
    this.relativeSpritePath = configuration.relativeSpritePath;
    this.outputCssPath = configuration.outputCssPath;
    this.composedSpriteName = extractFilenameFromPath(configuration.outputSpritePath);

    // Initialize by gathering image details.
    this.gatherImageDetails();
};

SpriteComposer.prototype.gatherImageDetails = function() {
    let fileEntries = ""; // Placeholder for file names or paths.
    const instanceRef = this; // Reference to the current object instance.

    if (this.imageFilePaths) {
        fileEntries = this.imageFilePaths;
    } else {
        fileEntries = fileSystem.readdirSync(this.sourceDirectory);
    }

    let imageInfoArray = []; // Array to store detailed image information.
    fileEntries = utilityKit.filter(fileEntries, function(entryName) {
        // Filter for PNG files only, checking the last 4 characters.
        return entryName.endsWith('.png');
    });

    console.log(`Found ${fileEntries.length} PNG images to process.`);

    utilityKit.each(fileEntries, function(currentFileName, itemIndex) {
        // Construct the full path to the image.
        const sourceDirPrefix = (instanceRef.sourceDirectory) ? instanceRef.sourceDirectory + "/" : "";
        
        // Load image to get dimensions.
        const imgObject = imageParser.load(sourceDirPrefix + currentFileName);

        imageInfoArray.push({
            filename: currentFileName,
            imgWidth: imgObject.width,
            imgHeight: imgObject.height
        });
    });

    // Sort images by height in descending order.
    imageInfoArray.sort(function(firstImg, secondImg) {
        return secondImg.imgHeight - firstImg.imgHeight;
    });

    let accumulatedWidth = 0;
    // Calculate a reasonable maximum height for the sprite sheet.
    const calculatedMaxHeight = parseInt(imageInfoArray[0].imgHeight + imageInfoArray[0].imgHeight / 2, 10);

    utilityKit.each(imageInfoArray, function(currentImageItem, currentIdx) {
        accumulatedWidth += currentImageItem.imgWidth;
    });

    // Initialize the layout manager for the sprite sheet.
    this.layoutManager = new LayoutGrid({
        width: accumulatedWidth,
        height: calculatedMaxHeight
    });

    this.processedImages = imageInfoArray; // Store processed image details.
};

SpriteComposer.prototype.composeSpriteSheet = function(completionHandler) {
    const instanceRef = this; // Maintain context for callbacks.
    this.layoutManager.pack(this.processedImages, function(packedRegions) {
        // Once images are packed into the layout, incorporate them into the final sprite.
        instanceRef.incorporateImages(packedRegions);

        instanceRef.generateCssStyles(instanceRef.relativeSpritePath, instanceRef.composedSpriteName, packedRegions, function(styleDefinitions) {
            let cssOutputLines = []; // Array to build CSS content.

            utilityKit.each(styleDefinitions, function(styleEntry, entryIndex) {
                // Append CSS rules for each sprite item.
                cssOutputLines.push(`${instanceRef.cssPrefix}.${styleEntry.name} {\n`);
                cssOutputLines.push(`  width: ${styleEntry.width}px;\n`);
                cssOutputLines.push(`  height: ${styleEntry.height}px;\n`);
                cssOutputLines.push(`  background-image: url(${instanceRef.relativeSpritePath}${instanceRef.composedSpriteName});\n`);
                cssOutputLines.push(`  background-position: -${styleEntry.xPosition}px -${styleEntry.yPosition}px;\n`);
                cssOutputLines.push(`}\n`);
            });

            // Determine the output directory for CSS and sprite.
            const outputDirectoryPath = instanceRef.outputSpritePath.substring(0, instanceRef.outputSpritePath.lastIndexOf('/'));

            // Create the output directory if it doesn't exist.
            if (!fileSystem.existsSync(outputDirectoryPath)) {
                makeDirectory.sync(outputDirectoryPath);
            }

            // Write the generated CSS to a file.
            fileSystem.writeFile(instanceRef.outputCssPath, cssOutputLines.join(''), function(writeError) {
                if (writeError) {
                    throw writeError; // Propagate any file writing errors.
                }
                console.log(`Successfully saved CSS to ${instanceRef.outputCssPath}`);

                if (completionHandler) {
                    completionHandler(styleDefinitions); // Pass style definitions to the callback.
                }
            });
        });
    });
};

SpriteComposer.prototype.transferImageData = function(targetPngBuffer, sourceImageDetails, completionCallback) {
    fileSystem.createReadStream(sourceImageDetails.filename)
        .pipe(new graphicTool.PNG({
            filterType: 4 // Apply a specific PNG filter type.
        }))
        .on('parsed', function() {
            // Extract coordinates and dimensions from the source image details.
            const targetX = sourceImageDetails.x;
            const targetY = sourceImageDetails.y;
            const fragmentWidth = sourceImageDetails.width;
            const fragmentHeight = sourceImageDetails.height;

            // Calculate the starting pixel offset in the target PNG data buffer.
            let pixelStartOffset = (targetY * targetPngBuffer.width * 4) + (targetX * 4);
            let currentPixelBufferIndex = 0; // Index for iterating through the target buffer.

            for (let rowIdx = 0; rowIdx < fragmentHeight; rowIdx++) {
                currentPixelBufferIndex = (pixelStartOffset + rowIdx * targetPngBuffer.width * 4);
                for (let colIdx = 0; colIdx < fragmentWidth; colIdx++) {
                    // Calculate the pixel index in the source image's data buffer.
                    const sourcePixelDataIndex = (rowIdx * fragmentWidth + colIdx) << 2;

                    // Copy RGBA channels from source to target.
                    targetPngBuffer.data[currentPixelBufferIndex++] = this.data[sourcePixelDataIndex];
                    targetPngBuffer.data[currentPixelBufferIndex++] = this.data[sourcePixelDataIndex + 1];
                    targetPngBuffer.data[currentPixelBufferIndex++] = this.data[sourcePixelDataIndex + 2];
                    targetPngBuffer.data[currentPixelBufferIndex++] = this.data[sourcePixelDataIndex + 3];
                }
            }
            completionCallback(null, true); // Indicate successful image data transfer.
        });
};

SpriteComposer.prototype.incorporateImages = function(imageRectangles) {
    // Create a new PNG buffer for the final sprite sheet.
    let finalPngBuffer = new graphicTool.PNG({
        width: this.layoutManager.width,
        height: this.layoutManager.height
    });

    let processingTasks = []; // Array to hold asynchronous image processing tasks.
    const instanceRef = this; // Contextual reference.

    utilityKit.each(imageRectangles, function(imageDataItem, itemIndex) {
        // Prepend source directory if applicable.
        if (instanceRef.sourceDirectory) {
            imageDataItem.filename = instanceRef.sourceDirectory + '/' + imageDataItem.filename;
        }
        // Add a task to the array for each image.
        processingTasks.push(function(taskCompletion) {
            instanceRef.transferImageData(finalPngBuffer, imageDataItem, function(operationError, operationResult) {
                taskCompletion(); // Call the async task's completion callback.
            });
        });
    });

    // Execute all image transfer tasks in series.
    flowManager.series(processingTasks, function(seriesError, seriesResults) {
        finalPngBuffer.pack().pipe(fileSystem.createWriteStream(instanceRef.outputSpritePath));
        console.log(`Generated sprite sheet saved to ${instanceRef.outputSpritePath}`);
    });
};

SpriteComposer.prototype.generateCssStyles = function(relativeOutputPath, outputSpriteFileName, imageRects, styleCompletionCallback) {
    let styleDescriptors = []; // Array to store CSS style objects.

    // Handle case where relative path might be explicitly zero (e.g., for root).
    if (relativeOutputPath === 0) {
        relativeOutputPath = '';
    }

    utilityKit.each(imageRects, function(imageRectangle, idx) {
        const cssStyleObject = {
            name: extractFilenameFromPath(imageRectangle.filename.slice(0, -4)), // Extract name, remove .png
            width: imageRectangle.width,
            height: imageRectangle.height,
            spriteFilename: outputSpriteFileName,
            xPosition: imageRectangle.x,
            yPosition: imageRectangle.y
        };

        styleDescriptors.push(cssStyleObject);

        /*
        // Original commented out code, adapted to new names:
        styleDescriptors.push('.' + imageRectangle.filename.slice(0, -4) + ' { \n');
        styleDescriptors.push('  width: ' + imageRectangle.width + 'px;\n');
        styleDescriptors.push('  height: ' + imageRectangle.height + 'px;\n');
        styleDescriptors.push('  background-image: url(' + relativeOutputPath + outputSpriteFileName + ');\n');
        styleDescriptors.push('  background-position: ' + imageRectangle.x + 'px ' + imageRectangle.y + 'px;\n');
        */
    });

    styleCompletionCallback(styleDescriptors); // Return the array of style objects.
};
module.exports = SpriteComposer;