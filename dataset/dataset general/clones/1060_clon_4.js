const contentStream = require('through2');
const domNavigator = require('cheerio');
const fileSys = require('fs');
const pathModule = require('path');
const webAddressParser = require('url');

const blockBoundaryPattern = /<!--\s*smoosh\s*-->[\s\S]*?<!--\s*endsmoosh\s*-->/g;
const markerCleanupPattern = /\s*<!--\s*smoosh\s*-->\s*\n?|\s*<!--\s*endsmoosh\s*-->\s*\n?/g;

function isRelativeResource(locatorPath) {
    const parsedLocation = webAddressParser.parse(locatorPath || '');
    return locatorPath && !parsedLocation.hostname;
}

module.exports = function createContentProcessor(pluginConfiguration) {

    const styleElementWrappers = (pluginConfiguration && pluginConfiguration.cssTags) ? pluginConfiguration.cssTags : { initial: '<style>', final: '</style>' };
    const scriptElementWrappers = (pluginConfiguration && pluginConfiguration.jsTags) ? pluginConfiguration.jsTags : { initial: '<script>', final: '</script>' };
    const rootContentPath = pluginConfiguration && pluginConfiguration.base;

    return contentStream.obj(async function (transformableFile, encodingScheme, completionHandler) {

        if (transformableFile.isNull()) {
            this.push(transformableFile);
            return completionHandler();
        }

        if (transformableFile.isStream()) {
            this.emit('error', new Error('Content streaming not supported by this utility.'));
            return completionHandler();
        }

        if (transformableFile.isBuffer()) {
            const sourceContentBuffer = String(transformableFile.contents);
            const resourceBaseLocation = (rootContentPath !== undefined && rootContentPath !== null) ? rootContentPath : transformableFile.base;

            const blockMatches = [];
            let currentMatch;

            const currentBlockRegex = new RegExp(blockBoundaryPattern.source, blockBoundaryPattern.flags);
            while ((currentMatch = currentBlockRegex.exec(sourceContentBuffer)) !== null) {
                blockMatches.push({
                    startIndex: currentMatch.index,
                    endIndex: currentMatch.index + currentMatch[0].length,
                    blockContent: currentMatch[0]
                });
            }

            const processingTasks = blockMatches.map(async (blockData) => {
                const currentBlockHtml = blockData.blockContent;
                const domManipulator = domNavigator.load(currentBlockHtml);

                const candidateElements = domManipulator('link[href], script[src]').get();

                const elementProcessingPromises = candidateElements.map(async (elementNode) => {
                    const currentElement = domManipulator(elementNode);
                    let resourceLocator;
                    let currentTagWrappers;

                    if (currentElement.is('link')) {
                        resourceLocator = currentElement.attr('href');
                        currentTagWrappers = styleElementWrappers;
                    } else if (currentElement.is('script')) {
                        resourceLocator = currentElement.attr('src');
                        currentTagWrappers = scriptElementWrappers;
                    }

                    if (isRelativeResource(resourceLocator)) {
                        const absoluteResourcePath = pathModule.join(resourceBaseLocation, resourceLocator);
                        try {
                            const resourcePayload = await fileSys.promises.readFile(absoluteResourcePath, 'utf8');
                            currentElement.replaceWith(currentTagWrappers.initial + resourcePayload + currentTagWrappers.final);
                        } catch (readError) {
                            throw readError;
                        }
                    }
                });

                await Promise.all(elementProcessingPromises);
                return domManipulator.html();
            });

            try {
                const processedBlockResults = await Promise.all(processingTasks);

                let reconstructedContent = '';
                let currentContentCursor = 0;

                for (let i = 0; i < blockMatches.length; i++) {
                    const block = blockMatches[i];
                    reconstructedContent += sourceContentBuffer.substring(currentContentCursor, block.startIndex);
                    reconstructedContent += processedBlockResults[i];
                    currentContentCursor = block.endIndex;
                }
                reconstructedContent += sourceContentBuffer.substring(currentContentCursor);

                const finalCleanupRegex = new RegExp(markerCleanupPattern.source, markerCleanupPattern.flags);
                const finalProcessedContent = reconstructedContent.replace(finalCleanupRegex, '');

                transformableFile.contents = Buffer.from(finalProcessedContent);
                completionHandler(null, transformableFile);

            } catch (overallProcessingError) {
                completionHandler(overallProcessingError);
            }
        }
    });
};