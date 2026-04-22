(() => {
    const previousGlobal = window.WorldView;
    const WorldView = {};

    WorldView.version = '1.0.0';

    WorldView.releaseGlobal = function () {
        window.WorldView = previousGlobal;
        return this;
    };

    window.WorldView = WorldView;

    const objectIdentifier = new WeakMap();
    let currentId = 0;
    const listenerRegistry = new WeakMap();

    WorldView.Tools = {
        mergeProperties: (target, ...sources) => {
            sources.forEach(source => {
                if (source && typeof source === 'object') {
                    for (const key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            });
            return target;
        },

        createBoundFunction: (func, context, ...argsToPrepend) => func.bind(context, ...argsToPrepend),

        assignObjectId: (item) => {
            if (!objectIdentifier.has(item)) {
                objectIdentifier.set(item, ++currentId);
            }
            return objectIdentifier.get(item);
        },

        processObjectEntries: (collection, operation, context, ...extraArgs) => {
            if (typeof collection !== 'object' || collection === null) {
                return false;
            }
            Object.entries(collection).forEach(([key, value]) => {
                operation.apply(context, [key, value, ...extraArgs]);
            });
            return true;
        },

        throttleAction: (actionFunc, delayMs, associatedContext) => {
            let timer = null;
            let pendingExecution = false;
            let lastArgs = null;

            return function(...args) {
                lastArgs = args;
                if (timer) {
                    pendingExecution = true;
                    return;
                }

                actionFunc.apply(associatedContext, args);

                timer = setTimeout(() => {
                    timer = null;
                    if (pendingExecution) {
                        pendingExecution = false;
                        this.apply(associatedContext, lastArgs);
                    }
                }, delayMs);
            };
        },

        alwaysFalse: () => false,

        roundToPrecision: (numberVal, decimalPlaces = 5) => {
            const factor = Math.pow(10, decimalPlaces);
            return Math.round(numberVal * factor) / factor;
        },

        stripWhitespace: (text) => text.trim(),

        splitStringBySpaces: (text) => WorldView.Tools.stripWhitespace(text).split(/\s+/),

        configureObject: (targetObj, newOptions) => {
            targetObj.configuration = WorldView.Tools.mergeProperties({}, targetObj.configuration, newOptions);
            return targetObj.configuration;
        },

        buildQueryString: (parameters, existingPath, capitalizeKeys) => {
            const parts = Object.entries(parameters).map(([key, val]) => {
                const processedKey = capitalizeKeys ? key.toUpperCase() : key;
                return `${encodeURIComponent(processedKey)}=${encodeURIComponent(val)}`;
            });
            const prefix = (!existingPath || existingPath.indexOf('?') === -1) ? '?' : '&';
            return prefix + parts.join('&');
        },

        formatString: (templateStr, replacements) => {
            return templateStr.replace(/\{ *([\w_]+) *\}/g, (_, key) => {
                let value = replacements[key];
                if (value === undefined) {
                    throw new Error(`Missing value for placeholder: {${key}}`);
                } else if (typeof value === 'function') {
                    value = value(replacements);
                }
                return value;
            });
        },

        isCollection: Array.isArray,

        transparentPixelData: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
    };

    const scheduleFrameUpdate = (callback, context, immediate, element) => {
        const boundCallback = WorldView.Tools.createBoundFunction(callback, context);
        if (immediate && !window.requestAnimationFrame) { // Mimic original's immediate execution fallback
            boundCallback();
        } else {
            return window.requestAnimationFrame(boundCallback, element);
        }
    };

    const cancelFrameUpdate = (id) => {
        if (id) {
            window.cancelAnimationFrame(id);
        }
    };

    WorldView.Tools.scheduleFrameUpdate = scheduleFrameUpdate;
    WorldView.Tools.cancelFrameUpdate = cancelFrameUpdate;

    WorldView.EventDispatcher = {
        attachListener(eventNames, handlerFunction, contextObject) {
            if (WorldView.Tools.processObjectEntries(eventNames, this.attachListener, this, handlerFunction, contextObject)) {
                return this;
            }

            const currentListeners = listenerRegistry.get(this) || new Map();
            listenerRegistry.set(this, currentListeners);

            const namesArray = WorldView.Tools.splitStringBySpaces(eventNames);

            namesArray.forEach(name => {
                const handlersForType = currentListeners.get(name) || new Set();
                handlersForType.add({ action: handlerFunction, context: contextObject || this });
                currentListeners.set(name, handlersForType);
            });
            return this;
        },

        hasActiveListeners(eventName) {
            const currentListeners = listenerRegistry.get(this);
            return !!currentListeners && currentListeners.has(eventName) && currentListeners.get(eventName).size > 0;
        },

        detachListener(eventNames, handlerFunction, contextObject) {
            const currentListeners = listenerRegistry.get(this);
            if (!currentListeners) { return this; }

            if (!eventNames) {
                return this.clearAllListeners();
            }

            if (WorldView.Tools.processObjectEntries(eventNames, this.detachListener, this, handlerFunction, contextObject)) {
                return this;
            }

            const namesArray = WorldView.Tools.splitStringBySpaces(eventNames);

            namesArray.forEach(name => {
                const handlersForType = currentListeners.get(name);
                if (handlersForType) {
                    if (!handlerFunction) {
                        currentListeners.delete(name);
                    } else {
                        Array.from(handlersForType).forEach(item => {
                            if (item.action === handlerFunction && (!contextObject || item.context === contextObject)) {
                                item.action = WorldView.Tools.alwaysFalse;
                                handlersForType.delete(item);
                            }
                        });
                        if (handlersForType.size === 0) {
                            currentListeners.delete(name);
                        }
                    }
                }
            });
            return this;
        },

        clearAllListeners() {
            listenerRegistry.delete(this);
            return this;
        },

        dispatchSignal(eventName, payload = {}) {
            if (!this.hasActiveListeners(eventName)) {
                return this;
            }

            const currentListeners = listenerRegistry.get(this);
            const handlersForType = currentListeners.get(eventName);

            const eventData = WorldView.Tools.mergeProperties({}, payload, { type: eventName, initiator: this });

            Array.from(handlersForType).forEach(item => {
                item.action.call(item.context, eventData);
            });
            return this;
        },

        attachOneTimeListener(eventNames, handlerFunction, contextObject) {
            if (WorldView.Tools.processObjectEntries(eventNames, this.attachOneTimeListener, this, handlerFunction, contextObject)) {
                return this;
            }

            const wrapper = WorldView.Tools.createBoundFunction(function() {
                this.detachListener(eventNames, handlerFunction, contextObject);
                this.detachListener(eventNames, wrapper, contextObject);
            }, this);

            return this.attachListener(eventNames, handlerFunction, contextObject).attachListener(eventNames, wrapper, contextObject);
        }
    };

    const _initHooksSymbol = Symbol('initHooks');
    const _initHooksCalledSymbol = Symbol('initHooksCalled');

    class BaseComponent {
        constructor(...args) {
            // Ensure prototype hooks are copied to instance for independent execution
            this[_initHooksSymbol] = (this.constructor.prototype[_initHooksSymbol] || []).slice();
            this.configuration = WorldView.Tools.mergeProperties({}, this.constructor.prototype.configuration, this.configuration);

            if (typeof this.prime === 'function') {
                this.prime(...args);
            }

            this.runSetupRoutines();
        }

        runSetupRoutines() {
            if (this[_initHooksCalledSymbol]) { return; }
            this[_initHooksCalledSymbol] = true;
            this[_initHooksSymbol].forEach(hook => hook.call(this));
        }

        static derive(properties) {
            const parentClass = this;

            const DerivedComponent = class extends parentClass {
                constructor(...args) {
                    super(...args);
                    if (properties.mixins) {
                        properties.mixins.forEach(mixin => WorldView.Tools.mergeProperties(this, mixin));
                    }
                }
            };

            if (properties.statics) {
                WorldView.Tools.mergeProperties(DerivedComponent, properties.statics);
                delete properties.statics;
            }

            // Merge prototype properties, ensuring configuration and hooks are inherited
            DerivedComponent.prototype.configuration = WorldView.Tools.mergeProperties(
                {},
                parentClass.prototype.configuration,
                properties.configuration
            );
            WorldView.Tools.mergeProperties(DerivedComponent.prototype, properties);
            delete DerivedComponent.prototype.mixins;
            delete DerivedComponent.prototype.configuration;

            DerivedComponent.prototype[_initHooksSymbol] = (parentClass.prototype[_initHooksSymbol] || []).slice();
            DerivedComponent.parentPrototype = parentClass.prototype;

            return DerivedComponent;
        }

        static incorporate(props) {
            WorldView.Tools.mergeProperties(this.prototype, props);
        }

        static addSetupRoutine(routine) {
            this.prototype[_initHooksSymbol] = this.prototype[_initHooksSymbol] || [];
            const actualRoutine = typeof routine === 'function' ? routine : function() {
                this[routine].apply(this, Array.prototype.slice.call(arguments, 1));
            };
            this.prototype[_initHooksSymbol].push(actualRoutine);
        }

        static updateDefaultConfiguration(newConfig) {
            this.prototype.configuration = WorldView.Tools.mergeProperties({}, this.prototype.configuration, newConfig);
        }
    }
    WorldView.BaseObject = BaseComponent;

    WorldView.mergeProperties = WorldView.Tools.mergeProperties;
    WorldView.createBoundFunction = WorldView.Tools.createBoundFunction;
    WorldView.assignObjectId = WorldView.Tools.assignObjectId;
    WorldView.configureObject = WorldView.Tools.configureObject;

    WorldView.EventDispatcher.on = WorldView.EventDispatcher.attachListener;
    WorldView.EventDispatcher.off = WorldView.EventDispatcher.detachListener;
    WorldView.EventDispatcher.once = WorldView.EventDispatcher.attachOneTimeListener;
    WorldView.EventDispatcher.trigger = WorldView.EventDispatcher.dispatchSignal;

})();