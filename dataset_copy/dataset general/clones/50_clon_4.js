const PngEncoder = require('pngjs');
const PathUtility = require('path');
const FsPromises = require('fs').promises;
const SizeReader = require('image-size');
const LayoutManager = require('./rectangle_sheet.js');

const retrieveImageDimensions = (assetPath) => {
    return new Promise((resolve, reject) => {
        SizeReader(assetPath, (err, dimensions) => {
            if (err) reject(err);
            else resolve(dimensions);
        });
    });
};

const extractLeafName = (fullPath) => PathUtility.basename(fullPath, PathUtility.extname(fullPath));

const createGraphicBinder = (settings) => {
    if (settings.assetPaths && settings.inputDirectory) {
        throw new Error("Provide either a source directory OR a list of asset paths, but not both.");
    }

    const currentConfiguration = {
        stylePrefix: settings.stylePrefix || "",
        inputDirectory: settings.inputDirectory,
        assetPaths: settings.assetPaths,
        outputImagePath: settings.outputImagePath,
        relativeImagePathForCss: settings.relativeImagePathForCss,
        outputStylePath: settings.outputStylePath,
        finalImageName: extractLeafName(settings.outputImagePath),
    };

    let collectedAssets = [];
    let layoutEngineInstance;

    const collectAssetDetails = async () => {
        let candidateAssets;
        if (currentConfiguration.assetPaths) {
            candidateAssets = currentConfiguration.assetPaths;
        } else {
            const directoryContents = await FsPromises.readdir(currentConfiguration.inputDirectory);
            candidateAssets = directoryContents.map(item => PathUtility.join(currentConfiguration.inputDirectory, item));
        }

        const imageFiles = candidateAssets.filter(item => PathUtility.extname(item).toLowerCase() === '.png');

        console.log(`Identified ${imageFiles.length} potential image assets.`);

        const dimensionPromises = imageFiles.map(async (filePath) => {
            const dims = await retrieveImageDimensions(filePath);
            return {
                sourcePath: filePath,
                width: dims.width,
                height: dims.height
            };
        });

        const rawAssetInformation = await Promise.all(dimensionPromises);

        rawAssetInformation.sort((itemA, itemB) => itemB.height - itemA.height);

        let aggregateWidth = 0;
        let maximalHeight = 0;

        if (rawAssetInformation.length > 0) {
            maximalHeight = Math.floor(rawAssetInformation[0].height + rawAssetInformation[0].height / 2);
            aggregateWidth = rawAssetInformation.reduce((sum, current) => sum + current.width, 0);
        }

        layoutEngineInstance = new LayoutManager({ width: aggregateWidth, height: maximalHeight });
        collectedAssets = rawAssetInformation;
    };

    const copyPixelBlock = (destinationBuffer, sourceBuffer, destX, destY, sourceWidth, sourceHeight, finalImageWidth) => {
        for (let row = 0; row < sourceHeight; row++) {
            const destinationRowStart = ((destY + row) * finalImageWidth + destX) << 2;
            const sourceRowStart = (row * sourceWidth) << 2;
            for (let col = 0; col < sourceWidth; col++) {
                const sourcePixelOffset = sourceRowStart + (col << 2);
                const destinationPixelOffset = destinationRowStart + (col << 2);

                destinationBuffer[destinationPixelOffset] = sourceBuffer[sourcePixelOffset];
                destinationBuffer[destinationPixelOffset + 1] = sourceBuffer[sourcePixelOffset + 1];
                destinationBuffer[destinationPixelOffset + 2] = sourceBuffer[sourcePixelOffset + 2];
                destinationBuffer[destinationPixelOffset + 3] = sourceBuffer[sourcePixelOffset + 3];
            }
        }
    };

    const composeOutputImage = async (positionedAssets) => {
        const finalImage = new PngEncoder.PNG({
            width: layoutEngineInstance.width,
            height: layoutEngineInstance.height
        });

        for (const assetEntry of positionedAssets) {
            await new Promise((resolve, reject) => {
                const inputImageStream = FsPromises.createReadStream(assetEntry.sourcePath);

                inputImageStream.pipe(new PngEncoder.PNG({
                    filterType: 4
                }))
                .on('parsed', function() {
                    copyPixelBlock(finalImage.data, this.data, assetEntry.x, assetEntry.y, assetEntry.width, assetEntry.height, finalImage.width);
                    resolve();
                })
                .on('error', reject);
            });
        }

        await new Promise((resolve, reject) => {
            const outputImageStream = FsPromises.createWriteStream(currentConfiguration.outputImagePath);
            finalImage.pack()
                .pipe(outputImageStream)
                .on('finish', () => {
                    console.log(`Saved composite image to ${currentConfiguration.outputImagePath}`);
                    resolve();
                })
                .on('error', reject);
        });
    };

    const generateStyleDeclaration = (positionedAssets) => {
        const styleData = positionedAssets.map(asset => {
            const className = extractLeafName(asset.sourcePath);
            return {
                styleClass: className,
                pixelWidth: asset.width,
                pixelHeight: asset.height,
                horizontalOffset: asset.x,
                verticalOffset: asset.y,
            };
        });

        const cssSegments = styleData.map(rule => `
${currentConfiguration.stylePrefix}.${rule.styleClass} {
    width: ${rule.pixelWidth}px;
    height: ${rule.pixelHeight}px;
    background-image: url(${currentConfiguration.relativeImagePathForCss}${currentConfiguration.finalImageName});
    background-position: -${rule.horizontalOffset}px -${rule.verticalOffset}px;
}`);
        return cssSegments.join('\n');
    };

    const processAndProduce = async (completionHandler) => {
        const placedItems = await new Promise((resolve, reject) => {
            layoutEngineInstance.pack(collectedAssets.map(item => ({
                image: item.sourcePath,
                width: item.width,
                height: item.height
            })), (result) => {
                if (result) resolve(result);
                else reject(new Error("Image layout manager failed to arrange assets."));
            });
        });

        const assetsWithCoordinates = placedItems.map(item => {
            const originalAsset = collectedAssets.find(pa => pa.sourcePath === item.image);
            return {
                ...originalAsset,
                x: item.x,
                y: item.y
            };
        });

        await composeOutputImage(assetsWithCoordinates);

        const stylesheetContent = generateStyleDeclaration(assetsWithCoordinates);

        const styleOutputDirectory = PathUtility.dirname(currentConfiguration.outputStylePath);
        if (styleOutputDirectory && styleOutputDirectory !== '.') {
            await FsPromises.mkdir(styleOutputDirectory, { recursive: true });
        }

        await FsPromises.writeFile(currentConfiguration.outputStylePath, stylesheetContent);
        console.log(`Saved stylesheet to ${currentConfiguration.outputStylePath}`);

        if (completionHandler) {
            const finalCssMetadata = assetsWithCoordinates.map(asset => ({
                name: extractLeafName(asset.sourcePath),
                width: asset.width,
                height: asset.height,
                sprite_name: currentConfiguration.finalImageName,
                x: asset.x,
                y: asset.y
            }));
            completionHandler(finalCssMetadata);
        }
    };

    return {
        prepareAssetList: collectAssetDetails,
        executeGeneration: processAndProduce
    };
};

module.exports = createGraphicBinder;