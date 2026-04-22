sigma.graph.loaders.gexfLoader = function(graphSourcePath, completionCallback) {
  // Author: A code generation expert, inspired by Mathieu Jacomy's original work.
  // This module facilitates loading graph data from GEXF XML files into a sigma.js instance.

  // --- Input Validation ---
  if (typeof graphSourcePath !== 'string' || graphSourcePath.trim() === '') {
    console.error('GEXF Loader: Invalid graph source path provided. Must be a non-empty string.');
    if (completionCallback) completionCallback.call(this, new Error('Invalid graph source path.'));
    return;
  }
  if (completionCallback && typeof completionCallback !== 'function') {
    console.warn('GEXF Loader: Provided completion callback is not a function. It will be ignored.');
  }

  // --- Internal Constants and Defaults ---
  const GEXF_VISUAL_NAMESPACE_URI = 'http://www.gexf.net/1.2draft/viz';
  const DEFAULT_NODE_SIZE = 1.0;
  const DEFAULT_NODE_POSITION_X = 0.0;
  const DEFAULT_NODE_POSITION_Y = 0.0;
  const DEFAULT_NODE_COLOR = '#666'; // A neutral grey for unspecified colors

  let xmlHttpRequest;
  let gexfDocument;
  const currentSigmaInstance = this; // Capture the 'this' context for sigma.js

  // --- Helper for XML element lookup (handles namespace fallback) ---
  const getXmlElements = function(parentElement, tagName) {
    let elements = parentElement.getElementsByTagName(tagName);
    if (!elements.length) {
      // Fallback for namespaced elements if direct tag name fails
      elements = parentElement.getElementsByTagNameNS('*', tagName);
    }
    return elements;
  };

  // --- Core Logic: Load and Parse GEXF ---
  try {
    // Instantiate XMLHttpRequest for fetching the GEXF file.
    xmlHttpRequest = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

    // Force interpretation as XML, essential for responseXML property.
    xmlHttpRequest.overrideMimeType('text/xml');
    // Open the request. 'false' makes it synchronous, as per original design.
    // NOTE: Synchronous XHR is deprecated and can freeze the browser UI. For production,
    // consider refactoring to an asynchronous approach with appropriate UI feedback.
    xmlHttpRequest.open('GET', graphSourcePath, false);
    xmlHttpRequest.send();

    // Check HTTP response status and document validity
    if (xmlHttpRequest.status !== 200) {
      const errorMsg = `GEXF Loader: Failed to load XML file from ${graphSourcePath}. HTTP Status: ${xmlHttpRequest.status}`;
      console.error(errorMsg);
      if (completionCallback) completionCallback.call(this, new Error(errorMsg));
      return;
    }

    gexfDocument = xmlHttpRequest.responseXML;

    if (!gexfDocument || gexfDocument.documentElement.nodeName === 'parsererror') {
      const errorMsg = `GEXF Loader: Could not parse XML from ${graphSourcePath}. Check file format.`;
      console.error(errorMsg, gexfDocument);
      if (completionCallback) completionCallback.call(this, new Error(errorMsg));
      return;
    }

    // --- Data Structures for Attribute Definitions ---
    const nodeAttributeDefinitions = [];   // List of node attribute metadata
    const nodeAttributeLookupMap = {};     // Map attribute 'id' to 'title' for nodes
    const edgeAttributeDefinitions = [];   // List of edge attribute metadata
    const edgeAttributeLookupMap = {};     // Map attribute 'id' to 'title' for edges

    // --- Helper for parsing <attribute> elements within an <attributes> section ---
    const processAttributeSection = function(xmlAttributesContainer, targetDefinitionsArray, targetLookupMap) {
      const attributeElements = xmlAttributesContainer.getElementsByTagName('attribute');
      for (let attrIdx = 0; attrIdx < attributeElements.length; attrIdx++) {
        const currentAttributeElement = attributeElements[attrIdx];
        const attrId = currentAttributeElement.getAttribute('id');
        const attrTitle = currentAttributeElement.getAttribute('title');
        const attrType = currentAttributeElement.getAttribute('type');

        if (attrId && attrTitle && attrType) {
          const attrDefinition = { identifier: attrId, displayLabel: attrTitle, dataType: attrType };
          targetDefinitionsArray.push(attrDefinition);
          targetLookupMap[attrId] = attrTitle; // Store 'id' -> 'title' mapping
        } else {
          console.warn('GEXF Loader: Malformed attribute element found, skipping:', currentAttributeElement);
        }
      }
    };

    // --- Parse Global Attribute Definitions (for nodes and edges) ---
    const xmlAttributeSections = gexfDocument.getElementsByTagName('attributes');
    for (let sectionIdx = 0; sectionIdx < xmlAttributeSections.length; sectionIdx++) {
      const currentAttributeSection = xmlAttributeSections[sectionIdx];
      const classType = currentAttributeSection.getAttribute('class');

      if (classType === 'node') {
        processAttributeSection(currentAttributeSection, nodeAttributeDefinitions, nodeAttributeLookupMap);
      } else if (classType === 'edge') {
        processAttributeSection(currentAttributeSection, edgeAttributeDefinitions, edgeAttributeLookupMap);
      } else {
        console.warn('GEXF Loader: Unknown attribute class type encountered:', classType);
      }
    }

    // --- Parse Nodes Section ---
    const xmlNodeContainers = gexfDocument.getElementsByTagName('nodes');
    for (let containerIdx = 0; containerIdx < xmlNodeContainers.length; containerIdx++) {
      const currentNodeContainer = xmlNodeContainers[containerIdx];
      const xmlNodeElements = currentNodeContainer.getElementsByTagName('node');

      for (let nodeIdx = 0; nodeIdx < xmlNodeElements.length; nodeIdx++) {
        const currentNodeElement = xmlNodeElements[nodeIdx];

        const nodeIdString = currentNodeElement.getAttribute('id');
        if (!nodeIdString) {
          console.warn('GEXF Loader: Node element found without an "id" attribute, skipping:', currentNodeElement);
          continue;
        }

        const nodeLabel = currentNodeElement.getAttribute('label') || nodeIdString;

        // --- Extract Visual Properties for the Node ---
        let visualSize = DEFAULT_NODE_SIZE;
        let positionX = DEFAULT_NODE_POSITION_X;
        let positionY = DEFAULT_NODE_POSITION_Y;
        let visualColor = DEFAULT_NODE_COLOR;

        // Size
        const xmlSizeElements = getXmlElements(currentNodeElement, 'size');
        if (xmlSizeElements.length > 0) {
          const currentSizeElement = xmlSizeElements[0];
          const sizeValue = parseFloat(currentSizeElement.getAttribute('value'));
          if (!isNaN(sizeValue)) {
            visualSize = sizeValue;
          }
        }

        // Position
        const xmlPositionElements = getXmlElements(currentNodeElement, 'position');
        if (xmlPositionElements.length > 0) {
          const currentPositionElement = xmlPositionElements[0];
          const xValue = parseFloat(currentPositionElement.getAttribute('x'));
          const yValue = parseFloat(currentPositionElement.getAttribute('y'));
          if (!isNaN(xValue)) positionX = xValue;
          if (!isNaN(yValue)) positionY = yValue;
        }

        // Color
        const xmlColorElements = getXmlElements(currentNodeElement, 'color');
        if (xmlColorElements.length > 0) {
          const currentColorElement = xmlColorElements[0];
          const r = parseFloat(currentColorElement.getAttribute('r'));
          const g = parseFloat(currentColorElement.getAttribute('g'));
          const b = parseFloat(currentColorElement.getAttribute('b'));
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            visualColor = '#' + currentSigmaInstance.tools.rgbToHex(r, g, b);
          }
        }

        // --- Create the Node Object for Sigma.js ---
        const newNodeObject = {
          label: nodeLabel,
          size: visualSize,
          x: positionX,
          y: positionY,
          color: visualColor,
          attributes: {} // Custom attributes will go here
        };

        // --- Parse Custom Node Attribute Values (<attvalue>) ---
        const xmlAttValueElements = currentNodeElement.getElementsByTagName('attvalue');
        for (let attValIdx = 0; attValIdx < xmlAttValueElements.length; attValIdx++) {
          const currentAttValueElement = xmlAttValueElements[attValIdx];
          const attributeReference = currentAttValueElement.getAttribute('for');
          const attributeActualValue = currentAttValueElement.getAttribute('value');

          if (attributeReference && nodeAttributeLookupMap[attributeReference]) {
            newNodeObject.attributes[nodeAttributeLookupMap[attributeReference]] = attributeActualValue;
          } else if (attributeReference) {
             console.warn(`GEXF Loader: Node attribute reference '${attributeReference}' not found in definitions for node '${nodeIdString}'. Value will be stored by ID.`);
             newNodeObject.attributes[attributeReference] = attributeActualValue;
          }
        }
        
        currentSigmaInstance.addNode(nodeIdString, newNodeObject);
      }
    }

    // --- Parse Edges Section ---
    let edgeUniqueIdCounter = 0; // Use a dedicated counter for sigma edge IDs
    const xmlEdgeContainers = gexfDocument.getElementsByTagName('edges');

    for (let containerIdx = 0; containerIdx < xmlEdgeContainers.length; containerIdx++) {
      const currentEdgeContainer = xmlEdgeContainers[containerIdx];
      const xmlEdgeElements = currentEdgeContainer.getElementsByTagName('edge');

      for (let edgeIdx = 0; edgeIdx < xmlEdgeElements.length; edgeIdx++) {
        const currentEdgeElement = xmlEdgeElements[edgeIdx];

        const sourceNodeIdentifier = currentEdgeElement.getAttribute('source');
        const targetNodeIdentifier = currentEdgeElement.getAttribute('target');
        const edgeDisplayLabel = currentEdgeElement.getAttribute('label');

        if (!sourceNodeIdentifier || !targetNodeIdentifier) {
          console.warn('GEXF Loader: Edge element found without "source" or "target" attribute, skipping:', currentEdgeElement);
          continue;
        }

        // --- Create the Edge Object for Sigma.js ---
        const newEdgeObject = {
          id: String(edgeUniqueIdCounter++), // Sigma requires unique string IDs for edges
          source: sourceNodeIdentifier,
          target: targetNodeIdentifier,
          label: edgeDisplayLabel,
          attributes: {} // Custom attributes for the edge
        };

        // --- Parse Direct XML Attributes on the <edge> tag ---
        // This captures attributes like 'weight', 'type' if they are directly on the tag
        // and not defined via <attvalue> for a pre-defined attribute.
        const rawEdgeAttributes = currentEdgeElement.attributes;
        for (let attrLoopIdx = 0; attrLoopIdx < rawEdgeAttributes.length; attrLoopIdx++) {
          const attributeName = rawEdgeAttributes[attrLoopIdx].name;
          // Skip standard GEXF attributes that are handled explicitly
          if (attributeName === 'source' || attributeName === 'target' || attributeName === 'label' || attributeName === 'id') {
            continue;
          }
          // Only add if not already defined by a specific <attvalue>
          if (!edgeAttributeLookupMap[attributeName]) {
              newEdgeObject.attributes[attributeName] = rawEdgeAttributes[attrLoopIdx].value;
          }
        }

        // --- Parse Custom Edge Attribute Values (<attvalue>) ---
        const xmlAttValueElements = currentEdgeElement.getElementsByTagName('attvalue');
        for (let attValIdx = 0; attValIdx < xmlAttValueElements.length; attValIdx++) {
          const currentAttValueElement = xmlAttValueElements[attValIdx];
          const attributeReference = currentAttValueElement.getAttribute('for');
          const attributeActualValue = currentAttValueElement.getAttribute('value');

          if (attributeReference && edgeAttributeLookupMap[attributeReference]) {
            newEdgeObject.attributes[edgeAttributeLookupMap[attributeReference]] = attributeActualValue;
          } else if (attributeReference) {
             console.warn(`GEXF Loader: Edge attribute reference '${attributeReference}' not found in definitions for edge between '${sourceNodeIdentifier}' and '${targetNodeIdentifier}'. Value will be stored by ID.`);
             newEdgeObject.attributes[attributeReference] = attributeActualValue;
          }
        }

        currentSigmaInstance.addEdge(newEdgeObject.id, sourceNodeIdentifier, targetNodeIdentifier, newEdgeObject);
      }
    }

    // --- Finalization ---
    // Execute the provided callback function, if any, in the context of the sigma instance.
    if (completionCallback) {
      completionCallback.call(this, null); // Pass null for error if successful
    }

  } catch (parsingError) {
    console.error('GEXF Loader: An unexpected error occurred during parsing:', parsingError);
    if (completionCallback) {
      completionCallback.call(this, parsingError);
    }
  }
};