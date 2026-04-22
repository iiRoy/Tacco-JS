class MarkRender {
    constructor(configurationSettings) {
        this.linkRegistry = new Map();
        this.blockStore = [];
        this.listDepth = 0;

        this.inputModifiers = [];
        this.outputModifiers = [];

        this.primaryHtmlTags = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del|style|section|header|footer|nav|article|aside";
        this.secondaryHtmlTags = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside";

        if (configurationSettings && configurationSettings.plugins) {
            configurationSettings.plugins.forEach(pluginModule => {
                if (typeof pluginModule === 'function') {
                    pluginModule(this).forEach(extension => {
                        if (extension.stage === 'initial' || extension.stage === 'pre-process') {
                            this.inputModifiers.push(extension);
                        } else if (extension.stage === 'final' || extension.stage === 'post-process') {
                            this.outputModifiers.push(extension);
                        } else {
                            this.outputModifiers.push(extension); // Default stage
                        }
                    });
                } else {
                    throw new Error(`Plugin '${pluginModule}' could not be initialized. It must be a callable function.`);
                }
            });
        }
    }

    applyTransformation(transformDescriptor, currentContent) {
        if (transformDescriptor.pattern) {
            const regexObject = new RegExp(transformDescriptor.pattern, 'g');
            return currentContent.replace(regexObject, transformDescriptor.replacement);
        } else if (transformDescriptor.processor) {
            return transformDescriptor.processor(currentContent);
        }
        return currentContent;
    }

    convertMarkup(sourceText) {
        this.linkRegistry.clear();
        this.blockStore = [];
        this.listDepth = 0;

        let processedContent = sourceText;

        processedContent = processedContent.split('~').join('~TEMP_TILDE~');
        processedContent = processedContent.split('$').join('~TEMP_DOLLAR~');

        processedContent = processedContent.split('\r\n').join('\n');
        processedContent = processedContent.split('\r').join('\n');

        processedContent = `\n\n${processedContent}\n\n`;

        processedContent = processedContent.split('\t').join('    '); // Equivalent of _Detab

        processedContent = processedContent.split('\n')
                                           .map(line => line.match(/^[ \t]*$/) ? '' : line)
                                           .join('\n');

        this.inputModifiers.forEach(mod => {
            processedContent = this.applyTransformation(mod, processedContent);
        });

        processedContent = this.processCodeAreas(processedContent);

        processedContent = this.isolateHtmlElements(processedContent);

        processedContent = this.extractLinkReferences(processedContent);

        processedContent = this.transformBlocks(processedContent);

        processedContent = this.cleanseAttributes(processedContent);

        processedContent = processedContent.split('~TEMP_DOLLAR~').join('$');
        processedContent = processedContent.split('~TEMP_TILDE~').join('~');

        this.outputModifiers.forEach(mod => {
            processedContent = this.applyTransformation(mod, processedContent);
        });

        return processedContent;
    }

    // Clone of `_StripLinkDefinitions`
    extractLinkReferences(content) {
        const referencePattern = /^[ ]{0,3}\[(.+?)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~ZERO_MARKER~))/gm;
        let outputSegments = [];
        let currentIndex = 0;
        const inputWithSentinel = content + "~ZERO_MARKER~"; // Add sentinel at the end

        let currentMatch;
        while ((currentMatch = referencePattern.exec(inputWithSentinel)) !== null) {
            const [wholeSection, identKey, urlValue, blankLines, titleValue] = currentMatch;
            const normalizedKey = identKey.toLowerCase();

            outputSegments.push(inputWithSentinel.substring(currentIndex, currentMatch.index));
            currentIndex = referencePattern.lastIndex;

            if (blankLines) {
                outputSegments.push(blankLines + (titleValue ? `"${titleValue}"` : '')); // Restore the text if invalid title
            } else {
                this.linkRegistry.set(normalizedKey, {
                    linkUrl: this.scrubSymbols(urlValue),
                    linkTitle: titleValue ? titleValue.replace(/"/g, "&quot;") : null
                });
                // Matched section is removed by not pushing it to outputSegments
            }
        }
        outputSegments.push(inputWithSentinel.substring(currentIndex));

        const finalProcessed = outputSegments.join('').replace(/~ZERO_MARKER~/, "");
        return finalProcessed;
    }

    // Clone of `_EncodeAmpsAndAngles`
    scrubSymbols(inputString) {
        return inputString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Clone of `_HashHTMLBlocks`
    isolateHtmlElements(content) {
        let workingContent = content.split('\n').join('\n\n');

        const applyBlockHashing = (textToHash, regex) => {
            let segments = [];
            let lastPosition = 0;
            let currentMatch;
            while ((currentMatch = regex.exec(textToHash)) !== null) {
                segments.push(textToHash.substring(lastPosition, currentMatch.index));
                const matchedBlock = currentMatch[1];
                let cleanBlock = matchedBlock.split('\n\n').join('\n');
                cleanBlock = cleanBlock.replace(/^\n/, "").replace(/\n+$/, "");

                const uniqueKey = `\n\n~ELEMENT_BUCKET_${this.blockStore.length}~~\n\n`;
                this.blockStore.push(cleanBlock);
                segments.push(uniqueKey);
                lastPosition = regex.lastIndex;
            }
            segments.push(textToHash.substring(lastPosition));
            return segments.join('');
        };

        const blockDefinitionMatchers = [
            { pattern: new RegExp(`^(<(${this.primaryHtmlTags})\\b[^\\r]*?\\n<\\/\\2>[ \\t]*(?=\\n+))`, 'gm') },
            { pattern: new RegExp(`^(<(${this.secondaryHtmlTags})\\b[^\\r]*?<\\/\\2>[ \\t]*(?=\\n+)\\n)`, 'gm') },
            { pattern: /(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g },
            { pattern: /(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g },
            { pattern: /(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g }
        ];

        for (const blockDef of blockDefinitionMatchers) {
            workingContent = applyBlockHashing(workingContent, blockDef.pattern);
        }

        workingContent = workingContent.split('\n\n').join('\n');
        return workingContent;
    }

    // Clone of `_RunBlockGamut`
    transformBlocks(content) {
        let currentContent = content;

        currentContent = this.processHeaders(currentContent);

        const rulePlaceholder = this.storeBlockContent("<horizontal-rule />");
        currentContent = currentContent.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, rulePlaceholder);
        currentContent = currentContent.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, rulePlaceholder);
        currentContent = currentContent.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, rulePlaceholder);

        currentContent = this.handleLists(currentContent);
        currentContent = this.processCodeBlocks(currentContent);
        currentContent = this.handleBlockQuotes(currentContent);

        currentContent = this.isolateHtmlElements(currentContent);
        currentContent = this.formatParagraphs(currentContent);

        return currentContent;
    }

    // Clone of `hashBlock`
    storeBlockContent(htmlFragment) {
        const uniqueKey = `~BUCKET_ITEM_${this.blockStore.length}~`;
        this.blockStore.push(htmlFragment);
        return uniqueKey;
    }

    // Clone of `_RunSpanGamut`
    transformInline(content) {
        let currentContent = content;

        currentContent = this.processInlineCode(currentContent);
        currentContent = this.escapeTagAttributes(currentContent);
        currentContent = this.encodeBackslashEscapes(currentContent);

        currentContent = this.handleImages(currentContent);
        currentContent = this.handleLinks(currentContent);

        return currentContent;
    }

    // --- Placeholder / Simplified functions for parts not provided in the snippet ---
    processCodeAreas(text) { return text; }
    cleanseAttributes(text) { return text; }
    processHeaders(text) { return text; }
    handleLists(text) { return text; }
    processCodeBlocks(text) { return text; }
    handleBlockQuotes(text) { return text; }
    formatParagraphs(text) { return text; }
    processInlineCode(text) { return text; }
    escapeTagAttributes(text) { return text; }
    encodeBackslashEscapes(text) { return text; }
    handleImages(text) { return text; }
    handleLinks(text) { return text; }
}