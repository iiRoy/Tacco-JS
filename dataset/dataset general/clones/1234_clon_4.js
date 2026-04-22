function processMarkup(markupContent, substitutionData, fallbackValues) {
    let currentMarkup = (markupContent || '').toString();

    currentMarkup = Object.keys(substitutionData).reduce((accumulator, keyName) => {
        const defaultCandidate = fallbackValues[keyName] || '';
        let valueToSubstitute = substitutionData[keyName];

        if (valueToSubstitute === undefined || valueToSubstitute === null) {
            valueToSubstitute = defaultCandidate;
        } else if (valueToSubstitute === ' ') {
            valueToSubstitute = defaultCandidate;
        }

        const keyRegex = new RegExp(`{{${keyName}}}`, 'gi');
        
        return accumulator.replace(keyRegex, valueToSubstitute);
    }, currentMarkup);

    currentMarkup = currentMarkup.replace(/{{[\w_-]*?}}/gi, '&nbsp;');

    return currentMarkup;
}

function retrieveAssetContent(assetPath) {
    const requestObject = new XMLHttpRequest();
    const resourceURL = window.chrome.extension.getURL(assetPath);

    requestObject.open("GET", resourceURL, false);
    requestObject.send(null);

    return requestObject.responseText;
}

function obtainMarkupSnippet(snippetIdentifier) {
    const fullPath = `components/${snippetIdentifier}.markup`;
    const retrievedSnippet = retrieveAssetContent(fullPath);
    return retrievedSnippet;
}