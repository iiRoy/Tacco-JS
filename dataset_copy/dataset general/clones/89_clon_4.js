(function(w) {
    const documentLoadEvent = 'DOMContentLoaded';
    const mainProcess = function() {
        const targetElementName = 'grid'; 
        const destinationElement = w.document.getElementsByTagName(targetElementName)[0];

        if (!destinationElement) {
            return;
        }

        const itemType = 'div';
        const itemCount = 1200;

        const generatedItems = Array.from({ length: itemCount }, () => w.document.createElement(itemType));

        const temporaryStorage = w.document.createDocumentFragment();
        generatedItems.forEach(itemComponent => temporaryStorage.appendChild(itemComponent));

        destinationElement.appendChild(temporaryStorage);
    };

    w.addEventListener(documentLoadEvent, mainProcess);
})(window);