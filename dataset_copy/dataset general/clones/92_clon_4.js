class ResponsiveModuleHandler {
    static defaultOptions = {
        targetModule: "",
        mediaQuerySettings: {},
        teardownOperation: "destroy"
    };

    static elementCopiesStore = new WeakMap();
    static globalBindingLedger = new Map(); // Stores Set<jQueryObject> per instanceContextId

    constructor(initialElements, options) {
        if (!options || !options.targetModule || !options.mediaQuerySettings || Object.keys(options.mediaQuerySettings).length === 0) {
            return;
        }

        if (typeof enquire === 'undefined') {
            throw new Error("enquire.js is mandatory for this responsive module handler - obtain it from http://wicky.nillia.ms/enquire.js/");
        }

        this.processedElements = initialElements;
        this.executionParameters = jQuery.extend({}, ResponsiveModuleHandler.defaultOptions, options);

        this.instanceContextId = "adaptiveHandler_" + Math.random().toString(36).substring(2, 11);
        this.activeContextId = "";

        if (!jQuery.fn[this.executionParameters.targetModule]) {
            throw new Error("The '" + this.executionParameters.targetModule + "' module is not available.");
        }

        this.captureInitialState();
        this.setupMediaQueryListeners();

        if (enquire.fire) enquire.fire();
    }

    captureInitialState() {
        this.processedElements.each((_idx, domNode) => {
            const currentElement = jQuery(domNode);
            ResponsiveModuleHandler.elementCopiesStore.set(domNode, currentElement.clone(true));
        });
    }

    static temporaryOnHandler(namespaceId, elementBindingSet, initialOnMethod) {
        return function(types, selector, data, fn, one) {
            if (typeof types === "object") {
                if (typeof selector !== "string") {
                    data = data || selector;
                    selector = undefined;
                }
                for (let typeKey in types) {
                    this.on(typeKey, selector, data, types[typeKey], one);
                }
                return this;
            }

            const modifiedTypes = types.replace(/ /g, "." + namespaceId + " ") + "." + namespaceId;
            elementBindingSet.add(this);
            initialOnMethod.call(this, modifiedTypes, selector, data, fn, one);
            return this;
        };
    }

    setupMediaQueryListeners() {
        Object.keys(this.executionParameters.mediaQuerySettings).forEach(query => {
            ((mediaQuery) => {
                enquire.register(mediaQuery, {
                    match: () => {
                        this.handleMediaQueryMatch(mediaQuery);
                    }
                });
            })(query);
        });
    }

    handleMediaQueryMatch(matchedQuery) {
        const currentConfiguration = this.executionParameters.mediaQuerySettings[matchedQuery];
        this.activeContextId = this.instanceContextId;

        if (!ResponsiveModuleHandler.globalBindingLedger.has(this.activeContextId)) {
            ResponsiveModuleHandler.globalBindingLedger.set(this.activeContextId, new Set());
        }
        const instanceBindingSet = ResponsiveModuleHandler.globalBindingLedger.get(this.activeContextId);

        if (typeof currentConfiguration.callbackBefore === 'function') {
            currentConfiguration.callbackBefore.call(this.processedElements);
        }

        this.attemptModuleTeardown(currentConfiguration);
        this.clearManagedBindings(instanceBindingSet);

        let currentElementsForModule = this.processedElements;
        if (typeof currentConfiguration.restoreDOM === 'undefined' || currentConfiguration.restoreDOM !== false) {
            currentElementsForModule = this.reconstructElementsFromCopies();
        }
        this.processedElements = currentElementsForModule;

        if (currentConfiguration === "destroy" || (typeof currentConfiguration.options !== 'undefined' && currentConfiguration.options === 'destroy')) {
            // No action needed
        } else if (currentConfiguration === "hide" || (typeof currentConfiguration.options !== 'undefined' && currentConfiguration.options === 'hide')) {
            this.processedElements.hide();
        } else {
            const initialOnMethod = jQuery.fn.on;
            jQuery.fn.on = ResponsiveModuleHandler.temporaryOnHandler(
                this.activeContextId,
                instanceBindingSet,
                initialOnMethod
            );

            this.processedElements[this.executionParameters.targetModule](currentConfiguration.options);

            jQuery.fn.on = initialOnMethod;
        }

        if (typeof currentConfiguration.callbackAfter === 'function') {
            currentConfiguration.callbackAfter.call(this.processedElements);
        }
    }

    attemptModuleTeardown(configuration) {
        const teardownMethodName = this.executionParameters.teardownOperation;
        if (typeof teardownMethodName === "string") {
            const moduleInstance = this.processedElements.data(this.executionParameters.targetModule);
            if (moduleInstance && moduleInstance[teardownMethodName]) {
                moduleInstance[teardownMethodName]();
                this.processedElements.removeData(this.executionParameters.targetModule);
            }
            this.processedElements[this.executionParameters.targetModule](teardownMethodName);
        } else if (typeof teardownMethodName === "function") {
            teardownMethodName.call(this.processedElements);
        }
    }

    clearManagedBindings(bindingSet) {
        if (bindingSet.size > 0) {
            bindingSet.forEach(jqElement => {
                jqElement.off('.' + this.activeContextId);
            });
            bindingSet.clear();
        }
    }

    reconstructElementsFromCopies() {
        let accumulatedElements = jQuery([]);
        this.processedElements.each((_idx, domNode) => {
            const currentElement = jQuery(domNode);
            const originalCopy = ResponsiveModuleHandler.elementCopiesStore.get(domNode);

            if (originalCopy) {
                const freshCopy = originalCopy.clone(true);
                currentElement.replaceWith(freshCopy);
                accumulatedElements = accumulatedElements.add(freshCopy);
            }
        });
        return accumulatedElements;
    }
}

jQuery.fn.initResponsiveModule = function(options) {
    return new ResponsiveModuleHandler(this, options);
};