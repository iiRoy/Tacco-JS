/**
 * @fileoverview This file contains an extension for the sigma.js library,
 * allowing it to parse GEXF (Graph Exchange XML Format) files.
 *
 * @author Mathieu Jacomy (originally)
 * @license Based on original work by Mathieu Jacomy @ Sciences Po Médialab & WebAtlas.
 *          Requires sigma.js to be loaded beforehand.
 */

// Extend the sigma.js public prototype with a new method: parseGexf.
sigma.publicPrototype.parseGexf = function(
  gexfPath, /* The path to the GEXF XML file. */
  callback  /* An optional callback function to be executed once parsing is complete. */
) {
  // --- Step 1: Load the GEXF XML file asynchronously (or synchronously, as implemented here) ---
  var gexfhttp;       // Variable to hold the XMLHttpRequest object.
  var gexf;           // Variable to hold the parsed GEXF XML document.
  var sigmaInstance = this; // Capture the current sigma.js instance for later use.

  // Determine the appropriate XMLHttpRequest object based on the browser environment.
  gexfhttp = window.XMLHttpRequest
    ? new XMLHttpRequest() // Standard browser implementation.
    : new ActiveXObject('Microsoft.XMLHTTP'); // Internet Explorer (older versions) support.

  // Set the MIME type to ensure the response is parsed as XML.
  gexfhttp.overrideMimeType('text/xml');

  // Open the GEXF file using a GET request. The 'false' argument makes this a synchronous request.
  gexfhttp.open(
    'GET',                  // HTTP method: GET.
    gexfPath,               // URL of the GEXF file.
    false                   // Synchronous request (blocks execution until response is received).
  );

  // Send the request.
  gexfhttp.send();

  // Retrieve the parsed XML document from the response.
  gexf = gexfhttp.responseXML;

  // Define the GEXF visualization namespace URI.
  // This is used for parsing visualization-specific attributes within the GEXF file.
  var viz = 'http://www.gexf.net/1.2draft/viz'; // Vis namespace URI.

  // Declare loop counter variables.
  var i,
    j,
    k;

  // --- Step 2: Parse Attributes (Node and Edge attributes) ---
  // This section is crucial and often confusing due to the XML structure,
  // so comments are added extensively for clarity.

  var nodesAttributes = [];   // An array to store the definitions of node attributes.
  var nodesAttributesDict = {}; // A dictionary mapping node attribute IDs to their titles for quick lookup.

  var edgesAttributes = [];   // An array to store the definitions of edge attributes.
  var edgesAttributesDict = {}; // A dictionary mapping edge attribute IDs to their titles.

  // Get all 'attributes' (plural) XML nodes from the GEXF document.
  // These nodes define the available attributes for nodes or edges.
  var attributesNodes = gexf.getElementsByTagName('attributes');

  // Iterate through each 'attributes' XML node found.
  for (i = 0; i < attributesNodes.length; i++) {
    var attributesNode = attributesNodes[i];  // Current 'attributes' XML node.

    // Check if these attributes belong to 'node' elements.
    if (attributesNode.getAttribute('class') == 'node') {
      // Get all 'attribute' (singular) XML nodes within the current 'attributes' node.
      // These define individual node attributes.
      var attributeNodes = attributesNode.getElementsByTagName('attribute');

      // Iterate through each individual 'attribute' XML node.
      for (j = 0; j < attributeNodes.length; j++) {
        var attributeNode = attributeNodes[j]; // Current 'attribute' XML node.

        // Extract the 'id', 'title', and 'type' of the attribute.
        var id = attributeNode.getAttribute('id'),
          title = attributeNode.getAttribute('title'),
          type = attributeNode.getAttribute('type');

        // Create an object to represent the attribute definition.
        var attribute = {
          id: id,
          title: title,
          type: type
        };

        // Add the attribute definition to our list.
        nodesAttributes.push(attribute);

        // Store the mapping from attribute ID to its title for easy lookup later.
        nodesAttributesDict[id] = title;
      }
    }
    // Check if these attributes belong to 'edge' elements.
    else if (attributesNode.getAttribute('class') == 'edge') {
      // Get all 'attribute' (singular) XML nodes for edges.
      var attributeNodes = attributesNode.getElementsByTagName('attribute');

      // Iterate through each individual 'attribute' XML node for edges.
      for (j = 0; j < attributeNodes.length; j++) {
        var attributeNode = attributeNodes[j]; // Current 'attribute' XML node.

        // Extract ID, title, and type for the edge attribute.
        var id = attributeNode.getAttribute('id'),
          title = attributeNode.getAttribute('title'),
          type = attributeNode.getAttribute('type');

        // Create an object for the edge attribute definition.
        var attribute = {
          id: id,
          title: title,
          type: type
        };

        // Add the edge attribute definition to its list.
        edgesAttributes.push(attribute);

        // Store the mapping from edge attribute ID to its title.
        edgesAttributesDict[id] = title;
      }
    }
  }

  // --- Step 3: Parse Nodes ---
  var nodes = []; // An array to temporarily hold parsed node data before adding to sigma.js.

  // Get all 'nodes' (plural) XML nodes from the GEXF document.
  // Each 'nodes' node can contain multiple individual 'node' elements.
  var nodesNodes = gexf.getElementsByTagName('nodes');

  // Loop through each 'nodes' (plural) XML element.
  for (i = 0; i < nodesNodes.length; i++) {
    var nodesNode = nodesNodes[i];  // Current 'nodes' XML node.

    // Get all 'node' (singular) XML nodes within the current 'nodes' (plural) node.
    var nodeNodes = nodesNode.getElementsByTagName('node');

    // Loop through each individual 'node' XML element.
    for (j = 0; j < nodeNodes.length; j++) {
      var nodeNode = nodeNodes[j];  // Current 'node' XML element.

      // For debugging purposes, you might want to inspect the current node.
      // window.NODE = nodeNode;

      // Extract the node's ID and label. If label is not present, use ID.
      var id = nodeNode.getAttribute('id');
      var label = nodeNode.getAttribute('label') || id;

      // --- Visualization attributes (viz: namespace) ---
      // Initialize default values for visualization properties.
      var size = 1;                             // Default node size.
      var x = 100 - 200 * Math.random();        // Random X position if not specified.
      var y = 100 - 200 * Math.random();        // Random Y position if not specified.
      var color;                                // Node color, will be determined.

      // Parse 'viz:size' attribute.
      var sizeNodes = nodeNode.getElementsByTagName('size');
      // Fallback to namespace-aware lookup if direct tag name doesn't work (e.g., for 'viz:size').
      sizeNodes = sizeNodes.length
        ? sizeNodes
        : nodeNode.getElementsByTagNameNS('*', 'size');
      if (sizeNodes.length > 0) {
        var sizeNode = sizeNodes[0];
        size = parseFloat(sizeNode.getAttribute('value'));
      }

      // Parse 'viz:position' attribute.
      var positionNodes = nodeNode.getElementsByTagName('position');
      // Fallback to namespace-aware lookup.
      positionNodes = positionNodes.length
        ? positionNodes
        : nodeNode.getElementsByTagNameNS('*', 'position');
      if (positionNodes.length > 0) {
        var positionNode = positionNodes[0];
        x = parseFloat(positionNode.getAttribute('x'));
        y = parseFloat(positionNode.getAttribute('y'));
      }

      // Parse 'viz:color' attribute.
      var colorNodes = nodeNode.getElementsByTagName('color');
      // Fallback to namespace-aware lookup.
      colorNodes = colorNodes.length
        ? colorNodes
        : nodeNode.getElementsByTagNameNS('*', 'color');
      if (colorNodes.length > 0) {
        var colorNode = colorNodes[0];
        // Convert RGB components to a hexadecimal color string.
        color = '#' + sigma.tools.rgbToHex(
          parseFloat(colorNode.getAttribute('r')),
          parseFloat(colorNode.getAttribute('g')),
          parseFloat(colorNode.getAttribute('b'))
        );
      }

      // Create the node object for sigma.js.
      var node = {
        label: label,
        size: size,
        x: x,
        y: y,
        attributes: {}, // Placeholder for custom attributes.
        color: color
      };

      // Parse custom attribute values defined within 'attvalue' tags.
      var attvalueNodes = nodeNode.getElementsByTagName('attvalue');
      for (k = 0; k < attvalueNodes.length; k++) {
        var attvalueNode = attvalueNodes[k];
        var attr = attvalueNode.getAttribute('for');    // The ID of the attribute definition.
        var val = attvalueNode.getAttribute('value');   // The value of this attribute for the current node.
        // Use the dictionary to map the attribute ID to its human-readable title.
        node.attributes[nodesAttributesDict[attr]] = val;
      }

      // Add the parsed node to the sigma.js instance.
      sigmaInstance.addNode(id, node);
    }
  }

  // --- Step 4: Parse Edges ---
  var edges = [];   // An array to temporarily hold parsed edge data.
  var edgeId = 0;   // A counter for assigning unique IDs to edges if not explicitly provided.

  // Get all 'edges' (plural) XML nodes from the GEXF document.
  var edgesNodes = gexf.getElementsByTagName('edges');

  // Loop through each 'edges' (plural) XML element.
  for (i = 0; i < edgesNodes.length; i++) {
    var edgesNode = edgesNodes[i];  // Current 'edges' XML node.

    // Get all 'edge' (singular) XML nodes within the current 'edges' (plural) node.
    var edgeNodes = edgesNode.getElementsByTagName('edge');

    // Loop through each individual 'edge' XML element.
    for (j = 0; j < edgeNodes.length; j++) {
      var edgeNode = edgeNodes[j];  // Current 'edge' XML element.

      // Extract source, target, and label for the edge.
      var source = edgeNode.getAttribute('source');
      var target = edgeNode.getAttribute('target');
      var label = edgeNode.getAttribute('label');

      // Create the edge object for sigma.js.
      var edge = {
        id: edgeId,         // Assign a unique ID.
        source: source,     // Source node ID.
        target: target,     // Target node ID.
        label: label,       // Edge label.
        attributes: {}      // Placeholder for custom attributes.
      };

      // Parse any direct attributes on the <edge> tag itself (e.g., 'weight').
      var attrs = edgeNode.attributes;
      for (var a = 0; a < attrs.length; a++) {
        var n = attrs[a].name; // Attribute name.
        // Skip default GEXF attributes that are already handled.
        if (n == 'source' || n == 'target' || n == 'label')
          continue;
        // Store other direct attributes.
        edge.attributes[n] = attrs[a].value;
      }

      // Parse custom attribute values defined within 'attvalue' tags for edges.
      var attvalueNodes = edgeNode.getElementsByTagName('attvalue');
      for (k = 0; k < attvalueNodes.length; k++) {
        var attvalueNode = attvalueNodes[k];
        var attr = attvalueNode.getAttribute('for');
        var val = attvalueNode.getAttribute('value');
        // Use the dictionary to map the edge attribute ID to its title.
        edge.attributes[edgesAttributesDict[attr]] = val;
      }

      // Add the parsed edge to the sigma.js instance.
      // The edgeId is incremented for the next edge.
      sigmaInstance.addEdge(edgeId++, source, target, edge);
    }
  }

  // --- Step 5: Execute Callback (if provided) ---
  // After all nodes and edges have been parsed and added to the sigma instance,
  // call the user-defined callback function, if one was supplied.
  if (callback) {
    callback.call(this); // Execute the callback in the context of the sigma instance.
  }
};