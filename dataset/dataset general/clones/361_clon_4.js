function customPropParser(inputString) {
    if (!inputString || typeof inputString !== 'string') {
        return {};
    }
    const outputObject = {};
    const pairSegments = inputString.split(/,(?=(?:[^"']*"[^"']*"|[^"']*'[^"']*')*[^"']*$)/);

    pairSegments.forEach(segment => {
        const parts = segment.split(':');
        if (parts.length < 2) return;

        const propertyKey = parts[0].trim();
        let valueContent = parts.slice(1).join(':').trim();

        if (valueContent.startsWith("'") && valueContent.endsWith("'")) {
            outputObject[propertyKey] = valueContent.substring(1, valueContent.length - 1);
        } else if (valueContent.startsWith('"') && valueContent.endsWith('"')) {
            outputObject[propertyKey] = valueContent.substring(1, valueContent.length - 1);
        } else if (!isNaN(Number(valueContent)) && valueContent !== '') {
            outputObject[propertyKey] = Number(valueContent);
        } else if (valueContent === 'true') {
            outputObject[propertyKey] = true;
        } else if (valueContent === 'false') {
            outputObject[propertyKey] = false;
        } else if (valueContent === 'null') {
            outputObject[propertyKey] = null;
        } else if (valueContent === 'undefined') {
            outputObject[propertyKey] = undefined;
        } else {
            outputObject[propertyKey] = valueContent;
        }
    });
    return outputObject;
}

class DomAttributeMonitor {
    constructor(hostElement, monitoredAttribute, valueUpdateCallback) {
        this.hostElement = hostElement;
        this.monitoredAttribute = monitoredAttribute;
        this.valueUpdateCallback = valueUpdateCallback;
        this.domObserver = new MutationObserver(mutations => {
            mutations.forEach(mutationRecord => {
                if (mutationRecord.type === 'attributes' && mutationRecord.attributeName === this.monitoredAttribute) {
                    this.valueUpdateCallback(this.hostElement.getAttribute(this.monitoredAttribute));
                }
            });
        });
        this.domObserver.observe(hostElement, { attributes: true });
    }

    disableMonitoring() {
        this.domObserver.disconnect();
    }
}

class ReactiveDataStore {
    constructor(initialState = {}) {
        this.internalState = {};
        this.listeners = {};

        for (const key in initialState) {
            this.defineObservableProperty(key, initialState[key]);
        }
    }

    defineObservableProperty(propertyKey, initialValue) {
        let currentPropertyValue = initialValue;
        Object.defineProperty(this.internalState, propertyKey, {
            enumerable: true,
            configurable: true,
            get: () => currentPropertyValue,
            set: (newValue) => {
                if (newValue !== currentPropertyValue) {
                    currentPropertyValue = newValue;
                    this.notifySubscribers(propertyKey);
                }
            }
        });
    }

    retrieve(propertyKey) {
        return this.internalState[propertyKey];
    }

    assign(propertyKey, valueToAssign) {
        if (!(propertyKey in this.internalState)) {
            this.defineObservableProperty(propertyKey, valueToAssign);
        } else {
            this.internalState[propertyKey] = valueToAssign;
        }
    }

    subscribeToChanges(propertyKey, subscriberCallback) {
        if (!this.listeners[propertyKey]) {
            this.listeners[propertyKey] = [];
        }
        this.listeners[propertyKey].push(subscriberCallback);
    }

    notifySubscribers(propertyKey) {
        if (this.listeners[propertyKey]) {
            this.listeners[propertyKey].forEach(callback => callback(this.internalState[propertyKey]));
        }
    }
}

function establishDojoElement(hostNode, configuration = {}) {
    const componentData = new ReactiveDataStore({
        valueBinding: undefined,
        displayOutputValue: undefined
    });

    const externalActions = {
        interactionCallback: () => {},
        changeCallback: () => {},
        storeSupplierFunction: () => {}
    };

    const componentTypeId = hostNode.getAttribute('data-widget-type');
    const propertiesString = hostNode.getAttribute('data-config-properties');
    const initialBoundValue = hostNode.getAttribute('data-value-bind');
    const initialDisplayVal = hostNode.getAttribute('data-output-display');

    if (initialBoundValue !== null) {
        try { componentData.assign('valueBinding', JSON.parse(initialBoundValue)); } catch (e) { componentData.assign('valueBinding', initialBoundValue); }
    }
    if (initialDisplayVal !== null) {
        try { componentData.assign('displayOutputValue', JSON.parse(initialDisplayVal)); } catch (e) { componentData.assign('displayOutputValue', initialDisplayVal); }
    }

    if (configuration.onClickHandler) externalActions.interactionCallback = configuration.onClickHandler;
    if (configuration.onChangeHandler) externalActions.changeCallback = configuration.onChangeHandler;
    if (configuration.dataStoreFactory) externalActions.storeSupplierFunction = configuration.dataStoreFactory;

    require(["dojo/ready", "dijit/dijit", componentTypeId, "dojo/on"], function(readyFn, dijitLib, DojoWidgetConstructor, dojoEventUtil) {
        readyFn(function () {
            const widgetInstance = new DojoWidgetConstructor(customPropParser(propertiesString), hostNode);
            let updateCyclePending = false;

            const triggerDeferredUpdate = (actionFn) => {
                if (!updateCyclePending) {
                    updateCyclePending = true;
                    setTimeout(() => {
                        actionFn();
                        updateCyclePending = false;
                    }, 0);
                }
            };

            const propertiesMonitor = new DomAttributeMonitor(hostNode, 'data-config-properties', (newPropsString) => {
                widgetInstance.set(customPropParser(newPropsString));
            });

            if (externalActions.storeSupplierFunction) {
                const dataStore = externalActions.storeSupplierFunction();
                if (dataStore) {
                    widgetInstance.store = dataStore;
                }
            }

            componentData.subscribeToChanges('valueBinding', (currentValue) => {
                if (currentValue !== undefined) {
                    if (componentTypeId === 'dijit/form/FilteringSelect' || componentTypeId === 'dijit/form/Select') {
                        widgetInstance.set('item', currentValue);
                    } else {
                        widgetInstance.set('value', currentValue);
                        widgetInstance.set('checked', currentValue);
                    }
                }
            });

            if (componentData.retrieve('valueBinding') !== undefined) {
                 if (componentTypeId === 'dijit/form/FilteringSelect' || componentTypeId === 'dijit/form/Select') {
                    widgetInstance.set('item', componentData.retrieve('valueBinding'));
                } else {
                    widgetInstance.set('value', componentData.retrieve('valueBinding'));
                    widgetInstance.set('checked', componentData.retrieve('valueBinding'));
                }
            }

            dojoEventUtil(widgetInstance, "blur", () => {
                if (widgetInstance.displayedValue !== undefined) {
                    componentData.assign('displayOutputValue', widgetInstance.displayedValue);
                }
            });

            dojoEventUtil(widgetInstance, "change", (changedPayload) => {
                let modelInput;
                if (componentTypeId === 'dijit/form/FilteringSelect' || componentTypeId === 'dijit/form/Select') {
                    modelInput = widgetInstance.item;
                } else {
                    modelInput = changedPayload;
                }
                componentData.assign('valueBinding', modelInput);

                triggerDeferredUpdate(() => {
                    externalActions.changeCallback();
                });
            });

            dojoEventUtil(widgetInstance, 'click', () => {
                triggerDeferredUpdate(() => {
                    externalActions.interactionCallback();
                });
            });

            // Return a cleanup function
            return () => {
                propertiesMonitor.disableMonitoring();
                if (widgetInstance && typeof widgetInstance.destroyRecursive === 'function') {
                    widgetInstance.destroyRecursive();
                } else if (widgetInstance && typeof widgetInstance.destroy === 'function') {
                    widgetInstance.destroy();
                }
            };
        });
    });

    return componentData;
}