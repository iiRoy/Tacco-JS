const SyntaxDefinitionStore = {
    rulesets: {}
};

SyntaxDefinitionStore.rulesets.HtmlXmlSyntax = {
    blockComment: new RegExp('&lt;!--[\\w\\W]*?-->', 'g'),
    processingInstruction: /&lt;\\?.+?\\?>/,
    documentTypeDeclaration: /&lt;!DOCTYPE.+?>/,
    characterDataBlock: /&lt;!\\[CDATA\\[[\\w\\W]*?\\]\\]>/i,
    elementToken: {
        pattern: new RegExp('&lt;\\/?(?:[\\w:-]+)\\s*(?:\\s+(?:[\\w:-]+)(?:=(?:(?:\"|\')(\\\\?[\\w\\W])*?\\1|[^\s\'\">=]+))?\\s*)*\\/?>', 'gi'),
        internalComponents: {
            tagNameParts: {
                pattern: /^&lt;\\/?[\\w:-]+/i,
                internalNameDetails: {
                    boundaryMarks: /^&lt;\\/?/,
                    nameSpacePrefix: /^[\\w-]+?:/
                }
            },
            attributeValue: {
                pattern: new RegExp('=(?:(\'|\")[\\w\\W]*?(\\1)|[^\\s>]+)', 'gi'),
                internalValueDetails: {
                    valueSeparators: /=|>|\"/g
                }
            },
            closingMarks: /\\/?>/g,
            attributeName: {
                pattern: /[\\w:-]+/g,
                internalNameDetails: {
                    nameSpacePrefix: /^[\\w-]+?:/
                }
            }
        }
    },
    characterEntity: /&amp;#?[\\da-z]{1,8};/gi
};

SyntaxDefinitionStore.rulesets.ScientificTextSyntax = {
    commandWord: /\\\\(?:[^a-zA-Z]|[a-zA-Z]+)/g,
    leftDelimiter: /\\[\\[({]/g,
    rightDelimiter: /\\[\\])}]/g,
    inlineComment: /%.*/g,
};

