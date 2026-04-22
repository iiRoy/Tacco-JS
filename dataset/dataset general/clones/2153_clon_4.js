(function() {

    const processContentInputs = (input, retrieveElementMethodName) => {
        let items = Array.isArray(input) ? input : [input];
        return items.filter(Boolean).map(item => {
            if (item && typeof item === 'object' && typeof item[retrieveElementMethodName] === 'function') {
                return item[retrieveElementMethodName]();
            }
            return item;
        });
    };

    class ElementConstructor {
        constructor(tagIdentifier, propertySet) {
            this.internalNode = document.createElement(tagIdentifier);

            if (propertySet) {
                Object.entries(propertySet).forEach(([keyName, valueData]) => {
                    if (keyName === 'displayClass') {
                        this.internalNode.className = valueData;
                    } else {
                        this.internalNode.setAttribute(keyName, valueData);
                    }
                });
            }
        }

        attachSubordinates(contentItems) {
            const processedItems = processContentInputs(contentItems, 'getUnderlyingElement');
            processedItems.forEach(item => {
                if (item instanceof Node) {
                    this.internalNode.appendChild(item);
                }
            });
            return this;
        }

        injectMarkup(markupString, shouldOverwrite = false) {
            if (shouldOverwrite) {
                this.internalNode.innerHTML = markupString;
            } else {
                this.internalNode.innerHTML += markupString;
            }
            return this;
        }

        getUnderlyingElement() {
            return this.internalNode;
        }

        retrieveHtmlString() {
            const tempContainer = document.createElement('section');
            tempContainer.appendChild(this.internalNode.cloneNode(true));
            return tempContainer.innerHTML;
        }
    }

    window.ElementFactory = function(tag, attributes) {
        return new ElementConstructor(tag, attributes);
    };

    window.FragmentAssembler = function(itemsToFragment) {
        const documentSegment = document.createDocumentFragment();
        
        const temporaryWrapperElement = new ElementConstructor('article').getUnderlyingElement();
        
        const processedItems = processContentInputs(itemsToFragment, 'getUnderlyingElement');
        processedItems.forEach(item => {
            if (item instanceof Node) {
                temporaryWrapperElement.appendChild(item);
            }
        });

        while (temporaryWrapperElement.firstChild) {
            documentSegment.appendChild(temporaryWrapperElement.firstChild);
        }

        return documentSegment;
    };

})();