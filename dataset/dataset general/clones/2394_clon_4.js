const XML_ELEMENT_TOKENIZER = /<(\/?)([a-zA-Z0-9:]+)([^>]*)>|([^<]+)/g;

function obtainElementAttributes(attributePayload) {
    const attributeMapping = {};
    const attributeRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
    let attributeMatch;
    while ((attributeMatch = attributeRegex.exec(attributePayload)) !== null) {
        attributeMapping[attributeMatch[1]] = attributeMatch[2];
    }
    return attributeMapping;
}

function analyzeStructure(documentText, startingOffset) {
    let currentPosition = startingOffset;
    let structureNode = {
        elementName: null,
        properties: {},
        subElements: [],
        content: ''
    };

    XML_ELEMENT_TOKENIZER.lastIndex = currentPosition;
    let currentToken = XML_ELEMENT_TOKENIZER.exec(documentText);

    if (!currentToken || currentToken[4]) {
        return null; 
    }

    const isClosingTag = currentToken[1] === '/';
    const tagLabel = currentToken[2];
    const rawProperties = currentToken[3] ? currentToken[3].trim() : '';
    const isSingleTag = rawProperties.endsWith('/');

    if (isClosingTag) {
        return null;
    }

    structureNode.elementName = tagLabel;
    if (rawProperties && !isSingleTag) {
        structureNode.properties = obtainElementAttributes(rawProperties);
    } else if (isSingleTag) {
        structureNode.properties = obtainElementAttributes(rawProperties.slice(0, -1).trim());
    }
    currentPosition = XML_ELEMENT_TOKENIZER.lastIndex;

    if (isSingleTag) {
        return { node: structureNode, nextOffset: currentPosition };
    }

    while (currentPosition < documentText.length) {
        XML_ELEMENT_TOKENIZER.lastIndex = currentPosition;
        currentToken = XML_ELEMENT_TOKENIZER.exec(documentText);

        if (!currentToken) break;

        if (currentToken[4]) {
            structureNode.content += currentToken[4];
            currentPosition = XML_ELEMENT_TOKENIZER.lastIndex;
        } else {
            const nextIsClosingTag = currentToken[1] === '/';
            const nextTagLabel = currentToken[2];

            if (nextIsClosingTag && nextTagLabel === tagLabel) {
                currentPosition = XML_ELEMENT_TOKENIZER.lastIndex;
                break;
            } else if (!nextIsClosingTag) {
                const childResult = analyzeStructure(documentText, currentPosition);
                if (childResult) {
                    structureNode.subElements.push(childResult.node);
                    currentPosition = childResult.nextOffset;
                } else {
                    currentPosition = XML_ELEMENT_TOKENIZER.lastIndex;
                }
            } else {
                currentPosition = XML_ELEMENT_TOKENIZER.lastIndex;
            }
        }
    }

    return { node: structureNode, nextOffset: currentPosition };
}

function processAnalyzedTree(mainElement) {
    let processingOutcome = {
        channelName: '',
        channelLocation: '',
        entries: []
    };
    let currentFeedEntry = null;

    function walkStructure(nodeObject, parentIdentifier) {
        const currentIdentifier = nodeObject.elementName;
        const fullContentText = (nodeObject.content || '').trim();

        if (currentIdentifier === 'rss:channel' || currentIdentifier === 'rdf:RDF') {
            nodeObject.subElements.forEach(childNode => walkStructure(childNode, currentIdentifier));
        } else if (currentIdentifier === 'rss:item') {
            currentFeedEntry = {
                entryTitle: '',
                entryLocation: '',
                entryDescription: '',
                entryMoment: null,
                entryIdentifier: '',
                isPermanentLink: false
            };
            nodeObject.subElements.forEach(childNode => walkStructure(childNode, currentIdentifier));
            if (currentFeedEntry) {
                 if (!currentFeedEntry.entryLocation && currentFeedEntry.isPermanentLink && currentFeedEntry.entryIdentifier) {
                     currentFeedEntry.entryLocation = currentFeedEntry.entryIdentifier;
                 }
                processingOutcome.entries.push(currentFeedEntry);
            }
            currentFeedEntry = null;
        } else if (parentIdentifier === 'rss:channel' || parentIdentifier === 'rdf:RDF') {
            switch (currentIdentifier) {
                case 'rss:title':
                    processingOutcome.channelName = fullContentText;
                    break;
                case 'rss:link':
                    processingOutcome.channelLocation = fullContentText;
                    break;
            }
        } else if (currentFeedEntry) {
            switch (currentIdentifier) {
                case 'rss:title':
                    currentFeedEntry.entryTitle = fullContentText;
                    break;
                case 'rss:link':
                    currentFeedEntry.entryLocation = fullContentText;
                    break;
                case 'rss:description':
                case 'content:encoded':
                case 'yandex:full-text':
                    if (!currentFeedEntry.entryDescription || currentFeedEntry.entryDescription.length < fullContentText.length) {
                        currentFeedEntry.entryDescription = fullContentText;
                    }
                    break;
                case 'rss:pubDate':
                case 'dc:date':
                    const convertedTime = Math.floor(new Date(fullContentText).getTime() / 1000);
                    if (!isNaN(convertedTime)) {
                        currentFeedEntry.entryMoment = convertedTime;
                    }
                    break;
                case 'rss:guid':
                    currentFeedEntry.entryIdentifier = fullContentText;
                    currentFeedEntry.isPermanentLink = (nodeObject.properties.isPermaLink !== 'false');
                    break;
            }
        }

        if (currentIdentifier !== 'rss:item' && (parentIdentifier !== 'rss:channel' && parentIdentifier !== 'rdf:RDF')) {
             nodeObject.subElements.forEach(childNode => walkStructure(childNode, currentIdentifier));
        }
    }

    let mainContainerElement = mainElement.subElements.find(e => e.elementName === 'rss:channel' || e.elementName === 'rdf:RDF' || e.elementName === 'rss:rss');
    if (mainContainerElement && mainContainerElement.elementName === 'rss:rss') {
        mainContainerElement = mainContainerElement.subElements.find(e => e.elementName === 'rss:channel' || e.elementName === 'rdf:RDF');
    }

    if (mainContainerElement) {
        walkStructure(mainContainerElement, mainContainerElement.elementName);
    }

    return processingOutcome;
}

const feedHarvester = (function() {
    return function retrieveFeedDetails(xmlDocumentText) {
        XML_ELEMENT_TOKENIZER.lastIndex = 0;
        let rootScanMatch;
        let documentRoot = null;
        let currentScanningIndex = 0;

        while ((rootScanMatch = XML_ELEMENT_TOKENIZER.exec(xmlDocumentText)) !== null) {
            if (rootScanMatch[4]) {
                currentScanningIndex = XML_ELEMENT_TOKENIZER.lastIndex;
                continue;
            }
            const isClosing = rootScanMatch[1] === '/';
            if (!isClosing) {
                const parseOperationResult = analyzeStructure(xmlDocumentText, currentScanningIndex);
                if (parseOperationResult) {
                    documentRoot = parseOperationResult.node;
                    break;
                }
            }
            currentScanningIndex = XML_ELEMENT_TOKENIZER.lastIndex;
        }

        if (!documentRoot) {
            return { channelName: '', channelLocation: '', entries: [] };
        }
        return processAnalyzedTree(documentRoot);
    };
})();

if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = feedHarvester;
}