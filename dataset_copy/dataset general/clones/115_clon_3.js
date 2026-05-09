'use strict';

const fileSysHndl = require('fs');
const pathUtil = require('path');
const streamProcessor = require('through2');
const gulpTools = require('gulp-util');
const { PluginError: StreamProcessingError } = gulpTools;
const objectMerger = require('node.extend');

const projectManifest = require('./package.json');

const configDefaults = {
    annotateBlocks: true,
    verboseOutput: false
};

const silentFunc = () => { /* This function performs no action */ };

let currentConfig;
let logger = silentFunc;

const outputLog = (...messages) => {
    if (currentConfig.verboseOutput) {
        logger(`[${new Date().toLocaleTimeString()}][TemplateProcessor]`, ...messages);
    }
};

module.exports = function (inputSettings) {
    currentConfig = objectMerger(true, {}, configDefaults, inputSettings || {});

    if (currentConfig.verboseOutput || process.env.NODE_ENV === 'development') {
        logger = gulpTools.log;
        if (process.env.NODE_ENV === 'development' && !currentConfig.verboseOutput) {
            outputLog('Verbose logging activated automatically for development environment.');
            currentConfig.verboseOutput = true; // Ensure config reflects actual state
        }
    }

    return streamProcessor.obj((vinylFile, encoding, completionCallback) => {
        if (vinylFile.isNull()) {
            outputLog('Skipping null file:', vinylFile.path);
            return completionCallback(null, vinylFile);
        }

        if (vinylFile.isStream()) {
            outputLog('Error: Streaming content encountered, which is unsupported for:', vinylFile.path);
            return completionCallback(new StreamProcessingError(projectManifest.name, 'Streaming content is not supported by this plugin.'));
        }

        if (!vinylFile.isBuffer()) {
            outputLog('Warning: File is not a buffer, passing through unchanged:', vinylFile.path);
            return completionCallback(null, vinylFile);
        }

        outputLog('Beginning processing for file:', vinylFile.path);

        processTemplateFile(vinylFile, currentConfig, (processingError) => {
            if (processingError) {
                outputLog('Failed to process file:', vinylFile.path, processingError.message);
                return completionCallback(new StreamProcessingError(projectManifest.name, `Error during template processing for ${vinylFile.path}: ${processingError.message}`));
            }
            outputLog('Successfully processed file:', vinylFile.path);
            return completionCallback(null, vinylFile);
        });
    });
};

function createVinylFile(fullFilePath, completionCallback) {
    const baseDirectory = pathUtil.dirname(fullFilePath);

    if (typeof completionCallback === 'function') {
        fileSysHndl.readFile(fullFilePath, (readError, fileData) => {
            if (readError) {
                outputLog('Asynchronous file read error for:', fullFilePath, readError.message);
                return completionCallback(null, readError);
            }
            const constructedFile = new gulpTools.File({
                base: baseDirectory,
                path: fullFilePath,
                contents: Buffer.from(fileData),
            });
            outputLog('Asynchronously created Vinyl file for:', fullFilePath);
            completionCallback(constructedFile);
        });
    } else {
        try {
            const syncFileData = fileSysHndl.readFileSync(fullFilePath);
            const constructedFile = new gulpTools.File({
                base: baseDirectory,
                path: fullFilePath,
                contents: Buffer.from(syncFileData),
            });
            outputLog('Synchronously created Vinyl file for:', fullFilePath);
            return constructedFile;
        } catch (syncReadError) {
            outputLog('Synchronous file read error for:', fullFilePath, syncReadError.message);
            throw new Error(`Failed to read file synchronously from ${fullFilePath}: ${syncReadError.message}`);
        }
    }
}

