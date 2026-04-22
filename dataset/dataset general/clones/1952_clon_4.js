var GlobalToolkit = GlobalToolkit || {};

const ElementComponentMap = new WeakMap();

GlobalToolkit.BehaviorRegistry = {
    _behaviorStore: new Map(),
    register: function(aspectId, traitKey, actionsList) {
        if (!this._behaviorStore.has(aspectId)) {
            this._behaviorStore.set(aspectId, new Map());
        }
        this._behaviorStore.get(aspectId).set(traitKey, actionsList);
    },
    invoke: function(subjectObject, aspectId, traitKey, parameters) {
        const aspectBehaviors = this._behaviorStore.get(aspectId);
        if (!aspectBehaviors) return;

        const traitActions = aspectBehaviors.get(traitKey);
        if (!traitActions) return;

        for (const actionInfo of traitActions) {
            const [conditionProperty, executeAction] = actionInfo;
            if (subjectObject.configOptions && subjectObject.configOptions[conditionProperty]) {
                executeAction.apply(subjectObject.associatedNode, parameters);
            }
        }
    }
};

GlobalToolkit.checkContainment = function(outerElement, innerElement) {
    if (!outerElement || !innerElement || outerElement === innerElement) return false;

    let currentParent = innerElement.parentNode;
    while (currentParent) {
        if (currentParent === outerElement) {
            return true;
        }
        currentParent = currentParent.parentNode;
    }
    return false;
};

GlobalToolkit.hasOverflowContent = function(targetNode, orientationHint) {
    const computedStyle = getComputedStyle(targetNode);
    if (computedStyle.overflow === 'hidden' || computedStyle.overflowX === 'hidden' || computedStyle.overflowY === 'hidden') {
        return false;
    }

    let scrollDimensionProp, clientDimensionProp, scrollPositionProp;
    if (orientationHint === 'horizontal') {
        scrollDimensionProp = 'scrollWidth';
        clientDimensionProp = 'clientWidth';
        scrollPositionProp = 'scrollLeft';
    } else {
        scrollDimensionProp = 'scrollHeight';
        clientDimensionProp = 'clientHeight';
        scrollPositionProp = 'scrollTop';
    }

    if (targetNode[scrollDimensionProp] > targetNode[clientDimensionProp]) {
        return true;
    }

    const initialScrollValue = targetNode[scrollPositionProp];
    targetNode[scrollPositionProp] = 1;
    const hasScroll = targetNode[scrollPositionProp] > 0;
    targetNode[scrollPositionProp] = initialScrollValue;
    return hasScroll;
};

GlobalToolkit.isCoordinateWithinRange = function(coordValue, lowerBound, extent) {
    return (coordValue > lowerBound) && (coordValue < (lowerBound + extent));
};

GlobalToolkit.isPointInsideRectangle = function(pointY, pointX, rectTop, rectLeft, rectHeight, rectWidth) {
    return GlobalToolkit.isCoordinateWithinRange(pointY, rectTop, rectHeight) &&
           GlobalToolkit.isCoordinateWithinRange(pointX, rectLeft, rectWidth);
};

GlobalToolkit.KeyMappings = new Map([
    ['BACKSPACE_KEY', 8], ['CAPS_LOCK_KEY', 20], ['COMMA_KEY', 188], ['CONTROL_KEY', 17],
    ['DELETE_KEY', 46], ['DOWN_ARROW_KEY', 40], ['END_KEY', 35], ['ENTER_KEY', 13],
    ['ESCAPE_KEY', 27], ['HOME_KEY', 36], ['INSERT_KEY', 45], ['LEFT_ARROW_KEY', 37],
    ['NUMPAD_ADDITION', 107], ['NUMPAD_DECIMAL_POINT', 110], ['NUMPAD_DIVISION', 111],
    ['NUMPAD_ENTER_KEY', 108], ['NUMPAD_MULTIPLICATION', 106], ['NUMPAD_SUBTRACTION', 109],
    ['PAGE_DOWN_KEY', 34], ['PAGE_UP_KEY', 33], ['PERIOD_KEY', 190], ['RIGHT_ARROW_KEY', 39],
    ['SHIFT_KEY', 16], ['SPACE_BAR', 32], ['TAB_KEY', 9], ['UP_ARROW_KEY', 38]
]);

