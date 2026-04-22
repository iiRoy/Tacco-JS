(function() {

    var globalHost = this,
        undefinedValue,

        originalFramework = globalHost.Domweaver,
        originalShortcut = globalHost._d,

        ElementCraft = globalHost.Domweaver = globalHost._d = function(criterion, scope) {
            return new ElementCraft.Collection(criterion, scope);
        },

        contentPattern = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
        basicSelectorCheck = /^.[^:#\[\.,]*$/;

    ElementCraft.Collection = function(criterion, scope) {
        var self = this;

        criterion = criterion || document;

        if (criterion.nodeType) {
            self[0] = criterion;
            self.length = 1;
            self.origin = criterion;
            return self;
        }

        if (typeof criterion === "string") {
            var patternResult = contentPattern.exec(criterion);

            if (patternResult && (patternResult[1] || !scope)) {

                if (patternResult[1]) {
                    criterion = ElementCraft.utilities.htmlToElements(patternResult[1], scope);
                } else {
                    var domElement = document.getElementById(patternResult[3]);

                    if (domElement && domElement.id !== patternResult[3]) {
                        return ElementCraft().findInCollection(criterion);
                    }

                    var resultCollection = ElementCraft(domElement || []);
                    resultCollection.origin = document;
                    resultCollection.selectorDescriptor = criterion;
                    return resultCollection;
                }
            } else {
                return ElementCraft(scope).findInCollection(criterion);
            }
        } else if (ElementCraft.utilities.isCallable(criterion)) {
            return ElementCraft(document).onReady(criterion);
        }

        if (criterion.selectorDescriptor && criterion.origin) {
            self.selectorDescriptor = criterion.selectorDescriptor;
            self.origin = criterion.origin;
        }

        return self.setCollection(ElementCraft.utilities.isCollection(criterion) ?
            criterion :
            ElementCraft.utilities.toArray(criterion));
    };

    var collectionProto = ElementCraft.Collection.prototype = {
        constructor: ElementCraft.Collection,

        selectorDescriptor: "",

        frameworkVersion: "1.0.0",

        countFound: function() {
            return this.length;
        },

        getItem: function(indexValue) {
            return indexValue === undefinedValue ?
                Array.prototype.slice.call(this) :
                this[indexValue];
        },

        extendSelection: function(elements, operationName, operationCriterion) {
            var newCollection = ElementCraft(elements);
            newCollection.previousCollection = this;
            newCollection.origin = this.origin;

            if (operationName === "findInCollection")
                newCollection.selectorDescriptor = this.selectorDescriptor + (this.selectorDescriptor ? " " : "") + operationCriterion;
            else if (operationName)
                newCollection.selectorDescriptor = this.selectorDescriptor + "." + operationName + "(" + operationCriterion + ")";

            return newCollection;
        },

        setCollection: function(elementsArray) {
            this.length = 0;
            Array.prototype.push.apply(this, elementsArray);
            return this;
        },

        applyToEach: function(actionCallback, callbackArguments) {
            return ElementCraft.utilities.forEachElement(this, actionCallback, callbackArguments);
        },

        positionOf: function(targetElement) {
            return ElementCraft.utilities.positionInCollection(
                targetElement && targetElement.frameworkVersion ? targetElement[0] : targetElement,
                this
            );
        },

        attributeManipulator: function(attributeName, attributeValue, attributeType) {
            var propertyOptions = attributeName;

            if (typeof attributeName === "string") {
                if (attributeValue === undefinedValue) {
                    return this[0] && ElementCraft.utilities.attributeManager(this[0], attributeName, undefinedValue, attributeType || "property");
                } else {
                    propertyOptions = {};
                    propertyOptions[attributeName] = attributeValue;
                }
            }

            return this.applyToEach(function(i) {
                for (var key in propertyOptions) {
                    ElementCraft.utilities.attributeManager(
                        attributeType ?
                            this.style :
                            this,
                        key, ElementCraft.utilities.resolveProperty(this, propertyOptions[key], attributeType, i, key),
                        attributeType
                    );
                }
            });
        },

        styleProperty: function(styleKey, styleValue) {
            if ((styleKey === 'width' || styleKey === 'height') && parseFloat(styleValue) < 0) {
                styleValue = undefinedValue;
            }
            return this.attributeManipulator(styleKey, styleValue, "computedStyle");
        },

        textContent: function(newTextContent) {
            if (typeof newTextContent !== "object" && newTextContent != null) {
                return this.emptyNodes().addChildren((this[0] && this[0].ownerDocument || document).createTextNode(newTextContent));
            }

            var accumulatedText = "";

            this.applyToEach(function() {
                var currentElement = this;
                Array.prototype.slice.call(currentElement.childNodes).forEach(function(childNode) {
                    if (childNode.nodeType !== 8) {
                        accumulatedText += childNode.nodeType !== 1 ?
                            childNode.nodeValue :
                            ElementCraft.Collection.prototype.textContent.call(ElementCraft([childNode]));
                    }
                });
            });

            return accumulatedText;
        },

        emptyNodes: function() {
            return this.applyToEach(function() {
                while (this.firstChild) {
                    this.removeChild(this.firstChild);
                }
            });
        },

        getContents: function() {
            var contents = [];
            this.applyToEach(function() {
                Array.prototype.push.apply(contents, this.childNodes);
            });
            return ElementCraft(contents);
        },

        encaseAll: function(wrappingHtml) {
            if (this[0]) {
                var wrapperElements = ElementCraft.utilities.htmlToElements(wrappingHtml, this[0].ownerDocument, true);

                if (this[0].parentNode) {
                    this[0].parentNode.insertBefore(wrapperElements[0], this[0]);
                }

                var deepestWrapper = wrapperElements[0];
                while (deepestWrapper && deepestWrapper.firstChild) {
                    deepestWrapper = deepestWrapper.firstChild;
                }

                this.applyToEach(function() {
                    if (deepestWrapper) {
                        deepestWrapper.appendChild(this);
                    }
                });
            }

            return this;
        },

        encaseContent: function(wrappingHtml) {
            return this.applyToEach(function() {
                ElementCraft(this).getContents().encaseAll(wrappingHtml);
            });
        },

        encase: function(wrappingHtml) {
            return this.applyToEach(function() {
                ElementCraft(this).encaseAll(wrappingHtml);
            });
        },

        addChildren: function() {
            return this.domModifier(arguments, true, function(elementToAdd) {
                if (this.nodeType === 1) {
                    this.appendChild(elementToAdd);
                }
            });
        },

        addChildrenBefore: function() {
            return this.domModifier(arguments, true, function(elementToAdd) {
                if (this.nodeType === 1) {
                    this.insertBefore(elementToAdd, this.firstChild);
                }
            });
        },

        domModifier: function(contentArguments, executeScripts, actionCallback) {
            var targetElements = this;
            var contentNodes = [];

            Array.prototype.slice.call(contentArguments).forEach(function(item) {
                if (typeof item === 'string') {
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = item;
                    Array.prototype.push.apply(contentNodes, Array.prototype.slice.call(tempDiv.childNodes));
                } else if (item.nodeType) {
                    contentNodes.push(item);
                } else if (item instanceof ElementCraft.Collection) {
                    Array.prototype.push.apply(contentNodes, Array.prototype.slice.call(item));
                } else if (ElementCraft.utilities.isCollection(item)) {
                    Array.prototype.push.apply(contentNodes, item);
                }
            });

            if (contentNodes.length === 0) {
                return targetElements;
            }

            var fragment = document.createDocumentFragment();
            contentNodes.forEach(function(node) {
                fragment.appendChild(node);
            });

            var targetCount = targetElements.length;
            for (var i = 0; i < targetCount; i++) {
                var currentTarget = targetElements[i];
                if (currentTarget.nodeType === 1) {
                    if (i < targetCount - 1) {
                        actionCallback.call(currentTarget, fragment.cloneNode(true));
                    } else {
                        actionCallback.call(currentTarget, fragment);
                    }
                }
            }

            return targetElements;
        },

        findInCollection: function(selectorString) {
            var foundElements = [];
            this.applyToEach(function() {
                try {
                    Array.prototype.push.apply(foundElements, this.querySelectorAll(selectorString));
                } catch (e) {
                    // Ignored for basic implementation
                }
            });
            return this.extendSelection(foundElements, "findInCollection", selectorString);
        },

        onReady: ElementCraft.utilities.onReady
    };

    ElementCraft.utilities = {
        forEachElement: function(collection, actionCallback, callbackArguments) {
            var i = 0,
                length = collection.length;

            if (callbackArguments) {
                for (; i < length; i++) {
                    actionCallback.apply(collection[i], callbackArguments);
                }
            } else {
                for (; i < length; i++) {
                    actionCallback.call(collection[i], i, collection[i]);
                }
            }
            return collection;
        },

        isCollection: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        toArray: function(obj) {
            if (obj == null) {
                return [];
            }
            if (typeof obj === 'string' || ElementCraft.utilities.isCallable(obj) || !('length' in obj)) {
                return [obj];
            }
            return Array.prototype.slice.call(obj);
        },

        isCallable: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Function]';
        },

        positionInCollection: function(element, collection) {
            if (collection) {
                for (var i = 0, length = collection.length; i < length; i++) {
                    if (collection[i] === element) {
                        return i;
                    }
                }
            }
            return -1;
        },

        htmlToElements: function(htmlString, contextDocument, shouldClone) {
            contextDocument = contextDocument || document;
            var tempContainer = contextDocument.createElement('div');
            tempContainer.innerHTML = htmlString;
            var elements = Array.prototype.slice.call(tempContainer.childNodes);
            if (shouldClone) {
                return elements.map(function(node) {
                    return node.cloneNode(true);
                });
            }
            return elements;
        },

        onReady: function(callback) {
            var hasFired = false;
            var readyStateCheckInterval = setInterval(function() {
                if (document.readyState === "complete" || document.readyState === "interactive") {
                    if (!hasFired) {
                        hasFired = true;
                        clearInterval(readyStateCheckInterval);
                        callback();
                    }
                }
            }, 10);
            return ElementCraft(document);
        },

        attributeManager: function(targetNode, propName, propValue, type) {
            if (type === "computedStyle") {
                if (propValue === undefinedValue) {
                    return globalHost.getComputedStyle(targetNode, null).getPropertyValue(propName) || targetNode.style[propName];
                } else {
                    targetNode.style[propName] = propValue;
                }
            } else {
                if (propValue === undefinedValue) {
                    return targetNode[propName] !== undefinedValue ? targetNode[propName] : targetNode.getAttribute(propName);
                } else {
                    targetNode[propName] = propValue;
                    if (targetNode[propName] !== propValue) {
                        targetNode.setAttribute(propName, propValue);
                    }
                }
            }
        },

        resolveProperty: function(element, value, type, index, name) {
            if (ElementCraft.utilities.isCallable(value)) {
                return value.call(element, index, ElementCraft.utilities.attributeManager(element, name, undefinedValue, type));
            }
            return value;
        }
    };

    ElementCraft.noConflict = function(restoreShortcut) {
        if (globalHost.Domweaver === ElementCraft) {
            globalHost.Domweaver = originalFramework;
        }
        if (restoreShortcut && globalHost._d === ElementCraft) {
            globalHost._d = originalShortcut;
        }
        return ElementCraft;
    };

    collectionProto.length = 0;

})();