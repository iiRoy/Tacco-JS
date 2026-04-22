const fileSystem = require('fs').promises;
const pathResolver = require('path');
const FlowEmitter = require('./mu/stream');
const ContentProcessor = require('./mu/parser');
const DisplayEngine = require('./mu/renderer');

class TemplateProcessorCore {
    constructor(initialRoot = process.cwd()) {
        this.baseDirectory = initialRoot;
        this.resourceCache = new Map();
    }

    async fetchResourceContent(resourcePath) {
        const resolvedPath = resourcePath.startsWith('/') || resourcePath.indexOf(':\\') === 1
            ? resourcePath
            : pathResolver.join(this.baseDirectory, resourcePath);
        return await fileSystem.readFile(resolvedPath, 'utf8');
    }

    async processTemplateResource(sourcePath, processingTrack = new Set()) {
        if (this.resourceCache.has(sourcePath) && !processingTrack.has(sourcePath)) {
            return this.resourceCache.get(sourcePath);
        }

        if (processingTrack.has(sourcePath)) {
            return this.resourceCache.get(sourcePath);
        }
        processingTrack.add(sourcePath);

        let fileText;
        try {
            fileText = await this.fetchResourceContent(sourcePath);
        } catch (error) {
            processingTrack.delete(sourcePath);
            throw error;
        }

        const parsedStructure = ContentProcessor.parse(fileText);
        this.resourceCache.set(sourcePath, parsedStructure);

        const partialProcessingPromises = parsedStructure.partials.map(async (partialName) => {
            await this.processTemplateResource(partialName, processingTrack);
        });

        await Promise.all(partialProcessingPromises);

        processingTrack.delete(sourcePath);

        return parsedStructure;
    }

    async processLiteralContent(identifier, content) {
        let actualContent = content;
        let actualIdentifier = identifier;

        if (typeof content === 'undefined') {
            actualContent = identifier;
            actualIdentifier = undefined;
        }

        const parsedResult = ContentProcessor.parse(actualContent);

        if (actualIdentifier) {
            this.resourceCache.set(actualIdentifier, parsedResult);
        }
        return parsedResult;
    }

    streamRenderedOutput(templateReference, inputData) {
        const outputStream = new FlowEmitter();
        let targetStructure;

        if (typeof templateReference === 'object' && templateReference !== null) {
            targetStructure = templateReference;
        } else if (typeof templateReference === 'string') {
            targetStructure = this.resourceCache.get(templateReference);
        }

        if (!targetStructure) {
            process.nextTick(() => outputStream.emit('error', new Error('TEMPLATE_REFERENCE_NOT_RESOLVED')));
            return outputStream;
        }

        process.nextTick(() => {
            try {
                DisplayEngine.render(targetStructure.tokens, inputData, this.resourceCache, outputStream, () => {
                    outputStream.emit('end');
                });
            } catch (renderError) {
                outputStream.emit('error', renderError);
            }
        });

        return outputStream;
    }

    generateStreamFromText(templateString, inputData, customFragments) {
        const parsedLiteral = ContentProcessor.parse(templateString);

        const activeFragments = new Map(this.resourceCache);
        if (customFragments) {
            for (const key in customFragments) {
                if (Object.prototype.hasOwnProperty.call(customFragments, key)) {
                    const fragmentContent = customFragments[key];
                    activeFragments.set(key, typeof fragmentContent === 'string' ? ContentProcessor.parse(fragmentContent) : fragmentContent);
                }
            }
        }

        const outputStream = new FlowEmitter();
        process.nextTick(() => {
            try {
                DisplayEngine.render(parsedLiteral.tokens, inputData, activeFragments, outputStream, () => {
                    outputStream.emit('end');
                });
            } catch (renderError) {
                outputStream.emit('error', renderError);
            }
        });
        return outputStream;
    }

    purgeCache(entryKey) {
        if (entryKey) {
            this.resourceCache.delete(entryKey);
        } else {
            this.resourceCache.clear();
        }
    }

    async compileAndStreamOutput(templateKey, inputData) {
        const outputStream = new FlowEmitter();
        let compiledStructure;

        try {
            compiledStructure = this.resourceCache.get(templateKey);

            if (!compiledStructure) {
                compiledStructure = await this.processTemplateResource(templateKey);
            }

            process.nextTick(() => {
                try {
                    DisplayEngine.render(compiledStructure.tokens, inputData, this.resourceCache, outputStream, () => {
                        outputStream.emit('end');
                    });
                } catch (renderError) {
                    outputStream.emit('error', renderError);
                }
            });

        } catch (compilationError) {
            process.nextTick(() => outputStream.emit('error', compilationError));
        }

        return outputStream;
    }
}

module.exports = function createTemplateEngine(configuration = {}) {
    return new TemplateProcessorCore(configuration.root || process.cwd());
};