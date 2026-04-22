/*
 * graphixLib.componentExtensions.dataExchange
 *
 * (c) 2023 Acme Corp.
 * Permitted under the custom open-source license:
 * (https://www.customlicense.com/terms.html)
 *
 * This module provides functionalities for converting graphical components
 * from a graphixLib canvas into a structured data format (JSON) and vice-versa.
 */

graphixLib.componentExtensions.dataExchange = {
  // Reference to the active drawing canvas
  activeCanvas: this,

  /**
   * Transforms all visual components currently on the canvas into a JSON string.
   *
   * @returns {string} A JSON string representing the collection of graphic elements.
   */
  exportComponents: function() {
    var componentList = []; // Accumulator for component data objects

    // Traverse the component tree from the lowest layer upwards
    for (var currentComponent = activeCanvas.firstLayerItem; currentComponent !== null; currentComponent = currentComponent.nextComponent) {
      if (currentComponent && currentComponent.componentType) { // Validate element existence and type
        var componentDetails = null; // Object to store properties of the current component

        switch (currentComponent.componentType) {
          case "image":
            componentDetails = {
              componentType: currentComponent.componentType,
              dimensionWidth: currentComponent.properties['width'],
              dimensionHeight: currentComponent.properties['height'],
              positionX: currentComponent.properties['x'],
              positionY: currentComponent.properties['y'],
              sourceUri: currentComponent.properties['src'],
              transformationString: currentComponent.transformOperations ? currentComponent.transformOperations.join(' ') : ''
            };
            break;
          case "oval": // Renamed from "ellipse"
            componentDetails = {
              componentType: currentComponent.componentType,
              radiusHorizontal: currentComponent.properties['rx'],
              radiusVertical: currentComponent.properties['ry'],
              centralX: currentComponent.properties['cx'],
              centralY: currentComponent.properties['cy'],
              outlineColor: currentComponent.properties['stroke'] === 0 ? 'none' : currentComponent.properties['stroke'],
              'outline-thickness': currentComponent.properties['stroke-width'],
              fillColor: currentComponent.properties['fill']
            };
            break;
          case "rectangle": // Renamed from "rect"
            componentDetails = {
              componentType: currentComponent.componentType,
              positionX: currentComponent.properties['x'],
              positionY: currentComponent.properties['y'],
              dimensionWidth: currentComponent.properties['width'],
              dimensionHeight: currentComponent.properties['height'],
              outlineColor: currentComponent.properties['stroke'] === 0 ? 'none' : currentComponent.properties['stroke'],
              'outline-thickness': currentComponent.properties['stroke-width'],
              fillColor: currentComponent.properties['fill']
            };
            break;
          case "label": // Renamed from "text"
            componentDetails = {
              componentType: currentComponent.componentType,
              fontFamily: currentComponent.properties['font'],
              'font-style': currentComponent.properties['font-family'],
              'font-size-value': currentComponent.properties['font-size'],
              outlineColor: currentComponent.properties['stroke'] === 0 ? 'none' : currentComponent.properties['stroke'],
              fillColor: currentComponent.properties['fill'] === 0 ? 'none' : currentComponent.properties['fill'],
              'outline-thickness': currentComponent.properties['stroke-width'],
              positionX: currentComponent.properties['x'],
              positionY: currentComponent.properties['y'],
              displayText: currentComponent.properties['text'],
              'text-alignment-style': currentComponent.properties['text-anchor']
            };
            break;
          case "vectorPath": // Renamed from "path"
            var pathDataString = ""; // String to build up the path attribute

            // Check if the path data is already a string or an array of segments
            if (currentComponent.properties['path'].constructor !== Array) {
              pathDataString += currentComponent.properties['path'];
            } else {
              // Iterate over each segment group in the path array
              helperTool.iterateElements(currentComponent.properties['path'],
                function(segmentGroupIdx, pathSegmentGroup) {
                  helperTool.iterateElements(pathSegmentGroup,
                    function(coordinateIdx, coordinateVal) {
                      if (coordinateIdx < 1) { // First coordinate of a segment
                        pathDataString += coordinateVal;
                      } else {
                        if (coordinateIdx === (pathSegmentGroup.length - 1)) { // Last coordinate of a segment
                          pathDataString += coordinateVal;
                        } else { // Intermediate coordinates need a comma
                          pathDataString += coordinateVal + ',';
                        }
                      }
                    });
                });
            }

            componentDetails = {
              componentType: currentComponent.componentType,
              fillColor: currentComponent.properties['fill'],
              transparencyLevel: currentComponent.properties['opacity'],
              displacementVector: currentComponent.properties['translation'],
              scaleFactor: currentComponent.properties['scale'],
              pathDefinition: pathDataString, // Renamed from 'path'
              outlineColor: currentComponent.properties['stroke'] === 0 ? 'none' : currentComponent.properties['stroke'],
              'outline-thickness': currentComponent.properties['stroke-width'],
              transformationString: currentComponent.transformOperations ? currentComponent.transformOperations.join(' ') : ''
            };
            break;
        }

        if (componentDetails) { // If component data was successfully formed
          componentList.push(componentDetails);
        }
      }
    }

    // Return the JSON stringified version of the collected component data
    return (JSON.stringify(componentList));
  },

  /**
   * Reconstructs graphic components on the canvas from provided JSON data.
   *
   * @param {string|object} inputComponentData - The JSON string or object containing component definitions.
   * @returns {ComponentSet} A new set containing the imported components.
   */
  importComponents: function(inputComponentData) {
    // Parse the input string into an object if necessary
    if (typeof(inputComponentData) === "string") {
      inputComponentData = JSON.parse(inputComponentData);
    }

    var currentCanvasRef = this; // Maintain reference to the canvas context
    var componentSet = currentCanvasRef.createSet(); // Initialize a new set for the imported items

    // Iterate through each component definition in the parsed data
    helperTool.iterateElements(inputComponentData, function(itemIndex, componentDefinition) {
      try {
        // Create the component and apply its properties
        var createdComponent = currentCanvasRef[componentDefinition.componentType]().applyProperties(componentDefinition);
        componentSet.add(createdComponent); // Add the newly created component to the set
      } catch (exceptionOccurred) {
        // Suppress any errors during component creation, continuing with other items
      }
    });
    return componentSet; // Return the set of all successfully imported components
  }
};