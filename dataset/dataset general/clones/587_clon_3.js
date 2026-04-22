(function () {

    // Regular expressions employed for dissecting HTML elements and their corresponding attributes.
    const TAG_START_PATTERN = /^<([a-zA-Z0-9_-]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
    const TAG_END_PATTERN = /^<\/([a-zA-Z0-9_-]+)[^>]*>/;
    const ATTRIBUTE_PATTERN = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

    // Utility function to convert a comma-separated string into a hash map for quick lookups.
    const buildLookupTable = function (inputString) {
        let lookupMap = {};
        const itemsArray = inputString.split(",");
        for (let idx = 0; idx < itemsArray.length; idx++) {
            lookupMap[itemsArray[idx]] = true;
        }
        return lookupMap;
    };

    // HTML5 elements that are always self-closing.
    const selfClosingTags = buildLookupTable("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");

    // HTML5 elements typically rendered as block-level.
    const blockLevelElements = buildLookupTable("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

    // HTML5 elements typically rendered as inline-level.
    const inlineLevelElements = buildLookupTable("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

    // Elements that implicitly close prior matching elements or inline elements.
    const autoClosingTags = buildLookupTable("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

    // Attributes that are boolean, meaning their presence implies their value.
    const booleanAttributes = buildLookupTable("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

    // Elements whose content should not be parsed as HTML (e.g., script, style tags).
    const rawContentElements = buildLookupTable("script,style");

    // Core function to process HTML markup, invoking callbacks for different parsing events.
    this.MarkupProcessor = function (markupString, eventHandlers) {
        let currentPosition;
        let tagMatch;
        let elementStack = [];
        let previousMarkupState = markupString; // Used to detect parsing stalls.

        // Extend the stack array with a utility method to access the top element.
        elementStack.peek = function () {
            return this[this.length - 1];
        };

        // Iterate as long as there is markup to parse.
        while (markupString) {
            let processedTextChunk = false; // Flag indicating if a non-text element was processed.

            // Check if we are currently inside a raw content element (like <script> or <style>).
            if (!elementStack.peek() || !rawContentElements[elementStack.peek()]) {

                // Attempt to parse comments first.
                if (markupString.startsWith("<!--")) {
                    currentPosition = markupString.indexOf("-->");
                    if (currentPosition >= 0) {
                        if (eventHandlers.comment) {
                            eventHandlers.comment(markupString.substring(4, currentPosition));
                        }
                        markupString = markupString.substring(currentPosition + 3);
                        processedTextChunk = true;
                    }
                }
                // Then try to parse closing tags.
                else if (markupString.startsWith("</")) {
                    tagMatch = markupString.match(TAG_END_PATTERN);
                    if (tagMatch) {
                        markupString = markupString.substring(tagMatch[0].length);
                        tagMatch[0].replace(TAG_END_PATTERN, handleClosingTag);
                        processedTextChunk = true;
                    }
                }
                // Finally, attempt to parse opening tags.
                else if (markupString.startsWith("<")) {
                    tagMatch = markupString.match(TAG_START_PATTERN);
                    if (tagMatch) {
                        markupString = markupString.substring(tagMatch[0].length);
                        tagMatch[0].replace(TAG_START_PATTERN, handleOpeningTag);
                        processedTextChunk = true;
                    }
                }

                // If no tag or comment was successfully processed, the remaining content is plain text.
                if (!processedTextChunk) {
                    currentPosition = markupString.indexOf("<");
                    let textContent = currentPosition < 0 ? markupString : markupString.substring(0, currentPosition);
                    markupString = currentPosition < 0 ? "" : markupString.substring(currentPosition);

                    if (eventHandlers.chars && textContent.length > 0) { // Only dispatch if there's actual text.
                        eventHandlers.chars(textContent);
                    }
                }

            } else { // Special handling for raw content elements.
                const currentRawTag = elementStack.peek();
                // Match everything until the closing tag of the current raw content element (case-insensitive).
                const rawContentRegex = new RegExp("([\\s\\S]*?)<\\/" + currentRawTag + "[^>]*>", "i");
                markupString = markupString.replace(rawContentRegex, function (fullMatch, contentText) {
                    // Remove any HTML comments or CDATA sections that might be within the raw content.
                    contentText = contentText.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
                    if (eventHandlers.chars) {
                        eventHandlers.chars(contentText);
                    }
                    return ""; // Consume the matched raw content and its closing tag.
                });

                handleClosingTag("", currentRawTag); // Manually trigger the closing event for the raw content tag.
            }

            // Guard against infinite loops where the parser makes no progress.
            if (markupString === previousMarkupState) {
                console.error("Parser stalled. Remaining input:", markupString.substring(0, Math.min(markupString.length, 100)) + "...");
                throw new Error("Parsing error: Markup could not be further processed, possibly malformed.");
            }
            previousMarkupState = markupString;
        }

        // After the main loop, ensure any remaining open tags are properly closed.
        handleClosingTag();

        function handleOpeningTag(entireMatch, tagName, attributeString, isSelfClosing) {
            let normalizedTagName = tagName.toLowerCase();

            // Auto-close inline elements if a block-level element is encountered.
            if (blockLevelElements[normalizedTagName]) {
                while (elementStack.peek() && inlineLevelElements[elementStack.peek()]) {
                    handleClosingTag("", elementStack.peek());
                }
            }

            // Auto-close elements that implicitly self-close if a matching tag is found.
            if (autoClosingTags[normalizedTagName] && elementStack.peek() === normalizedTagName) {
                handleClosingTag("", normalizedTagName);
            }

            // Determine if the tag is unary (self-closing).
            const isUnary = selfClosingTags[normalizedTagName] || (isSelfClosing === "/");

            if (!isUnary) {
                elementStack.push(normalizedTagName);
            }

            if (eventHandlers.start) {
                let collectedAttributes = [];

                attributeString.replace(ATTRIBUTE_PATTERN, function (match, attrName, valDoubleQuote, valSingleQuote, valNoQuote) {
                    // Prioritize values from double quotes, then single, then unquoted. Fallback to attribute name for booleans.
                    let attributeValue = valDoubleQuote || valSingleQuote || valNoQuote || (booleanAttributes[attrName] ? attrName : "");

                    collectedAttributes.push({
                        name: attrName,
                        value: attributeValue,
                        // Prepare an XML-safe escaped value for output.
                        xmlEscapedValue: attributeValue.replace(/(^|[^\\])"/g, '$1\\\"')
                    });
                });

                eventHandlers.start(normalizedTagName, collectedAttributes, isUnary);
            }
        }

        function handleClosingTag(fullMatch, specificTagName) {
            let stackIndex = 0; // Default to closing all if no specific tag given.

            if (specificTagName) {
                // Search for the specified tag from the top of the stack downwards.
                for (let i = elementStack.length - 1; i >= 0; i--) {
                    if (elementStack[i] === specificTagName) {
                        stackIndex = i;
                        break;
                    }
                }
            }

            // If a matching tag was found (or if we're clearing the stack).
            if (stackIndex >= 0) {
                // Trigger 'end' events for all elements being closed.
                for (let i = elementStack.length - 1; i >= stackIndex; i--) {
                    if (eventHandlers.end) {
                        eventHandlers.end(elementStack[i]);
                    }
                }
                // Truncate the element stack to reflect the closed tags.
                elementStack.length = stackIndex;
            }
        }
    };

    // Function to transform HTML markup into an XML string.
    this.MarkupToXMLString = function (htmlSource) {
        let xmlOutput = "";

        this.MarkupProcessor(htmlSource, {
            start: function (tagIdentifier, attributeList, isSelfClosing) {
                xmlOutput += "<" + tagIdentifier;
                for (let i = 0; i < attributeList.length; i++) {
                    xmlOutput += " " + attributeList[i].name + '="' + attributeList[i].xmlEscapedValue + '"';
                }
                xmlOutput += isSelfClosing ? "/>" : ">"; // Use self-closing XML syntax for unary tags.
            },
            end: function (tagIdentifier) {
                xmlOutput += "</" + tagIdentifier + ">";
            },
            chars: function (textContent) {
                xmlOutput += textContent;
            },
            comment: function (commentText) {
                xmlOutput += "<!--" + commentText + "-->";
            }
        });

        return xmlOutput;
    };

    // Function to convert HTML markup into a living DOM Document object.
    this.MarkupToDOMDocument = function (htmlSource, targetDocument) {
        // Elements that are expected to be unique within an HTML document.
        const singletonElements = buildLookupTable("html,head,body,title");

        // Rules for placing certain elements within a specific parent (e.g., <link> in <head>).
        const structuralPlacement = {
            link: "head",
            base: "head"
        };

        let workingDocument = targetDocument;

        // If no document is provided, attempt to create a new one.
        if (!workingDocument) {
            if (typeof document !== "undefined" && document.implementation && document.implementation.createDocument) {
                workingDocument = document.implementation.createDocument("", "", null);
            } else if (typeof DOMDocument !== "undefined") {
                workingDocument = new DOMDocument();
            } else if (typeof ActiveXObject !== "undefined") {
                workingDocument = new ActiveXObject("Msxml.DOMDocument");
            } else {
                throw new Error("Failed to initialize a DOM Document; no suitable environment found.");
            }
        } else {
            // Ensure we're working with the actual document object, not a node.
            workingDocument = workingDocument.ownerDocument ||
                (workingDocument.getOwnerDocument && workingDocument.getOwnerDocument()) ||
                workingDocument;
        }

        let elementPath = []; // Stack to maintain the current hierarchy of DOM nodes.
        let documentRoot = workingDocument.documentElement ||
            (workingDocument.getDocumentElement && workingDocument.getDocumentElement());

        // If the document is initially empty, construct a basic HTML skeleton.
        if (!documentRoot && workingDocument.createElement) {
            const newHtmlElement = workingDocument.createElement("html");
            const newHeadElement = workingDocument.createElement("head");
            newHeadElement.appendChild(workingDocument.createElement("title"));
            newHtmlElement.appendChild(newHeadElement);
            newHtmlElement.appendChild(workingDocument.createElement("body"));
            workingDocument.appendChild(newHtmlElement);
            documentRoot = newHtmlElement; // Update documentRoot reference.
        }

        // Pre-fill references to singleton elements from the document.
        if (workingDocument.getElementsByTagName) {
            for (let tagKey in singletonElements) {
                if (singletonElements.hasOwnProperty(tagKey)) {
                    singletonElements[tagKey] = workingDocument.getElementsByTagName(tagKey)[0];
                }
            }
        }

        // Set the initial parent node for appending elements.
        let currentDomParent = singletonElements.body || documentRoot;

        this.MarkupProcessor(htmlSource, {
            start: function (tagIdentifier, attributeList, isSelfClosing) {
                // If the tag is a known singleton, simply update the current parent node.
                if (singletonElements[tagIdentifier]) {
                    currentDomParent = singletonElements[tagIdentifier];
                    if (!isSelfClosing) {
                        elementPath.push(currentDomParent);
                    }
                    return;
                }

                const newElement = workingDocument.createElement(tagIdentifier);

                // Apply all parsed attributes to the newly created element.
                for (let i = 0; i < attributeList.length; i++) {
                    newElement.setAttribute(attributeList[i].name, attributeList[i].value);
                }

                // Append the new element according to structural rules or the current parent.
                if (structuralPlacement[tagIdentifier] && singletonElements[structuralPlacement[tagIdentifier]] && typeof singletonElements[structuralPlacement[tagIdentifier]] !== "boolean") {
                    singletonElements[structuralPlacement[tagIdentifier]].appendChild(newElement);
                } else if (currentDomParent && currentDomParent.appendChild) {
                    currentDomParent.appendChild(newElement);
                } else {
                    // No suitable parent found; element might be dropped or logged.
                    // console.warn(`Element <${tagIdentifier}> could not be appended to any parent.`);
                }

                // If not self-closing, add to the path and set as the new current parent.
                if (!isSelfClosing) {
                    elementPath.push(newElement);
                    currentDomParent = newElement;
                }
            },
            end: function (tagIdentifier) {
                if (elementPath.length > 0) { // Ensure the stack is not empty before popping.
                    elementPath.pop(); // Remove the last element from the path.
                    // Update current parent, falling back to the document root if the path becomes empty.
                    currentDomParent = elementPath[elementPath.length - 1] || documentRoot;
                }
            },
            chars: function (textContent) {
                // Append text content as a text node to the current parent, if content is not empty.
                if (currentDomParent && currentDomParent.appendChild && textContent.trim().length > 0) {
                    currentDomParent.appendChild(workingDocument.createTextNode(textContent));
                }
            },
            comment: function (commentText) {
                // The original implementation did nothing with comment nodes in DOM mode.
                // To include comments in the DOM, uncomment the line below:
                // if (currentDomParent && currentDomParent.appendChild) {
                //     currentDomParent.appendChild(workingDocument.createComment(commentText));
                // }
            }
        });

        return workingDocument;
    };

})();