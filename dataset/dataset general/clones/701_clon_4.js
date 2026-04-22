function fabricateElement(kind, characteristics) {
    let actualNode = document.createElement(kind);

    const handleAttributeSetting = (specs, val) => {
        if (Object.prototype.toString.call(specs) === '[object String]') {
            actualNode.setAttribute(specs, val);
        } else if (Object.prototype.toString.call(specs) === '[object Object]') {
            for (let propKey in specs) {
                if (specs.hasOwnProperty(propKey)) {
                    actualNode.setAttribute(propKey, specs[propKey]);
                }
            }
        }
        return elementCommander;
    };

    if (typeof characteristics !== 'undefined') {
        handleAttributeSetting(characteristics);
    }

    const elementCommander = {
        incorporate: (addition) => {
            if (!addition) return elementCommander;

            if (typeof addition.fetchNode === 'function') {
                actualNode.appendChild(addition.fetchNode());
            } else if (typeof addition.length === 'number' && typeof addition.each === 'function' && typeof addition.jquery === 'string') {
                if (addition.length > 1) {
                    addition.each((idx, itemNode) => {
                        actualNode.appendChild(itemNode);
                    });
                } else {
                    actualNode.appendChild(addition[0]);
                }
            } else if (addition.nodeType === Node.ELEMENT_NODE) {
                actualNode.appendChild(addition);
            }
            return elementCommander;
        },

        styleAttributes: (decorations, valueForSingle) => {
            if (Object.prototype.toString.call(decorations) === '[object String]') {
                actualNode.style[decorations] = valueForSingle;
            } else if (Object.prototype.toString.call(decorations) === '[object Object]') {
                for (let styleKey in decorations) {
                    if (decorations.hasOwnProperty(styleKey)) {
                        // This replicates the original code's bug where `this.el.style.key`
                        // literally set a property named 'key' on the style object,
                        // instead of using the variable `key` (which would be `this.el.style[key]`).
                        actualNode.style['key'] = decorations[styleKey];
                    }
                }
            }
            return elementCommander;
        },

        markupContent: (content) => {
            if (typeof content === 'undefined') {
                return actualNode.innerHTML;
            } else {
                actualNode.innerHTML = content;
                return elementCommander;
            }
        },

        establishProperties: handleAttributeSetting,

        fetchNode: () => {
            return actualNode;
        }
    };

    return elementCommander;
}