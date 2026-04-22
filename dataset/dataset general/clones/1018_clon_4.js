const filesystemAccess = require('fs');
const pathUtilities = require('path');
const markdownParser = require('marked');
const syntaxHighlighter = require('cardinal');
const terminalStylizer = require('./color');

const renderConfigDefaults = {
    compressNewlines: true,
    emptySpace: '',
    dividerStart: '',
    dividerEnd: '',
    headingPrefix: '\n',
    headingSuffix: '\n\n',
    headingMarkerChar: '#',
    codeBlockPrefix: '\n',
    codeBlockSuffix: '\n\n',
    codeBlockPadding: '    ',
    quoteBlockPrefix: '\n',
    quoteBlockSuffix: '\n\n',
    quoteBlockStyle: 'blockquote',
    quoteBlockPadding: '  > ',
    quoteBlockPadStyle: 'syntax',
    listItemBlockPrefix: '\n',
    listItemBlockSuffix: '\n',
    listItemStartMark: '',
    listItemEndMark: '\n',
    listItemStyle: 'ul',
    listItemPadding: '  * ',
    listItemPadStyle: 'syntax',
    textParagraphPrefix: '',
    textParagraphSuffix: '\n'
};

class TokenStreamProcessor {
    constructor(segmentList) {
        this.segments = segmentList;
        this.currentIndex = 0;
    }

    peek() {
        if (this.currentIndex >= this.segments.length) {
            return { kind: 'end_of_stream' };
        }
        return this.segments[this.currentIndex];
    }

    advance() {
        if (this.currentIndex >= this.segments.length) {
            return { kind: 'end_of_stream' };
        }
        return this.segments[this.currentIndex++];
    }

    isExhausted() {
        return this.currentIndex >= this.segments.length;
    }
}

function inlineElementFormatter(sourceText, renderingConfiguration) {
    let outputBuffer = '';
    let currentSource = sourceText;

    const generateLinkMarkup = (title, url) => {
        outputBuffer += '[' + terminalStylizer(title, 'strong') + '](' + terminalStylizer(url, 'link') + ')';
    };

    const inlineRuleEvaluators = [
        {
            regex: markdownParser.inline.rules.escape,
            processor: (match) => match[1]
        },
        {
            regex: markdownParser.inline.rules.code,
            processor: (match) => terminalStylizer(match[2], 'code')
        },
        {
            regex: markdownParser.inline.rules.autolink,
            processor: (match) => terminalStylizer(match[0], 'link')
        },
        {
            regex: markdownParser.inline.rules.url,
            processor: (match) => { generateLinkMarkup(match[1], match[1]); return ''; }
        },
        {
            regex: markdownParser.inline.rules.tag,
            processor: (match) => match[0]
        },
        {
            regex: markdownParser.inline.rules.link,
            processor: (match) => { generateLinkMarkup(match[1], match[2]); return ''; }
        },
        {
            regex: markdownParser.inline.rules.reflink,
            processor: (match) => match[0]
        },
        {
            regex: markdownParser.inline.rules.nolink,
            processor: (match) => match[0]
        },
        {
            regex: markdownParser.inline.rules.strong,
            processor: (match) => terminalStylizer(inlineElementFormatter(match[2] || match[1], renderingConfiguration), 'strong')
        },
        {
            regex: markdownParser.inline.rules.em,
            processor: (match) => terminalStylizer(inlineElementFormatter(match[2] || match[1], renderingConfiguration), 'em')
        },
        {
            regex: markdownParser.inline.rules.br,
            processor: (match) => '\n'
        },
        {
            regex: markdownParser.inline.rules.del,
            processor: (match) => terminalStylizer(inlineElementFormatter(match[1], renderingConfiguration), 'del')
        },
        {
            regex: markdownParser.inline.rules.text,
            processor: (match) => match[0]
        }
    ];

    while (currentSource) {
        let matched = false;
        for (const evaluator of inlineRuleEvaluators) {
            const matchResult = evaluator.regex.exec(currentSource);
            if (matchResult) {
                currentSource = currentSource.substring(matchResult[0].length);
                const processed = evaluator.processor(matchResult);
                outputBuffer += processed;
                matched = true;
                break;
            }
        }

        if (!matched) {
            throw new Error('Unparseable inline content at byte: ' + currentSource.charCodeAt(0));
        }
    }

    return outputBuffer;
}

function sectionDecorator(contentSource, decorationOptions) {
    decorationOptions = decorationOptions || {};

    const contentLines = contentSource.split('\n');
    let padString = decorationOptions.pad_str || '';
    let padColorStyle = decorationOptions.pad_color || decorationOptions.block_color_style;
    const decoratedLines = [];

    if (padColorStyle) {
        padString = terminalStylizer(padString, padColorStyle);
    }

    contentLines.forEach(function(lineFragment) {
        if (decorationOptions.block_color_style) {
            lineFragment = terminalStylizer(lineFragment, decorationOptions.block_color_style);
        }
        decoratedLines.push(padString + lineFragment);
    });

    return decoratedLines.join('\n');
}

