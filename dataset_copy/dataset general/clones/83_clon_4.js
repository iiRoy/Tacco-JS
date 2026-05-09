if (typeof Array.prototype.indexOf === 'undefined') {
    Object.defineProperty(Array.prototype, 'indexOf', {
        value: function(targetItem, startOffset) {
            const collection = this;
            const collectionLen = collection.length;

            let initialScanPoint = Number(startOffset) || 0;
            initialScanPoint = (initialScanPoint < 0) ? Math.ceil(initialScanPoint) : Math.floor(initialScanPoint);
            if (initialScanPoint < 0) {
                initialScanPoint += collectionLen;
            }

            const performSearchRecursively = (currentPosition) => {
                if (currentPosition >= collectionLen) {
                    return -1;
                }
                if (currentPosition in collection && collection[currentPosition] === targetItem) {
                    return currentPosition;
                }
                return performSearchRecursively(currentPosition + 1);
            };

            return performSearchRecursively(initialScanPoint);
        },
        writable: true,
        configurable: true
    });
}

function DomWrapper(selectorString) {
    if (!(this instanceof DomWrapper)) {
        return new DomWrapper(selectorString);
    }
    this.targetElements = Array.from(document.querySelectorAll(selectorString));
    this.itemCount = this.targetElements.length;
}

DomWrapper.prototype.exposeVisual = function() {
    this.targetElements.forEach(currentElement => {
        if (currentElement instanceof HTMLElement) {
            currentElement.style.display = '';
        }
    });
    return this;
};

DomWrapper.prototype.obscureVisual = function() {
    this.targetElements.forEach(currentElement => {
        if (currentElement instanceof HTMLElement) {
            currentElement.style.display = 'none';
        }
    });
    return this;
};