(function(alias) {
    alias.dataToDoc = function(inputData, rootLabel) {
        let currentDocument;
        try {
            currentDocument = document.implementation.createDocument('', '', null);
        } catch(e) {
            currentDocument = new ActiveXObject('Msxml2.DOMDocument.3.0');
        }

        try {
            let initialElement = constructElement(currentDocument, inputData, rootLabel);
            currentDocument.appendChild(initialElement);
        } catch(e) {
            throw new Error('Data transformation failed: ' + e.message);
        }

        return currentDocument;
    };

    function constructElement(docRef, sourceObject, elementLabel) {
        let currentElement = docRef.createElement(elementLabel);

        Object.entries(sourceObject).forEach(([propertyKey, propertyValue]) => {
            if (Array.isArray(propertyValue)) {
                expandCollection(docRef, currentElement, propertyValue, propertyKey);
            } else if (typeof propertyValue === 'object' && propertyValue !== null) {
                let nestedElement = constructElement(docRef, propertyValue, propertyKey);
                currentElement.appendChild(nestedElement);
            } else {
                currentElement.setAttribute(propertyKey, propertyValue);
            }
        });
        return currentElement;
    }

    function expandCollection(docRef, parentElement, itemCollection, itemLabel) {
        if (itemCollection.length === 0) {
            parentElement.appendChild(docRef.createElement(itemLabel));
            return;
        }

        itemCollection.forEach(collectionItem => {
            if (typeof collectionItem !== 'object' || collectionItem === null) {
                let itemEntry = docRef.createElement(itemLabel);
                if (collectionItem !== '') {
                    itemEntry.appendChild(docRef.createTextNode(collectionItem));
                }
                parentElement.appendChild(itemEntry);
            } else {
                let nestedObjectElement = constructElement(docRef, collectionItem, itemLabel);
                parentElement.appendChild(nestedObjectElement);
            }
        });
    }

})(jQuery);