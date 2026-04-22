sigma.publicPrototype.ingestGraphData = function(sourceURL, onCompletion) {
  // Initiates fetching of the XML data from the specified URL.
  var xmlRequestObj, graphDoc;
  var graphVisualizer = this; // Retain reference to the sigma instance

  xmlRequestObj = window.XMLHttpRequest ?
    new XMLHttpRequest() :
    new ActiveXObject('Msxml2.XMLHTTP'); // Fallback for older IE versions

  xmlRequestObj.overrideMimeType('text/xml'); // Ensure XML interpretation
  xmlRequestObj.open('GET', sourceURL, false); // Synchronous request for simplicity
  xmlRequestObj.send(); // Dispatch the request
  graphDoc = xmlRequestObj.responseXML; // Retrieve the parsed XML document

  var visualNamespace = 'http://www.gexf.net/1.2draft/viz'; // GEXF visualization attributes namespace
  var idxA, idxB, idxC; // General purpose loop indices

  // Begin parsing of custom attribute definitions for graph elements
  // This section extracts metadata about node and edge properties.
  var nodePropList = [];   // Stores definitions of node-specific attributes
  var nodePropMap = {};    // Provides a quick lookup for node attribute titles by their IDs
  var edgePropList = [];   // Stores definitions of edge-specific attributes
  var edgePropMap = {};    // Provides a quick lookup for edge attribute titles by their IDs
  var xmlPropSections = graphDoc.getElementsByTagName('attributes');  // All XML 'attributes' elements

  for (idxA = 0; idxA < xmlPropSections.length; idxA++) {
    var currentPropSection = xmlPropSections[idxA];  // Iterate through each 'attributes' XML element
    if (currentPropSection.getAttribute('class') === 'node') {
      var xmlPropDefs = currentPropSection.getElementsByTagName('attribute');  // Get individual 'attribute' definitions for nodes
      for (idxB = 0; idxB < xmlPropDefs.length; idxB++) {
        var currentPropDef = xmlPropDefs[idxB];  // Process each node attribute definition

        var uniqueID = currentPropDef.getAttribute('id'),
          propLabel = currentPropDef.getAttribute('title'),
          dataType = currentPropDef.getAttribute('type');

        var propDefinition = {uniqueID: uniqueID, propLabel: propLabel, dataType: dataType};
        nodePropList.push(propDefinition); // Add to the list
        nodePropMap[uniqueID] = propLabel; // Store in the map for easy access
      }
    } else if (currentPropSection.getAttribute('class') === 'edge') {
      var xmlPropDefs = currentPropSection.getElementsByTagName('attribute');  // Get individual 'attribute' definitions for edges
      for (idxB = 0; idxB < xmlPropDefs.length; idxB++) {
        var currentPropDef = xmlPropDefs[idxB];  // Process each edge attribute definition

        var uniqueID = currentPropDef.getAttribute('id'),
          propLabel = currentPropDef.getAttribute('title'),
          dataType = currentPropDef.getAttribute('type');

        var propDefinition = {uniqueID: uniqueID, propLabel: propLabel, dataType: dataType};
        edgePropList.push(propDefinition); // Add to the list
        edgePropMap[uniqueID] = propLabel; // Store in the map
      }
    }
  }

  var graphElements = []; // This array is declared but not explicitly used to store nodes in this clone, mirroring original behavior.
  var xmlNodeSections = graphDoc.getElementsByTagName('nodes'); // Retrieve all 'nodes' XML containers

  for (idxA = 0; idxA < xmlNodeSections.length; idxA++) {
    var currentNodeSection = xmlNodeSections[idxA];  // Process each 'nodes' XML element
    var xmlNodeElements = currentNodeSection.getElementsByTagName('node'); // Get all 'node' XML elements within this container

    for (idxB = 0; idxB < xmlNodeElements.length; idxB++) {
      var currentNodeElement = xmlNodeElements[idxB];  // Handle each individual 'node' XML element

      window.globalNodeRef = currentNodeElement; // Expose the current XML node for potential external debugging

      var uniqueID = currentNodeElement.getAttribute('id');
      var displayLabel = currentNodeElement.getAttribute('label') || uniqueID; // Default label to ID if not present

      // Initialize visual attributes for the node
      var elementSize = 1;
      var posX = 100 - 200 * Math.random(); // Assign a random X position as default
      var posY = 100 - 200 * Math.random(); // Assign a random Y position as default
      var elementColor; // Variable to hold the node's color

      var xmlSizeInfo = currentNodeElement.getElementsByTagName('size');
      xmlSizeInfo = xmlSizeInfo.length > 0 ?
        xmlSizeInfo :
        currentNodeElement.getElementsByTagNameNS('*', 'size'); // Check for namespace-qualified 'size'
      if (xmlSizeInfo.length > 0) {
        var currentSizeInfo = xmlSizeInfo[0];
        elementSize = parseFloat(currentSizeInfo.getAttribute('value')); // Parse size value
      }

      var xmlPositionInfo = currentNodeElement.getElementsByTagName('position');
      xmlPositionInfo = xmlPositionInfo.length > 0 ?
        xmlPositionInfo :
        currentNodeElement.getElementsByTagNameNS('*', 'position'); // Check for namespace-qualified 'position'
      if (xmlPositionInfo.length > 0) {
        var currentPositionInfo = xmlPositionInfo[0];
        posX = parseFloat(currentPositionInfo.getAttribute('x')); // Parse X coordinate
        posY = parseFloat(currentPositionInfo.getAttribute('y')); // Parse Y coordinate
      }

      var xmlColorInfo = currentNodeElement.getElementsByTagName('color');
      xmlColorInfo = xmlColorInfo.length > 0 ?
        xmlColorInfo :
        currentNodeElement.getElementsByTagNameNS('*', 'color'); // Check for namespace-qualified 'color'
      if (xmlColorInfo.length > 0) {
        var currentColorInfo = xmlColorInfo[0];
        elementColor = '#' + graphVisualizer.tools.rgbToHex(Number(currentColorInfo.getAttribute('r')),
          Number(currentColorInfo.getAttribute('g')),
          Number(currentColorInfo.getAttribute('b'))); // Convert RGB components to hex string
      }

      // Construct the JavaScript object representing the graph node
      var graphNodeObject = {displayLabel: displayLabel, elementSize: elementSize, posX: posX, posY: posY, attributes: {}, elementColor: elementColor};

      // Extract and assign custom attribute values for the node
      var xmlAttributeValues = currentNodeElement.getElementsByTagName('attvalue');
      for (idxC = 0; idxC < xmlAttributeValues.length; idxC++) {
        var currentAttributeValue = xmlAttributeValues[idxC];
        var attributeKey = currentAttributeValue.getAttribute('for');
        var attributeValue = currentAttributeValue.getAttribute('value');
        graphNodeObject.attributes[nodePropMap[attributeKey]] = attributeValue; // Map ID to title for storage
      }

      graphVisualizer.addNode(uniqueID, graphNodeObject); // Add the constructed node to the visualizer
    }
  }

  var connectionList = []; // This array is also declared but not explicitly used, mirroring original.
  var connectionCounter = 0; // A counter to generate unique IDs for edges
  var xmlEdgeSections = graphDoc.getElementsByTagName('edges'); // Retrieve all 'edges' XML containers

  for (idxA = 0; idxA < xmlEdgeSections.length; idxA++) {
    var currentEdgeSection = xmlEdgeSections[idxA];
    var xmlEdgeElements = currentEdgeSection.getElementsByTagName('edge'); // Get all 'edge' XML elements

    for (idxB = 0; idxB < xmlEdgeElements.length; idxB++) {
      var currentEdgeElement = xmlEdgeElements[idxB];
      var originID = currentEdgeElement.getAttribute('source');
      var destinationID = currentEdgeElement.getAttribute('target');
      var connectionLabel = currentEdgeElement.getAttribute('label');

      var graphConnectionObject = {
        uniqueID:    connectionCounter, // Assign a sequential unique ID
        origin:      originID,
        destination: destinationID,
        edgeLabel:   connectionLabel,
        attributes:  {}
      };

      // Copy any other direct attributes found on the XML edge element
      var allAttributes = currentEdgeElement.attributes;
      for (var idxD = 0; idxD < allAttributes.length; idxD++) {
        var attrName = allAttributes[idxD].name;
        if (attrName === 'source' || attrName === 'target' || attrName === 'label') {
          continue; // Skip already handled attributes
        }
        graphConnectionObject.attributes[attrName] = allAttributes[idxD].value;
      }

      // Extract and assign custom attribute values for the edge
      var xmlAttributeValues = currentEdgeElement.getElementsByTagName('attvalue');
      for (idxC = 0; idxC < xmlAttributeValues.length; idxC++) {
        var currentAttributeValue = xmlAttributeValues[idxC];
        var attributeKey = currentAttributeValue.getAttribute('for');
        var attributeValue = currentAttributeValue.getAttribute('value');
        graphConnectionObject.attributes[edgePropMap[attributeKey]] = attributeValue; // Map ID to title for storage
      }

      graphVisualizer.addEdge(connectionCounter++, originID, destinationID, graphConnectionObject); // Add edge to visualizer, then increment counter
    }
  }

  if (onCompletion) {
    onCompletion.call(this); // Invoke the provided callback function if it exists
  }
};