function broadcastActivity(element, activityName, details = {}) {
    const activitySignal = new CustomEvent(activityName, {
        bubbles: true,
        cancelable: true,
        detail: details
    });
    element.dispatchEvent(activitySignal);
}

GlobalToolkit.removeNodeWithNotification = function(elementToRemove) {
    const allDescendantsAndSelf = Array.from(elementToRemove.querySelectorAll('*')).concat(elementToRemove);
    for (const node of allDescendantsAndSelf) {
        broadcastActivity(node, 'componentdestruction');
    }
    if (elementToRemove.parentNode) {
        elementToRemove.parentNode.removeChild(elementToRemove);
    }
};

GlobalToolkit._selectionPreventer = function(event) {
    event.preventDefault();
    return false;
};

GlobalToolkit.allowUserSelection = function(targetElement) {
    targetElement.style.userSelect = '';
    targetElement.style.webkitUserSelect = '';
    targetElement.style.MozUserSelect = '';
    targetElement.removeAttribute('unselectable');
    targetElement.removeEventListener('selectstart', GlobalToolkit._selectionPreventer);
};

GlobalToolkit.preventUserSelection = function(targetElement) {
    targetElement.style.userSelect = 'none';
    targetElement.style.webkitUserSelect = 'none';
    targetElement.style.MozUserSelect = 'none';
    targetElement.setAttribute('unselectable', 'on');
    targetElement.addEventListener('selectstart', GlobalToolkit._selectionPreventer, false);
};

GlobalToolkit.findClosestScrollableContainer = function(startingNode) {
    let currentNode = startingNode;
    while (currentNode && currentNode !== document.body && currentNode !== document.documentElement) {
        const currentStyle = getComputedStyle(currentNode);
        const positionType = currentStyle.position;
        const overflowProperties = currentStyle.overflow + currentStyle.overflowY + currentStyle.overflowX;

        const isScrollable = (/(auto|scroll)/).test(overflowProperties);
        const isPositioned = (/(relative|absolute|fixed)/).test(positionType);

        if (isScrollable && isPositioned) {
            return currentNode;
        }
        currentNode = currentNode.parentNode;
    }
    return document.documentElement;
};

const _activeComponentDefinitions = new Map();
const _componentInstanceCache = new WeakMap();

function isBehaviorAccessor(componentIdentity, actionLabel, inputParameters) {
    const definition = _activeComponentDefinitions.get(componentIdentity);
    if (!definition) return false;

    const accessorBehaviors = new Set(definition.accessorMethodNames || []);
    const mutatorAccessorBehaviors = new Set(definition.mutatorAccessorMethodNames || []);

    if (accessorBehaviors.has(actionLabel)) {
        return true;
    }
    if (inputParameters.length === 1 && typeof inputParameters[0] === 'string' && mutatorAccessorBehaviors.has(actionLabel)) {
        return true;
    }
    return false;
}

class RootComponent {
    constructor(nodeReference, initialSettings) {
        if (!nodeReference) throw new Error('A DOM node must be supplied for component initialization.');

        this.associatedNode = nodeReference;
        this.componentIdentity = this.constructor.componentKey;
        this.signalPrefix = this.constructor.signalPrefix || this.constructor.componentKey;
        this.baseStyleClass = this.constructor.baseStyleClass;

        const componentSpecificDefaults = this.constructor.defaultSettings || {};
        const globalComponentDefaults = RootComponent.globalDefaultSettings || {};

        this.configOptions = { ...globalComponentDefaults, ...componentSpecificDefaults, ...initialSettings };

        _componentInstanceCache.set(nodeReference, this);
        this.configureLifecycleHandlers();
        this.initializeCustomBehavior();
    }

