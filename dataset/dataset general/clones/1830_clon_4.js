sigma.publicPrototype.loadGraphXml = function(xmlSourcePath, completionCallback) {
  const graphManipulator = this;

  let networkAgent;
  try {
    networkAgent = new XMLHttpRequest();
  } catch (err) {
    networkAgent = new ActiveXObject('Microsoft.XMLHTTP');
  }

  networkAgent.overrideMimeType('text/xml');
  networkAgent.open('GET', xmlSourcePath, false);
  networkAgent.send(null);

  const parsedDocument = networkAgent.responseXML;

  if (!parsedDocument) {
    console.error("Unable to retrieve or parse XML from:", xmlSourcePath);
    if (completionCallback) completionCallback.call(graphManipulator, new Error("XML loading failed"));
    return;
  }

  const vizNamespaceUri = 'http://www.gexf.net/1.2draft/viz';

  const queryXmlElements = (parentElement, tagName, nsUri = null) => {
    let collection = [];
    if (nsUri) {
      collection = Array.from(parentElement.getElementsByTagNameNS(nsUri, tagName));
    }
    if (collection.length === 0) {
      collection = Array.from(parentElement.getElementsByTagName(tagName));
    }
    return collection;
  };

  const extractAttribute = (element, attributeKey) => element.getAttribute(attributeKey);

  const convertColorComponentsToHex = (red, green, blue) => {
    const toComponentHex = (component) => {
      const hexValue = Math.round(component).toString(16);
      return hexValue.length === 1 ? '0' + hexValue : hexValue;
    };
    return '#' + toComponentHex(red) + toComponentHex(green) + toComponentHex(blue);
  };

  const vertexPropertyRegistry = new Map();
  const edgePropertyRegistry = new Map();

  queryXmlElements(parsedDocument, 'attributes').forEach(attributeSetElement => {
    const classType = extractAttribute(attributeSetElement, 'class');
    const targetRegistry = (classType === 'node') ? vertexPropertyRegistry :
                           (classType === 'edge') ? edgePropertyRegistry : null;

    if (targetRegistry) {
      queryXmlElements(attributeSetElement, 'attribute').forEach(attributeDefinitionElement => {
        const definitionId = extractAttribute(attributeDefinitionElement, 'id');
        const definitionTitle = extractAttribute(attributeDefinitionElement, 'title');
        targetRegistry.set(definitionId, definitionTitle);
      });
    }
  });

  queryXmlElements(parsedDocument, 'nodes').forEach(vertexContainerElement => {
    queryXmlElements(vertexContainerElement, 'node').forEach(currentVertexElement => {
      const vertexId = extractAttribute(currentVertexElement, 'id');
      const vertexDisplayLabel = extractAttribute(currentVertexElement, 'label') || vertexId;

      let displaySize = 1.0;
      let coordinateX = 100 - 200 * Math.random();
      let coordinateY = 100 - 200 * Math.random();
      let displayColor;

      queryXmlElements(currentVertexElement, 'size', vizNamespaceUri).slice(0, 1)
        .forEach(sizeElem => {
          displaySize = parseFloat(extractAttribute(sizeElem, 'value')) || displaySize;
        });

      queryXmlElements(currentVertexElement, 'position', vizNamespaceUri).slice(0, 1)
        .forEach(positionElem => {
          coordinateX = parseFloat(extractAttribute(positionElem, 'x')) || coordinateX;
          coordinateY = parseFloat(extractAttribute(positionElem, 'y')) || coordinateY;
        });

      queryXmlElements(currentVertexElement, 'color', vizNamespaceUri).slice(0, 1)
        .forEach(colorElem => {
          const rVal = parseFloat(extractAttribute(colorElem, 'r'));
          const gVal = parseFloat(extractAttribute(colorElem, 'g'));
          const bVal = parseFloat(extractAttribute(colorElem, 'b'));
          if (!isNaN(rVal) && !isNaN(gVal) && !isNaN(bVal)) {
            displayColor = convertColorComponentsToHex(rVal, gVal, bVal);
          }
        });

      const customVertexData = {};
      queryXmlElements(currentVertexElement, 'attvalue').forEach(attributeValueElement => {
        const attributeRef = extractAttribute(attributeValueElement, 'for');
        const attributeValue = extractAttribute(attributeValueElement, 'value');
        const mappedTitle = vertexPropertyRegistry.get(attributeRef);
        if (mappedTitle) {
          customVertexData[mappedTitle] = attributeValue;
        }
      });

      const newVertexObject = {
        label: vertexDisplayLabel,
        size: displaySize,
        x: coordinateX,
        y: coordinateY,
        attributes: customVertexData,
        color: displayColor
      };
      graphManipulator.addNode(vertexId, newVertexObject);
    });
  });

  let connectionIdCounter = 0;
  queryXmlElements(parsedDocument, 'edges').forEach(edgeContainerElement => {
    queryXmlElements(edgeContainerElement, 'edge').forEach(currentEdgeElement => {
      const sourceEndpointId = extractAttribute(currentEdgeElement, 'source');
      const targetEndpointId = extractAttribute(currentEdgeElement, 'target');
      const edgeDisplayLabel = extractAttribute(currentEdgeElement, 'label');

      const customEdgeData = {};

      Array.from(currentEdgeElement.attributes).forEach(attr => {
        const attrName = attr.name;
        if (!['source', 'target', 'label'].includes(attrName)) {
          customEdgeData[attrName] = attr.value;
        }
      });

      queryXmlElements(currentEdgeElement, 'attvalue').forEach(attributeValueElement => {
        const attributeRef = extractAttribute(attributeValueElement, 'for');
        const attributeValue = extractAttribute(attributeValueElement, 'value');
        const mappedTitle = edgePropertyRegistry.get(attributeRef);
        if (mappedTitle) {
          customEdgeData[mappedTitle] = attributeValue;
        }
      });

      const newEdgeObject = {
        id: connectionIdCounter,
        source: sourceEndpointId,
        target: targetEndpointId,
        label: edgeDisplayLabel,
        attributes: customEdgeData
      };
      graphManipulator.addEdge(connectionIdCounter++, sourceEndpointId, targetEndpointId, newEdgeObject);
    });
  });

  if (completionCallback) {
    completionCallback.call(graphManipulator);
  }
};