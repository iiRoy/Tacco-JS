const currentDocument = globalThis.document;
const identifierXPath = "//ul[contains(concat(' ', normalize-space(@class), ' '), ' BookDetail ')]/li[starts-with(normalize-space(), 'ISBN：')]";
const identifierProcessor = (sourceText) => {
    const prefixString = 'ISBN：';
    const startPosition = sourceText.indexOf(prefixString);
    if (startPosition !== -1) {
        return sourceText.substring(startPosition + prefixString.length).trim();
    }
    return '';
};

let capturedIdentifier = '';
const xpathEvaluationResult = currentDocument.evaluate(identifierXPath, currentDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
const identifierContainer = xpathEvaluationResult.singleNodeValue;
if (identifierContainer) {
    capturedIdentifier = identifierProcessor(identifierContainer.textContent || '');
}

const dispatchCommunication = (messageContent) => {
    if (globalThis.self && typeof globalThis.self.postMessage === 'function') {
        globalThis.self.postMessage(messageContent);
    }
};

dispatchCommunication(capturedIdentifier);

const assembleElement = (tagId, inlineStyles, elementAttributes, childNodes) => {
    const freshElement = currentDocument.createElement(tagId);
    if (inlineStyles) {
        for (const styleProperty in inlineStyles) {
            if (Object.prototype.hasOwnProperty.call(inlineStyles, styleProperty)) {
                freshElement.style[styleProperty] = inlineStyles[styleProperty];
            }
        }
    }
    if (elementAttributes) {
        for (const attributeName in elementAttributes) {
            if (Object.prototype.hasOwnProperty.call(elementAttributes, attributeName)) {
                freshElement.setAttribute(attributeName, elementAttributes[attributeName]);
            }
        }
    }
    if (childNodes) {
        childNodes.forEach(childItem => {
            if (typeof childItem === 'string') {
                freshElement.appendChild(currentDocument.createTextNode(childItem));
            } else if (childItem instanceof Node) {
                freshElement.appendChild(childItem);
            }
        });
    }
    return freshElement;
};

const processDeliveryRequest = (codeValue) => {
    const baseAddress = "http://www.taaze.tw/apredir.html?ap124294093_a_";
    const displayMessage = 'TAAZE \u6709 3 \u5C0F\u6642\u5230\u8CA貨';
    
    const fullAddress = baseAddress + encodeURIComponent(codeValue);
    
    const targetAnchor = currentDocument.getElementById("book_action");
    
    if (targetAnchor) {
        const linkDisplayStyles = { color: 'red' };
        const linkProperties = { href: fullAddress };
        const generatedHyperlink = assembleElement('a', linkDisplayStyles, linkProperties, [displayMessage]);
        
        const containerDisplayStyles = {
            textAlign: 'center',
            border: '1px solid rgb(204, 204, 204)',
            backgroundColor: 'rgb(242, 242, 242)',
            margin: '40px 0 0',
            float: 'left',
            width: '160px',
            padding: '10px'
        };
        const createdContainer = assembleElement('div', containerDisplayStyles, null, [generatedHyperlink]);
        
        targetAnchor.style.marginTop = '5px';
        targetAnchor.insertAdjacentElement('beforebegin', createdContainer);
    }
};

if (globalThis.self && globalThis.self.port) {
    globalThis.self.port.on('add3hr', processDeliveryRequest);
}