    configureLifecycleHandlers() {
        this._applySettingHandler = (evt) => {
            if (evt.target === this.associatedNode) {
                this.updateSetting(evt.detail.key, evt.detail.value);
            }
        };
        this._retrieveSettingHandler = (evt) => {
            if (evt.target === this.associatedNode) {
                evt.detail.result = this.querySetting(evt.detail.key);
            }
        };
        this._destroyComponentHandler = (evt) => {
             if (evt.target === this.associatedNode) {
                this.terminateCustomBehavior();
            }
        };

        this.associatedNode.addEventListener('settingupdate.' + this.componentIdentity, this._applySettingHandler);
        this.associatedNode.addEventListener('settingquery.' + this.componentIdentity, this._retrieveSettingHandler);
        this.associatedNode.addEventListener('componentdestruction', this._destroyComponentHandler);
    }

    initializeCustomBehavior() {
        // To be overridden by specific components
    }

    terminateCustomBehavior() {
        _componentInstanceCache.delete(this.associatedNode);
        this.associatedNode.removeEventListener('settingupdate.' + this.componentIdentity, this._applySettingHandler);
        this.associatedNode.removeEventListener('settingquery.' + this.componentIdentity, this._retrieveSettingHandler);
        this.associatedNode.removeEventListener('componentdestruction', this._destroyComponentHandler);

        this.associatedNode.classList.remove(this.baseStyleClass + '-inactive', this.namespace + '-state-inactive');
        this.associatedNode.removeAttribute('aria-disabled');
    }

    adjustSetting(key, value) {
        let settingsMap = key;
        if (typeof key === 'string') {
            if (value === undefined) {
                return this.querySetting(key);
            }
            settingsMap = { [key]: value };
        }

        for (const prop in settingsMap) {
            if (Object.prototype.hasOwnProperty.call(settingsMap, prop)) {
                this.updateSetting(prop, settingsMap[prop]);
            }
        }
    }

    querySetting(key) {
        return this.configOptions[key];
    }

    updateSetting(key, value) {
        this.configOptions[key] = value;

        if (key === 'disabled') {
            const actionVerb = value ? 'add' : 'remove';
            this.associatedNode.classList[actionVerb](
                this.baseStyleClass + '-inactive',
                this.namespace + '-state-inactive'
            );
            this.associatedNode.setAttribute('aria-disabled', value);
        }
    }

    activateComponent() {
        this.updateSetting('disabled', false);
    }

    deactivateComponent() {
        this.updateSetting('disabled', true);
    }

    signalEvent(eventType, triggeringEvent, eventData) {
        const fullEventName = (eventType === this.signalPrefix)
            ? eventType : this.signalPrefix + eventType;

        const emittedEvent = new CustomEvent(fullEventName, {
            bubbles: true,
            cancelable: true,
            detail: {
                originalEvent: triggeringEvent,
                payload: eventData
            }
        });

        // Simplified copying of original event properties
        if (triggeringEvent) {
            for (const prop of ['type', 'target', 'currentTarget', 'relatedTarget', 'pageX', 'pageY', 'which', 'button', 'key', 'code']) {
                if (triggeringEvent[prop] !== undefined) {
                    emittedEvent.detail.originalEvent[prop] = triggeringEvent[prop];
                }
            }
        }

        this.associatedNode.dispatchEvent(emittedEvent);

        const callbackResult = this.configOptions[eventType] && this.configOptions[eventType].call(this.associatedNode, emittedEvent, eventData);
        return !(callbackResult === false || emittedEvent.defaultPrevented);
    }
}

RootComponent.globalDefaultSettings = {
    disabled: false
};