const createMarkdownGrammar = function() {
    const urlContentChars = "[-A-Z0-9+&@#/%?=~_|[\\]()!:,.;]";
    const urlEndingChars = "[-A-Z0-9+&@#/%=~_|[\\])]";
    const uriRecognizer = new RegExp("(https?|ftp)(://" + urlContentChars + "*" + urlEndingChars + ")(?=$|\\W)", "gi");
    const electronicMailRecognizer = /(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)/gi;

    const scientificTextRules = SyntaxDefinitionStore.rulesets.ScientificTextSyntax;

    const lineFeedDelimiter = /\n/gm;

    const markdownSchema = {};

    markdownSchema.codeBlockGFM = {
        pattern: /^`{3}.*\n(?:[\s\S]*?)\n`{3} *$/gm,
        contextDetails: {
            "markdownBlockIndicator": /`{3}/,
            lineBreak: lineFeedDelimiter
        }
    };
    markdownSchema.altHeadingOne = {
        pattern: /^(.+)[ \t]*\n=+[ \t]*$/gm,
        contextDetails: {}
    };
    markdownSchema.altHeadingTwo = {
        pattern: /^(.+)[ \t]*\n-+[ \t]*$/gm,
        contextDetails: {}
    };
    markdownSchema.indentedCodeBlock = {
        pattern: /(^|(?:^|(?:^|\n)(?![ \t]*([*+\-]|\d+\.)[ \t]).*\n)\s*?\n)((?: {4}|\t).*(?:\n|$))+/g,
        lookBehind: true,
        contextDetails: {
            lineBreak: lineFeedDelimiter
        }
    };
    markdownSchema.standardTable = {
        pattern: new RegExp(
            [
                '^',
                '[ ]{0,3}',
                '[|]',
                '(.+)\\n',

                '[ ]{0,3}',
                '[|]([ ]*[-:]+[-| :]*)\\n',

                '(',
                '(?:[ ]*[|].*\\n?)*',
                ')',
                '(?:\\n|$)'
            ].join(''),
            'gm'
        ),
        contextDetails: {
            lineBreak: lineFeedDelimiter
        }
    };
    markdownSchema.alternativeTable = {
        pattern: new RegExp(
            [
                '^',
                '[ ]{0,3}',
                '(\\S.*[|].*)\\n',

                '[ ]{0,3}',
                '([-:]+[ ]*[|][-| :]*)\\n',

                '(',
                '(?:.*[|].*\\n?)*',
                ')',
                '(?:\\n|$)'
            ].join(''),
            'gm'
        ),
        contextDetails: {
            lineBreak: lineFeedDelimiter
        }
    };

    markdownSchema.horizontalRule = {
        pattern: /^([*\-_] *){3,}$/gm
    };
    markdownSchema.mathBlock = {
        pattern: /(\$\$|\\\\\[|\\\\\\\\\()[\s\S]*?(\$\$|\\\\\]|\\\\\\\\\))/g,
        contextDetails: {
            "mathBlockStart": /^(\$\$|\\\\\[|\\\\\\\\\()/,
            "mathBlockEnd": /(\$\$|\\\\\]|\\\\\\\\\))/,
            lineBreak: lineFeedDelimiter,
            remainingRules: scientificTextRules
        }
    };
    markdownSchema.latexEnvironment = {
        pattern: /\\?\\begin\{[a-z]*\*?\}[\s\S]*?\\?\\end\{[a-z]*\*?\}/g,
        contextDetails: {
            "environmentKeyword": /\\?\\(begin|end)/,
            lineBreak: lineFeedDelimiter,
            remainingRules: scientificTextRules
        }
    };
    markdownSchema.lineTextRule = {
        pattern: /^[ <>^*+#\t\\\/\[\]\(\)0-9\._-]*[A-Za-z\$][^\n]*$/gm,
    };

    markdownSchema.headingLevels = {};
    for (let currentLevel = 6; currentLevel >= 1; currentLevel--) {
        markdownSchema.headingLevels["level" + currentLevel] = {
            pattern: new RegExp("^#{" + currentLevel + "}.+$", "gm"),
            contextDetails: {
                "headingHashPrefix": new RegExp("^#{" + currentLevel + "}")
            }
        };
    }

    markdownSchema.blockQuote = {
        pattern: /^ {0,3}> *[^\n]+$/gm,
        contextDetails: {
            "blockquotePrefix": /^ {0,3}> */,
            "listItemRule": {}
        }
    };
    markdownSchema.listItem = {
        pattern: /^[ \t]*([*+\-]|\d+\.)[ \t].+(?:\n|[ \t].*\n)*/gm,
        contextDetails: {
            "listItemPrefix": /^[ \t]*([*+\-]|\d+\.)[ \t]/m,
            'gfmCodeBlockNested': {
                pattern: /^((?: {4}|\t)+)`{3}.*\n(?:[\s\S]*?)\n\1`{3} *$/gm,
                contextDetails: {
                    "markdownBlockIndicator": /`{3}/,
                    lineBreak: lineFeedDelimiter
                }
            },
            lineBreak: lineFeedDelimiter
        }
    };
    markdownSchema.blockQuote.contextDetails.listItemRule = markdownSchema.listItem;

    markdownSchema.footnoteDefinition = {
        pattern: /^ {0,3}\[\^.*?\]:[ \t]+.*$/gm,
        contextDetails: {
            "referenceIdentifier": {
                pattern: /\[\^.*?\]/,
                contextDetails: {
                    "openingBracket": /\[/,
                    "closingBracket": /\]/
                }
            }
        }
    };
    markdownSchema.linkDefinition = {
        pattern: /^ {0,3}\[.*?\]:[ \t]+.*$/gm,
        contextDetails: {
            "linkIdentifier": {
                pattern: /\[.*?\]/,
                contextDetails: {
                    "openingBracket": /\[/,
                    "closingBracket": /\]/
                }
            },
            uri: uriRecognizer,
            linkTitle: /['\"\(][^\'\"\)]*['\"\)]/
        }
    };
    markdownSchema.paragraphElement = {
        pattern: /.+/g,
        contextDetails: {}
    };
    markdownSchema.lineFeed = /^\n$/gm;
    markdownSchema.imageElement = {
        pattern: /!\[[^\]]*\]\([^\)]+\)/g,
        contextDetails: {
            "imagePrefix": /^!/,
            "openingBracket": /\[/,
            "altTextContent": /[^\[]+(?=\])/,
            "closingBracket": /\](?=\()/,
            "imageSourceParentheses": {
                pattern: /\([^\)]+\)/,
                contextDetails: {
                    "parenStart": /^\(/,
                    "imageTitle": /(['‘][^'’]*['’]|["“][^"”]*["”])(?=\)$)/,
                    "imagePath": /[^\('" \t]+(?=[\)'" \t])/,
                    "parenEnd": /\)$/
                }
            }
        }
    };
    markdownSchema.hyperlinkElement = {
        pattern: new RegExp('\\[(?:(\\\\.)|[^\\[\\]])*?\\]\\([^\(\)\s]+(\\(\\S*?\\))??[^\(\)\s]*?(\\s([\'‘][^\'’]*[\'’]|[\"“][^\"”]*[\"”]))?\)', 'gm'),
        contextDetails: {
            "bracketStart": {
                pattern: /(^|[^\\])\[/,
                lookBehind: true
            },
            "underlinedTextContent": {
                pattern: /(?:(\\.)|[^\\[\\]])+(?=\])/
            },
            "bracketEnd": /\]\s?\(/,
            "parenEnd": /\)$/,
            "hyperlinkRef": /.*/
        }
    };
    markdownSchema.footnoteReference = {
        pattern: /\[\^(.*?)\]/g,
        contextDetails: {
            "referenceSection": {
                pattern: /^\[[^\[\]]+\] ?/,
                contextDetails: {
                    "openingBracket": /\[/,
                    "referenceId": /^[^\[\]]+/,
                    "closingBracket": /\]/
                }
            }
        }
    };
    markdownSchema.imageReference = {
        pattern: /!\[(.*?)\] ?\[(.*?)\]/g,
        contextDetails: {
            "imagePrefix": /^!/,
            "referenceEnd": {
                pattern: /\[[^\[\]]+\]$/,
                contextDetails: {
                    "openingBracket": /\[/,
                    "hyperlinkRef": /[^\[\]]+(?=\]$)/,
                    "closingBracket": /\]/
                }
            },
            "referenceStart": {
                pattern: /^\[[^\[\]]+\] ?/,
                contextDetails: {
                    "openingBracket": /\[/,
                    "altTextContent": /^[^\[\]]+/,
                    "closingBracket": /\]/
                }
            }
        }
    };
    markdownSchema.linkReference = {
        pattern: /\[(.*?)\] ?\[(.*?)\]/g,
        contextDetails: {
            "referenceEnd": {
                pattern: /\[[^\[\]]+\]$/,
                contextDetails: {
                    "openingBracket": /\[/,
                    "hyperlinkRef": /[^\[\]]+(?=\]$)/,
                    "closingBracket": /\]/
                }
            },
            "referenceStart": {
                pattern: /^\[[^\[\]]+\] ?/,
                contextDetails: {
                    "openingBracket": /\[/,
                    "underlinedTextContent": /^[^\[\]]+/,
                    "closingBracket": /\]/
                }
            }
        }
    };
    markdownSchema.inlineCode = {
        pattern: /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/g,
        lookBehind: true,
        contextDetails: {
            "codeDelimiter": /`/
        }
    };
    markdownSchema.inlineMath = {
        pattern: /\$.*?\$/g,
        contextDetails: {
            "mathDelimiterStart": /^\$/,
            "mathDelimiterEnd": /\$$/,
            remainingRules: scientificTextRules
        }
    };
    markdownSchema.strongEmphasis = {
        pattern: /([_\*])\1((?!\1{2}).)*\1{2}/g,
        contextDetails: {
            "emphasisDelimiter": /([_\*])\1/g
        }
    };
    markdownSchema.emphasisText = {
        pattern: /(^|[^\\])(\*|_)(\S[^\2]*?)??[^\s\\]+?\2/g,
        lookBehind: true,
        contextDetails: {
            "emphasisStart": /^(\*|_)/,
            "emphasisEnd": /(\*|_)$/
        }
    };
    markdownSchema.strikethroughText = {
        pattern: /(^|\n|\W)(~~)(?=\S)([^\r]*?\S)\2/gm,
        lookBehind: true,
        contextDetails: {
            "strikethroughDelimiter": /(~~)/,
            "strikethroughContent": /[^~]+/
        }
    };

    let sharedContextRules = {
        inlineCode: markdownSchema.inlineCode,
        inlineMath: markdownSchema.inlineMath,
        footnoteReference: markdownSchema.footnoteReference,
        imageElement: markdownSchema.imageElement,
        hyperlinkElement: markdownSchema.hyperlinkElement,
        imageReference: markdownSchema.imageReference,
        linkReference: markdownSchema.linkReference,
        uri: uriRecognizer,
        electronicMail: electronicMailRecognizer,
        strongEmphasis: markdownSchema.strongEmphasis,
        emphasisText: markdownSchema.emphasisText,
        strikethroughText: markdownSchema.strikethroughText,
        conflictMarker: /⧸⧸/g,
        commentSegment: SyntaxDefinitionStore.rulesets.HtmlXmlSyntax.blockComment,
        elementTag: SyntaxDefinitionStore.rulesets.HtmlXmlSyntax.elementToken,
        htmlEntity: SyntaxDefinitionStore.rulesets.HtmlXmlSyntax.characterEntity
    };

    for (let currentLevel = 6; currentLevel >= 1; currentLevel--) {
        markdownSchema.headingLevels["level" + currentLevel].contextDetails.remainingRules = sharedContextRules;
    }
    markdownSchema.altHeadingOne.contextDetails.remainingRules = sharedContextRules;
    markdownSchema.altHeadingTwo.contextDetails.remainingRules = sharedContextRules;
    markdownSchema.standardTable.contextDetails.remainingRules = sharedContextRules;
    markdownSchema.alternativeTable.contextDetails.remainingRules = sharedContextRules;
    markdownSchema.paragraphElement.contextDetails.remainingRules = sharedContextRules;
    markdownSchema.blockQuote.contextDetails.remainingRules = sharedContextRules;
    markdownSchema.listItem.contextDetails.remainingRules = sharedContextRules;
    markdownSchema.footnoteDefinition.contextDetails.remainingRules = sharedContextRules;

    let nestedSharedRules = {
        inlineCode: markdownSchema.inlineCode,
        footnoteReference: markdownSchema.footnoteReference,
        hyperlinkElement: markdownSchema.hyperlinkElement,
        linkReference: markdownSchema.linkReference,
        conflictMarker: /⧸⧸/g,
    };
    markdownSchema.strongEmphasis.contextDetails.remainingRules = nestedSharedRules;
    markdownSchema.emphasisText.contextDetails.remainingRules = nestedSharedRules;
    markdownSchema.strikethroughText.contextDetails.remainingRules = nestedSharedRules;

    let inlineContextRules = {
        inlineCode: markdownSchema.inlineCode,
        strongEmphasis: markdownSchema.strongEmphasis,
        emphasisText: markdownSchema.emphasisText,
        strikethroughText: markdownSchema.strikethroughText,
        conflictMarker: /⧸⧸/g,
        commentSegment: SyntaxDefinitionStore.rulesets.HtmlXmlSyntax.blockComment,
        elementTag: SyntaxDefinitionStore.rulesets.HtmlXmlSyntax.elementToken,
        htmlEntity: SyntaxDefinitionStore.rulesets.HtmlXmlSyntax.characterEntity
    };
    markdownSchema.hyperlinkElement.contextDetails.underlinedTextContent.contextDetails = inlineContextRules;
    markdownSchema.linkReference.contextDetails.referenceStart.contextDetails.underlinedTextContent.contextDetails = inlineContextRules;

    markdownSchema.lineTextRule.contextDetails = {
        headingOne: markdownSchema.headingLevels.level1,
        headingTwo: markdownSchema.headingLevels.level2,
        headingThree: markdownSchema.headingLevels.level3,
        headingFour: markdownSchema.headingLevels.level4,
        headingFive: markdownSchema.headingLevels.level5,
        headingSix: markdownSchema.headingLevels.level6,
        blockQuote: markdownSchema.blockQuote,
        listItem: markdownSchema.listItem,
        footnoteDefinition: markdownSchema.footnoteDefinition,
        linkDefinition: markdownSchema.linkDefinition
    };

    return markdownSchema;
};

SyntaxDefinitionStore.rulesets.MarkdownSyntax = createMarkdownGrammar();

const defaultTransformationPreferences = {
    mainHeadingSetext: false,
    subHeadingSetext: false,
    listBulletSymbol: '+',
    indentationString: '\t',
    columnPrefix: 'Col ',
    tableBorders: true,
    preserveNbsp: true,
    omitSpanTags: false,
    omitDivTags: false,
};

class DocumentMarkupProcessor {
    constructor(configOptions) {
        this.currentPreferences = { ...defaultTransformationPreferences, ...configOptions };
        this.domElementHandlers = new Map();
        this.setupElementHandlers();
    }

    setupElementHandlers() {
        this.domElementHandlers.set('H1', (el) => {
            const content = this.processElementChildren(el);
            return this.currentPreferences.mainHeadingSetext ? `${content}\n${'='.repeat(content.length)}\n\n` : `# ${content}\n\n`;
        });
        this.domElementHandlers.set('H2', (el) => {
            const content = this.processElementChildren(el);
            return this.currentPreferences.subHeadingSetext ? `${content}\n${'-'.repeat(content.length)}\n\n` : `## ${content}\n\n`;
        });
        for (let i = 3; i <= 6; i++) {
            this.domElementHandlers.set(`H${i}`, (el) => `###${'#'.repeat(i - 3)} ${this.processElementChildren(el)}\n\n`);
        }
        this.domElementHandlers.set('P', (el) => `${this.processElementChildren(el)}\n\n`);
        this.domElementHandlers.set('UL', (el) => {
            let listOutput = '';
            Array.from(el.children).forEach(li => {
                listOutput += `${this.currentPreferences.listBulletSymbol} ${this.processElementChildren(li).trim()}\n`;
            });
            return listOutput + '\n';
        });
        this.domElementHandlers.set('OL', (el) => {
            let listOutput = '';
            let itemCounter = 1;
            Array.from(el.children).forEach(li => {
                listOutput += `${itemCounter}. ${this.processElementChildren(li).trim()}\n`;
                itemCounter++;
            });
            return listOutput + '\n';
        });
        this.domElementHandlers.set('LI', (el) => this.processElementChildren(el));
        this.domElementHandlers.set('A', (el) => {
            const linkHref = el.getAttribute('href') || '';
            const linkText = this.processElementChildren(el);
            return `[${linkText}](${linkHref})`;
        });
        this.domElementHandlers.set('IMG', (el) => {
            const imageSrc = el.getAttribute('src') || '';
            const imageAlt = el.getAttribute('alt') || '';
            return `![${imageAlt}](${imageSrc})`;
        });
        this.domElementHandlers.set('CODE', (el) => `\`${el.textContent}\``);
        this.domElementHandlers.set('PRE', (el) => '```\n' + el.textContent.trim() + '\n```\n\n');
        this.domElementHandlers.set('STRONG', (el) => `**${this.processElementChildren(el)}**`);
        this.domElementHandlers.set('EM', (el) => `*${this.processElementChildren(el)}*`);
        this.domElementHandlers.set('BLOCKQUOTE', (el) => {
            const quoteContent = this.processElementChildren(el).split('\n').map(line => `> ${line}`).join('\n');
            return `${quoteContent}\n\n`;
        });
        this.domElementHandlers.set('BR', () => '  \n');
        this.domElementHandlers.set('HR', () => '---\n\n');
        this.domElementHandlers.set('TABLE', (el) => this.convertHtmlTable(el));
        this.domElementHandlers.set('TBODY', (el) => this.processElementChildren(el));
        this.domElementHandlers.set('THEAD', (el) => this.processElementChildren(el));
        this.domElementHandlers.set('TR', (el) => this.processElementChildren(el));
        this.domElementHandlers.set('TH', (el) => this.processElementChildren(el));
        this.domElementHandlers.set('TD', (el) => this.processElementChildren(el));

        this.domElementHandlers.set('default', (el) => {
            if (this.currentPreferences.omitSpanTags && el.tagName === 'SPAN') return this.processElementChildren(el);
            if (this.currentPreferences.omitDivTags && el.tagName === 'DIV') return this.processElementChildren(el);
            return this.processElementChildren(el);
        });
    }

    processElementChildren(parentElement) {
        let childOutput = '';
        Array.from(parentElement.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                childOutput += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const handler = this.domElementHandlers.get(node.tagName) || this.domElementHandlers.get('default');
                childOutput += handler(node);
            }
        });
        return childOutput;
    }

    convertHtmlTable(tableNode) {
        let tableMarkdown = '';
        const headerRows = tableNode.querySelectorAll('thead tr');
        const bodyRows = tableNode.querySelectorAll('tbody tr');

        if (headerRows.length > 0) {
            const headers = Array.from(headerRows[0].children).map(th => this.processElementChildren(th).trim());
            tableMarkdown += '| ' + headers.join(' | ') + ' |\n';
            if (this.currentPreferences.tableBorders) {
                tableMarkdown += '|' + headers.map(() => '---').join('|') + '|\n';
            }
        }

        bodyRows.forEach(row => {
            const cells = Array.from(row.children).map(cell => this.processElementChildren(cell).trim());
            tableMarkdown += '| ' + cells.join(' | ') + ' |\n';
        });

        return tableMarkdown + '\n';
    }

    convertDocument(inputMarkup) {
        const domParser = new DOMParser();
        const docFragment = domParser.parseFromString(inputMarkup, 'text/html');
        const rootElements = docFragment.body.children;

        let finalResult = '';
        Array.from(rootElements).forEach(rootEl => {
            const handler = this.domElementHandlers.get(rootEl.tagName) || this.domElementHandlers.get('default');
            finalResult += handler(rootEl);
        });

        finalResult = finalResult.replace(/(\n\s*){3,}/g, '\n\n')
                                 .replace(/ {2,}/g, ' ')
                                 .trim();
        if (this.currentPreferences.preserveNbsp) {
            finalResult = finalResult.replace(/&nbsp;/g, ' ');
        }
        return finalResult;
    }
}