function structureNodeRenderer(tokenStream, renderingConfiguration, nestingLevel = 0) {
    const nodeElement = tokenStream.advance();
    let formattedOutput = '';
    let contentForProcessing;

    switch (nodeElement.kind) {
        case 'space': {
            return renderingConfiguration.emptySpace;
        }
        case 'hr': {
            const dividerLine = new Array(80).join('-') + '\n';
            return renderingConfiguration.dividerStart + terminalStylizer(dividerLine, nodeElement.kind) + renderingConfiguration.dividerEnd;
        }
        case 'heading': {
            const prefixMarking = terminalStylizer(
                Array(nodeElement.depth + 1).join(renderingConfiguration.headingMarkerChar),
                'syntax'
            );
            contentForProcessing = inlineElementFormatter(nodeElement.text, renderingConfiguration);
            formattedOutput = terminalStylizer(contentForProcessing, nodeElement.kind);

            return renderingConfiguration.headingPrefix + prefixMarking + ' ' + formattedOutput + renderingConfiguration.headingSuffix;
        }
        case 'code': {
            contentForProcessing = '';
            try {
                contentForProcessing = syntaxHighlighter.highlight(nodeElement.text);
            } catch (errorObject) {
                contentForProcessing = terminalStylizer(nodeElement.text, nodeElement.kind);
            }
            
            contentForProcessing = sectionDecorator(contentForProcessing, {
                pad_str: renderingConfiguration.codeBlockPadding
            });

            return renderingConfiguration.codeBlockPrefix + contentForProcessing + renderingConfiguration.codeBlockSuffix;
        }
        case 'table': {
            return '';
        }
        case 'blockquote_start': {
            let innerBlockContent = '';
            while (tokenStream.peek().kind !== 'blockquote_end' && !tokenStream.isExhausted()) {
                innerBlockContent += structureNodeRenderer(tokenStream, renderingConfiguration, nestingLevel + 1);
            }
            tokenStream.advance();
            innerBlockContent = sectionDecorator(innerBlockContent, {
                block_color_style: renderingConfiguration.quoteBlockStyle,
                pad_str: renderingConfiguration.quoteBlockPadding,
                pad_color: renderingConfiguration.quoteBlockPadStyle
            });

            return renderingConfiguration.quoteBlockPrefix + innerBlockContent + renderingConfiguration.quoteBlockSuffix;
        }
        case 'list_start': {
            let listItemsContent = '';
            while (tokenStream.peek().kind !== 'list_end' && !tokenStream.isExhausted()) {
                listItemsContent += structureNodeRenderer(tokenStream, renderingConfiguration, nestingLevel + 1);
            }
            tokenStream.advance();
            return renderingConfiguration.listItemBlockPrefix + listItemsContent + renderingConfiguration.listItemBlockSuffix;
        }
        case 'list_item_start': {
            let itemContent = '';
            while (tokenStream.peek().kind !== 'list_item_end' && !tokenStream.isExhausted()) {
                itemContent += structureNodeRenderer(tokenStream, renderingConfiguration, nestingLevel + 1);
            }
            tokenStream.advance();
            itemContent = sectionDecorator(itemContent, {
                block_color_style: renderingConfiguration.listItemStyle,
                pad_str: renderingConfiguration.listItemPadding,
                pad_color: renderingConfiguration.listItemPadStyle
            });
            return renderingConfiguration.listItemStartMark + itemContent + renderingConfiguration.listItemEndMark;
        }
        case 'paragraph': {
            if (nestingLevel > 0) {
                return nodeElement.text;
            }
            contentForProcessing = inlineElementFormatter(nodeElement.text, renderingConfiguration);
            return renderingConfiguration.textParagraphPrefix + terminalStylizer(contentForProcessing, nodeElement.kind) + renderingConfiguration.textParagraphSuffix;
        }
        case 'text': { 
            return nodeElement.text;
        }
        case 'end_of_stream': {
             return ''; 
        }
        default: {
            if (nodeElement.text) {
                return nodeElement.text;
            }
            return '';
        }
    }
}

exports.renderMarkdown = function(inputMarkdown, customConfiguration) {
    const markdownSegments = markdownParser.lexer(inputMarkdown);
    const renderingConfiguration = Object.assign({}, renderConfigDefaults, customConfiguration);
    const documentStream = new TokenStreamProcessor(markdownSegments);
    const generatedResultFragments = [];

    while (!documentStream.isExhausted()) {
        const processedFragment = structureNodeRenderer(documentStream, renderingConfiguration, 0);
        if (processedFragment !== undefined) { 
            generatedResultFragments.push(processedFragment);
        }
    }

    let finalRenderedContent = generatedResultFragments.join('');

    if (renderingConfiguration.compressNewlines) {
        finalRenderedContent = finalRenderedContent.replace(/\n\n\n/g, '\n\n');
    }

    return finalRenderedContent;
};

exports.renderMarkdownFile = function(targetFile, customConfiguration) {
    const resourcePath = pathUtilities.resolve(targetFile); 
    let generatedOutput = '';
    
    try {
        const fileContent = filesystemAccess.readFileSync(resourcePath).toString();
        generatedOutput = exports.renderMarkdown(fileContent, customConfiguration);
    } catch (errorObject) {
        throw errorObject;
    }

    return generatedOutput;
};