GlobalToolkit.createComponentType = function(fullComponentName, behaviorPrototype) {
    const [componentGroup, componentDesignation] = fullComponentName.split(".");
    const combinedDesignation = componentGroup + '-' + componentDesignation;

    const ComponentConstructor = class extends RootComponent {};

    ComponentConstructor.componentKey = componentDesignation;
    ComponentConstructor.namespace = componentGroup;
    ComponentConstructor.signalPrefix = behaviorPrototype.signalPrefix || componentDesignation;
    ComponentConstructor.baseStyleClass = combinedDesignation;
    ComponentConstructor.defaultSettings = behaviorPrototype.defaultSettings || {};
    ComponentConstructor.accessorMethodNames = behaviorPrototype.accessorMethodNames || [];
    ComponentConstructor.mutatorAccessorMethodNames = behaviorPrototype.mutatorAccessorMethodNames || ['adjustSetting'];

    Object.assign(ComponentConstructor.prototype, behaviorPrototype);

    _activeComponentDefinitions.set(componentDesignation, ComponentConstructor);

    const publicInteractionFunction = function(targetNodes, operationIdentifier, ...operationParameters) {
        let interactionResults = [];
        const nodesArray = Array.isArray(targetNodes) ? targetNodes : [targetNodes];

        for (const currentNode of nodesArray) {
            let componentInstance = _componentInstanceCache.get(currentNode);

            if (typeof operationIdentifier === 'object' || !operationIdentifier) {
                if (!componentInstance) {
                    componentInstance = new ComponentConstructor(currentNode, operationIdentifier);
                    componentInstance.initializeCustomBehavior();
                }
            } else if (typeof operationIdentifier === 'string') {
                if (isBehaviorAccessor(componentDesignation, operationIdentifier, operationParameters)) {
                    if (componentInstance && typeof componentInstance[operationIdentifier] === 'function') {
                        interactionResults.push(componentInstance[operationIdentifier](...operationParameters));
                    } else {
                        interactionResults.push(undefined);
                    }
                } else {
                    if (componentInstance && typeof componentInstance[operationIdentifier] === 'function') {
                        componentInstance[operationIdentifier](...operationParameters);
                    }
                }
            }
        }
        return interactionResults.filter(r => r !== undefined).length > 0 ? (interactionResults.length === 1 ? interactionResults[0] : interactionResults) : targetNodes;
    };

    GlobalToolkit[componentGroup] = GlobalToolkit[componentGroup] || {};
    GlobalToolkit[componentGroup][componentDesignation] = publicInteractionFunction;

    return publicInteractionFunction;
};

