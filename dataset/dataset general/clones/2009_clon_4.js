var visualForge = {};

function _checkIfArray(val) {
    return Array.isArray(val);
}

function _checkIfObject(val) {
    return typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof _ListManager) && !(val instanceof _SkipRender);
}

function _checkIfString(val) {
    return typeof val === 'string';
}

function _checkIfNumber(val) {
    return typeof val === 'number';
}

function _checkIfDomNode(val) {
    return val instanceof Node;
}

function _convertKebabToCamel(str) {
    return str.replace(/(-([a-z]))/g, function(g) { return g[1].toUpperCase(); });
}

const _uriRegistry = new Map([
    ["html", "http://www.w3.org/1999/xhtml"],
    ["xlink", "http://www.w3.org/1999/xlink"],
    ["svg", "http://www.w3.org/2000/svg"],
    ["xml", "http://www.w3.org/XML/1998/namespace"],
    ["xmlns", "http://www.w3.org/2000/xmlns"]
]);

const _svgElementNames = /^(svg|g|rect|circle|clipPath|path|line|polygon|polyline|text|textPath)$/;

const _tagIdentifierPattern = /([^\s\.#]+)(?:#([^\s\.#]+))?(?:\.([^\s#]+))?/;

const _blankSpacePattern = /^\s+$/;

const _listDataKeyPrefix = Symbol('_listDataUniqueKey_');

const _elementMetadataStore = new WeakMap();
function _manageElementData(targetElement, dataContent) {
    if (dataContent === undefined) {
        return _elementMetadataStore.get(targetElement);
    }
    _elementMetadataStore.set(targetElement, dataContent);
    return dataContent;
}

function _determineTagNamespace(tagName) {
    const parts = tagName.split(':');
    if (parts.length > 1) {
        const prefix = parts[0];
        const localName = parts[1];
        return [_uriRegistry.get(prefix) || prefix, localName];
    }
    if (_svgElementNames.test(tagName)) {
        return [_uriRegistry.get("svg"), tagName];
    }
    return [_uriRegistry.get("html"), tagName];
}

class RenderableElementDescriptor {
    constructor(nsURI, tagName, properties, childrenList) {
        this.ns = nsURI;
        this.name = tagName;
        this.props = properties;
        this.kids = childrenList;
    }
}

class _ListManager {
    constructor(sourceData, dataToDescriptor, dataToKey, onCreate, onUpdate, onDelete, forceUpdate) {
        this.data = sourceData;
        this.mapData = dataToDescriptor;
        this.extractKey = dataToKey;
        this.createFn = onCreate;
        this.updateFn = onUpdate;
        this.deleteFn = onDelete;
        this.forceRefresh = forceUpdate;
    }
}

class _SkipRender {
    constructor() {}
}

function _parseCssTagSyntax(tagInput) {
    const match = _tagIdentifierPattern.exec(tagInput);
    if (!match) return { baseName: tagInput, elementId: undefined, classNames: [] };
    return {
        baseName: match[1],
        elementId: match[2],
        classNames: match[3] ? match[3].split('.') : []
    };
}

function _processHiccupArray(hiccupArray) {
    let currentProperties = {};
    let childDescriptors = [];

    const parsedTag = _parseCssTagSyntax(hiccupArray[0]);
    const [elementNs, elementTag] = _determineTagNamespace(parsedTag.baseName);

    let contentStartIndex = 1;
    if (_checkIfObject(hiccupArray[1])) {
        currentProperties = hiccupArray[1];
        contentStartIndex = 2;
    }

    if (parsedTag.elementId) {
        currentProperties["id"] = parsedTag.elementId;
    }
    if (parsedTag.classNames.length > 0) {
        const existingClass = currentProperties["class"];
        if (_checkIfArray(existingClass)) {
            currentProperties["class"] = existingClass.concat(parsedTag.classNames);
        } else if (_checkIfString(existingClass)) {
            currentProperties["class"] = parsedTag.classNames.concat(existingClass);
        } else {
            currentProperties["class"] = parsedTag.classNames;
        }
    }

    for (let i = contentStartIndex; i < hiccupArray.length; i++) {
        let child = hiccupArray[i];
        if (child === null || child === undefined) continue;

        if (_checkIfArray(child) && child[0] === ":*:") {
            child.slice(1).forEach(subChild => {
                if (subChild !== null && subChild !== undefined) {
                    childDescriptors.push(_normalizeInputContent(subChild));
                }
            });
        } else {
            childDescriptors.push(_normalizeInputContent(child));
        }
    }

    return new RenderableElementDescriptor(elementNs, elementTag, currentProperties, childDescriptors);
}

function _normalizeInputContent(content) {
    if (_checkIfNumber(content)) {
        return String(content);
    } else if (_checkIfArray(content)) {
        return _processHiccupArray(content);
    } else {
        return content;
    }
}

const _attributeNamespaceLookup = new Map([
    ["xlink", "http://www.w3.org/1999/xlink"],
    ["xml", "http://www.w3.org/XML/1998/namespace"],
    ["xmlns", "http://www.w3.org/2000/xmlns"]
]);
function _applyElementSettings(targetElement, settingsMap) {
    if (!settingsMap) return;

    for (const [key, value] of Object.entries(settingsMap)) {
        if (value === null || value === undefined) {
            targetElement.removeAttribute(key);
            continue;
        }

        if (key === "style") {
            for (const [styleKey, styleVal] of Object.entries(value)) {
                targetElement.style[_convertKebabToCamel(styleKey)] = styleVal;
            }
            continue;
        }

        if (key === "properties") {
            for (const [propKey, propVal] of Object.entries(value)) {
                targetElement[propKey] = propVal;
            }
            continue;
        }

        if (key === "class") {
            if (_checkIfArray(value)) {
                targetElement.setAttribute("class", value.join(" "));
            } else {
                targetElement.setAttribute("class", String(value));
            }
            continue;
        }

        const nsIndex = key.indexOf(':');
        if (nsIndex > -1) {
            const prefix = key.substring(0, nsIndex);
            const localName = key.substring(nsIndex + 1);
            const nsURI = _attributeNamespaceLookup.get(prefix) || prefix;
            targetElement.setAttributeNS(nsURI, localName, String(value));
        } else {
            targetElement.setAttribute(key, String(value));
        }
    }
}

function _createDomElement(description) {
    if (description instanceof _ListManager) {
        throw new Error("List managers cannot be rendered directly; they manage children of an element.");
    } else if (description instanceof _SkipRender) {
        return null;
    } else if (_checkIfString(description)) {
        return document.createTextNode(description);
    } else if (_checkIfDomNode(description)) {
        return description;
    } else if (description instanceof RenderableElementDescriptor) {
        const newElement = document.createElementNS(description.ns, description.name);
        _applyElementSettings(newElement, description.props);

        const firstChild = description.kids[0];
        if (firstChild instanceof _ListManager) {
            const manager = firstChild;
            if (manager.createFn) {
                manager.data.forEach(dataItem => {
                    const childEl = manager.createFn(dataItem);
                    _manageElementData(childEl, dataItem);
                    newElement.appendChild(childEl);
                });
            } else {
                manager.data.forEach(dataItem => {
                    const childEl = _createDomElement(_normalizeInputContent(manager.mapData(dataItem)));
                    _manageElementData(childEl, dataItem);
                    newElement.appendChild(childEl);
                });
            }
        } else {
            description.kids.forEach(childDesc => {
                const childEl = _createDomElement(childDesc);
                if (childEl !== null) {
                    newElement.appendChild(childEl);
                }
            });
        }
        return newElement;
    } else {
        return document.createTextNode(String(description));
    }
}

function _isIgnorableNode(node) {
    return node.nodeType === Node.COMMENT_NODE || (node.nodeType === Node.TEXT_NODE && _blankSpacePattern.test(node.textContent));
}

function _updateChildList(parentContainer, listManager) {
    const defaultCreate = (dataItem) => {
        const el = _createDomElement(_normalizeInputContent(listManager.mapData(dataItem)));
        parentContainer.appendChild(el);
        return el;
    };
    const defaultUpdate = (element, dataItem) => {
        if (listManager.forceRefresh) {
            _reconcileDomTree(element, _normalizeInputContent(listManager.mapData(dataItem)));
        } else {
            const oldData = _manageElementData(element);
            const dataHasChanged = oldData !== dataItem && (typeof oldData !== 'object' || oldData === null || JSON.stringify(oldData) !== JSON.stringify(dataItem));
            if (dataHasChanged) {
                _reconcileDomTree(element, _normalizeInputContent(listManager.mapData(dataItem)));
            }
        }
        return element;
    };
    const defaultDelete = (element) => parentContainer.removeChild(element);

    const createElement = listManager.createFn || defaultCreate;
    const updateElement = listManager.updateFn || defaultUpdate;
    const deleteElement = listManager.deleteFn || defaultDelete;
    const getItemKey = listManager.extractKey || ((d, i) => i);

    const currentDomChildren = Array.from(parentContainer.childNodes).filter(node => node.nodeType === Node.ELEMENT_NODE);
    const newDataSet = listManager.data || [];

    const existingKeyToElementMap = new Map();
    currentDomChildren.forEach((child, index) => {
        const data = _manageElementData(child);
        const key = _listDataKeyPrefix.toString() + getItemKey(data, index);
        existingKeyToElementMap.set(key, child);
    });

    let insertionCursor = parentContainer.firstChild;

    for (let i = 0; i < newDataSet.length; i++) {
        const dataItem = newDataSet[i];
        const dataKey = _listDataKeyPrefix.toString() + getItemKey(dataItem, i);

        let targetElement = existingKeyToElementMap.get(dataKey);

        if (!targetElement) {
            targetElement = createElement(dataItem);
            _manageElementData(targetElement, dataItem);
        } else {
            updateElement(targetElement, dataItem);
            _manageElementData(targetElement, dataItem);
            existingKeyToElementMap.delete(dataKey);
        }

        if (targetElement !== insertionCursor) {
            parentContainer.insertBefore(targetElement, insertionCursor);
        }
        
        if (insertionCursor === targetElement) {
            insertionCursor = targetElement.nextSibling;
        } else {
            insertionCursor = targetElement.nextSibling;
        }
    }

    existingKeyToElementMap.forEach(element => deleteElement(element));

    while (insertionCursor) {
        const next = insertionCursor.nextSibling;
        parentContainer.removeChild(insertionCursor);
        insertionCursor = next;
    }
}

function _reconcileDomTree(currentDomElement, newDescriptor) {
    if (newDescriptor instanceof _SkipRender) {
        return;
    }

    if (newDescriptor instanceof _ListManager) {
        _updateChildList(currentDomElement, newDescriptor);
        return;
    }

    if (_checkIfString(newDescriptor)) {
        if (currentDomElement.nodeType === Node.TEXT_NODE) {
            currentDomElement.textContent = newDescriptor;
        } else {
            const newTextNode = document.createTextNode(newDescriptor);
            currentDomElement.parentNode.replaceChild(newTextNode, currentDomElement);
            return newTextNode;
        }
        return currentDomElement;
    }

    if (_checkIfDomNode(newDescriptor)) {
        if (currentDomElement !== newDescriptor) {
            currentDomElement.parentNode.replaceChild(newDescriptor, currentDomElement);
        }
        return newDescriptor;
    }

    if (!(newDescriptor instanceof RenderableElementDescriptor)) {
        throw new Error("Cannot reconcile with an unknown descriptor type.");
    }

    if (currentDomElement.nodeName.toLowerCase() !== newDescriptor.name.toLowerCase()) {
        throw new Error(`Element type mismatch: current <${currentDomElement.nodeName}> vs new <${newDescriptor.name}>`);
    }

    _applyElementSettings(currentDomElement, newDescriptor.props);

    Array.from(currentDomElement.childNodes).filter(_isIgnorableNode).forEach(node => currentDomElement.removeChild(node));

    const newChildrenDescriptions = newDescriptor.kids;
    const firstNewChild = newChildrenDescriptions[0];

    if (firstNewChild instanceof _ListManager) {
        _updateChildList(currentDomElement, firstNewChild);
    } else {
        let existingChildren = Array.from(currentDomElement.childNodes);
        let currentChildIndex = 0;
        let newChildIndex = 0;

        while (newChildIndex < newChildrenDescriptions.length || currentChildIndex < existingChildren.length) {
            const existingChild = existingChildren[currentChildIndex];
            const newChildDesc = newChildrenDescriptions[newChildIndex];

            if (newChildDesc === undefined) {
                while (currentChildIndex < existingChildren.length) {
                    currentDomElement.removeChild(existingChildren[currentChildIndex]);
                    currentChildIndex++;
                }
                break;
            }

            if (newChildDesc instanceof _SkipRender) {
                if (existingChild) {
                    currentDomElement.removeChild(existingChild);
                    currentChildIndex++;
                }
                newChildIndex++;
                continue;
            }

            if (existingChild === undefined) {
                const newChildElement = _createDomElement(newChildDesc);
                if (newChildElement) {
                    currentDomElement.appendChild(newChildElement);
                }
                newChildIndex++;
                continue;
            }

            if (_checkIfString(newChildDesc)) {
                if (existingChild.nodeType === Node.TEXT_NODE) {
                    existingChild.textContent = newChildDesc;
                } else {
                    const newTextNode = document.createTextNode(newChildDesc);
                    currentDomElement.replaceChild(newTextNode, existingChild);
                }
            } else if (_checkIfDomNode(newChildDesc)) {
                if (existingChild !== newChildDesc) {
                    currentDomElement.replaceChild(newChildDesc, existingChild);
                }
            } else if (newChildDesc instanceof RenderableElementDescriptor) {
                if (existingChild.nodeType === Node.ELEMENT_NODE && existingChild.nodeName.toLowerCase() === newChildDesc.name.toLowerCase()) {
                    _reconcileDomTree(existingChild, newChildDesc);
                } else {
                    const newRenderedChild = _createDomElement(newChildDesc);
                    if (newRenderedChild) {
                        currentDomElement.replaceChild(newRenderedChild, existingChild);
                    } else {
                        currentDomElement.removeChild(existingChild);
                    }
                }
            } else {
                throw new Error("Unrecognized child descriptor type during reconciliation.");
            }
            currentChildIndex++;
            newChildIndex++;
        }
    }
    return currentDomElement;
}

visualForge.create = function(input) {
    return _createDomElement(_normalizeInputContent(input));
};

visualForge.update = function(targetElement, newContent) {
    return _reconcileDomTree(targetElement, _normalizeInputContent(newContent));
};

visualForge.List = _ListManager;
visualForge.Skip = _SkipRender;