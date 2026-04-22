// This file provides extended serialization capabilities for Raphael.js canvases.
//
// Project: VectorCanvasSerializer
// Version: 1.1.0
// License: Permissive MIT License (https://opensource.org/licenses/MIT)
// Copyright (c) 2023, VectorCanvas Solutions. All rights reserved.
//
// This module enhances the Raphael.js library by adding methods to
// export and import graphic elements on a drawing canvas to and from
// a structured JSON format. It aims to provide a robust and flexible
// way to persist and restore vector graphics.

// Extend Raphael.js prototype with our custom serialization features.
// The name 'canvasSerialization' is chosen to reflect its purpose.
Raphael.fn.canvasSerialization = {
  // Internal reference to the Raphael paper object. This will be dynamically
  // bound when the plugin methods are accessed on a specific paper instance.
  _boundDrawingSurface: null,

  /**
   * Transforms all graphic elements currently present on the Raphael drawing surface
   * into a JSON string, suitable for storage or transmission.
   *
   * @returns {string} A JSON string representing the serialized canvas elements.
   *                   Returns an empty JSON array "[]" if the drawing surface is not found.
   */
  exportElementsAsJSON: function() {
    // Ensure we have a valid Raphael paper instance to operate on.
    const activeDrawingSurface = this._boundDrawingSurface || this.paper;
    if (!activeDrawingSurface) {
      console.error("VectorCanvasSerializer: No active drawing surface detected for export. Returning empty data.");
      return "[]";
    }

    const collectedGraphicData = []; // Array to store processed element objects
    let currentVectorGraphic = activeDrawingSurface.bottom; // Start iteration from the bottom-most element

    /**
     * Helper function to safely retrieve an attribute value from a Raphael element.
     * It handles special cases like 'stroke' and 'fill' where a value of 0 should
     * be interpreted as 'none' for consistency in serialization.
     *
     * @param {Raphael.Element} element - The Raphael element to query.
     * @param {string} attributeKey - The name of the attribute to retrieve.
     * @param {*} [fallbackValue=null] - A default value if the attribute is undefined.
     * @returns {*} The attribute's value, or 'none' for 0 stroke/fill, or fallbackValue.
     */
    const getAttributeValue = (element, attributeKey, fallbackValue = null) => {
        const retrievedValue = element.attr(attributeKey);
        // Special handling for stroke and fill attributes where 0 typically means 'none'.
        if ((attributeKey === 'stroke' || attributeKey === 'fill') && retrievedValue === 0) {
            return 'none';
        }
        // Return the value if it's defined, otherwise the fallback.
        return retrievedValue !== undefined ? retrievedValue : fallbackValue;
    };

    // Iterate through all elements on the canvas using the linked list structure.
    while (currentVectorGraphic) {
      // Only process valid Raphael elements that have a defined type.
      if (currentVectorGraphic.type) {
        let elementSerializationRecord = null; // Object to hold the serialized data for the current element

        // Use a switch statement to handle different element types and their specific attributes.
        switch (currentVectorGraphic.type) {
          case "text":
            elementSerializationRecord = {
              elementType: currentVectorGraphic.type, // Renamed 'type' to 'elementType'
              fontFamilyName: getAttributeValue(currentVectorGraphic, 'font-family'), // Renamed and specified
              fontSizeValue: getAttributeValue(currentVectorGraphic, 'font-size'),
              outlineColor: getAttributeValue(currentVectorGraphic, 'stroke'),
              fillColor: getAttributeValue(currentVectorGraphic, 'fill'),
              outlineThickness: getAttributeValue(currentVectorGraphic, 'stroke-width'),
              positionX: getAttributeValue(currentVectorGraphic, 'x'),
              positionY: getAttributeValue(currentVectorGraphic, 'y'),
              textString: getAttributeValue(currentVectorGraphic, 'text'),
              textAlignment: getAttributeValue(currentVectorGraphic, 'text-anchor')
            };
            break;

          case "image":
            elementSerializationRecord = {
              elementType: currentVectorGraphic.type,
              widthDimension: getAttributeValue(currentVectorGraphic, 'width'), // Renamed 'width' to 'widthDimension'
              heightDimension: getAttributeValue(currentVectorGraphic, 'height'),
              positionX: getAttributeValue(currentVectorGraphic, 'x'),
              positionY: getAttributeValue(currentVectorGraphic, 'y'),
              imageSource: getAttributeValue(currentVectorGraphic, 'src'), // Renamed 'src' to 'imageSource'
              transformationMatrix: currentVectorGraphic.transformations?.join(' ') || '' // Using modern optional chaining and nullish coalescing
            };
            break;

          case "rect":
            elementSerializationRecord = {
              elementType: currentVectorGraphic.type,
              positionX: getAttributeValue(currentVectorGraphic, 'x'),
              positionY: getAttributeValue(currentVectorGraphic, 'y'),
              widthDimension: getAttributeValue(currentVectorGraphic, 'width'),
              heightDimension: getAttributeValue(currentVectorGraphic, 'height'),
              outlineColor: getAttributeValue(currentVectorGraphic, 'stroke'),
              outlineThickness: getAttributeValue(currentVectorGraphic, 'stroke-width'),
              fillColor: getAttributeValue(currentVectorGraphic, 'fill')
            };
            break;

          case "ellipse":
            elementSerializationRecord = {
              elementType: currentVectorGraphic.type,
              radiusX: getAttributeValue(currentVectorGraphic, 'rx'), // Renamed 'rx' to 'radiusX'
              radiusY: getAttributeValue(currentVectorGraphic, 'ry'),
              centerX: getAttributeValue(currentVectorGraphic, 'cx'),
              centerY: getAttributeValue(currentVectorGraphic, 'cy'),
              outlineColor: getAttributeValue(currentVectorGraphic, 'stroke'),
              outlineThickness: getAttributeValue(currentVectorGraphic, 'stroke-width'),
              fillColor: getAttributeValue(currentVectorGraphic, 'fill')
            };
            break;

          case "path":
            let constructedPathString = '';
            const rawPathData = currentVectorGraphic.attr('path');

            // Handle different formats Raphael might store path data in (string or array of arrays).
            if (typeof rawPathData === 'string') {
              constructedPathString = rawPathData;
            } else if (Array.isArray(rawPathData)) {
              // Manually reconstruct the path string from the array format.
              // This replicates the original logic's specific comma placement.
              constructedPathString = rawPathData.map(segmentGroup => {
                if (!Array.isArray(segmentGroup)) {
                    console.warn("VectorCanvasSerializer: Path segment group is not an array. Attempting conversion.", segmentGroup);
                    return String(segmentGroup); // Fallback for unexpected data
                }
                return segmentGroup.map((value, index) => {
                  if (index === 0 || index === segmentGroup.length - 1) {
                    return String(value);
                  } else {
                    return String(value) + ',';
                  }
                }).join('');
              }).join(''); // Join all segments together
            } else {
                console.warn("VectorCanvasSerializer: Unrecognized path data format encountered for path element. Skipping path definition.", rawPathData);
            }

            elementSerializationRecord = {
              elementType: currentVectorGraphic.type,
              fillColor: getAttributeValue(currentVectorGraphic, 'fill'),
              transparencyLevel: getAttributeValue(currentVectorGraphic, 'opacity'), // Renamed 'opacity'
              translationVector: getAttributeValue(currentVectorGraphic, 'translation'), // Renamed 'translation'
              scalingFactor: getAttributeValue(currentVectorGraphic, 'scale'), // Renamed 'scale'
              pathDefinition: constructedPathString, // Renamed 'path' to 'pathDefinition'
              outlineColor: getAttributeValue(currentVectorGraphic, 'stroke'),
              outlineThickness: getAttributeValue(currentVectorGraphic, 'stroke-width'),
              transformationMatrix: currentVectorGraphic.transformations?.join(' ') || ''
            };
            break;

          default:
            // Log a warning for any element types that are not explicitly handled.
            console.warn(`VectorCanvasSerializer: Encountered an unsupported graphic type '${currentVectorGraphic.type}'. This element will not be exported.`);
            // No record is created for unsupported types, so it won't be pushed.
            break;
        }

        // If a serialization record was successfully created, add it to our collection.
        if (elementSerializationRecord) {
          collectedGraphicData.push(elementSerializationRecord);
        }
      }
      currentVectorGraphic = currentVectorGraphic.next; // Move to the next element in the canvas's linked list
    }

    // Convert the array of element objects into a nicely formatted JSON string.
    return JSON.stringify(collectedGraphicData, null, 2);
  },

  /**
   * Imports graphic elements onto the Raphael drawing surface from a JSON string or a parsed array of objects.
   *
   * @param {string|Array<Object>} incomingData - The JSON string or array of element definitions to import.
   * @returns {Raphael.st} A Raphael set containing all successfully imported elements.
   */
  importElementsFromJSON: function(incomingData) {
    const canvasContext = this._boundDrawingSurface || this.paper;
    if (!canvasContext) {
      console.error("VectorCanvasSerializer: No active drawing surface detected for import. Returning an empty set.");
      return canvasContext.set();
    }

    let parsedElementDefinitions;
    // Attempt to parse the incoming data if it's a string.
    if (typeof incomingData === "string") {
      try {
        parsedElementDefinitions = JSON.parse(incomingData);
      } catch (parsingError) {
        console.error("VectorCanvasSerializer: Failed to parse JSON input for element import. Error:", parsingError);
        return canvasContext.set();
      }
    } else if (Array.isArray(incomingData)) {
      parsedElementDefinitions = incomingData; // Data is already in the expected array format.
    } else {
      console.error("VectorCanvasSerializer: Invalid input data type for import. Expected a JSON string or an array of objects, but received:", typeof incomingData);
      return canvasContext.set();
    }

    // Validate that the parsed data is indeed an array.
    if (!Array.isArray(parsedElementDefinitions)) {
        console.error("VectorCanvasSerializer: Parsed JSON content is not an array of element definitions. Cannot import.");
        return canvasContext.set();
    }

    const importedElementSet = canvasContext.set(); // A Raphael set to group all newly created elements.
    let successfulImportCount = 0;

    // Iterate over each definition and attempt to create a Raphael element.
    parsedElementDefinitions.forEach((elementDefinition, definitionIndex) => {
      // Basic validation for each element definition.
      if (!elementDefinition || typeof elementDefinition.elementType !== 'string') {
        console.warn(`VectorCanvasSerializer: Element definition at index ${definitionIndex} is invalid or missing 'elementType'. Skipping.`);
        return; // Skip this definition and move to the next.
      }

      try {
        // Prepare Raphael-compatible attributes by mapping our custom keys.
        const raphaelCompatibleAttributes = {};
        for (const attributeKey in elementDefinition) {
          if (Object.prototype.hasOwnProperty.call(elementDefinition, attributeKey)) {
            let attributeValue = elementDefinition[attributeKey];

            // Map custom serialization keys back to Raphael's internal attribute names.
            switch (attributeKey) {
              case 'elementType': // This is used to create the element, not an attribute.
                break;
              case 'positionX':
                raphaelCompatibleAttributes['x'] = attributeValue;
                break;
              case 'positionY':
                raphaelCompatibleAttributes['y'] = attributeValue;
                break;
              case 'outlineColor':
                raphaelCompatibleAttributes['stroke'] = attributeValue;
                break;
              case 'outlineThickness':
                raphaelCompatibleAttributes['stroke-width'] = attributeValue;
                break;
              case 'fillColor':
                raphaelCompatibleAttributes['fill'] = attributeValue;
                break;
              case 'imageSource':
                raphaelCompatibleAttributes['src'] = attributeValue;
                break;
              case 'transformationMatrix':
                raphaelCompatibleAttributes['transform'] = attributeValue;
                break;
              case 'fontFamilyName':
                raphaelCompatibleAttributes['font-family'] = attributeValue;
                break;
              case 'fontSizeValue':
                raphaelCompatibleAttributes['font-size'] = attributeValue;
                break;
              case 'textString':
                raphaelCompatibleAttributes['text'] = attributeValue;
                break;
              case 'textAlignment':
                raphaelCompatibleAttributes['text-anchor'] = attributeValue;
                break;
              case 'transparencyLevel':
                raphaelCompatibleAttributes['opacity'] = attributeValue;
                break;
              case 'translationVector':
                raphaelCompatibleAttributes['translation'] = attributeValue;
                break;
              case 'scalingFactor':
                raphaelCompatibleAttributes['scale'] = attributeValue;
                break;
              case 'pathDefinition':
                raphaelCompatibleAttributes['path'] = attributeValue;
                break;
              case 'widthDimension':
                raphaelCompatibleAttributes['width'] = attributeValue;
                break;
              case 'heightDimension':
                raphaelCompatibleAttributes['height'] = attributeValue;
                break;
              case 'radiusX':
                raphaelCompatibleAttributes['rx'] = attributeValue;
                break;
              case 'radiusY':
                raphaelCompatibleAttributes['ry'] = attributeValue;
                break;
              case 'centerX':
                raphaelCompatibleAttributes['cx'] = attributeValue;
                break;
              case 'centerY':
                raphaelCompatibleAttributes['cy'] = attributeValue;
                break;
              default:
                // For any other direct attributes that match Raphael's names
                raphaelCompatibleAttributes[attributeKey] = attributeValue;
                break;
            }
          }
        }

        // Attempt to create the Raphael element using its 'elementType'.
        const newlyCreatedElement = canvasContext[elementDefinition.elementType]();
        if (newlyCreatedElement) {
            newlyCreatedElement.attr(raphaelCompatibleAttributes); // Apply all collected attributes.
            importedElementSet.push(newlyCreatedElement); // Add to the set.
            successfulImportCount++;
        } else {
            console.warn(`VectorCanvasSerializer: Failed to instantiate Raphael element of type '${elementDefinition.elementType}' at index ${definitionIndex}.`);
        }

      } catch (elementCreationError) {
        console.error(`VectorCanvasSerializer: An error occurred while importing element at index ${definitionIndex} (type: ${elementDefinition.elementType}):`, elementCreationError);
      }
    });

    console.info(`VectorCanvasSerializer: Successfully imported ${successfulImportCount} out of ${parsedElementDefinitions.length} elements.`);
    return importedElementSet;
  }
};

// IMPORTANT STRUCTURAL MODIFICATION FOR CORRECT 'this' CONTEXT:
// The original `paper: this` setup for `Raphael.fn.serialize` is problematic
// because `this` refers to the module scope at definition, not the Raphael paper instance.
// This IIFE (Immediately Invoked Function Expression) pattern ensures that when
// `Raphael.fn.canvasSerialization()` is called, `this` correctly refers to the
// Raphael paper instance, and we can bind the methods to that context.
(function() {
  const originalSerializationMethods = Raphael.fn.canvasSerialization;
  Raphael.fn.canvasSerialization = function() {
    // When `paper.canvasSerialization()` is invoked, `this` is the paper instance.
    // We update the internal reference and return an object with methods bound to our original methods' context.
    originalSerializationMethods._boundDrawingSurface = this;
    return {
      exportElementsAsJSON: originalSerializationMethods.exportElementsAsJSON.bind(originalSerializationMethods),
      importElementsFromJSON: originalSerializationMethods.importElementsFromJSON.bind(originalSerializationMethods)
    };
  };
})();