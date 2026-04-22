const processNodeList = function(collection, operation) {
    let indexPosition = 0;
    const itemCount = collection.length;
    while (indexPosition < itemCount) {
        operation(collection[indexPosition]);
        indexPosition++;
    }
};

const domUtilityKit = {
    currentSelection: [],

    locateItems: function (queryText) {
        this.currentSelection = [...document.querySelectorAll(queryText)];
        return this;
    },

    applyStyles: function (styleDeclaration) {
        processNodeList(this.currentSelection, item => {
            item.style.cssText = styleDeclaration;
        });
        return this;
    },

    modifyAttributes: function (attributeName, attributeValue) {
        processNodeList(this.currentSelection, item => {
            item.setAttribute(attributeName, attributeValue);
        });
        return this;
    },

    triggerAnimation: function (duration, zoom, rotation, rotationX, rotationY, translationX, translationY, skewX, skewY) {
        const buildTransformString = (d, z, r, rx, ry, tx, ty, sx, sy) => {
            return `-webkit-transition: all ${d}s ease-in-out; ` +
                   `-webkit-transform: scale(${z}) ` +
                   `rotate(${r}deg) ` +
                   `rotateX(${rx}deg) ` +
                   `rotateY(${ry}deg) ` +
                   `translate(${tx}px, ${ty}px) ` +
                   `skew(${sx}deg, ${sy}deg)`;
        };

        processNodeList(this.currentSelection, item => {
            item.style.cssText = buildTransformString(duration, zoom, rotation, rotationX, rotationY, translationX, translationY, skewX, skewY);
        });
        return this;
    },

    attachEventHandlers: function (eventName, eventCallback) {
        processNodeList(this.currentSelection, item => {
            item.addEventListener(eventName, eventCallback, false);
        });
        return this;
    }
};