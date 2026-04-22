(function () {

    // Helper to create a quick lookup object from a comma-separated string
    const createLookup = (entryList) => {
        const referenceMap = {};
        entryList.split(',').forEach(item => {
            referenceMap[item] = true;
        });
        return referenceMap;
    };

    // Element category definitions, renamed and reordered
    const specialContentTags = createLookup("script,style");
    const voidElements = createLookup("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");
    const blockLevelElements = createLookup("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");
    const phraseElements = createLookup("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");
    const implicitCloseElements = createLookup("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
    const booleanAttributes = createLookup("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

    // The core parser function
    const MarkupInterpreter = function (sourceText, outputCallbacks) {
        let textCursor = 0;
        const activeNodePath = []; // Renamed from 'stack', 'documentPath'
        activeNodePath.current = () => activeNodePath[activeNodePath.length - 1];

        let currentTextAccumulator = ""; // Buffer for accumulating characters
        let currentParsingState = "TEXT_CONTENT"; // State machine state

        let currentTagContext = null; // Stores details of the tag being parsed

        // Internal functions for handling tag events
        const emitStartTag = (elementName, elementProperties, isSelfClosing) => { // Renamed from parseStartTag, dispatchOpeningTag
            elementName = elementName.toLowerCase();

            // Auto-close inline elements when a block element is encountered
            if (blockLevelElements[elementName]) {
                while (activeNodePath.current() && phraseElements[activeNodePath.current()]) {
                    emitEndTag(activeNodePath.current());
                }
            }

            // Auto-close specific elements if they are already open
            if (implicitCloseElements[elementName] && activeNodePath.current() === elementName) {
                emitEndTag(elementName);
            }

            isSelfClosing = voidElements[elementName] || !!isSelfClosing;

            if (!isSelfClosing) {
                activeNodePath.push(elementName);
            }

            if (outputCallbacks.onOpening) { // Renamed from handler.start, outputCallbacks.beginNode
                const processedProperties = [];
                elementProperties.forEach(prop => {
                    let propValue = prop.value;
                    if (booleanAttributes[prop.name]) {
                        propValue = prop.name; // For boolean attributes, value is name
                    }
                    processedProperties.push({
                        label: prop.name,
                        data: propValue,
                    });
                });
                outputCallbacks.onOpening(elementName, processedProperties, isSelfClosing);
            }
        };

        const emitEndTag = (elementName) => { // Renamed from parseEndTag, dispatchClosingTag
            let closingTargetIndex = 0; // If no name, close all

            if (elementName) {
                // Find the closest opened tag of the same type
                for (let i = activeNodePath.length - 1; i >= 0; i--) {
                    if (activeNodePath[i] === elementName) {
                        closingTargetIndex = i;
                        break;
                    }
                }
            }

            if (closingTargetIndex >= 0) {
                // Close all elements from the stack down to closingTargetIndex
                for (let i = activeNodePath.length - 1; i >= closingTargetIndex; i--) {
                    if (outputCallbacks.onClosing) { // Renamed from handler.end, outputCallbacks.endNode
                        outputCallbacks.onClosing(activeNodePath[i]);
                    }
                }
                // Remove closed elements from the stack
                activeNodePath.length = closingTargetIndex;
            }
        };

        // Main parsing loop
        while (textCursor < sourceText.length) {
            const currentSlice = sourceText.substring(textCursor);
            let consumedAmount = 0;
            let prevCursor = textCursor; // For error detection

            // Handle special raw content elements (script/style)
            if (activeNodePath.current() && specialContentTags[activeNodePath.current()]) {
                const currentRawTagName = activeNodePath.current();
                const endRawTagPattern = new RegExp("([\\s\\S]*?)<\\/" + currentRawTagName + "[^>]*>", "i");
                const rawMatch = currentSlice.match(endRawTagPattern);

                if (rawMatch) {
                    let rawContent = rawMatch[1];
                    // Mimic original's comment/CDATA stripping inside script/style
                    rawContent = rawContent.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, (all, g1, g2) => g1 || g2 || '');
                    if (outputCallbacks.onText) {
                        outputCallbacks.onText(rawContent);
                    }
                    consumedAmount = rawMatch[0].length;
                    emitEndTag(currentRawTagName);
                    currentParsingState = "TEXT_CONTENT";
                } else {
                    // No closing tag found for raw content element, consume rest as text
                    if (outputCallbacks.onText) {
                        outputCallbacks.onText(currentSlice);
                    }
                    consumedAmount = currentSlice.length;
                    // The element effectively remains open until end of document, implicitly handled by loop end.
                }
            } else { // Normal parsing states
                switch (currentParsingState) {
                    case "TEXT_CONTENT":
                        if (currentSlice.startsWith("<!--")) {
                            if (currentTextAccumulator.length > 0 && outputCallbacks.onText) {
                                outputCallbacks.onText(currentTextAccumulator);
                                currentTextAccumulator = "";
                            }
                            consumedAmount = 4;
                            currentParsingState = "COMMENT_BODY";
                        } else if (currentSlice.startsWith("</")) {
                            if (currentTextAccumulator.length > 0 && outputCallbacks.onText) {
                                outputCallbacks.onText(currentTextAccumulator);
                                currentTextAccumulator = "";
                            }
                            consumedAmount = 2;
                            currentParsingState = "TAG_CLOSING_NAME";
                        } else if (currentSlice.startsWith("<")) {
                            if (currentTextAccumulator.length > 0 && outputCallbacks.onText) {
                                outputCallbacks.onText(currentTextAccumulator);
                                currentTextAccumulator = "";
                            }
                            consumedAmount = 1;
                            currentParsingState = "TAG_OPENING_NAME";
                        } else {
                            const nextDelimiter = currentSlice.indexOf("<");
                            if (nextDelimiter === -1) {
                                currentTextAccumulator += currentSlice;
                                consumedAmount = currentSlice.length;
                            } else {
                                currentTextAccumulator += currentSlice.substring(0, nextDelimiter);
                                consumedAmount = nextDelimiter;
                            }
                        }
                        break;

                    case "COMMENT_BODY":
                        const commentEnd = currentSlice.indexOf("-->");
                        if (commentEnd !== -1) {
                            if (outputCallbacks.onComment) { // Renamed from handler.comment, outputCallbacks.note
                                outputCallbacks.onComment(currentSlice.substring(0, commentEnd));
                            }
                            consumedAmount = commentEnd + 3;
                            currentParsingState = "TEXT_CONTENT";
                        } else {
                            // Malformed comment, original would throw if the entire remaining string was part of an unclosed comment.
                            // For functional equivalence, we should eventually throw.
                            // For now, treat as text, and the stuck check below will throw if no progress.
                            currentTextAccumulator += "<!--" + currentSlice; // Re-add the opening, as it's now text
                            consumedAmount = currentSlice.length;
                            currentParsingState = "TEXT_CONTENT"; // Fallback to text
                        }
                        break;

                    case "TAG_OPENING_NAME":
                    case "TAG_CLOSING_NAME":
                        const tagNameMatch = currentSlice.match(/^([-A-Za-z0-9_:]+)/);
                        if (tagNameMatch) {
                            currentTagContext = { name: tagNameMatch[1], properties: [], isSelfClosing: false };
                            consumedAmount = tagNameMatch[0].length;
                            currentParsingState = (currentParsingState === "TAG_OPENING_NAME") ? "TAG_ATTRIBUTES" : "TAG_CLOSING_END";
                        } else {
                            // Invalid tag name character, treat '<' followed by char as text
                            if (outputCallbacks.onText) {
                                outputCallbacks.onText("<"); // Emit the '<' that was consumed
                            }
                            // Don't consume current char, let it be processed as text in next iteration
                            consumedAmount = 0; 
                            currentParsingState = "TEXT_CONTENT";
                            currentTagContext = null;
                        }
                        break;

                    case "TAG_ATTRIBUTES":
                        const attributeRegex = /^(\s*)([-a-zA-Z0-9_:]+)(?:\s*=\s*(?:("([^"]*)")|('([^']*)')|([^>\s]+)))?/;
                        const attrMatch = currentSlice.match(attributeRegex);

                        if (attrMatch && attrMatch[1].length > 0) { // Matched an attribute preceded by whitespace
                            const fullMatch = attrMatch[0];
                            const attrName = attrMatch[2];
                            let attrValue = "";

                            if (attrMatch[4] !== undefined) { // Double quoted
                                attrValue = attrMatch[4];
                            } else if (attrMatch[6] !== undefined) { // Single quoted
                                attrValue = attrMatch[6];
                            } else if (attrMatch[7] !== undefined) { // Unquoted
                                attrValue = attrMatch[7];
                            } else if (attrMatch[3] === undefined && attrMatch[2] !== undefined) { // Boolean attribute, no explicit value
                                attrValue = attrName;
                            }

                            currentTagContext.properties.push({ name: attrName, value: attrValue });
                            consumedAmount = fullMatch.length;
                            // Stay in TAG_ATTRIBUTES to find more
                        } else if (currentSlice.startsWith("/>")) {
                            currentTagContext.isSelfClosing = true;
                            emitStartTag(currentTagContext.name, currentTagContext.properties, true);
                            consumedAmount = 2;
                            currentParsingState = "TEXT_CONTENT";
                            currentTagContext = null;
                        } else if (currentSlice.startsWith(">")) {
                            emitStartTag(currentTagContext.name, currentTagContext.properties, false);
                            consumedAmount = 1;
                            currentParsingState = "TEXT_CONTENT";
                            currentTagContext = null;
                        } else if (currentSlice.match(/^\s+/)) { // Only whitespace, consume and stay in state
                            consumedAmount = currentSlice.match(/^\s+/)[0].length;
                        } else {
                            // Malformed tag or unexpected character, treat as text and reset
                            if (outputCallbacks.onText) {
                                outputCallbacks.onText("<" + currentTagContext.name); // Emit the tag name part
                            }
                            consumedAmount = 0; // Re-process current char as text
                            currentParsingState = "TEXT_CONTENT";
                            currentTagContext = null;
                        }
                        break;

                    case "TAG_CLOSING_END":
                        const closeEndMatch = currentSlice.match(/^\s*>/);
                        if (closeEndMatch) {
                            consumedAmount = closeEndMatch[0].length;
                            emitEndTag(currentTagContext.name);
                            currentParsingState = "TEXT_CONTENT";
                            currentTagContext = null;
                        } else {
                            // Malformed closing tag, treat as text
                            if (outputCallbacks.onText) {
                                outputCallbacks.onText("</" + currentTagContext.name); // Emit the closing tag start
                            }
                            consumedAmount = 0; // Reprocess current char as text
                            currentParsingState = "TEXT_CONTENT";
                            currentTagContext = null;
                        }
                        break;
                }
            }

            if (consumedAmount === 0 && textCursor === prevCursor) {
                // Parser got stuck, indicating an unhandled or malformed sequence
                throw new Error("Parsing error: Stuck at character " + textCursor + ". Remaining: " + currentSlice.substring(0, 50));
            }
            textCursor += consumedAmount;
        }

        // Emit any remaining accumulated text
        if (currentTextAccumulator.length > 0 && outputCallbacks.onText) {
            outputCallbacks.onText(currentTextAccumulator);
        }

        // Close any remaining open tags at the end of the document
        emitEndTag();
    };

    // --- MarkupToStandard (HTMLtoXML equivalent) ---
    this.MarkupToStandard = function (inputMarkup) {
        let outputBuffer = "";

        MarkupInterpreter(inputMarkup, {
            onOpening: function (tagIdentifier, attributeRecords, isSelfClosing) {
                outputBuffer += "<" + tagIdentifier;
                attributeRecords.forEach(record => {
                    // XML escaping for attributes
                    let escapedData = record.data
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&apos;');
                    outputBuffer += " " + record.label + '="' + escapedData + '"';
                });
                if (isSelfClosing) {
                    outputBuffer += "/>"; // XHTML-style self-closing
                } else {
                    outputBuffer += ">";
                }
            },
            onClosing: function (tagIdentifier) {
                // Ensure we don't emit closing tags for void elements
                if (!voidElements[tagIdentifier]) {
                    outputBuffer += "</" + tagIdentifier + ">";
                }
            },
            onText: function (content) {
                // XML escaping for text content
                outputBuffer += content
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            },
            onComment: function (commentContent) {
                outputBuffer += "<!--" + commentContent + "-->";
            }
        });

        return outputBuffer;
    };

    // --- MarkupToDocument (HTMLtoDOM equivalent) ---
    this.MarkupToDocument = function (inputMarkup, targetDocument) {
        // Renamed one -> singularElements, structure -> parentStructureMap
        const singularElements = createLookup("html,head,body,title");
        const parentStructureMap = { link: "head", base: "head" };

        let domContext = targetDocument;
        if (!domContext) {
            if (typeof document !== "undefined" && document.implementation && document.implementation.createDocument) {
                domContext = document.implementation.createDocument("", "", null);
            } else if (typeof ActiveXObject !== "undefined") {
                domContext = new ActiveXObject("Msxml2.DOMDocument");
            } else {
                throw new Error("No DOM document implementation found.");
            }
        } else {
            domContext = domContext.ownerDocument || domContext;
        }

        let rootNode = domContext.documentElement || (domContext.children && domContext.children[0]);

        // If it's an empty document, pre-populate HTML structure
        if (!rootNode && domContext.createElement) {
            const documentHtml = domContext.createElement("html");
            const documentHead = domContext.createElement("head");
            documentHead.appendChild(domContext.createElement("title"));
            documentHtml.appendChild(documentHead);
            documentHtml.appendChild(domContext.createElement("body"));
            domContext.appendChild(documentHtml);
            rootNode = documentHtml;
        }

        // Collect references to singular elements
        const preExistingDomElements = {};
        if (domContext.getElementsByTagName) {
            for (const tagName in singularElements) {
                if (singularElements.hasOwnProperty(tagName)) {
                    const foundElements = domContext.getElementsByTagName(tagName);
                    if (foundElements && foundElements.length > 0) {
                        preExistingDomElements[tagName] = foundElements[0];
                    }
                }
            }
        }

        let currentDomParent = preExistingDomElements.body || (rootNode && rootNode.getElementsByTagName('body')[0]) || rootNode;
        const domNodeStack = []; // Renamed from elems, nodePath

        MarkupInterpreter(inputMarkup, {
            onOpening: function (tagIdentifier, attributeRecords, isSelfClosing) {
                if (preExistingDomElements[tagIdentifier]) {
                    currentDomParent = preExistingDomElements[tagIdentifier];
                    if (!isSelfClosing) {
                        domNodeStack.push(currentDomParent);
                    }
                    return;
                }

                const newDomElement = domContext.createElement(tagIdentifier);

                attributeRecords.forEach(record => {
                    newDomElement.setAttribute(record.label, record.data);
                });

                if (parentStructureMap[tagIdentifier] && preExistingDomElements[parentStructureMap[tagIdentifier]]) {
                    preExistingDomElements[parentStructureMap[tagIdentifier]].appendChild(newDomElement);
                } else if (currentDomParent && currentDomParent.appendChild) {
                    currentDomParent.appendChild(newDomElement);
                }

                if (!isSelfClosing) {
                    domNodeStack.push(newDomElement);
                    currentDomParent = newDomElement;
                }
            },
            onClosing: function (tagIdentifier) {
                if (domNodeStack.length > 0) {
                    domNodeStack.pop();
                    currentDomParent = domNodeStack[domNodeStack.length - 1] || preExistingDomElements.body || rootNode;
                }
            },
            onText: function (content) {
                if (currentDomParent && currentDomParent.appendChild) {
                    currentDomParent.appendChild(domContext.createTextNode(content));
                }
            },
            onComment: function (commentContent) {
                // Original HTMLtoDOM did not create comment nodes. Mimic that.
                // currentDomParent.appendChild(domContext.createComment(commentContent));
            }
        });

        return domContext;
    };

})();