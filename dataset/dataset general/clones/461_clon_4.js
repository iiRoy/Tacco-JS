(function(domKit, nothing) {

    // Internal state and utility functions for data storage and object manipulation
    const nodeDataMap = new WeakMap();
    const eventHandlerMap = new WeakMap();
    const nativeHTMLElementFocus = HTMLElement.prototype.focus;

    // Retrieves data associated with a DOM node
    const obtainNodeData = (node, key) => {
        let dataContainer = nodeDataMap.get(node);
        return dataContainer ? dataContainer.get(key) : nothing;
    };

    // Assigns data to a DOM node
    const assignNodeData = (node, key, value) => {
        let dataContainer = nodeDataMap.get(node);
        if (!dataContainer) {
            dataContainer = new Map();
            nodeDataMap.set(node, dataContainer);
        }
        dataContainer.set(key, value);
    };

    // Removes data from a DOM node
    const removeNodeData = (node, key) => {
        let dataContainer = nodeDataMap.get(node);
        if (dataContainer) {
            dataContainer.delete(key);
            if (dataContainer.size === 0) {
                nodeDataMap.delete(node);
            }
        }
    };

    // Deep merges properties from source objects into a target object
    const deepObjectMerge = (target, ...sources) => {
        if (!target || typeof target !== 'object') return target;
        for (const source of sources) {
            if (source && typeof source === 'object') {
                for (const key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                            target[key] = deepObjectMerge(target[key], source[key]);
                        } else {
                            target[key] = source[key];
                        }
                    }
                }
            }
        }
        return target;
    };

    // Type checking utilities
    const isFunction = (func) => typeof func === 'function';
    const isNumber = (val) => typeof val === 'number';
    const isString = (val) => typeof val === 'string';

    // --- Custom Element Collection Class (replaces jQuery object) ---
    class NodeCollection extends Array {
        constructor(selectorOrNodes, contextNode = document) {
            super();
            if (selectorOrNodes instanceof HTMLElement || selectorOrNodes instanceof Document) {
                this.push(selectorOrNodes);
            } else if (Array.isArray(selectorOrNodes) || selectorOrNodes instanceof NodeList || selectorOrNodes instanceof HTMLCollection) {
                for (let i = 0; i < selectorOrNodes.length; i++) {
                    this.push(selectorOrNodes[i]);
                }
            } else if (isString(selectorOrNodes)) {
                const baseContext = contextNode instanceof NodeCollection ? contextNode[0] : contextNode;
                const found = baseContext.querySelectorAll(selectorOrNodes);
                for (let i = 0; i < found.length; i++) {
                    this.push(found[i]);
                }
            }
        }

        // Iterates over each node in the collection
        each(callback) {
            for (let i = 0; i < this.length; i++) {
                callback.call(this[i], i, this[i]);
            }
            return this;
        }

        // Gets or sets CSS properties
        style(propertyName, value) {
            if (value === nothing) {
                return this.length > 0 ? getComputedStyle(this[0])[propertyName] : nothing;
            } else {
                return this.each(node => node.style[propertyName] = value);
            }
        }

        // Finds all ancestors of the first node
        findAncestors() {
            if (this.length === 0) return new NodeCollection();
            let ancestors = new Set();
            let current = this[0].parentNode;
            while (current && current.nodeType === 1 && current !== document) {
                ancestors.add(current);
                current = current.parentNode;
            }
            return new NodeCollection(Array.from(ancestors));
        }

        // Filters the collection based on a predicate function
        filterNodes(predicate) {
            return new NodeCollection(Array.from(this).filter(predicate));
        }

        // Returns a new collection containing the first node
        firstNode() {
            return this.length > 0 ? new NodeCollection(this[0]) : new NodeCollection();
        }

        // Assigns data to each node in the collection
        assign(key, val) {
            return this.each(node => assignNodeData(node, key, val));
        }

        // Retrieves data from the first node in the collection
        retrieve(key) {
            return this.length > 0 ? obtainNodeData(this[0], key) : nothing;
        }

        // Removes data from each node in the collection
        removeData(key) {
            return this.each(node => removeNodeData(node, key));
        }

        // Adds nodes to the current collection without duplicates
        addNodes(nodes) {
            const newCollection = new NodeCollection(this);
            const nodesToAdd = nodes instanceof NodeCollection ? nodes : new NodeCollection(nodes);
            nodesToAdd.each(node => {
                if (!newCollection.includes(node)) {
                    newCollection.push(node);
                }
            });
            return newCollection;
        }

        // Finds descendant nodes matching a selector within each node of the collection
        find(selector) {
            if (this.length === 0) return new NodeCollection();
            let results = new Set();
            this.each(node => {
                node.querySelectorAll(selector).forEach(foundNode => results.add(foundNode));
            });
            return new NodeCollection(Array.from(results));
        }

        // Attaches an event handler to each node
        attach(eventSpec, handler) {
            const [eventName, namespace] = eventSpec.split('.');
            return this.each(node => {
                let nodeEvents = eventHandlerMap.get(node);
                if (!nodeEvents) {
                    nodeEvents = new Map();
                    eventHandlerMap.set(node, nodeEvents);
                }
                let handlers = nodeEvents.get(eventName);
                if (!handlers) {
                    handlers = [];
                    nodeEvents.set(eventName, handlers);
                }
                const wrappedHandler = function(event) {
                    handler.apply(this, arguments);
                };
                wrappedHandler.__originalHandler = handler;
                wrappedHandler.__namespace = namespace;
                handlers.push({ handler: wrappedHandler, namespace: namespace });
                node.addEventListener(eventName, wrappedHandler);
            });
        }

        // Detaches event handlers from each node
        detach(eventSpec) {
            const [eventName, namespace] = eventSpec.split('.');
            return this.each(node => {
                let nodeEvents = eventHandlerMap.get(node);
                if (!nodeEvents) return;

                if (eventName && namespace) {
                    let handlers = nodeEvents.get(eventName);
                    if (handlers) {
                        nodeEvents.set(eventName, handlers.filter(h => {
                            if (h.namespace === namespace) {
                                node.removeEventListener(eventName, h.handler);
                                return false;
                            }
                            return true;
                        }));
                    }
                } else if (eventName) {
                    let handlers = nodeEvents.get(eventName);
                    if (handlers) {
                        handlers.forEach(h => node.removeEventListener(eventName, h.handler));
                        nodeEvents.delete(eventName);
                    }
                } else if (namespace) {
                    nodeEvents.forEach((handlers, evName) => {
                        nodeEvents.set(evName, handlers.filter(h => {
                            if (h.namespace === namespace) {
                                node.removeEventListener(evName, h.handler);
                                return false;
                            }
                            return true;
                        }));
                    });
                }
                if (Array.from(nodeEvents.values()).every(arr => arr.length === 0)) {
                    eventHandlerMap.delete(node);
                }
            });
        }

        // Dispatches event handlers directly (mimics jQuery's triggerHandler, no bubbling)
        triggerImmediate(eventName, args) {
            const [baseEventName, namespace] = eventName.split('.');
            return this.each(node => {
                let nodeEvents = eventHandlerMap.get(node);
                if (!nodeEvents) return;

                const handlers = nodeEvents.get(baseEventName);
                if (handlers) {
                    handlers.forEach(h => {
                        if (!namespace || h.namespace === namespace) {
                            h.handler.apply(node, args);
                        }
                    });
                }
            });
        }

        // --- Core functionality replacements for jQuery.fn methods ---

        // Replaces $.fn.focus
        focusElement(delay, callback) {
            if (isNumber(delay)) {
                return this.each(node => {
                    setTimeout(() => {
                        nativeHTMLElementFocus.call(node);
                        if (isFunction(callback)) {
                            callback.call(node);
                        }
                    }, delay);
                });
            } else {
                return this.each(node => nativeHTMLElementFocus.apply(node, arguments));
            }
        }

        // Replaces $.fn.scrollParent
        parentScrollContainer() {
            let targetNode = this.length > 0 ? this[0] : nothing;
            if (!targetNode) return new NodeCollection(document);

            const initialPos = getComputedStyle(targetNode).position;
            let containerCandidate = nothing;

            let current = targetNode.parentNode;
            while (current && current.nodeType === 1 && current !== document.body && current !== document.documentElement) {
                const style = getComputedStyle(current);
                const overflowProp = style.overflow + style.overflowY + style.overflowX;
                const isScrollable = /(auto|scroll)/.test(overflowProp);
                const isPositioned = /(relative|absolute|fixed)/.test(style.position);

                if (isScrollable && (initialPos === 'absolute' || initialPos === 'fixed' ? isPositioned : true)) {
                    containerCandidate = current;
                    break;
                }
                current = current.parentNode;
            }

            if (initialPos === 'fixed' || !containerCandidate) {
                return new NodeCollection(document);
            }
            return new NodeCollection(containerCandidate);
        }

        // Replaces $.fn.zIndex
        elementDepth(depthValue) {
            if (depthValue !== nothing) {
                return this.style("zIndex", depthValue);
            }

            if (this.length === 0) return 0;
            let currentNode = new NodeCollection(this[0]);
            while (currentNode.length > 0 && currentNode[0] !== document) {
                const position = currentNode.style("position");
                if (position === "absolute" || position === "relative" || position === "fixed") {
                    const value = parseInt(currentNode.style("zIndex"), 10);
                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }
                currentNode = new NodeCollection(currentNode[0].parentNode);
            }
            return 0;
        }

        // Replaces $.fn.disableSelection
        disableTextSelection() {
            const eventType = domKit.featureSupport.selectStart ? "selectstart" : "mousedown";
            return this.attach(eventType + ".coreBlocker", event => event.preventDefault());
        }

        // Replaces $.fn.enableSelection
        enableTextSelection() {
            return this.detach(".coreBlocker");
        }

        // Internal helper for dimension calculation
        _calculateReducedSize(node, initialSize, includeBorder, includeMargin, dimensionName) {
            let currentSize = initialSize;
            const style = getComputedStyle(node);
            const sides = dimensionName === "Width" ? ["Left", "Right"] : ["Top", "Bottom"];

            sides.forEach(side => {
                currentSize -= parseFloat(style[`padding${side}`]) || 0;
                if (includeBorder) {
                    currentSize -= parseFloat(style[`border${side}Width`]) || 0;
                }
                if (includeMargin) {
                    currentSize -= parseFloat(style[`margin${side}`]) || 0;
                }
            });
            return currentSize;
        }

        // Replaces $.fn.innerWidth/Height (getter)
        getInnerDimension(dimensionName) {
            if (this.length === 0) return 0;
            const node = this[0];
            return dimensionName === "Width" ? node.clientWidth : node.clientHeight;
        }

        // Replaces $.fn.outerWidth/Height (getter)
        getOuterDimension(dimensionName, includeMargin) {
            if (this.length === 0) return 0;
            const node = this[0];
            let value = dimensionName === "Width" ? node.offsetWidth : node.offsetHeight;
            if (includeMargin) {
                const style = getComputedStyle(node);
                value += parseFloat(style[`margin${dimensionName === "Width" ? "Left" : "Top"}`]) || 0;
                value += parseFloat(style[`margin${dimensionName === "Width" ? "Right" : "Bottom"}`]) || 0;
            }
            return value;
        }
    }

    domKit.selectNodes = (selectorOrNodes, contextNode) => new NodeCollection(selectorOrNodes, contextNode);

    // --- Interface Kit (replaces $.ui) ---
    domKit.interfaceKit = domKit.interfaceKit || {};
    if (domKit.interfaceKit.versionIdentifier) {
        return; // Prevent duplicate loading
    }
    domKit.interfaceKit.versionIdentifier = "1.8.7-AltClone"; // New version string

    // Key definitions (replaces $.ui.keyCode)
    domKit.interfaceKit.keyMappings = {
        ALT_KEY: 18, BACKSPACE_KEY: 8, CAPS_LOCK_KEY: 20, COMMA_KEY: 188, COMMAND_KEY: 91,
        COMMAND_LEFT_KEY: 91, COMMAND_RIGHT_KEY: 93, CONTROL_KEY: 17, DELETE_KEY: 46,
        DOWN_ARROW_KEY: 40, END_KEY: 35, ENTER_KEY: 13, ESCAPE_KEY: 27, HOME_KEY: 36,
        INSERT_KEY: 45, LEFT_ARROW_KEY: 37, MENU_KEY: 93, NUMPAD_ADD_KEY: 107,
        NUMPAD_DECIMAL_KEY: 110, NUMPAD_DIVIDE_KEY: 111, NUMPAD_ENTER_KEY: 108,
        NUMPAD_MULTIPLY_KEY: 106, NUMPAD_SUBTRACT_KEY: 109, PAGE_DOWN_KEY: 34,
        PAGE_UP_KEY: 33, PERIOD_KEY: 190, RIGHT_ARROW_KEY: 39, SHIFT_KEY: 16,
        SPACE_KEY: 32, TAB_KEY: 9, UP_ARROW_KEY: 38, WINDOWS_KEY: 91
    };

    // Node attribute filters (replaces $.expr)
    const nodeAttributeEvaluators = {
        hasAssociatedData: (node, key) => !!obtainNodeData(node, key),

        canAcceptFocus: (node) => {
            const nodeName = node.nodeName.toLowerCase();
            const tabIndex = parseInt(node.getAttribute("tabindex"), 10);

            if (nodeName === "area") {
                const map = node.parentNode;
                const mapName = map ? map.name : '';
                if (!node.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                    return false;
                }
                const img = document.querySelector(`img[usemap="#${mapName}"]`);
                return !!img && nodeAttributeEvaluators.isVisible(img);
            }

            const isInteractive = /(input|select|textarea|button|object)/.test(nodeName);
            const isAnchor = nodeName === "a";
            const hasTabIndex = !isNaN(tabIndex);

            const baseFocusCheck = isInteractive
                ? !node.disabled
                : isAnchor
                    ? node.href || hasTabIndex
                    : hasTabIndex;

            return baseFocusCheck && nodeAttributeEvaluators.isVisible(node);
        },

        isTabbableElement: (node) => {
            const tabIndex = parseInt(node.getAttribute("tabindex"), 10);
            return (isNaN(tabIndex) || tabIndex >= 0) && nodeAttributeEvaluators.canAcceptFocus(node);
        },

        isVisible: (node) => {
            let current = node;
            while (current && current !== document) {
                const style = getComputedStyle(current);
                if (style.visibility === 'hidden' || style.display === 'none' || (current.offsetWidth === 0 && current.offsetHeight === 0)) {
                    return false;
                }
                current = current.parentNode;
            }
            return true;
        }
    };

    // Add filter methods to NodeCollection prototype for chainability
    NodeCollection.prototype.withData = function(key) { return this.filterNodes(node => nodeAttributeEvaluators.hasAssociatedData(node, key)); };
    NodeCollection.prototype.focusable = function() { return this.filterNodes(node => nodeAttributeEvaluators.canAcceptFocus(node)); };
    NodeCollection.prototype.tabbable = function() { return this.filterNodes(node => nodeAttributeEvaluators.isTabbableElement(node)); };

    // --- Dimension extensions (replaces $.each for Width/Height) ---
    ["Width", "Height"].forEach(dimensionName => {
        const type = dimensionName.toLowerCase();

        NodeCollection.prototype[`inner${dimensionName}`] = function(sizeValue) {
            if (sizeValue === nothing) {
                return this.getInnerDimension(dimensionName);
            }
            return this.each(node => {
                node.style[type] = this._calculateReducedSize(node, sizeValue, false, false, dimensionName) + "px";
            });
        };

        NodeCollection.prototype[`outer${dimensionName}`] = function(sizeValue, includeMargin) {
            if (!isNumber(sizeValue)) { // Getter case, 'sizeValue' is actually 'includeMargin' boolean
                return this.getOuterDimension(dimensionName, sizeValue);
            }
            return this.each(node => {
                node.style[type] = this._calculateReducedSize(node, sizeValue, true, includeMargin, dimensionName) + "px";
            });
        };
    });

    // --- Feature Detection (replaces $.support) ---
    domKit.featureSupport = {
        minHeightCapable: false,
        selectStart: false
    };

    document.addEventListener('DOMContentLoaded', () => {
        const tempDiv = document.createElement("div");
        document.body.appendChild(tempDiv);
        Object.assign(tempDiv.style, {
            minHeight: "100px",
            height: "auto",
            padding: "0",
            borderWidth: "0"
        });
        domKit.featureSupport.minHeightCapable = tempDiv.offsetHeight === 100;
        domKit.featureSupport.selectStart = "onselectstart" in tempDiv;
        document.body.removeChild(tempDiv).style.display = "none";
    });

    // --- Deprecated Utilities (replaces $.ui.plugin, $.ui.contains, etc.) ---
    domKit.interfaceKit.componentPlugin = {
        addHook: function(moduleIdentifier, optionSetting, actionSet) {
            const proto = domKit.interfaceKit[moduleIdentifier].prototype;
            for (const key in actionSet) {
                if (Object.prototype.hasOwnProperty.call(actionSet, key)) {
                    proto.pluginHooks[key] = proto.pluginHooks[key] || [];
                    proto.pluginHooks[key].push([optionSetting, actionSet[key]]);
                }
            }
        },
        executeHooks: function(instance, hookName, args) {
            const hooks = instance.pluginHooks[hookName];
            if (!hooks || !instance.componentNode.length || !instance.componentNode[0].parentNode) {
                return;
            }
            for (let i = 0; i < hooks.length; i++) {
                if (instance.configuration[hooks[i][0]]) {
                    hooks[i][1].apply(instance.componentNode, args);
                }
            }
        }
    };

    domKit.interfaceKit.nodeInclusion = (ancestorNode, descendantNode) => {
        return ancestorNode.compareDocumentPosition ?
            (ancestorNode.compareDocumentPosition(descendantNode) & 16) :
            (ancestorNode !== descendantNode && ancestorNode.contains(descendantNode));
    };

    domKit.interfaceKit.checkScrollability = (node, axis) => {
        if (domKit.selectNodes(node).style("overflow") === "hidden") {
            return false;
        }
        const scrollProp = (axis && axis === "left") ? "scrollLeft" : "scrollTop";
        let hasScroll = false;
        if (node[scrollProp] > 0) {
            return true;
        }
        node[scrollProp] = 1;
        hasScroll = (node[scrollProp] > 0);
        node[scrollProp] = 0;
        return hasScroll;
    };

    domKit.interfaceKit.isWithinAxis = (coordinate, reference, size) => {
        return (coordinate > reference) && (coordinate < (reference + size));
    };

    domKit.interfaceKit.isWithinRegion = (yCoord, xCoord, topBoundary, leftBoundary, heightDim, widthDim) => {
        return domKit.interfaceKit.isWithinAxis(yCoord, topBoundary, heightDim) &&
               domKit.interfaceKit.isWithinAxis(xCoord, leftBoundary, widthDim);
    };

    // --- Component System (replaces $.Widget) ---

    // Element removal hook (replaces $.cleanData / $.fn.remove)
    const componentRemovalObserver = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(removedNode => {
                    if (removedNode.nodeType === 1) { // Element node
                        domKit.selectNodes('*', removedNode).addNodes(removedNode).each(node => {
                            domKit.selectNodes(node).triggerImmediate("componentRemoved");
                        });
                    }
                });
            }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        componentRemovalObserver.observe(document.body, { childList: true, subtree: true });
    });

    class BaseComponentDefinition {
        constructor(initialOptions, elementRef) {
            if (arguments.length > 0) {
                this._initComponent(initialOptions, elementRef);
            }
        }

        // Static properties to be defined by inheriting components
        static get componentName() { return "baseComponent"; }
        static get eventPrefix() { return ""; }
        static get defaultOptions() { return { isDisabled: false }; }

        _initComponent(initialOptions, elementRef) {
            assignNodeData(elementRef, this.constructor.componentName, this);
            this.componentNode = domKit.selectNodes(elementRef);
            this.configuration = deepObjectMerge({},
                this.constructor.defaultOptions,
                this._getCreationConfiguration(),
                initialOptions
            );

            this.componentNode.attach("componentRemoved." + this.constructor.componentName, () => {
                this.destroyComponent();
            });

            this._createImplementation();
            this._dispatchCustomEvent("componentCreated");
            this._startImplementation();
        }

        _getCreationConfiguration() {
            // Placeholder for metadata plugin integration (original uses $.metadata)
            return {};
        }

        _createImplementation() {}
        _startImplementation() {}

        destroyComponent() {
            this.componentNode
                .detach("." + this.constructor.componentName)
                .removeData(this.constructor.componentName);
            
            const element = this.getComponentNode()[0];
            if (element) {
                element.className = element.className
                    .replace(new RegExp(this.constructor.baseClass + "-disabled|ui-state-disabled", "g"), "")
                    .trim();
                element.removeAttribute("aria-disabled");
            }
            this.componentNode.detach("." + this.constructor.componentName);
        }

        getComponentNode() {
            return this.componentNode;
        }

        _dispatchCustomEvent(eventType, eventData) {
            const prefix = this.constructor.eventPrefix || this.constructor.componentName;
            this.componentNode.triggerImmediate(prefix + eventType, eventData);
        }
        
        updateOptions(newOptions) {
            this.configuration = deepObjectMerge({}, this.configuration, newOptions);
            return this;
        }
    }

    domKit.interfaceKit.baseComponent = BaseComponentDefinition;

    domKit.interfaceKit.createComponent = function(fullName, basePrototypeClass, prototypeDefinition) {
        const [namespace, name] = fullName.split(".");
        const fullIdentifier = namespace + "-" + name;

        const baseClass = (prototypeDefinition ? basePrototypeClass : domKit.interfaceKit.baseComponent);
        prototypeDefinition = prototypeDefinition || basePrototypeClass; // Adjust arguments if basePrototypeClass is omitted

        // Custom selector integration for NodeCollection
        NodeCollection.prototype[fullIdentifier] = function() {
            return this.filterNodes(node => !!obtainNodeData(node, name));
        };

        domKit.interfaceKit[namespace] = domKit.interfaceKit[namespace] || {};

        const ComponentConstructor = function(options, element) {
            if (arguments.length > 0) {
                this._initComponent(options, element);
            }
        };

        const baseInstance = new baseClass();
        // Deep copy default options from base
        const mergedBaseOptions = deepObjectMerge({}, baseInstance.configuration);
        
        const inheritedPrototype = Object.create(baseClass.prototype);

        deepObjectMerge(inheritedPrototype, {
            namespaceIdentifier: namespace,
            componentName: name,
            eventPrefix: ComponentConstructor.eventPrefix || name,
            baseClass: fullIdentifier,
            pluginHooks: {}
        }, prototypeDefinition);
        inheritedPrototype.configuration = deepObjectMerge({}, baseClass.defaultOptions, mergedBaseOptions, prototypeDefinition.options || {});

        ComponentConstructor.prototype = inheritedPrototype;
        ComponentConstructor.prototype.constructor = ComponentConstructor;

        // Set static properties for easier access
        ComponentConstructor.componentName = name;
        ComponentConstructor.eventPrefix = ComponentConstructor.prototype.eventPrefix;
        ComponentConstructor.baseClass = ComponentConstructor.prototype.baseClass;
        ComponentConstructor.defaultOptions = ComponentConstructor.prototype.configuration;

        domKit.interfaceKit[namespace][name] = ComponentConstructor;

        domKit.interfaceKit.linkComponentToNodes(name, ComponentConstructor);
    };

    domKit.interfaceKit.linkComponentToNodes = function(name, ComponentConstructor) {
        NodeCollection.prototype[name] = function(opts) {
            const isMethodCall = isString(opts);
            const methodArgs = Array.prototype.slice.call(arguments, 1);
            let returnVal = this;

            const finalOptions = !isMethodCall && methodArgs.length ?
                deepObjectMerge({}, opts, ...methodArgs) :
                opts;

            if (isMethodCall && opts.charAt(0) === "_") {
                return returnVal; // Prevent internal method calls
            }

            if (isMethodCall) {
                this.each(node => {
                    const instance = obtainNodeData(node, name);
                    let methodResult = instance && isFunction(instance[opts]) ?
                        instance[opts].apply(instance, methodArgs) :
                        instance;
                    if (methodResult !== instance && methodResult !== nothing) {
                        returnVal = methodResult;
                        return false; // Break .each loop
                    }
                });
            } else {
                this.each(node => {
                    const instance = obtainNodeData(node, name);
                    if (instance) {
                        if (isFunction(instance.updateOptions)) instance.updateOptions(finalOptions || {});
                        if (isFunction(instance._startImplementation)) instance._startImplementation();
                    } else {
                        new ComponentConstructor(finalOptions, node);
                    }
                });
            }
            return returnVal;
        };
    };

})(window.domKit = window.domKit || {}, undefined);