const CleanHtmlContent = function(rawHtmlInput) {
    let processedHtml = rawHtmlInput;
    const htmlEndIndex = processedHtml.indexOf('</html>');
    if (htmlEndIndex >= 0) {
        processedHtml = processedHtml.substring(0, htmlEndIndex + 7);
    }

    const temporaryWrapper = document.createElement('div');
    temporaryWrapper.innerHTML = processedHtml;

    const permittedElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'ul', 'ol', 'img', 'li', 'a', 'blockquote', 'pre', 'span', 'b', 'i', 'br', 'em', 'strong', 'code', 'table', 'thead', 'tbody', 'td', 'th', 'tr'];

    const refineElementAttributes = function(currentElement) {
        currentElement.removeAttribute('class');
        currentElement.removeAttribute('style');
        currentElement.removeAttribute('lang');
        currentElement.removeAttribute('dir');
        currentElement.removeAttribute('title');

        const elementNameAttr = currentElement.getAttribute('name');
        if (elementNameAttr) {
            if (elementNameAttr.startsWith('_ftnref')) {
                currentElement.removeAttribute('href');
                const footnoteRef = currentElement.textContent.replace(/\[(\d+)\]/, '[^$1]');
                currentElement.textContent = footnoteRef;
            } else if (elementNameAttr.startsWith('_ftn')) {
                currentElement.removeAttribute('href');
                const footnoteDef = currentElement.textContent.replace(/\[(\d+)\]/, '[^$1]:');
                currentElement.textContent = footnoteDef;
            }
        }
    };

    const processNodeHierarchy = function(nodeList) {
        Array.from(nodeList).forEach(currentNode => {
            Array.from(currentNode.childNodes).filter(node => node.nodeType === Node.COMMENT_NODE).forEach(commentNode => {
                currentNode.removeChild(commentNode);
            });

            const childElements = Array.from(currentNode.children);

            if (!currentNode.textContent.trim().length && !(currentNode.tagName === 'IMG' || currentNode.querySelector('img'))) {
                if (currentNode.parentNode) {
                    currentNode.parentNode.removeChild(currentNode);
                }
                return;
            }

            if (permittedElements.indexOf(currentNode.tagName.toLowerCase()) < 0) {
                while (currentNode.firstChild) {
                    currentNode.parentNode.insertBefore(currentNode.firstChild, currentNode);
                }
                if (currentNode.parentNode) {
                    currentNode.parentNode.removeChild(currentNode);
                }
            } else {
                refineElementAttributes(currentNode);
            }
            processNodeHierarchy(childElements);
        });
    };

    Array.from(temporaryWrapper.childNodes).filter(node => node.nodeType === Node.COMMENT_NODE).forEach(commentNode => {
        temporaryWrapper.removeChild(commentNode);
    });

    processNodeHierarchy(temporaryWrapper.children);

    processNodeHierarchy(temporaryWrapper.children);

    return temporaryWrapper.innerHTML.replace(/\n/g, ' ');
};

const documentTranslator = new DocumentMarkupProcessor({
    mainHeadingSetext: false,
    subHeadingSetext: false,
    listBulletSymbol: '+',
    indentationString: '\t',
    columnPrefix: 'Col ',
    tableBorders: true,
    preserveNbsp: true,
    omitSpanTags: false,
    omitDivTags: false,
});

const TransformHtmlToMarkdown = function(inputHtml) {
    const cleanedHtml = CleanHtmlContent(inputHtml);
    return documentTranslator.convertDocument(cleanedHtml);
};