GlobalToolkit.MouseInteractionHandler = {
    _initMouseBehavior: function(componentRef, mouseSettings) {
        componentRef._mouseState = {
            distanceThreshold: mouseSettings.distance || 1,
            delayDuration: mouseSettings.delay || 0,
            cancelSelector: mouseSettings.cancel || '',
            isTrackingActive: false,
            blockNextClick: false,
            firstClickEvent: null,
            delayTimerId: null,
            delayConditionMet: false,
            moveCallback: null,
            upCallback: null
        };
        componentRef.associatedNode.addEventListener('mousedown', (e) => this._onMouseDown(componentRef, e));
        componentRef.associatedNode.addEventListener('click', (e) => this._onClick(componentRef, e));

        if (navigator.userAgent.indexOf("MSIE") > -1 || navigator.userAgent.indexOf("Trident") > -1) {
            componentRef._originalUnselectableAttribute = componentRef.associatedNode.getAttribute('unselectable');
            componentRef.associatedNode.setAttribute('unselectable', 'on');
        }
    },

    _teardownMouseBehavior: function(componentRef) {
        componentRef.associatedNode.removeEventListener('mousedown', (e) => this._onMouseDown(componentRef, e));
        componentRef.associatedNode.removeEventListener('click', (e) => this._onClick(componentRef, e));

        if (componentRef._mouseState.moveCallback) {
            document.removeEventListener('mousemove', componentRef._mouseState.moveCallback);
            document.removeEventListener('mouseup', componentRef._mouseState.upCallback);
        }

        if (navigator.userAgent.indexOf("MSIE") > -1 || navigator.userAgent.indexOf("Trident") > -1) {
            if (componentRef._originalUnselectableAttribute !== null) {
                componentRef.associatedNode.setAttribute('unselectable', componentRef._originalUnselectableAttribute);
            } else {
                componentRef.associatedNode.removeAttribute('unselectable');
            }
        }
        clearTimeout(componentRef._mouseState.delayTimerId);
    },

    _onMouseDown: function(componentRef, event) {
        if (event.mouseHandled) return;

        if (componentRef._mouseState.isTrackingActive) {
            this._onMouseUp(componentRef, event);
        }

        componentRef._mouseState.firstClickEvent = event;

        const isPrimaryButton = (event.which === 1 || event.button === 0);
        const isTargetCanceled = componentRef._mouseState.cancelSelector && event.target.closest(componentRef._mouseState.cancelSelector);

        if (!isPrimaryButton || isTargetCanceled || (componentRef.onMouseCapture && componentRef.onMouseCapture(event) === false)) {
            return true;
        }

        componentRef._mouseState.delayConditionMet = !componentRef._mouseState.delayDuration;
        if (!componentRef._mouseState.delayConditionMet) {
            componentRef._mouseState.delayTimerId = setTimeout(() => {
                componentRef._mouseState.delayConditionMet = true;
            }, componentRef._mouseState.delayDuration);
        }

        if (this._checkDistance(componentRef, event) && componentRef._mouseState.delayConditionMet) {
            if (componentRef.onMouseStart && componentRef.onMouseStart(event) === false) {
                event.preventDefault();
                return true;
            }
            componentRef._mouseState.isTrackingActive = true;
        }

        componentRef._mouseState.moveCallback = (e) => this._onMouseMove(componentRef, e);
        componentRef._mouseState.upCallback = (e) => this._onMouseUp(componentRef, e);
        document.addEventListener('mousemove', componentRef._mouseState.moveCallback, false);
        document.addEventListener('mouseup', componentRef._mouseState.upCallback, false);

        event.preventDefault();

        event.mouseHandled = true;
        return true;
    },

    _onMouseMove: function(componentRef, event) {
        if ((navigator.userAgent.indexOf("MSIE") > -1 || navigator.userAgent.indexOf("Trident") > -1) && event.button === 0) {
            return this._onMouseUp(componentRef, event);
        }

        if (componentRef._mouseState.isTrackingActive) {
            if (componentRef.onMouseDrag) {
                componentRef.onMouseDrag(event);
            }
            event.preventDefault();
            return false;
        }

        if (this._checkDistance(componentRef, event) && componentRef._mouseState.delayConditionMet) {
            if (componentRef.onMouseStart && componentRef.onMouseStart(componentRef._mouseState.firstClickEvent, event) === false) {
                this._onMouseUp(componentRef, event);
            } else {
                componentRef._mouseState.isTrackingActive = true;
                if (componentRef.onMouseDrag) {
                    componentRef.onMouseDrag(event);
                }
            }
        }
        return !componentRef._mouseState.isTrackingActive;
    },

    _onMouseUp: function(componentRef, event) {
        document.removeEventListener('mousemove', componentRef._mouseState.moveCallback, false);
        document.removeEventListener('mouseup', componentRef._mouseState.upCallback, false);

        if (componentRef._mouseState.isTrackingActive) {
            componentRef._mouseState.isTrackingActive = false;
            componentRef._mouseState.blockNextClick = (event.target === componentRef._mouseState.firstClickEvent.target);
            if (componentRef.onMouseStop) {
                componentRef.onMouseStop(event);
            }
        }
        clearTimeout(componentRef._mouseState.delayTimerId);
        return false;
    },

    _onClick: function(componentRef, event) {
        if (componentRef._mouseState.blockNextClick) {
            componentRef._mouseState.blockNextClick = false;
            event.stopImmediatePropagation();
            event.preventDefault();
            return false;
        }
    },

    _checkDistance: function(componentRef, event) {
        const startEvent = componentRef._mouseState.firstClickEvent;
        if (!startEvent) return false;
        return (Math.max(
                Math.abs(startEvent.pageX - event.pageX),
                Math.abs(startEvent.pageY - event.pageY)
            ) >= componentRef._mouseState.distanceThreshold
        );
    }
};

// WAI-ARIA normalization and jQuery selector extensions are omitted.
// These functionalities are too tightly integrated with jQuery's internal
// mechanisms and DOM manipulation patterns to be genuinely cloned with a
// distinct strategy without reimplementing a significant portion of jQuery itself.