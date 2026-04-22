const externalCleanser = require('./sanitize.js');

function protectXmlContent(inputVal) {
    if (typeof inputVal !== 'string') {
        return String(inputVal);
    }
    return inputVal.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')')
                   .replace(/"/g, '&quot;')
                   .replace(/'/g, '&apos;');
}

function extractElementDetails(currentObj, optionsForConversion) {
    let extractedAttributes = [];
    let extractedText = '';
    let extractedChildren = [];

    for (const propKey of Object.keys(currentObj)) {
        const propValue = currentObj[propKey];
        const typeOfValue = typeof propValue;

        if (propKey === '$t') {
            extractedText = protectXmlContent(propValue);
        } else if (typeOfValue !== 'object' && !Array.isArray(propValue)) {
            let processedValue = String(propValue);
            if (optionsForConversion.performCleansing) {
                processedValue = externalCleanser.sanitize(processedValue);
            }
            extractedAttributes.push(` ${propKey}="${protectXmlContent(processedValue)}"`);
        } else if (Array.isArray(propValue)) {
            propValue.forEach(arrayItem => {
                if (typeof arrayItem !== 'object') {
                    let processedValue = String(arrayItem);
                    if (optionsForConversion.performCleansing) {
                        processedValue = externalCleanser.sanitize(processedValue);
                    }
                    extractedAttributes.push(` ${propKey}="${protectXmlContent(processedValue)}"`);
                } else {
                    extractedChildren.push(constructXmlFragment(arrayItem, propKey, optionsForConversion));
                }
            });
        } else {
            extractedChildren.push(constructXmlFragment(propValue, propKey, optionsForConversion));
        }
    }
    return { extractedAttributes, extractedText, extractedChildren };
}

function constructXmlFragment(dataObject, elementIdentifier, configuration) {
    const { extractedAttributes, extractedText, extractedChildren } = extractElementDetails(dataObject, configuration);

    const openingTagPart = `<${elementIdentifier}${extractedAttributes.join('')}`;

    if (extractedText === '' && extractedChildren.length === 0) {
        return `${openingTagPart}/>`;
    } else {
        return `${openingTagPart}>${extractedText}${extractedChildren.join('')}</${elementIdentifier}>`;
    }
}

const convertDataToXml = function (inputSource, processingOptions) {
    let parsedStructure;

    const effectiveOptions = { performCleansing: false };
    if (processingOptions) {
        Object.assign(effectiveOptions, processingOptions);
    }

    if (inputSource instanceof Buffer) {
        parsedStructure = inputSource.toString();
    } else {
        parsedStructure = inputSource;
    }

    if (typeof parsedStructure === 'string') {
        try {
            parsedStructure = JSON.parse(parsedStructure);
        } catch (syntaxError) {
            throw new Error("Input data structure is malformed");
        }
    }

    let overallOutput = '';
    if (typeof parsedStructure === 'object' && parsedStructure !== null && !Array.isArray(parsedStructure)) {
        for (const rootKey of Object.keys(parsedStructure)) {
            overallOutput += constructXmlFragment(parsedStructure[rootKey], rootKey, effectiveOptions);
        }
    }

    return overallOutput;
};

const xmlConverter = convertDataToXml;