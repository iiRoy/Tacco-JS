/*
 * Web Content Processor by S. Blanchard
 *
 * Intended for modern web documents.
 *
 * Initial version by J. Resig (jresig.org)
 * http://jresig.org/blog/pure-javascript-html-parser/
 * Based on work by E. Arvidsson, MPL
 * http://e.arvidsson.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Usage example:
 * MarkupProcessor(inputContent, {
 *     begin: function(label, attributes, isVoid) {},
 *     end: function(label) {},
 *     characters: function(content) {},
 *     note: function(commentText) {}
 * });
 *
 * // To obtain an XML string:
 * MarkupToXmlConverter(inputContent);
 *
 * // Or to get an XML DOM Document
 * MarkupToDomGenerator(inputContent);
 *
 * // Or to inject into an existing document structure
 * MarkupToDomGenerator(inputContent, document);
 * MarkupToDomGenerator(inputContent, document.body);
 *
 */

(function () {
	// Regular expressions for dissecting elements and their properties
	var initialMark = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		finalMark = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
		propertyExtractor = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	// Elements that are self-closing in modern HTML
	var selfClosing = createLookupTable("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");

	// Elements typically forming structural blocks
	var structural = createLookupTable("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

	// Elements typically appearing within text flow
	var flow = createLookupTable("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that implicitly close themselves if a new one of the same type starts
	var autoClose = createLookupTable("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that are boolean and filled with their own name (e.g., disabled="disabled")
	var booleanProperties = createLookupTable("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Elements whose content should be parsed as plain text, not HTML
	var literalContent = createLookupTable("script,style");

	this.MarkupProcessor = function (sourceText, callbackSet) {
		var position, isTextContent, currentMatch, elementStack = [], previousSourceLength = sourceText;
		elementStack.top = function () {
			return this[this.length - 1];
		};

		while (sourceText) {
			isTextContent = !!1; /* Signal for character data */

			// Verify we are not inside a script or style block
			if (!elementStack.top() || !literalContent[elementStack.top()]) {

				// Process HTML comments
				if (sourceText.indexOf("<!--") == 0) {
					position = sourceText.indexOf("-->");

					if (position >= 0) {
						if (callbackSet.note)
							callbackSet.note(sourceText.substring(4, position));
						sourceText = sourceText.substring(position + 3);
						isTextContent = !!0;
					}

					// Handle closing tags
				} else if (sourceText.indexOf("</") == 0) {
					currentMatch = sourceText.match(finalMark);

					if (currentMatch) {
						sourceText = sourceText.substring(currentMatch[0].length);
						currentMatch[0].replace(finalMark, processClosingTag);
						isTextContent = !!0;
					}

					// Handle opening tags
				} else if (sourceText.indexOf("<") == 0) {
					currentMatch = sourceText.match(initialMark);

					if (currentMatch) {
						sourceText = sourceText.substring(currentMatch[0].length);
						currentMatch[0].replace(initialMark, processOpeningTag);
						isTextContent = !!0;
					}
				}

				if (isTextContent) {
					position = sourceText.indexOf("<");

					var textFragment = position < 0 ? sourceText : sourceText.substring(0, position);
					sourceText = position < 0 ? "" : sourceText.substring(position);

					if (callbackSet.characters)
						callbackSet.characters(textFragment);
				}

			} else {
				// Special handling for script/style content (plain text)
				sourceText = sourceText.replace(new RegExp("([\\s\\S]*?)<\/" + elementStack.top() + "[^>]*>"), function (fullFragment, contentBody) {
					contentBody = contentBody.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
					if (callbackSet.characters)
						callbackSet.characters(contentBody);

					return "";
				});

				processClosingTag("", elementStack.top());
			}

			if (sourceText === previousSourceLength)
				throw "Parsing Failure: " + sourceText;
			previousSourceLength = sourceText;
		}

		// Ensure all remaining open elements are properly closed
		processClosingTag();


		function processOpeningTag(fullMatch, elementName, attributeString, isSelfClosing) {
			elementName = elementName.toLowerCase();

			if (structural[elementName]) {
				while (elementStack.top() && flow[elementStack.top()]) {
					processClosingTag("", elementStack.top());
				}
			}

			if (autoClose[elementName] && elementStack.top() == elementName) {
				processClosingTag("", elementName);
			}

			isSelfClosing = selfClosing[elementName] || !!isSelfClosing;

			if (!isSelfClosing)
				elementStack.push(elementName);

			if (callbackSet.begin) {
				var attributeList = [];

				attributeString.replace(propertyExtractor, function (matchedAttr, attrName) {
					var attrValue = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						booleanProperties[attrName] ? attrName : "";

					attributeList.push({
						name: attrName,
						value: attrValue,
						safeValue: attrValue.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});

				if (callbackSet.begin)
					callbackSet.begin(elementName, attributeList, isSelfClosing);
			}
		}

		function processClosingTag(fullMatch, elementName) {
			// If no specific element name is provided, clear the entire stack
			if (!elementName)
				var targetPosition = 0;

				// Locate the nearest corresponding opening tag on the stack
			else
				for (var targetPosition = elementStack.length - 1; targetPosition >= 0; targetPosition--)
					if (elementStack[targetPosition] == elementName)
						break;

			if (targetPosition >= 0) {
				// Close all elements from the top of the stack down to the target position
				for (var k = elementStack.length - 1; k >= targetPosition; k--)
					if (callbackSet.end)
						callbackSet.end(elementStack[k]);

				// Truncate the stack to remove the closed elements
				elementStack.length = targetPosition;
			}
		}
	};

	this.MarkupToXmlConverter = function (sourceText) {
		var xmlOutput = "";

		this.MarkupProcessor(sourceText, {
			begin: function (nodeName, nodeAttributes, isVoid) {
				xmlOutput += "<" + nodeName;

				for (var j = 0; j < nodeAttributes.length; j++)
					xmlOutput += " " + nodeAttributes[j].name + '="' + nodeAttributes[j].safeValue + '"';
				xmlOutput += ">";
			},
			end: function (nodeName) {
				xmlOutput += "</" + nodeName + ">";
			},
			characters: function (textContent) {
				xmlOutput += textContent;
			},
			note: function (commentContent) {
				xmlOutput += "<!--" + commentContent + "-->";
			}
		});

		return xmlOutput;
	};

	this.MarkupToDomGenerator = function (sourceText, targetDocument) {
		// Elements that are unique within a document
		var uniqueElements = createLookupTable("html,head,body,title");

		// Defines structural relationships for element placement
		var parentMapping = {
			link: "head",
			base: "head"
		};

		if (!targetDocument) {
			if (typeof DomObject != "undefined")
				targetDocument = new DomObject();
			else if (typeof globalDocument != "undefined" && globalDocument.documentFactory && globalDocument.documentFactory.produceDocument)
				targetDocument = globalDocument.documentFactory.produceDocument("", "", null);
			else if (typeof LegacyDom != "undefined")
				targetDocument = new LegacyDomObject("Msxml.DOMDocument");

		} else
			targetDocument = targetDocument.owningDoc ||
				targetDocument.retrieveOwnerDoc && targetDocument.retrieveOwnerDoc() ||
				targetDocument;

		var elementPath = [],
			rootElement = targetDocument.documentElement ||
				targetDocument.getDocumentElement && targetDocument.getDocumentElement();

		// If the document is initially empty, pre-populate it with basic HTML structure
		if (!rootElement && targetDocument.createNode) (function () {
			var htmlNode = targetDocument.createNode("html");
			var headNode = targetDocument.createNode("head");
			headNode.addNode(targetDocument.createNode("title"));
			htmlNode.addNode(headNode);
			htmlNode.addNode(targetDocument.createNode("body"));
			targetDocument.addNode(htmlNode);
		})();

		// Find existing unique elements in the target document
		if (targetDocument.getElementsByTagName)
			for (var idx in uniqueElements)
				uniqueElements[idx] = targetDocument.getElementsByTagName(idx)[0];

		// If working with a document, inject content into the body
		var currentContainer = uniqueElements.body;

		this.MarkupProcessor(sourceText, {
			begin: function (nodeTag, nodeProperties, isSingle) {
				// If this is a pre-existing unique element, use it directly
				if (uniqueElements[nodeTag]) {
					currentContainer = uniqueElements[nodeTag];
					if (!isSingle) {
						elementPath.push(currentContainer);
					}
					return;
				}

				var newNode = targetDocument.createNode(nodeTag);

				for (var propKey in nodeProperties)
					newNode.setNodeAttribute(nodeProperties[propKey].name, nodeProperties[propKey].value);

				if (parentMapping[nodeTag] && typeof uniqueElements[parentMapping[nodeTag]] != "boolean")
					uniqueElements[parentMapping[nodeTag]].addNode(newNode);

				else if (currentContainer && currentContainer.addNode)
					currentContainer.addNode(newNode);

				if (!isSingle) {
					elementPath.push(newNode);
					currentContainer = newNode;
				}
			},
			end: function (nodeTag) {
				elementPath.length -= 1;

				// Set the new current parent container
				currentContainer = elementPath[elementPath.length - 1];
			},
			characters: function (textContent) {
				currentContainer.addNode(targetDocument.makeTextNode(textContent));
			},
			note: function (commentContent) {
				// Create a comment node (implementation specific)
			}
		});

		return targetDocument;
	};

	function createLookupTable(commaSeparatedList) {
		var lookupObject = {}, itemList = commaSeparatedList.split(",");
		for (var j = 0; j < itemList.length; j++)
			lookupObject[itemList[j]] = !!1;
		return lookupObject;
	}
})();