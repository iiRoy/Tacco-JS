const createStyleProcessor = () => {
    let propertyHandlers = new Map();
    let collectedDeclarations = new Map();

    const assessCompatibility = (attributeName) => {
        const testTarget = document.body.style;
        const transformKey = attributeName.replace(/-([a-z])/g, (match, char) => char.toUpperCase());
        const vendorPrefixes = ['', 'Webkit', 'Moz', 'O'];

        for (const prefix of vendorPrefixes) {
            if ((prefix + transformKey) in testTarget) {
                return true;
            }
        }
        return false;
    };

    const retrieveStylesheetContent = async (sourceUri) => {
        try {
            const networkResponse = await fetch(sourceUri);
            if (!networkResponse.ok) {
                throw new Error(`HTTP retrieval issue: ${networkResponse.status}`);
            }
            return networkResponse.text();
        } catch (errorDetails) {
            console.error(`Failed to obtain stylesheet from ${sourceUri}:`, errorDetails);
            return '';
        }
    };

    const processDeclarationBlock = (sheetContent) => {
        const sanitizedContent = sheetContent.replace(/\/\*[\s\S]*?\*\//g, '');
        const ruleSegments = sanitizedContent.split('}').filter(segment => segment.trim() !== '');

        for (const segment of ruleSegments) {
            const braceLocation = segment.indexOf('{');
            if (braceLocation === -1) continue;

            let selectorText = segment.substring(0, braceLocation).trim();
            const declarationText = segment.substring(braceLocation + 1).trim();

            const individualSelectors = selectorText.split(',').map(s => s.trim()).filter(s => s !== '');
            const declarationPairs = declarationText.split(';').map(d => d.trim()).filter(d => d !== '');

            for (const currentSelector of individualSelectors) {
                if (!collectedDeclarations.has(currentSelector)) {
                    collectedDeclarations.set(currentSelector, new Map());
                }
                const selectorAttributes = collectedDeclarations.get(currentSelector);

                for (const pair of declarationPairs) {
                    const colonLocation = pair.indexOf(':');
                    if (colonLocation === -1) continue;

                    const attributeKey = pair.substring(0, colonLocation).trim();
                    const assignedValue = pair.substring(colonLocation + 1).trim();

                    if (propertyHandlers.has(attributeKey)) {
                        selectorAttributes.set(attributeKey, {
                            supported: assessCompatibility(attributeKey),
                            value: assignedValue
                        });
                    }
                }
            }
        }
    };

    const collectAllStyleSources = async () => {
        const allContents = [];

        const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const linkRetrievalPromises = linkElements
            .filter(link => link.href && link.href.startsWith(window.location.origin))
            .map(link => retrieveStylesheetContent(link.href));
        
        const styleElements = Array.from(document.querySelectorAll('style'));
        styleElements.forEach(style => {
            allContents.push(style.textContent);
        });

        const externalContents = await Promise.all(linkRetrievalPromises);
        externalContents.forEach(content => allContents.push(content));

        // Process in reverse to simulate cascade precedence (later sheets override earlier ones)
        allContents.reverse();

        for (const contentBlock of allContents) {
            processDeclarationBlock(contentBlock);
        }

        dispatchActionCallbacks();
    };

    const dispatchActionCallbacks = () => {
        for (const [selectorReference, attributesMap] of collectedDeclarations.entries()) {
            for (const [attributeName, attributeData] of attributesMap.entries()) {
                const callbackFunction = propertyHandlers.get(attributeName);
                if (callbackFunction) {
                    callbackFunction({
                        compatibilityStatus: attributeData.supported,
                        targetSelector: selectorReference,
                        propertyName: attributeName,
                        propertyValue: attributeData.value
                    });
                }
            }
        }
    };

    return {
        initialize: (customActionMap) => {
            if (customActionMap && typeof customActionMap === 'object') {
                for (const key in customActionMap) {
                    if (Object.prototype.hasOwnProperty.call(customActionMap, key) && typeof customActionMap[key] === 'function') {
                        propertyHandlers.set(key, customActionMap[key]);
                    }
                }
            }
            collectAllStyleSources();
        }
    };
};

const customProcessor = createStyleProcessor();