function processTemplateFile(vinylFile, processingConfig, completionHandler) {
    outputLog('Entering processTemplateFile for:', vinylFile.path);

    injectIncludedParts(vinylFile, processingConfig);

    const currentFileContentString = vinylFile.contents.toString('utf-8');
    const parentTemplateReference = locateParentDirective(currentFileContentString);

    if (!parentTemplateReference || !parentTemplateReference.path) {
        outputLog('No master template directive found in:', vinylFile.path, 'moving to next step.');
        return completionHandler(null);
    }

    const relativeParentTemplatePath = parentTemplateReference.path;
    outputLog('Master template path identified:', relativeParentTemplatePath);

    let absoluteParentTemplatePath;
    const isRootRelativePath = isRelativeFromRoot(relativeParentTemplatePath);

    if (processingConfig.root && isRootRelativePath) {
        absoluteParentTemplatePath = pathUtil.join(process.cwd(), processingConfig.root, relativeParentTemplatePath);
        outputLog('Master path resolved as root-relative using config.root:', absoluteParentTemplatePath);
    } else if (processingConfig.root && !isRootRelativePath) {
        outputLog('Warning: "root" config is set, but master path is not root-relative. Resolving relative to current file:', relativeParentTemplatePath);
        absoluteParentTemplatePath = pathUtil.resolve(pathUtil.dirname(vinylFile.path), relativeParentTemplatePath);
    } else {
        absoluteParentTemplatePath = pathUtil.resolve(pathUtil.dirname(vinylFile.path), relativeParentTemplatePath);
        outputLog('Master path resolved relative to current file:', absoluteParentTemplatePath);
    }

    createVinylFile(absoluteParentTemplatePath, (parentVinylFile, readErr) => {
        if (readErr) {
            outputLog('Error loading master template:', absoluteParentTemplatePath, readErr.message);
            return completionHandler(new Error(`Could not load master template '${relativeParentTemplatePath}': ${readErr.message}`));
        }
        if (!parentVinylFile) {
            return completionHandler(new Error(`Master template file not found or empty: ${absoluteParentTemplatePath}`));
        }

        processTemplateFile(parentVinylFile, processingConfig, (recursiveErr) => {
            if (recursiveErr) {
                outputLog('Recursive processing error for master template:', absoluteParentTemplatePath, recursiveErr.message);
                return completionHandler(recursiveErr);
            }

            const parentContent = parentVinylFile.contents.toString();
            const contentLines = splitStringIntoLines(parentContent);

            const transformedLines = contentLines.map((currentLine) => {
                let processedLine = substituteVariables(currentLine, parentTemplateReference.variableContext);
                const contentBlockName = locatePlaceholderDirective(processedLine);

                if (contentBlockName) {
                    const extractedBlockContent = extractBlockContent(currentFileContentString, contentBlockName);
                    return extractedBlockContent || processedLine;
                } else {
                    return processedLine;
                }
            });

            const finalContent = transformedLines.join('\n');
            vinylFile.contents = Buffer.from(finalContent);

            outputLog('Master template integration completed for:', vinylFile.path);
            return completionHandler(null);
        });
    });
}

function injectIncludedParts(vinylFile, processingConfig) {
    const originalFileContent = vinylFile.contents.toString('utf-8');
    const originalFileLines = splitStringIntoLines(originalFileContent);

    const processedLinesWithIncludes = originalFileLines.map((currentLine) => {
        const includeDirective = locateIncludeDirective(currentLine);

        if (includeDirective && includeDirective.path) {
            let absoluteIncludePath;
            const isRootRelativePath = isRelativeFromRoot(includeDirective.path);

            if (processingConfig.root && isRootRelativePath) {
                absoluteIncludePath = pathUtil.join(process.cwd(), processingConfig.root, includeDirective.path);
                outputLog('Include path resolved as root-relative:', absoluteIncludePath);
            } else if (processingConfig.root && !isRootRelativePath) {
                outputLog('Warning: "root" config is set, but include path is not root-relative. Resolving relative to current file:', includeDirective.path);
                absoluteIncludePath = pathUtil.resolve(pathUtil.dirname(vinylFile.path), includeDirective.path);
            } else {
                absoluteIncludePath = pathUtil.resolve(pathUtil.dirname(vinylFile.path), includeDirective.path);
                outputLog('Include path resolved relative to current file:', absoluteIncludePath);
            }

            try {
                const embeddedFile = createVinylFile(absoluteIncludePath);
                if (!embeddedFile) {
                    outputLog('Warning: Included file not found, skipping inclusion:', absoluteIncludePath);
                    return currentLine;
                }

                if (embeddedFile.contents) {
                    if (includeDirective.variableContext) {
                        embeddedFile.contents = Buffer.from(substituteVariables(
                            embeddedFile.contents.toString('utf-8'),
                            includeDirective.variableContext
                        ));
                    }
                    injectIncludedParts(embeddedFile, processingConfig); // Recursive call for nested includes

                    if (processingConfig.annotateBlocks) {
                        const includeBaseName = pathUtil.basename(absoluteIncludePath);
                        return [
                            `<!-- START_INCL: ${includeBaseName} -->`,
                            embeddedFile.contents.toString('utf-8'),
                            `<!-- END_INCL: ${includeBaseName} -->`
                        ].join('\n');
                    } else {
                        return embeddedFile.contents.toString('utf-8');
                    }
                } else {
                    outputLog('Warning: Included file has no content:', absoluteIncludePath);
                    return currentLine;
                }
            } catch (includeErr) {
                outputLog('Error during include processing for:', absoluteIncludePath, includeErr.message);
                return `<!-- ERROR_INCL: ${includeDirective.path} - ${includeErr.message} -->${currentLine}`;
            }
        } else {
            return currentLine;
        }
    });

    vinylFile.contents = Buffer.from(processedLinesWithIncludes.join('\n'));
}

