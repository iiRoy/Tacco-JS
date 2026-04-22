((globalObject) => {
    const emptyOperation = () => {};
    const diagnosticActions = new Set([
        'assertion', 'clearance', 'tally', 'debugInfo', 'directory', 'xmlDirectory', 'fault',
        'exceptionDetails', 'category', 'collapsedCategory', 'categoryEnd', 'information', 'print',
        'timelineMark', 'profileStart', 'profileStop', 'dataGrid', 'timingStart', 'timingEnd',
        'timestampPoint', 'stackTrace', 'advisory'
    ]);

    const existingLog = globalObject.inspector || {};
    globalObject.inspector = existingLog; 

    diagnosticActions.forEach(actionName => {
        if (typeof existingLog[actionName] === 'undefined') {
            existingLog[actionName] = emptyOperation;
        }
    });
})(window);

((docRef) => {
    const segmentContent = (elementNode, divisionSymbol, baseClass, segmentSuffix) => {
        const fullContent = elementNode.textContent; 
        let contentSections = [];

        if (divisionSymbol === '') {
            contentSections = Array.from(fullContent);
        } else if (divisionSymbol === ' ') {
            contentSections = fullContent.split(divisionSymbol);
        } else {
            const temporaryContainer = docRef.createElement('div');
            temporaryContainer.innerHTML = elementNode.innerHTML;

            Array.from(temporaryContainer.querySelectorAll('br')).forEach(breakElement => {
                breakElement.replaceWith(docRef.createTextNode(divisionSymbol));
            });
            contentSections = temporaryContainer.textContent.split(divisionSymbol);
        }

        if (contentSections.length > 0) {
            let composedSegmentHtml = '';
            contentSections.forEach((part, index) => {
                const fragmentClassIdentifier = `${baseClass}${index + 1}`;
                composedSegmentHtml += `<span class="${fragmentClassIdentifier}" data-segment-hidden="true">${part}</span>${segmentSuffix}`;
            });
            elementNode.setAttribute('data-original-text', fullContent);
            elementNode.innerHTML = composedSegmentHtml;
        }
    };

    const textSegmentationStrategies = {
        characterSeparation: (elementNode) => {
            segmentContent(elementNode, '', 'char-segment', '');
        },
        wordSeparation: (elementNode) => {
            segmentContent(elementNode, ' ', 'word-unit', ' ');
        },
        lineSeparation: (elementNode) => {
            const lineBreakMarker = 'segment-separator-d2b3c4a5-f6e7-8901-2345-67890abcdef0'; 
            segmentContent(elementNode, lineBreakMarker, 'line-block', '');
        }
    };

    docRef.typographyEnhancer = (elementsInput, operationIdentifier = 'characterSeparation') => {
        const targetElements = Array.isArray(elementsInput) ? elementsInput : docRef.querySelectorAll(elementsInput);

        if (textSegmentationStrategies[operationIdentifier]) {
            Array.from(targetElements).forEach(elementNode => {
                textSegmentationStrategies[operationIdentifier](elementNode);
            });
        } else if (operationIdentifier === 'characters' || operationIdentifier === 'split' || !operationIdentifier) {
            Array.from(targetElements).forEach(elementNode => {
                textSegmentationStrategies.characterSeparation(elementNode);
            });
        } else {
            (window.inspector || console).fault(`Operation '${operationIdentifier}' is not recognized by typographyEnhancer.`);
        }
        return targetElements;
    };
})(document);

((globalObject, docRef) => {
    const configureDynamicScaling = (elementsToAdjust, scaleFactor = 1, scalingOptions = {}) => {
        const defaultScalingSettings = {
            'smallestSizePx': Number.MIN_SAFE_INTEGER,
            'largestSizePx': Number.MAX_SAFE_INTEGER
        };
        const activeSettings = Object.assign({}, defaultScalingSettings, scalingOptions);

        const targetNodes = Array.isArray(elementsToAdjust) ? elementsToAdjust : docRef.querySelectorAll(elementsToAdjust);

        Array.from(targetNodes).forEach(targetNode => {
            const updateSize = () => {
                const currentDisplayWidth = targetNode.clientWidth;
                const computedFontSize = currentDisplayWidth / (scaleFactor * 10);
                const finalAppliedSize = Math.max(
                    Math.min(computedFontSize, parseFloat(activeSettings.largestSizePx)),
                    parseFloat(activeSettings.smallestSizePx)
                );
                targetNode.style.fontSize = `${finalAppliedSize}px`;
            };

            updateSize();

            globalObject.addEventListener('resize', updateSize);
        });
        return targetNodes;
    };

    globalObject.dynamicFontScaler = configureDynamicScaling;
})(window, document);