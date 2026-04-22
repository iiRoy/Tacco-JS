(function(global) {

    // --- Utility Functions (replacing jQuery utils) ---

    let uniqueIdCounter = 0;
    const obtainUniqueId = () => ++uniqueIdCounter;

    const isSimpleObject = (val) => Object.prototype.toString.call(val) === '[object Object]';
    const isExecutable = (val) => typeof val === 'function';

    const deepObjectMerge = (primaryTarget, ...sources) => {
        if (!primaryTarget || !isSimpleObject(primaryTarget)) {
            primaryTarget = {};
        }
        for (const source of sources) {
            if (source && isSimpleObject(source)) {
                for (const key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        const value = source[key];
                        if (isSimpleObject(value)) {
                            primaryTarget[key] = deepObjectMerge(isSimpleObject(primaryTarget[key]) ? primaryTarget[key] : {}, value);
                        } else {
                            primaryTarget[key] = value;
                        }
                    }
                }
            }
        }
        return primaryTarget;
    };

    const noOperation = () => {};

    const dispatchCustomEvent = (targetElement, eventKey, eventPayload, originalSourceEvent) => {
        const customEvt = new CustomEvent(eventKey, {
            detail: eventPayload,
            bubbles: true,
            cancelable: true
        });
        if (originalSourceEvent) {
            for (const prop in originalSourceEvent) {
                if (!(prop in customEvt) && Object.prototype.hasOwnProperty.call(originalSourceEvent, prop)) {
                    try {
                        customEvt[prop] = originalSourceEvent[prop];
                    } catch (e) { /* Read-only property, ignore */ }
                }
            }
        }
        Object.defineProperty(customEvt, 'target', { value: targetElement, writable: false });

        targetElement.dispatchEvent(customEvt);
        return !customEvt.defaultPrevented;
    };

    // --- Element Cleanup Hook (replacing $.cleanData) ---
    const originalDomRemoveChild = Element.prototype.removeChild;
    Element.prototype.removeChild = function(childNode) {
        if (childNode.nodeType === 1) {
            dispatchCustomEvent(childNode, 'componentRemoval', {});
        }
        return originalDomRemoveChild.call(this, childNode);
    };

    // --- Component Instance Registry (replacing $.data) ---
    const componentInstanceMap = new WeakMap();

    // --- Core Behavioral Component Class (replacing $.Widget) ---
    class BehavioralComponentCore {
        constructor() {
            this.componentDesignation = 'core';
            this.componentEventQualifier = '';
            this.defaultCreationElement = '<div>';
            this.componentParameters = {
                isDisabled: false,
                oncreate: null
            };
            this.activeDomElement = null;
            this.uniqueComponentId = obtainUniqueId();
            this.componentEventScope = `.${this.componentDesignation}${this.uniqueComponentId}`;
            this.registeredEventHandlers = new Set();
            this.hoverEffectElements = new Set();
            this.focusEffectElements = new Set();
            this.associatedDocument = null;
            this.associatedWindow = null;
        }

        // Equivalent to _createWidget
        _initiateComponent(initialParameters, domElementInput) {
            const resolvedElement = domElementInput || this.defaultCreationElement;
            this.activeDomElement = (typeof resolvedElement === 'string') ?
                document.createElement(resolvedElement) :
                resolvedElement;

            this.componentParameters = deepObjectMerge({},
                this.componentParameters,
                this._getInitialCreationParameters(),
                initialParameters
            );

            if (this.activeDomElement !== this) {
                componentInstanceMap.set(this.activeDomElement, this);

                this._attachEventHandler(true, this.activeDomElement, {
                    'componentRemoval': (evt) => {
                        if (evt.target === this.activeDomElement) {
                            this.disposeComponent();
                        }
                    }
                });

                this.associatedDocument = this.activeDomElement.ownerDocument || document;
                this.associatedWindow = this.associatedDocument.defaultView || window;
            }

            this._constructComponentElements();
            this._broadcastComponentEvent('create', null, this._getCreationEventData());
            this._finalizeComponentSetup();
        }

        _getInitialCreationParameters() { return noOperation(); }
        _getCreationEventData() { return noOperation(); }
        _constructComponentElements() { noOperation(); }
        _finalizeComponentSetup() { noOperation(); }

        // Equivalent to destroy
        disposeComponent() {
            this._performSpecificDisposal();

            this._detachAllEventHandlers();

            componentInstanceMap.delete(this.activeDomElement);

            if (this.activeDomElement) {
                this.getComponentRootElement()
                    .removeAttribute('aria-disabled');
                this.getComponentRootElement()
                    .classList.remove(
                        `${this.componentDesignation}-disabled`,
                        'ui-state-disabled'
                    );
            }

            this.hoverEffectElements.forEach(el => el.classList.remove('ui-state-hover'));
            this.focusEffectElements.forEach(el => el.classList.remove('ui-state-focus'));
        }
        _performSpecificDisposal() { noOperation(); }

        // Equivalent to widget()
        getComponentRootElement() {
            return this.activeDomElement;
        }

        // Equivalent to option()
        queryUpdateComponentParameters(key, value) {
            let currentParameters = key;

            if (arguments.length === 0) {
                return deepObjectMerge({}, this.componentParameters);
            }

            if (typeof key === 'string') {
                currentParameters = {};
                const segments = key.split('.');
                key = segments.shift();

                if (segments.length) {
                    let traversalPoint = currentParameters[key] = deepObjectMerge({}, this.componentParameters[key]);
                    for (let i = 0; i < segments.length - 1; i++) {
                        traversalPoint[segments[i]] = traversalPoint[segments[i]] || {};
                        traversalPoint = traversalPoint[segments[i]];
                    }
                    key = segments.pop();
                    if (value === undefined) {
                        return traversalPoint[key] === undefined ? null : traversalPoint[key];
                    }
                    traversalPoint[key] = value;
                } else {
                    if (value === undefined) {
                        return this.componentParameters[key] === undefined ? null : this.componentParameters[key];
                    }
                    currentParameters[key] = value;
                }
            }

            this._applyComponentParameterUpdates(currentParameters);
            return this;
        }

        // Equivalent to _setOptions
        _applyComponentParameterUpdates(newParameters) {
            for (const key in newParameters) {
                this._applySingleComponentParameter(key, newParameters[key]);
            }
            return this;
        }

        // Equivalent to _setOption
        _applySingleComponentParameter(key, value) {
            this.componentParameters[key] = value;

            if (key === 'isDisabled') {
                this.getComponentRootElement()
                    .classList.toggle(`${this.componentDesignation}-disabled ui-state-disabled`, !!value);
                if (value) {
                    this.getComponentRootElement().setAttribute('aria-disabled', 'true');
                    this.hoverEffectElements.forEach(el => el.classList.remove('ui-state-hover'));
                    this.focusEffectElements.forEach(el => el.classList.remove('ui-state-focus'));
                } else {
                    this.getComponentRootElement().removeAttribute('aria-disabled');
                }
            }
            return this;
        }

        // Equivalent to enable()
        activateFunctionality() {
            return this._applySingleComponentParameter('isDisabled', false);
        }
        // Equivalent to disable()
        deactivateFunctionality() {
            return this._applySingleComponentParameter('isDisabled', true);
        }

        // Equivalent to _on
        _attachEventHandler(checkDisabledFlag, targetElementRef, handlerMappings) {
            let effectiveHandlerMappings = handlerMappings;
            let effectiveTargetElement = targetElementRef;
            let performDisabledCheck = checkDisabledFlag;

            if (typeof checkDisabledFlag !== 'boolean') {
                effectiveHandlerMappings = targetElementRef;
                effectiveTargetElement = checkDisabledFlag;
                performDisabledCheck = false;
            }
            if (!effectiveHandlerMappings) {
                effectiveHandlerMappings = effectiveTargetElement;
                effectiveTargetElement = this.activeDomElement;
            }

            const elementsToAttach = Array.isArray(effectiveTargetElement) ? effectiveTargetElement : [effectiveTargetElement];

            elementsToAttach.forEach(el => {
                for (const eventSignature in effectiveHandlerMappings) {
                    const originalAction = effectiveHandlerMappings[eventSignature];
                    const [eventNamePart, cssSelector] = eventSignature.split(/\s+(.*)/s).filter(Boolean);

                    const namespacedEventKey = eventNamePart + this.componentEventScope;

                    const actionWrapper = (evt) => {
                        if (!performDisabledCheck && (this.componentParameters.isDisabled === true || evt.currentTarget.classList.contains('ui-state-disabled'))) {
                            return;
                        }
                        let resolvedTarget = evt.target;
                        if (cssSelector) {
                            let current = evt.target;
                            while (current && current !== el) {
                                if (current.matches(cssSelector)) {
                                    resolvedTarget = current;
                                    break;
                                }
                                current = current.parentElement;
                            }
                            if (current === el && !current.matches(cssSelector)) {
                                return;
                            }
                            if (!current || current === el) {
                                return;
                            }
                        }

                        const incomingArguments = Array.from(arguments);
                        const executableAction = typeof originalAction === 'string' ?
                            this[originalAction] : originalAction;

                        if (isExecutable(executableAction)) {
                            return executableAction.apply(this, [evt].concat(incomingArguments.slice(1)));
                        } else {
                            console.warn(`BehavioralComponentCore: Action for event '${eventSignature}' is not an executable function or method name.`);
                        }
                    };

                    el.addEventListener(namespacedEventKey, actionWrapper, { capture: true });
                    this.registeredEventHandlers.add({ element: el, namespacedEventKey, actionWrapper });
                }
            });
        }

        // Equivalent to _off
        _detachEventHandler(targetElementRef, eventKey) {
            const fullEventKey = (eventKey || "").split(" ").map(e => e + this.componentEventScope).join(" ");
            this.registeredEventHandlers.forEach(bound => {
                if ((!targetElementRef || bound.element === targetElementRef) &&
                    (!eventKey || fullEventKey.includes(bound.namespacedEventKey))) {
                    bound.element.removeEventListener(bound.namespacedEventKey, bound.actionWrapper, { capture: true });
                    this.registeredEventHandlers.delete(bound);
                }
            });
        }

        _detachAllEventHandlers() {
            this.registeredEventHandlers.forEach(bound => {
                bound.element.removeEventListener(bound.namespacedEventKey, bound.actionWrapper, { capture: true });
            });
            this.registeredEventHandlers.clear();
        }

        // Equivalent to _delay
        deferActionExecution(actionToPerform, delayMilliseconds) {
            const currentInstance = this;
            const actionWrapper = () => {
                const actualAction = typeof actionToPerform === 'string' ? currentInstance[actionToPerform] : actionToPerform;
                if (isExecutable(actualAction)) {
                    return actualAction.apply(currentInstance, arguments);
                }
            };
            return setTimeout(actionWrapper, delayMilliseconds || 0);
        }

        // Equivalent to _hoverable
        applyHoverState(targetElement) {
            const elements = Array.isArray(targetElement) ? targetElement : [targetElement];
            elements.forEach(el => {
                this.hoverEffectElements.add(el);
                this._attachEventHandler(el, {
                    'mouseenter': (evt) => evt.currentTarget.classList.add('ui-state-hover'),
                    'mouseleave': (evt) => evt.currentTarget.classList.remove('ui-state-hover')
                });
            });
        }

        // Equivalent to _focusable
        applyFocusState(targetElement) {
            const elements = Array.isArray(targetElement) ? targetElement : [targetElement];
            elements.forEach(el => {
                this.focusEffectElements.add(el);
                this._attachEventHandler(el, {
                    'focusin': (evt) => evt.currentTarget.classList.add('ui-state-focus'),
                    'focusout': (evt) => evt.currentTarget.classList.remove('ui-state-focus')
                });
            });
        }

        // Equivalent to _trigger
        _broadcastComponentEvent(eventCategory, originalSourceEvent, eventPayload) {
            const eventName = (eventCategory === this.componentEventQualifier ?
                eventCategory :
                this.componentEventQualifier + eventCategory).toLowerCase();

            const registeredCallback = this.componentParameters[`on${eventCategory}`];

            const defaultPreventionStatus = !dispatchCustomEvent(this.activeDomElement, eventName, eventPayload, originalSourceEvent);

            return !(isExecutable(registeredCallback) &&
                registeredCallback.apply(this.activeDomElement, [originalSourceEvent].concat(eventPayload)) === false ||
                defaultPreventionStatus);
        }
    }

    // Static properties for tracking descendants
    BehavioralComponentCore._descendantComponents = [];

    // Add show/hide equivalent methods
    const animationTransitionMap = {
        displayComponent: 'fadeIn',
        hideComponent: 'fadeOut'
    };
    for (const actionName in animationTransitionMap) {
        const defaultAnimationType = animationTransitionMap[actionName];
        BehavioralComponentCore.prototype[`_${actionName}`] = function(elementToAnimate, animationOptions, completionCallback) {
            let effectiveAnimationOptions = animationOptions;
            if (typeof effectiveAnimationOptions === 'string') {
                effectiveAnimationOptions = { effect: effectiveAnimationOptions };
            }
            const animationCategory = !effectiveAnimationOptions ?
                actionName :
                effectiveAnimationOptions === true || typeof effectiveAnimationOptions === 'number' ?
                    defaultAnimationType :
                    effectiveAnimationOptions.effect || defaultAnimationType;

            effectiveAnimationOptions = effectiveAnimationOptions || {};
            if (typeof effectiveAnimationOptions === 'number') {
                effectiveAnimationOptions = { duration: effectiveAnimationOptions };
            }

            // Simplified animation logic, focusing on structure
            if (animationCategory === 'fadeIn') {
                elementToAnimate.style.opacity = 0;
                elementToAnimate.style.display = '';
                setTimeout(() => {
                    elementToAnimate.style.opacity = 1;
                    if (isExecutable(completionCallback)) completionCallback.call(this);
                }, effectiveAnimationOptions.duration || 400);
            } else if (animationCategory === 'fadeOut') {
                elementToAnimate.style.opacity = 1;
                setTimeout(() => {
                    elementToAnimate.style.opacity = 0;
                    elementToAnimate.style.display = 'none';
                    if (isExecutable(completionCallback)) completionCallback.call(this);
                }, effectiveAnimationOptions.duration || 400);
            } else {
                if (actionName === 'displayComponent') {
                    elementToAnimate.style.display = '';
                } else {
                    elementToAnimate.style.display = 'none';
                }
                if (isExecutable(completionCallback)) completionCallback.call(this);
            }
        };
    }

    // --- Component Definition Function (replacing $.widget) ---
    const defineBehavioralComponent = (componentIdentity, parentClassRef, prototypeDefinitionMap) => {
        let parentConstructor = parentClassRef;
        let actualPrototypeDefinition = prototypeDefinitionMap;

        if (!actualPrototypeDefinition) {
            actualPrototypeDefinition = parentClassRef;
            parentConstructor = BehavioralComponentCore;
        }

        const [componentNamespacePart, componentNamePart] = componentIdentity.split('.');
        const fullComponentIdentity = `${componentNamespacePart}-${componentNamePart}`;

        const priorConstructor = global[componentNamespacePart] && global[componentNamespacePart][componentNamePart];

        class ComponentImplementation extends parentConstructor {
            constructor(settings, domElement) {
                if (!new.target) {
                    return new ComponentImplementation(settings, domElement);
                }
                super();
                this.componentDesignation = componentNamePart;
                this.componentNamespace = componentNamespacePart;
                this.fullComponentIdentity = fullComponentIdentity;

                if (arguments.length) {
                    this._initiateComponent(settings, domElement);
                }
            }
        }

        ComponentImplementation.version = actualPrototypeDefinition.version;
        ComponentImplementation._originalPrototypeDefinition = deepObjectMerge({}, actualPrototypeDefinition);
        ComponentImplementation._descendantComponents = [];

        const augmentedComponentPrototype = {};
        for (const prop in actualPrototypeDefinition) {
            if (Object.prototype.hasOwnProperty.call(actualPrototypeDefinition, prop)) {
                const value = actualPrototypeDefinition[prop];
                if (isExecutable(value) && isExecutable(parentConstructor.prototype[prop])) {
                    augmentedComponentPrototype[prop] = (function() {
                        const baseMethodReference = parentConstructor.prototype[prop];
                        const baseMethodApplyReference = (args) => baseMethodReference.apply(this, args);

                        return function(...args) {
                            const originalBaseMethod = this.ancestorMethod;
                            const originalBaseMethodApply = this.ancestorMethodApply;

                            this.ancestorMethod = baseMethodReference;
                            this.ancestorMethodApply = baseMethodApplyReference;

                            const executionResult = value.apply(this, args);

                            this.ancestorMethod = originalBaseMethod;
                            this.ancestorMethodApply = originalBaseMethodApply;

                            return executionResult;
                        };
                    })();
                } else {
                    augmentedComponentPrototype[prop] = value;
                }
            }
        }

        Object.assign(ComponentImplementation.prototype, deepObjectMerge(
            {},
            new parentConstructor().componentParameters,
            parentConstructor.prototype,
            augmentedComponentPrototype,
            {
                constructor: ComponentImplementation,
                componentNamespace: componentNamespacePart,
                componentDesignation: componentNamePart,
                fullComponentIdentity: fullComponentIdentity,
                componentEventQualifier: priorConstructor ?
                    (priorConstructor.prototype.componentEventQualifier || componentNamePart) :
                    componentNamePart
            }
        ));
        ComponentImplementation.prototype.componentParameters = deepObjectMerge({}, parentConstructor.prototype.componentParameters, augmentedComponentPrototype.componentParameters);


        if (priorConstructor) {
            priorConstructor._descendantComponents.forEach(childComponent => {
                const childPrototype = childComponent.prototype;
                defineBehavioralComponent(
                    `${childPrototype.componentNamespace}.${childPrototype.componentDesignation}`,
                    ComponentImplementation,
                    childComponent._originalPrototypeDefinition
                );
            });
            delete priorConstructor._descendantComponents;
        } else {
            parentConstructor._descendantComponents.push(ComponentImplementation);
        }

        global[componentNamespacePart] = global[componentNamespacePart] || {};
        global[componentNamespacePart][componentNamePart] = ComponentImplementation;

        integrateBehavioralPlugin(componentNamePart, ComponentImplementation);

        return ComponentImplementation;
    };

    // --- Component Integration Bridge (replacing $.widget.bridge) ---
    const integrateBehavioralPlugin = (pluginName, componentFactory) => {
        const fullDesignation = componentFactory.prototype.fullComponentIdentity || pluginName;

        global.InteractionKit = global.InteractionKit || {};

        global.InteractionKit[pluginName] = function(selector, options) {
            const selectedElements = document.querySelectorAll(selector);
            let invocationArgs = Array.from(arguments).slice(1);

            const isMethodCallRequest = typeof options === 'string';
            let resultValue = selectedElements;

            let combinedOptions = options;
            if (!isMethodCallRequest && invocationArgs.length > 1) {
                combinedOptions = deepObjectMerge({}, ...invocationArgs);
            }

            if (isMethodCallRequest) {
                const requestedMethodName = options;
                let methodExecuted = false;
                for (let i = 0; i < selectedElements.length; i++) {
                    const el = selectedElements[i];
                    const componentInstance = componentInstanceMap.get(el);
                    if (!componentInstance) {
                        console.error(`Cannot invoke methods on ${pluginName} before initialization; attempted to call method '${requestedMethodName}'`);
                        continue;
                    }
                    if (!isExecutable(componentInstance[requestedMethodName]) || requestedMethodName.startsWith('_')) {
                        console.error(`No such method '${requestedMethodName}' for ${pluginName} component instance`);
                        continue;
                    }
                    methodExecuted = true;
                    const methodOutcome = componentInstance[requestedMethodName].apply(componentInstance, invocationArgs.slice(1));
                    if (methodOutcome !== componentInstance && methodOutcome !== undefined) {
                        resultValue = methodOutcome;
                        break;
                    }
                }
                return methodExecuted ? resultValue : undefined;
            } else {
                selectedElements.forEach(el => {
                    let componentInstance = componentInstanceMap.get(el);
                    if (componentInstance) {
                        componentInstance.queryUpdateComponentParameters(combinedOptions || {})._finalizeComponentSetup();
                    } else {
                        componentInstanceMap.set(el, new componentFactory(combinedOptions, el));
                    }
                });
                return resultValue;
            }
        };
    };

    global.defineBehavioralComponent = defineBehavioralComponent;
    global.BehavioralComponentCore = BehavioralComponentCore;
    global.integrateBehavioralPlugin = integrateBehavioralPlugin;

})(window);