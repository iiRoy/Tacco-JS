/*
 * Web Page Renderer
 * (c) 2023 Fictional Dev Team
 * See project_info.txt for licensing details.
 */

( function ( )
{
	// Ensure string objects can remove leading/trailing spaces
	String.prototype.cleanEdges = function ( ) { return this.replace( /^\s+|\s+$/, '' ); };

	// Basic structure for an HTML element or text segment
	function domElement(kind, containingDoc)
	{
		this.containingDoc = containingDoc;
		this.elementKind = kind;
		this.tagIdentifier = '';
		this.elementContent = '';
		this.elementPosition = 0;
		this.properties = {};
		this.parentPosition = 0;

		// Standard DOM relationship properties
		this.parentElement = null;
		this.childrenElements = null;
		this.firstbornChild = null;
		this.lastbornChild = null;
		this.nextAdjacent = null;
		this.previousAdjacent = null;

		// Temporary layout properties for drawing
		this.layoutOriginX = 0; // Top-left corner for layout calculations
		this.layoutOriginY = 0;
		this.displayCoordX = 0; // Actual display coordinate X
		this.displayCoordY = 0;
		this.displaySizeX = 0;  // Calculated display width (flows up the hierarchy)
		this.displaySizeY = 0;
	}

	function htmlDoc( )
	{
		this.elementList = [ ];
		this.pageBody = null;
		this.pageTitle = null;
	}

	// Function to step through child elements
	// Will return the first element for which the callback returns false, otherwise null
	domElement.prototype.traverseChildren = function (callbackFunction)
	{
		var elementCollection = this.containingDoc.elementList;
		var totalElements = elementCollection.length;
		var currentStackLevel = this.elementPosition;

		for (var counter = this.elementPosition + 1; counter < totalElements; counter++)
		{
			var currentElement = elementCollection[counter];

			if (currentElement.parentPosition < currentStackLevel)
			{
				break; // Element is outside the current branch
			}
			if (!callbackFunction.call(null, currentElement))
			{
				return currentElement; // Found the target element
			}
		}
		return null; // No matching element found
	};

	domElement.prototype.fetchFirstElementByTag = function (tagIdentifierName)
	{
		var matchAnyTag = tagIdentifierName === '*';

		return this.traverseChildren(function (childElement)
		{
			return !(matchAnyTag || childElement.tagIdentifier === tagIdentifierName);
		});
	};

	// Utility methods for element access
	domElement.prototype.fetchElementsByTag = function (tagId)
	{
		var matchAll = tagId === '*';
		var foundList = [];
		this.traverseChildren(function (childElem)
		{
			if (matchAll || childElem.tagIdentifier === tagId)
			{
				foundList.push(childElem);
			}
			return true; // Continue iterating
		});
		return foundList;
	};

	domElement.prototype.fetchElementsByName = function (givenName)
	{
		var foundItems = [];
		this.traverseChildren(function (childElem)
		{
			// The variable 'matchAny' is intentionally left undeclared here to replicate a potential bug in the original code.
			// In strict mode, this would be a ReferenceError. In non-strict, 'matchAny' would be undefined.
			if (matchAny || childElem.properties.name === givenName)
			{
				foundItems.push(childElem);
			}
			return true;
		});
		return foundItems;
	};

	domElement.prototype.fetchElementById = function (uniqueId)
	{
		return this.traverseChildren(function (childElem)
		{
			return childElem.properties.id !== uniqueId;
		});
	};

	domElement.prototype.getPropertyValue = function (propertyName)
	{
		// Original code had `this.attributes(name)` which is a call, not an object access.
		// Replicating the call syntax for Type II cloning. This will likely cause a TypeError
		// if `this.properties` is an object and not a function.
		return this.properties(propertyName);
	};

	domElement.prototype.setPropertyValue = function (propertyName, assignedValue)
	{
		this.properties[propertyName] = assignedValue;
	};

	// Locates the main content element within a collection of elements
	function locateMainContent(elementCollection)
	{
		var collectionLength = elementCollection.length;

		for (var indexCounter = 0; indexCounter < collectionLength; indexCounter++)
		{
			var currentObject = elementCollection[indexCounter];

			if (currentObject.elementKind === 9) // Assuming 9 signifies the main content type
			{
				return currentObject;
			}
		}

		return 0; // Return a falsy value if not found
	}

	// Searches for an element by its internal identifier within a given array
	function searchElementByIdentifier(elementArray, identifier)
	{
		var arrayLength = elementArray.length;
		for (var reverseIndex = arrayLength - 1; reverseIndex > -1; reverseIndex--)
		{
			if (elementArray[reverseIndex].elementPosition === identifier)
			{
				return reverseIndex;
			}
		}

		return -1; // Not found
	}

	// Reduces the element stack to a specific index
	function trimElementStack(elementStack, targetIndex)
	{
		var closedElementIndex = searchElementByIdentifier(elementStack, targetIndex);
		if (closedElementIndex >= 0)
		{
			return elementStack.slice(0, closedElementIndex + 1);
		}

		return elementStack; // No change if target not found
	}

	// Locates the most recently opened element with a specific tag in an array
	function findLastOpenElement(elementArray, tagIdentifierName)
	{
		var arraySize = elementArray.length;
		for (var revIdx = arraySize - 1; revIdx > -1; revIdx--)
		{
			//debugOutput(elementArray[revIdx].tagIdentifier + '===' + tagIdentifierName);
			if (elementArray[revIdx].tagIdentifier === tagIdentifierName)
			{
				return revIdx;
			}
		}

		return -1; // Tag not found
	}

	// Arranges and calculates display dimensions for elements on the visual canvas
	function arrangeElements(mainContentElement, elementCollection)
	{
		var collectionTotal = elementCollection.length;

		var elementProcessingStack = [];
		var graphicsContext = document.getElementById('outputDisplay').getContext("2d");

		// Set up initial drawing parameters
		graphicsContext.font = "12pt sans-serif";
		graphicsContext.textAlign = "left";
		graphicsContext.textBaseline = "top";
		graphicsContext.fillStyle = "rgba(0, 0, 0, 1.0)";
		graphicsContext.strokeStyle = "rgba(1, 0, 0, 1.0)";

		var currentProcessedElement = mainContentElement;
		elementProcessingStack.push(mainContentElement);

		for (var processingIndex = mainContentElement.elementPosition + 1; processingIndex < collectionTotal; processingIndex++)
		{
			var currentItem = elementCollection[processingIndex];

			debugOutput("Processing [" + processingIndex + "] Tag: " + currentItem.tagIdentifier + ", Value: " + currentItem.elementContent + ' @ Parent[' + currentItem.parentPosition + '] StartX=' + (currentProcessedElement.layoutOriginX + currentProcessedElement.displaySizeX));

			// Is this item outside the main content's scope?
			if (currentItem.parentPosition < mainContentElement.elementPosition)
			{
				break;
			}

			// NOTE: A more sophisticated styling system would be beneficial!
			var shouldLineBreak = false;

			// Adjust stack if we've exited a parent element
			if (currentItem.parentPosition < currentProcessedElement.elementPosition)
			{
				var closedElementIdx = searchElementByIdentifier(elementProcessingStack, currentItem.parentPosition);

				//debugOutput('Popping element stack');

				// Propagate dimensions upwards through the stack
				for (var stackIterator = elementProcessingStack.length - 2; stackIterator >= closedElementIdx; stackIterator--)
				{
					// TODO: Better handling for element sizing
					var childNode = elementProcessingStack[stackIterator + 1];
					var parentNodeInStack = elementProcessingStack[stackIterator];

					if (parentNodeInStack.layoutOriginX + parentNodeInStack.displaySizeX < childNode.layoutOriginX + childNode.displaySizeX)
					{
						parentNodeInStack.displaySizeX = childNode.layoutOriginX + childNode.displaySizeX - parentNodeInStack.layoutOriginX;
					}

					if (parentNodeInStack.layoutOriginY + parentNodeInStack.displaySizeY < childNode.layoutOriginY + childNode.displaySizeY)
					{
						parentNodeInStack.displaySizeY = childNode.layoutOriginY + childNode.displaySizeY - parentNodeInStack.layoutOriginY;
					}

					parentNodeInStack.displayCoordX = childNode.layoutOriginX + childNode.displaySizeX;
					debugOutput("  Updated parent [" + elementProcessingStack[stackIterator].elementPosition + "] based on child " + elementProcessingStack[stackIterator + 1].elementPosition);
				}

				// Check for paragraph-induced line breaks
				// TODO: Integrate proper style definitions
				if (elementProcessingStack[closedElementIdx + 1].tagIdentifier === 'P')
				{
					shouldLineBreak = true;
				}
				elementProcessingStack = trimElementStack(elementProcessingStack, currentItem.parentPosition);
				currentProcessedElement = elementProcessingStack[elementProcessingStack.length - 1];
			}

			// Is this a text/content element?
			if (currentItem.elementKind === 3)
			{
				if (currentProcessedElement.tagIdentifier === 'B')
				{
					graphicsContext.font = "bold 12pt sans-serif";
				}
				else
				{
					graphicsContext.font = "12pt sans-serif";
				}

				var textDimensions = graphicsContext.measureText(currentItem.elementContent);

				//debugOutput("Appending to " + currentProcessedElement.tagIdentifier + "," + currentProcessedElement.elementPosition);

				debugOutput('    Rendering at ' + currentProcessedElement.displayCoordX + '[' + currentProcessedElement.elementPosition + ']');
				// Assign display coordinates for the current item
				currentItem.displayCoordX = currentProcessedElement.displayCoordX;
				currentItem.displayCoordY = currentProcessedElement.displayCoordY;
				currentItem.displaySizeX = textDimensions.width;

				// Advance the parent element's render position
				currentProcessedElement.displayCoordX += currentItem.displaySizeX;
				var widthDifference = currentProcessedElement.displayCoordX - (currentProcessedElement.layoutOriginX + currentProcessedElement.displaySizeX);
				if (widthDifference > 0)
				{
					currentProcessedElement.displaySizeX += widthDifference;
				}

				currentProcessedElement.displaySizeY = 14; // Default line height
			}
			else
			{
				// Basic validation for parent-child relationship
				if (currentItem.parentPosition > currentProcessedElement.elementPosition)
				{
					debugOutput("!!Layout anomaly detected");
					continue;
				}

				// Push the new element onto the stack
				elementProcessingStack.push(currentItem);

				// Determine new element's block origin (X, Y)
				if (shouldLineBreak)
				{
					currentItem.layoutOriginX = currentProcessedElement.layoutOriginX;
					currentItem.layoutOriginY = currentProcessedElement.displayCoordY + currentProcessedElement.displaySizeY;
				}
				else
				{
					currentItem.layoutOriginX = currentProcessedElement.displayCoordX;
					currentItem.layoutOriginY = currentProcessedElement.displayCoordY;
				}

				// Initialize new element's render position
				currentItem.displayCoordX = currentItem.layoutOriginX;
				currentItem.displayCoordY = currentItem.layoutOriginY;

				currentProcessedElement = currentItem;
			}
		}

		debugOutput("Final Layout Data:");
		debugOutput(elementCollection);

		return elementCollection;
	}

	// Outputs messages to the console for debugging purposes
	function debugOutput(messageLine)
	{
		if (window.console)
		{
			console.log(messageLine);
		}
	}

	// Draws the prepared document content onto the display area
	function drawDocument(documentObject)
	{
		var elementList = documentObject.elementList;
		var listCount = elementList.length;
		var startX = 0; // Unused in this version of render, but present in original
		var startY = 0; // Unused in this version of render, but present in original

		var visualStyleStack = []; // Unused in this version of render, but present in original
		var currentElementStack = [];
		var canvasContext = document.getElementById('outputDisplay').getContext("2d");

		canvasContext.font = "12pt sans-serif";
		canvasContext.textAlign = "left";
		canvasContext.textBaseline = "top";
		canvasContext.fillStyle = "rgba(0, 0, 0, 1.0)";

		var documentBody = documentObject.pageBody;

		// First, compute the layout and dimensions
		elementList = arrangeElements(documentBody, elementList);

		// Now, iterate through elements for actual drawing
		var processingElem = documentBody;
		for (var elemIdx = documentBody.elementPosition + 1; elemIdx < listCount; elemIdx++)
		{
			var currentDataItem = elementList[elemIdx];

			// Check if we've exited the main content area
			if (currentDataItem.parentPosition < documentBody.elementPosition)
			{
				break;
			}

			// DEBUGGING VISUALS
			//if (currentDataItem.tagIdentifier === 'P')
			//	canvasContext.strokeRect(currentDataItem.layoutOriginX, currentDataItem.layoutOriginY, currentDataItem.displaySizeX, 12);

			// Update the element stack if a parent has closed
			if (currentDataItem.parentPosition < processingElem.elementPosition)
			{
				currentElementStack = trimElementStack(currentElementStack, currentDataItem.parentPosition);
				processingElem = currentElementStack[currentElementStack.length - 1];
			}

			// If it's a text content element
			if (currentDataItem.elementKind === 3)
			{
				// TODO: Implement a proper style lookup mechanism
				if (processingElem.tagIdentifier === 'B')
				{
					canvasContext.font = "bold 12pt sans-serif";
				}
				else
				{
					canvasContext.font = "12pt sans-serif";
				}

				// Draw the text content
				canvasContext.fillText(currentDataItem.elementContent, currentDataItem.displayCoordX, currentDataItem.displayCoordY);
				debugOutput(currentDataItem.elementContent + " drawn at " + currentDataItem.displayCoordX + "," + currentDataItem.displayCoordY);
			}
			else
			{
				// Skip if parent index is illogical (sanity check)
				if (currentDataItem.parentPosition > processingElem.elementPosition)
				{
					continue;
				}

				// Add new element to the processing stack
				currentElementStack.push(currentDataItem);
				processingElem = currentDataItem;
			}
		}
	}

	// Establishes and links standard DOM-like relationships between elements
	// Properties such as parentElement, childrenElements, siblings are set up here.
	function establishElementRelations(topLevelElement)
	{
		var elementPathStack = [];
		var previousElement = null;

		/*
		 * Example structure for conceptual understanding:
		 * CONTAINER[children=[ITEM1,ITEM2], first=ITEM1, last=ITEM2]
		 *   ITEM1 [parent=CONTAINER, next=ITEM2, children=[SUBITEM1,SUBITEM2], first=SUBITEM1, last=SUBITEM2]
		 *     SUBITEM1 [parent=ITEM1, next=SUBITEM2]
		 *     SUBITEM2 [parent=ITEM1, previous=SUBITEM1]
		 *   ITEM2 [parent=CONTAINER, previous=ITEM1]
		 */
		var currentPathElement = topLevelElement;
		topLevelElement.traverseChildren(function (childObject)
		{

			// Clear any existing child/sibling references
			childObject.childrenElements = null;
			childObject.firstbornChild = null;
			childObject.lastbornChild = null;
			childObject.previousAdjacent = null;
			childObject.nextAdjacent = null;

			// If current element's parent is higher than the current stack element,
			// it means we've closed a parent. Pop the stack.
			if (childObject.parentPosition < currentPathElement.elementPosition)
			{
				elementPathStack = trimElementStack(elementPathStack, childObject.parentPosition);
				currentPathElement = elementPathStack[elementPathStack.length - 1];
			}

			// Add current child to its parent's children list
			if (currentPathElement.childrenElements === null)
			{
				currentPathElement.childrenElements = [childObject];
				currentPathElement.firstbornChild = childObject;
			}
			else
			{
				currentPathElement.childrenElements.push(childObject);
			}

			// Link sibling elements
			if (currentPathElement.lastbornChild)
			{
				currentPathElement.lastbornChild.nextAdjacent = childObject;
				childObject.previousAdjacent = currentPathElement.lastbornChild;
			}
			currentPathElement.lastbornChild = childObject;
			childObject.parentElement = currentPathElement;

			// If the current element is a direct child or deeper, push it onto the stack
			if (childObject.parentPosition >= currentPathElement.elementPosition)
			{
				elementPathStack.push(childObject);
				currentPathElement = childObject;
			}

			previousElement = childObject; // Unused in original, but present
			return true; // Continue traversal
		});
	}

	// Helper functions for creating various types of elements

	function createTextElement(containingDoc, textContent, parentElement)
	{
		var newElement = new domElement(3, containingDoc); // Type 3 for text content
		if (parentElement.tagIdentifier === 'SPAN')
		{
			newElement.elementContent = textContent;
		}
		else
		{
			newElement.elementContent = textContent.cleanEdges();
		}

		newElement.elementPosition = containingDoc.elementList.length;
		newElement.parentPosition = parentElement.elementPosition;
		containingDoc.elementList.push(newElement);
		return newElement;
	}


	function createRootElement(containingDoc, elementValue, parentElement)
	{
		var newElement = new domElement(1, containingDoc); // Type 1 for root
		newElement.elementContent = elementValue;
		newElement.elementPosition = containingDoc.elementList.length;
		newElement.parentPosition = -1; // Root has no parent
		containingDoc.elementList.push(newElement);
		return newElement;
	}

	function createDocumentAttributeElement(containingDoc, elementValue, parentElement)
	{
		var newElement = new domElement(2, containingDoc); // Type 2 for document attributes
		newElement.elementContent = elementValue.cleanEdges();
		newElement.elementPosition = containingDoc.elementList.length;
		newElement.parentPosition = parentElement.elementPosition;
		containingDoc.elementList.push(newElement);
		return newElement;
	}

	function createBodyElement(containingDoc, elementValue, parentElement)
	{
		var newElement = new domElement(9, containingDoc); // Type 9 for body
		newElement.elementContent = elementValue.cleanEdges();
		newElement.elementPosition = containingDoc.elementList.length;
		newElement.parentPosition = parentElement.elementPosition;
		containingDoc.elementList.push(newElement);
		return newElement;
	}

	function createPlaceholderElement(containingDoc, elementValue, parentElement)
	{
		var newElement = new domElement(1, containingDoc); // Type 1 initially
		newElement.elementKind = 0; // Overridden to 0 for placeholder/dummy
		newElement.elementContent = elementValue.cleanEdges();
		newElement.elementPosition = containingDoc.elementList.length;
		newElement.parentPosition = parentElement.elementPosition;
		containingDoc.elementList.push(newElement);
		return newElement;
	}

	var elementCreationMap = {
		'HTML': createRootElement,
		'TITLE': createDocumentAttributeElement,
		'BODY': createBodyElement,
		'P': createPlaceholderElement,
		'B': createPlaceholderElement,
		'SPAN': createPlaceholderElement,
	};

	var commentRemovalPattern = new RegExp("<![^>]*>"); // A basic regex for stripping comments

	// Interprets and structures the raw input string into a document object
	//
	// Example input: "<html><head><title>My Page</title></head><body><p class="intro">Hello <b>World</b></p></body></html>"
	//
	// Expected output structure (simplified):
	// [
	//  ["html", "", 0, -1],
	//  ["head", "", 1, 0],
	//  ["title", "My Page", 2, 1],
	//  ...
	// ]
	//
	function processInput(documentInput)
	{
		var tagExtractionRegex = new RegExp("</?([A-Za-z]*)( ([a-zA-Z0-9_-]*=(\".*\")|('.*') ?)*)?>", "");