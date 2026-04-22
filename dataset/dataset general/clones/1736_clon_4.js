const DocumentAssembler = (buildSettings = {}) => {

    class InternalComposer {
        constructor(configData) {
            const initialConfig = configData || {};
            this.config = {
                context: initialConfig.context == null ? {} : initialConfig.context,
                locals: initialConfig.locals == null ? {} : initialConfig.locals,
                format: initialConfig.format == null ? false : initialConfig.format,
                autoescape: initialConfig.autoescape == null ? false : initialConfig.autoescape,
            };
            this.currentIndentLevel = 0;
            this.outputChunks = [];
        }

        static protectHtml(input) {
            return String(input)
                .replace(/&(?!\w+;)/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        sanitizeContent(raw) {
            if (this.config.autoescape) {
                return InternalComposer.protectHtml(raw);
            }
            return String(raw);
        }

        static renderProperties(propertiesObject) {
            let propertyString = '';
            for (const key in propertiesObject) {
                const val = propertiesObject[key];
                propertyString += ` ${key}="${InternalComposer.protectHtml(val)}"`;
            }
            return propertyString;
        }

        getIndentation() {
            if (this.config.format) {
                return '  '.repeat(this.currentIndentLevel);
            }
            return '';
        }

        addRawText(textValue) {
            this.outputChunks.push(String(textValue));
        }

        addHtmlComment(commentText) {
            this.addRawText(`<!--${commentText}-->`);
            if (this.config.format) {
                this.addRawText('\n');
            }
        }

        addDocumentDeclaration(declarationId = '5') {
            const knownDeclarations = {
                '5': '<!DOCTYPE html>',
                'xml': '<?xml version="1.0" encoding="utf-8" ?>',
                'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
                'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
                '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
                'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
                'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
            };
            this.addRawText(knownDeclarations[declarationId]);
            if (this.config.format) {
                this.addRawText('\n');
            }
        }

        generateElement(tagName, ...elementArguments) {
            const voidElements = new Set(['area', 'base', 'basefont', 'br', 'hr', 'img', 'input', 'link', 'meta']);
            let elementHtmlParts = [];

            const hasFunctionContent = elementArguments.some(arg => typeof arg === 'function');
            const hasLiteralContent = elementArguments.some(arg => typeof arg === 'string' || typeof arg === 'number');

            if (this.config.format && (!hasFunctionContent && hasLiteralContent)) {
                // If only literal content, do not indent the opening tag if it's inline
            } else if (this.config.format) {
                elementHtmlParts.push(this.getIndentation());
            }

            elementHtmlParts.push(`<${tagName}`);

            for (const arg of elementArguments) {
                if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                    elementHtmlParts.push(InternalComposer.renderProperties(arg));
                }
            }

            if (voidElements.has(tagName)) {
                elementHtmlParts.push(' />');
                if (this.config.format) {
                    elementHtmlParts.push('\n');
                }
            } else {
                elementHtmlParts.push('>');

                if (hasFunctionContent) {
                    if (this.config.format) {
                        elementHtmlParts.push('\n');
                    }
                    this.currentIndentLevel++;
                    for (const arg of elementArguments) {
                        if (typeof arg === 'function') {
                            const result = arg.call(this.config.context);
                            if (typeof result === 'string' || typeof result === 'number') {
                                elementHtmlParts.push(this.getIndentation());
                                elementHtmlParts.push(this.sanitizeContent(result));
                                if (this.config.format) {
                                    elementHtmlParts.push('\n');
                                }
                            }
                        }
                    }
                    this.currentIndentLevel--;
                    if (this.config.format) {
                        elementHtmlParts.push(this.getIndentation());
                    }
                } else if (hasLiteralContent) {
                    for (const arg of elementArguments) {
                        if (typeof arg === 'string' || typeof arg === 'number') {
                            elementHtmlParts.push(this.sanitizeContent(arg));
                        }
                    }
                }
                elementHtmlParts.push(`</${tagName}>`);
                if (this.config.format) {
                    elementHtmlParts.push('\n');
                }
            }
            this.addRawText(elementHtmlParts.join(''));
        }

        assembleFinalOutput() {
            return this.outputChunks.join('');
        }
    }

    const currentComposer = new InternalComposer(buildSettings);

    const zeroPadder = (val) => String(val).length === 1 ? '0' + String(val) : String(val);
    const clockFormatter = (moment) => `${zeroPadder(moment.getHours())}:${zeroPadder(moment.getMinutes())}:${zeroPadder(moment.getSeconds())}`;

    const anchorLink = function() { currentComposer.generateElement('a', ...arguments); };
    const divisionBlock = function() { currentComposer.generateElement('div', ...arguments); };
    const emphasizedText = function() { currentComposer.generateElement('em', ...arguments); };
    const userForm = function() { currentComposer.generateElement('form', ...arguments); };
    const secondaryHeading = function() { currentComposer.generateElement('h2', ...arguments); };
    const italicElement = function() { currentComposer.generateElement('i', ...arguments); };
    const inputField = function() { currentComposer.generateElement('input', ...arguments); };
    const listEntry = function() { currentComposer.generateElement('li', ...arguments); };
    const paragraphText = function() { currentComposer.generateElement('p', ...arguments); };
    const strikeText = function() { currentComposer.generateElement('s', ...arguments); };
    const contentArea = function() { currentComposer.generateElement('section', ...arguments); };
    const inlineSpan = function() { currentComposer.generateElement('span', ...arguments); };
    const tableHeaderCell = function() { currentComposer.generateElement('th', ...arguments); };
    const timeDisplay = function() { currentComposer.generateElement('time', ...arguments); };
    const tableRowEntry = function() { currentComposer.generateElement('tr', ...arguments); };
    const underlinedElement = function() { currentComposer.generateElement('u', ...arguments); };
    const unorderedListBlock = function() { currentComposer.generateElement('ul', ...arguments); };
    const scriptEmbed = function() { currentComposer.generateElement('script', ...arguments); };

    const embedCode = (code) => scriptEmbed({ type: 'text' }, `;(${code})();`);

    const addTextContent = currentComposer.addRawText.bind(currentComposer);
    const addRemark = currentComposer.addHtmlComment.bind(currentComposer);
    const announceDocument = currentComposer.addDocumentDeclaration.bind(currentComposer);

    const pageLayouts = {};

    pageLayouts.app = function() {
        contentArea({ "class": 'app' }, function() {
            divisionBlock({ id: 'left' }, function() {
                return divisionBlock({ "class": 'wrap', id: 'channel-list' });
            });
            return divisionBlock({ id: 'right' }, function() {
                return divisionBlock({ "class": 'wrap', id: 'channel' });
            });
        });
    };

    pageLayouts.chat = function() {
        contentArea({ "class": 'chat-wrap' }, function() {
            secondaryHeading(function() { return this.name; });
            unorderedListBlock({ "class": 'chat' });
            return userForm(function() {
                return inputField({ type: 'text', id: 'message', autocomplete: 'off' });
            });
        });
    };

    pageLayouts.message = function() {
        listEntry({ "class": 'message' }, function() {
            inlineSpan({ "class": 'nick' }, function() { return this.from; });
            inlineSpan({ "class": 'timestamp' }, function() { return clockFormatter(this.received); });
            return this.message;
        });
    };

    pageLayouts.channelList = function() {
        contentArea({ "class": 'conversations' }, function() {
            secondaryHeading(function() { return 'Conversations'; });
            return unorderedListBlock();
        });
    };

    pageLayouts.channelListChannel = function() {
        listEntry({ "class": 'irc-channel' }, function() {
            inlineSpan({ "class": 'name' }, function() { return this.name; });
            return inlineSpan({ "class": 'message-count' });
        });
    };

    const contextObject = currentComposer.config.context;
    if (contextObject && contextObject.template && pageLayouts[contextObject.template]) {
        pageLayouts[contextObject.template].call(contextObject);
    }

    return currentComposer.assembleFinalOutput();
};