function locateParentDirective(targetString) {
    const pattern = /<!--\s*@@master\s*=\s*(\S+)\s*(?:(\{[^}]*\})?\s*)?-->/;
    const regexMatch = targetString.match(pattern);

    if (!regexMatch) {
        return null;
    }

    const masterPath = regexMatch[1];
    let parsedContext = null;

    if (regexMatch[2]) {
        try {
            parsedContext = JSON.parse(regexMatch[2]);
        } catch (parseError) {
            outputLog('Warning: Malformed JSON context in master directive for path:', masterPath, parseError.message);
        }
    }

    return {
        path: masterPath,
        variableContext: parsedContext
    };
}

function locateIncludeDirective(targetString) {
    const pattern = /<!--\s*@@include\s*=\s*(\S+)\s*(?:(\{[^}]*\})?\s*)?-->/;
    const regexMatch = targetString.match(pattern);

    if (!regexMatch) {
        return null;
    }

    const includePath = regexMatch[1];
    let parsedContext = null;

    if (regexMatch[2]) {
        try {
            parsedContext = JSON.parse(regexMatch[2]);
        } catch (parseError) {
            outputLog('Warning: Malformed JSON context in include directive for path:', includePath, parseError.message);
        }
    }

    return {
        path: includePath,
        variableContext: parsedContext
    };
}

function locatePlaceholderDirective(targetString) {
    const pattern = /<!--\s*@@placeholder\s*=\s*(\S+)\s*-->/;
    const regexMatch = targetString.match(pattern);
    return regexMatch ? regexMatch[1] : null;
}

function substituteVariables(templateString, variableContext) {
    if (typeof templateString !== 'string' || !variableContext || templateString.indexOf('@@var') < 0) {
        return templateString;
    }

    const varPattern = /<!--\s*@@var\s*=\s*([^- ]+)\s*-->/g;

    return templateString.replace(varPattern, (fullMatch, varName) => {
        if (Object.prototype.hasOwnProperty.call(variableContext, varName)) {
            return variableContext[varName];
        } else {
            outputLog(`Warning: Variable "${varName}" referenced but not found in context. Context keys: [${Object.keys(variableContext).join(', ')}]`);
            return fullMatch; // Keep the original directive if variable is missing
        }
    });
}

function extractBlockContent(sourceContent, contentBlockName) {
    if (typeof sourceContent !== 'string' || !contentBlockName) {
        outputLog('Error: Invalid arguments for extractBlockContent.');
        return '';
    }

    const contentLines = splitStringIntoLines(sourceContent);
    let currentlyInsideBlock = false;
    const accumulatedBlockContent = [];
    const blockBeginPattern = new RegExp(`<!--\\s*@@block\\s*=\\s*${contentBlockName}\\s*-->`);
    const blockEndPattern = /<!--\s*@@close\s*-->/;

    for (const currentLine of contentLines) {
        if (currentlyInsideBlock) {
            if (blockEndPattern.test(currentLine)) {
                currentlyInsideBlock = false;
            } else {
                accumulatedBlockContent.push(currentLine);
            }
        } else {
            if (blockBeginPattern.test(currentLine)) {
                currentlyInsideBlock = true;
            }
        }
    }

    const extractedText = accumulatedBlockContent.join('\n');

    if (currentConfig.annotateBlocks) {
        return [
            `<!-- BLOCK_CONTENT_BEGIN: ${contentBlockName} -->`,
            extractedText,
            `<!-- BLOCK_CONTENT_END: ${contentBlockName} -->`
        ].join('\n');
    } else {
        return extractedText;
    }
}

function splitStringIntoLines(sourceString) {
    if (typeof sourceString !== 'string') {
        outputLog('Warning: Non-string input provided to splitStringIntoLines, returning empty array.');
        return [];
    }
    return sourceString.split(/\r\n|\n|\r/);
}

function isRelativeFromRoot(pathToExamine) {
    if (typeof pathToExamine !== 'string' || pathToExamine.length === 0) {
        return false;
    }
    return pathToExamine.startsWith(pathUtil.sep) || (process.platform === 'win32' && pathToExamine.startsWith('/'));
}