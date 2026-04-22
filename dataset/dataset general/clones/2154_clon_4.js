var MarkupForge = MarkupForge || {};
MarkupForge.textSculptor = MarkupForge.textSculptor || {};

MarkupForge.textSculptor.MarkdownProcessor = function() {
    let linkReferences = {};
    let linkTitles = {};
    let embeddedBlocks = [];
    let nestingDepth = 0;

    const generateBlockPlaceholder = (content) => {
        const index = embeddedBlocks.push(content) - 1;
        return `\n\nMARKUPBLOCK${index}MARKUPBLOCK\n\n`;
    };

    const maskSpecialGlyphs = (inputString, charsToEscape) => {
        let output = inputString;
        for (let i = 0; i < charsToEscape.length; i++) {
            const char = charsToEscape.charAt(i);
            const regex = new RegExp(`\\${char}`, 'g');
            output = output.replace(regex, `&#${char.charCodeAt(0)};`);
        }
        return output;
    };

    const encodeHtmlEntities = (input) => {
        input = input.replace(/&/g, "&amp;");
        input = input.replace(/</g, "&lt;");
        input = input.replace(/>/g, "&gt;");
        return input;
    };
    
    const normalizeTabs = (inputStr) => {
        let processed = inputStr.replace(/^(.+?)\t/gm, "$1    ");
        processed = processed.replace(/^\t/gm, "    ");
        return processed;
    };

    const restoreEscapedSequences = (inputStr) => {
        inputStr = inputStr.replace(/\\([\\`*_{}[\]()>#+-.!])/g, '$1');
        return inputStr;
    };

    const extractDefinitions = (sourceText) => {
        const definitionPattern = /^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm;

        sourceText = sourceText.replace(definitionPattern, (fullMatch, id, url, blankLines, title) => {
            const normalizedId = id.toLowerCase();
            linkReferences[normalizedId] = encodeHtmlEntities(url);
            if (blankLines) {
                return blankLines + title;
            } else if (title) {
                linkTitles[normalizedId] = title.replace(/"/g, "&quot;");
            }
            return "";
        });
        return sourceText;
    };

    const storeBlockContent = (fullMatch, capturedBlock) => {
        let blockContent = capturedBlock;
        blockContent = blockContent.replace(/\n\n/g, "\n");
        blockContent = blockContent.replace(/^\n/, "");
        blockContent = blockContent.replace(/\n+$/, "");
        return generateBlockPlaceholder(blockContent);
    };

    const isolateHtmlBlocks = (sourceText) => {
        sourceText = sourceText.replace(/\n/g, "\n\n");

        const blockTagsA = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
        const blockTagsB = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";

        const nestedBlockRegex = new RegExp(`^(<(${blockTagsA})\\b[^\\r]*?\\n<\\/\\2>[ \\t]*(?=\\n+))`, 'gm');
        sourceText = sourceText.replace(nestedBlockRegex, storeBlockContent);

        const generalBlockRegex = new RegExp(`^(<(${blockTagsB})\\b[^\\r]*?.*<\\/\\2>[ \\t]*(?=\\n+)\\n)`, 'gm');
        sourceText = sourceText.replace(generalBlockRegex, storeBlockContent);

        const hrRegex = /(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g;
        sourceText = sourceText.replace(hrRegex, storeBlockContent);

        const commentRegex = /(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g;
        sourceText = sourceText.replace(commentRegex, storeBlockContent);

        const processorInstructionRegex = /(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g;
        sourceText = sourceText.replace(processorInstructionRegex, storeBlockContent);

        sourceText = sourceText.replace(/\n\n/g, "\n");
        return sourceText;
    };

    const handleCodeSpans = (txt) => txt;
    const escapeBackslashes = (txt) => txt;
    const embedImages = (txt) => txt;
    const detectAutoLinks = (txt) => txt;
    const emphasizeText = (txt) => txt;

    const protectTagAttributes = (contentString) => {
        const attributeEscapeRegex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;
        contentString = contentString.replace(attributeEscapeRegex, (fullMatch) => {
            let processedTag = fullMatch.replace(/(.)<\/?code>(?=.)/g, "$1`");
            processedTag = maskSpecialGlyphs(processedTag, "\\`*_");
            return processedTag;
        });
        return contentString;
    };

    const generateLinkElement = (fullMatch, capture1, linkText, capture3, href, capture5, quoteChar, titleText) => {
        let linkId = capture3 ? capture3.toLowerCase() : null;

        if (linkId === null || linkId === "") {
            linkId = linkText.toLowerCase();
        }

        let targetUrl = href || linkReferences[linkId];
        if (!targetUrl) {
            return fullMatch;
        }

        let linkTitle = titleText || linkTitles[linkId];
        let titleAttribute = linkTitle ? ` title="${linkTitle}"` : "";

        return `<a href="${targetUrl}"${titleAttribute}>${linkText}</a>`;
    };

    const transformLinks = (inputContent) => {
        const refLinkPattern1 = /(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g;
        inputContent = inputContent.replace(refLinkPattern1, generateLinkElement);

        const inlineLinkPattern = /(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g;
        inputContent = inputContent.replace(inlineLinkPattern, generateLinkElement);

        const refLinkPattern2 = /(\[([^\[\]]+)\])()()()()()/g;
        inputContent = inputContent.replace(refLinkPattern2, generateLinkElement);

        return inputContent;
    };

    const processInlineElements = (inputData) => {
        inputData = handleCodeSpans(inputData);
        inputData = protectTagAttributes(inputData);
        inputData = escapeBackslashes(inputData);

        inputData = embedImages(inputData);
        inputData = transformLinks(inputData);

        inputData = detectAutoLinks(inputData);
        inputData = encodeHtmlEntities(inputData);
        inputData = emphasizeText(inputData);

        inputData = inputData.replace(/  +\n/g, " <br />\n");

        return inputData;
    };

    const applyHeadings = (txt) => processInlineElements(txt);
    const formatLists = (txt) => processInlineElements(txt);
    const insertCodeBlocks = (txt) => txt; // Code blocks typically raw content
    const quoteParagraphs = (txt) => processInlineElements(txt);
    const wrapParagraphs = (txt) => processInlineElements(txt);

    const processStructuralElements = (inputData) => {
        inputData = applyHeadings(inputData);
        
        let hrKey = generateBlockPlaceholder("<hr />");
        inputData = inputData.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, hrKey);
        inputData = inputData.replace(/^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm, hrKey);
        inputData = inputData.replace(/^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm, hrKey);

        inputData = formatLists(inputData);
        inputData = insertCodeBlocks(inputData);
        inputData = quoteParagraphs(inputData);

        inputData = isolateHtmlBlocks(inputData);
        inputData = wrapParagraphs(inputData);

        return inputData;
    };

    this.renderMarkup = (inputMarkdown) => {
        linkReferences = {};
        linkTitles = {};
        embeddedBlocks = [];
        nestingDepth = 0;

        const TILDE_ESCAPE_SEQUENCE = "~TILDEESC~";
        const DOLLAR_ESCAPE_SEQUENCE = "~DOLLESC~";

        let currentContent = inputMarkdown;

        currentContent = currentContent.replace(/~/g, TILDE_ESCAPE_SEQUENCE);
        currentContent = currentContent.replace(/\$/g, DOLLAR_ESCAPE_SEQUENCE);

        currentContent = currentContent.replace(/\r\n/g, "\n");
        currentContent = currentContent.replace(/\r/g, "\n");

        currentContent = "\n\n" + currentContent + "\n\n";

        currentContent = normalizeTabs(currentContent);

        currentContent = currentContent.replace(/^[ \t]+$/mg, "");

        currentContent = isolateHtmlBlocks(currentContent);

        currentContent = extractDefinitions(currentContent);

        currentContent = processStructuralElements(currentContent);

        currentContent = restoreEscapedSequences(currentContent);
        
        currentContent = currentContent.replace(new RegExp(DOLLAR_ESCAPE_SEQUENCE, 'g'), "$$");
        currentContent = currentContent.replace(new RegExp(TILDE_ESCAPE_SEQUENCE, 'g'), "~");

        for (let i = 0; i < embeddedBlocks.length; i++) {
            const placeholderRegex = new RegExp(`\\n\\nMARKUPBLOCK${i}MARKUPBLOCK\\n\\n`, 'g');
            currentContent = currentContent.replace(placeholderRegex, embeddedBlocks[i]);
        }

        return currentContent;
    };
};