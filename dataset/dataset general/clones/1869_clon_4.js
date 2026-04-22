const DEBUG_MODE_ACTIVE = false;
const XML_GRAPHICS_URI = 'http://www.w3.org/2000/svg';
const privateConstructorKey = Symbol('confidential_initializer_key');

function ensureCondition(checkValue, issueMessage) {
    if (DEBUG_MODE_ACTIVE) {
        if (!checkValue) {
            throw new Error(`Assertion Failed: ${issueMessage}`);
        }
    } else {
        if (!checkValue) {
            throw new Error(`Assertion Failed (debug mode off): ${issueMessage}`);
        }
    }
}

function generateEphemeralNode() {
    const rootElement = document.documentElement;
    if (rootElement && rootElement.namespaceURI === XML_GRAPHICS_URI) {
        return document.createElementNS(XML_GRAPHICS_URI, 'g');
    }
    return document.createElement('div');
}

const probeEnvironmentCapabilities = (() => {
    const testNode = generateEphemeralNode();
    testNode.style.cssText = 'width: calc(0px); width: -webkit-calc(0px);';

    const calcIdentifierMatch = testNode.style.width.match(/^(calc|-webkit-calc)/);
    const resolvedCalcFunction = calcIdentifierMatch ? calcIdentifierMatch[0] : '';

    const propertyChecker = (potentialProperties) => {
        for (const prop of potentialProperties) {
            if (prop in testNode.style) {
                return prop;
            }
        }
        return undefined;
    };

    const transformAttribute = propertyChecker(['transform', 'webkitTransform', 'msTransform']);
    const depthAttribute = propertyChecker(['perspective', 'webkitPerspective', 'msPerspective']);

    return new Map([
        ['calculationFunction', resolvedCalcFunction],
        ['transformAttribute', transformAttribute],
        ['transformOriginAttribute', transformAttribute ? transformAttribute + 'Origin' : undefined],
        ['depthAttribute', depthAttribute],
        ['depthOriginAttribute', depthAttribute ? depthAttribute + 'Origin' : undefined]
    ]);
})();

const attributePrefixResolver = new Map([
    ['transform', probeEnvironmentCapabilities.get('transformAttribute')],
    ['transformOrigin', probeEnvironmentCapabilities.get('transformOriginAttribute')],
    ['perspective', probeEnvironmentCapabilities.get('depthAttribute')],
    ['perspectiveOrigin', probeEnvironmentCapabilities.get('depthOriginAttribute')]
]);

function resolveVendorPrefix(attributeName) {
    return attributePrefixResolver.has(attributeName) ? attributePrefixResolver.get(attributeName) : attributeName;
}

const silencedWarnings = new Set();
const warnOfDeprecation = (featureName, expirationDate, advisoryText, isPlural) => {
    if (silencedWarnings.has(featureName)) {
        return;
    }

    const verbForm = isPlural ? 'are' : 'is';
    const currentDate = new Date();
    const gracePeriodEnd = new Date(expirationDate);
    gracePeriodEnd.setMonth(gracePeriodEnd.getMonth() + 3);

    const warningStrategy = new Map([
        [true, (date) => { // Condition: currentDate < date
            console.warn(`Motion API: '${featureName}' ${verbForm} deprecated and will cease functionality by ${date.toDateString()}. ${advisoryText}`);
            silencedWarnings.add(featureName);
        }],
        [false, (date) => { // Condition: currentDate >= date
            throw new Error(`'${featureName}' ${verbForm} no longer supported. ${advisoryText}`);
        }]
    ]);
    warningStrategy.get(currentDate < gracePeriodEnd)(gracePeriodEnd);
};

const fabricateInstance = (basePrototype, propertyDefinitions) => {
    const newObject = Object.create(basePrototype);
    Object.keys(propertyDefinitions).forEach(propName => {
        Object.defineProperty(newObject, propName, Object.getOwnPropertyDescriptor(propertyDefinitions, propName));
    });
    return newObject;
};

const unimplementedRoutine = () => {
    throw new Error('Abstract routine not implemented.');
};

const establishEphemeralProperty = (targetObject, propertyName, getterFunc, setterFunc) => {
    const accessDescriptor = {
        get: getterFunc,
        configurable: true,
        enumerable: true
    };
    if (setterFunc) {
        accessDescriptor.set = setterFunc;
    }
    Object.defineProperty(targetObject, propertyName, accessDescriptor);
};

class BoundsViolationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BoundsViolationError';
    }
}

const isSet = (val) => typeof val !== 'undefined';
const hasValue = (val) => isSet(val) && (val !== null);

// --- Motion Configuration (replaces TimingDict and Timing) ---

const motionAttributeDefaults = new Map([
    ['initialDelay', 0],
    ['finalDelay', 0],
    ['fillMode', 'auto'],
    ['startProgress', 0],
    ['cycleCount', 1],
    ['activeDuration', 'auto'],
    ['speedMultiplier', 1],
    ['playDirection', 'normal'],
    ['curveStyle', 'linear']
]);

const createMotionAttributeMap = (inputParameters) => {
    const attributeMap = new Map(motionAttributeDefaults);
    if (typeof inputParameters === 'object' && inputParameters !== null) {
        const attributeKeyMap = new Map([
            ['delay', 'initialDelay'], ['endDelay', 'finalDelay'], ['fill', 'fillMode'],
            ['iterationStart', 'startProgress'], ['iterations', 'cycleCount'], ['duration', 'activeDuration'],
            ['playbackRate', 'speedMultiplier'], ['direction', 'playDirection'], ['easing', 'curveStyle']
        ]);
        for (const originalKey in inputParameters) {
            if (attributeKeyMap.has(originalKey)) {
                attributeMap.set(attributeKeyMap.get(originalKey), inputParameters[originalKey]);
            }
        }
    } else if (hasValue(inputParameters)) {
        attributeMap.set('activeDuration', Number(inputParameters));
    }
    return attributeMap;
};

const MotionCurveFactory = {
    generateFromText: (styleText, itemContext) => {
        return () => `ComputedCurve(${styleText})`;
    }
};

const MotionConfiguration = function(initKey, parameterSet, updateNotifier) {
    if (initKey !== privateConstructorKey) {
        throw new TypeError('Unauthorized constructor for MotionConfiguration');
    }

    const internalData = {
        _attributeMap: createMotionAttributeMap(parameterSet),
        _notificationHandler: updateNotifier,
        _cachedMotionEvaluator: null,
        _associatedItem: null
    };

    const configProxyHandler = {
        get(targetData, propertyAlias) {
            switch (propertyAlias) {
                case 'computedCycles':
                    const cycles = targetData._attributeMap.get('cycleCount');
                    return cycles < 0 ? 1 : cycles;
                case 'resolvedDuration':
                    const durationVal = targetData._attributeMap.get('activeDuration');
                    return typeof durationVal === 'number' ? durationVal : 'auto';
                case 'motionEvaluator':
                    if (!targetData._cachedMotionEvaluator) {
                        targetData._cachedMotionEvaluator = MotionCurveFactory.generateFromText(
                            targetData._attributeMap.get('curveStyle'),
                            targetData._associatedItem
                        );
                    }
                    return targetData._cachedMotionEvaluator;
                case 'replicate':
                    const replicatedParams = Object.fromEntries(targetData._attributeMap);
                    return new MotionConfiguration(
                        privateConstructorKey,
                        replicatedParams,
                        targetData._notificationHandler
                    );
                case 'invalidateMotionEvaluator':
                    return () => { targetData._cachedMotionEvaluator = null; };

                case 'initialDelay': return targetData._attributeMap.get('initialDelay');
                case 'finalDelay': return targetData._attributeMap.get('finalDelay');
                case 'fillMode': return targetData._attributeMap.get('fillMode');
                case 'startProgress': return targetData._attributeMap.get('startProgress');
                case 'cycleCount': return targetData._attributeMap.get('cycleCount');
                case 'activeDuration': return targetData._attributeMap.get('activeDuration');
                case 'speedMultiplier': return targetData._attributeMap.get('speedMultiplier');
                case 'playDirection': return targetData._attributeMap.get('playDirection');
                case 'curveStyle': return targetData._attributeMap.get('curveStyle');

                default:
                    return Reflect.get(targetData, propertyAlias);
            }
        },
        set(targetData, propertyAlias, newValue) {
            let internalKey;
            let finalValue = newValue;

            switch (propertyAlias) {
                case 'initialDelay': internalKey = 'initialDelay'; break;
                case 'finalDelay': internalKey = 'finalDelay'; break;
                case 'fillMode': internalKey = 'fillMode'; break;
                case 'startProgress': internalKey = 'startProgress'; break;
                case 'cycleCount': internalKey = 'cycleCount'; break;
                case 'activeDuration': internalKey = 'activeDuration'; break;
                case 'speedMultiplier': internalKey = 'speedMultiplier'; break;
                case 'playDirection': internalKey = 'playDirection'; break;
                case 'curveStyle': internalKey = 'curveStyle'; break;
                default:
                    return Reflect.set(targetData, propertyAlias, newValue);
            }

            if (hasValue(newValue)) {
                if (internalKey === 'activeDuration' && newValue === 'auto') {
                    // 'auto' is allowed for duration
                } else if (['initialDelay', 'finalDelay', 'startProgress', 'cycleCount',
                            'activeDuration', 'speedMultiplier'].includes(internalKey)) {
                    finalValue = Number(newValue);
                }
                targetData._attributeMap.set(internalKey, finalValue);
            } else {
                targetData._attributeMap.set(internalKey, motionAttributeDefaults.get(internalKey));
            }

            if (internalKey === 'curveStyle') {
                targetData._cachedMotionEvaluator = null;
            }
            targetData._notificationHandler();
            return true;
        }
    };

    return new Proxy(internalData, configProxyHandler);
};

// --- Temporal Context (replaces AnimationTimeline) ---

let initialDocumentTime = performance.now();
const getClockTime = () => performance.now();

const calculateRelativeTime = (current, start) => current - start;

const activeMotionControllers = new Set();
let sortedControllersFlag = false;
let controllerIdentifier = 0;

const beginStateModification = () => {};
const endStateModification = (action) => { action && action(); };
const triggerAnimationRefresh = () => {};
const requireStyleRecalculation = () => {};
const repeatLastAnimationTick = () => {};

class NotificationSystem {
    constructor() {
        this._eventListeners = new Map();
        this._onListeners = new Map();
    }

    addSubscription(eventType, listenerCallback) {
        if (typeof listenerCallback !== 'function') return;
        if (!this._eventListeners.has(eventType)) {
            this._eventListeners.set(eventType, []);
        }
        const listeners = this._eventListeners.get(eventType);
        if (!listeners.includes(listenerCallback)) {
            listeners.push(listenerCallback);
        }
    }
    removeSubscription(eventType, listenerCallback) {
        if (!this._eventListeners.has(eventType)) return;
        const listeners = this._eventListeners.get(eventType);
        const index = listeners.indexOf(listenerCallback);
        if (index !== -1) {
            listeners.splice(index, 1);
            if (this._onListeners.has(eventType)) {
                const onHandlerInfo = this._onListeners.get(eventType);
                if (index < onHandlerInfo.index) {
                    onHandlerInfo.index -= 1;
                }
            }
        }
    }
    setSingleListener(eventType, listenerCallback) {
        if (typeof listenerCallback === 'function') {
            const currentListeners = this._eventListeners.get(eventType) || [];
            this._onListeners.set(eventType, {
                callback: listenerCallback,
                index: currentListeners.length
            });
        } else {
            this._onListeners.delete(eventType);
        }
    }
    getSingleListener(eventType) {
        return this._onListeners.has(eventType) ? this._onListeners.get(eventType).callback : null;
    }
    hasSubscribers(eventType) {
        return (this._eventListeners.has(eventType) && this._eventListeners.get(eventType).length > 0) ||
               this._onListeners.has(eventType);
    }
    dispatchNotification(eventType, eventObject, targetInstance) {
        let callbacksToExecute = [];
        if (this._eventListeners.has(eventType)) {
            callbacksToExecute = callbacksToExecute.concat(this._eventListeners.get(eventType).slice());
        }
        if (this._onListeners.has(eventType)) {
            const onHandlerInfo = this._onListeners.get(eventType);
            callbacksToExecute.splice(onHandlerInfo.index, 0, onHandlerInfo.callback);
        }
        Promise.resolve().then(() => {
            for (const handler of callbacksToExecute) {
                handler.call(targetInstance, eventObject);
            }
        });
    }
}

class CustomEventPrototype {
    constructor(type, target) {
        this._type = type;
        this._target = target;
        this._phase = 0; // Event.NONE equivalent
        this._timestamp = getClockTime();
    }
    get type() { return this._type; }
    get target() { return this._target; }
    get currentTarget() { return this._target; }
    get eventPhase() { return this._phase; }
    get bubbles() { return false; }
    get cancelable() { return false; }
    get timeStamp() { return this._timestamp; }
    get defaultPrevented() { return false; }

    initializeEvent(targetInstance) {
        this._target = targetInstance;
        this._phase = 2; // Event.AT_TARGET equivalent
        this._timestamp = getClockTime();
    }
}


const TemporalContext = function(initKey) {
    if (initKey !== privateConstructorKey) {
        throw new TypeError('Unauthorized constructor for TemporalContext');
    }
    this._startTimeReference = initialDocumentTime;
};

TemporalContext.prototype = {
    get currentProgress() {
        if (this._startTimeReference === undefined) {
            this._startTimeReference = initialDocumentTime;
            if (this._startTimeReference === undefined) {
                return null;
            }
        }
        return calculateRelativeTime(getClockTime(), this._startTimeReference);
    },
    get effectiveProgress() {
        return this.currentProgress || 0;
    },
    activateMotion: function(sourceItem) {
        return new MotionController(privateConstructorKey, sourceItem, this);
    },
    retrieveActiveControllers: function() {
        return Array.from(activeMotionControllers).filter(controller => !controller.isBeyondActivePeriod());
    },
    convertTimeToContext: function(otherTimeValue, otherContext) {
        if ((this.currentProgress === null) || (otherContext.currentProgress === null)) {
            return null;
        } else {
            return otherTimeValue + otherContext._startTimeReference - this._startTimeReference;
        }
    },
    _pauseAllForTest: function(pausePoint) {
        activeMotionControllers.forEach(controller => {
            controller.pauseExecution();
            controller.updateCurrentTime(pausePoint);
        });
    }
};

// --- Motion Controller (replaces AnimationPlayer) ---

const MotionController = function(initKey, motionSource, temporalContext) {
    if (initKey !== privateConstructorKey) {
        throw new TypeError('Unauthorized constructor for MotionController');
    }

    beginStateModification();
    try {
        const controllerState = {
            _registeredWithContext: false,
            _uniqueIdentifier: controllerIdentifier++,
            _temporalContext: temporalContext,
            _initialPlayTime: temporalContext.currentProgress === null ? 0 : temporalContext.currentProgress,
            _offsetLag: 0.0,
            _executionPaused: false,
            _frozenTimePoint: null,
            _priorProgress: null,
            _speedFactor: 1.0,
            _hasProcessedTick: false,
            _motionSource: motionSource,
            _lastKnownProgress: undefined,
            _completionFlag: false,
            _notificationSystem: new NotificationSystem()
        };

        const controllerProxyHandler = {
            get(targetState, prop) {
                switch (prop) {
                    case 'motionSource': return targetState._motionSource;
                    case 'timelineContext': return targetState._temporalContext;
                    case 'isPaused': return targetState._executionPaused;
                    case 'playbackSpeed': return targetState._speedFactor;
                    case 'notifier': return targetState._notificationSystem;

                    case 'currentTimeProgress':
                        const currentClockTimeFromTimeline = targetState._temporalContext.effectiveProgress;
                        const baseTimeComputed = (currentClockTimeFromTimeline - targetState._initialPlayTime) * targetState._speedFactor;

                        const unlimitedProgress = baseTimeComputed - targetState._offsetLag;

                        let effectiveLagToApply;
                        const pauseTimePoint = targetState._frozenTimePoint !== null ? targetState._frozenTimePoint : 0;
                        const sourceEndTime = targetState._motionSource ? targetState._motionSource.endTime : 0;

                        if (targetState._executionPaused) {
                            effectiveLagToApply = baseTimeComputed - pauseTimePoint;
                        } else if (targetState._speedFactor < 0 && unlimitedProgress <= 0) {
                            if (targetState._frozenTimePoint === null) {
                                targetState._frozenTimePoint = Math.min(targetState._priorProgress || 0, 0);
                            }
                            effectiveLagToApply = baseTimeComputed - targetState._frozenTimePoint;
                        } else if (targetState._speedFactor > 0 && unlimitedProgress >= sourceEndTime) {
                            if (targetState._frozenTimePoint === null) {
                                targetState._frozenTimePoint = Math.max(targetState._priorProgress || 0, sourceEndTime);
                            }
                            effectiveLagToApply = baseTimeComputed - targetState._frozenTimePoint;
                        } else {
                            effectiveLagToApply = targetState._offsetLag;
                        }

                        targetState._priorProgress = baseTimeComputed - effectiveLagToApply;
                        return targetState._priorProgress;

                    case 'isBeyondActivePeriod':
                        // Placeholder: Original logic for _isPastEndOfActiveInterval not fully provided.
                        return false;

                    case 'pauseExecution':
                        return () => {
                            if (!targetState._executionPaused) {
                                targetState._executionPaused = true;
                                targetState._frozenTimePoint = targetState.currentTimeProgress;
                                beginStateModification();
                                endStateModification(repeatLastAnimationTick);
                            }
                        };
                    case 'resumeExecution':
                        return () => {
                            if (targetState._executionPaused) {
                                targetState._executionPaused = false;
                                if (targetState._frozenTimePoint !== null) {
                                    targetState._offsetLag = (targetState._temporalContext.effectiveProgress - targetState._initialPlayTime) * targetState._speedFactor - targetState._frozenTimePoint;
                                    targetState._frozenTimePoint = null;
                                }
                                beginStateModification();
                                endStateModification(triggerAnimationRefresh);
                            }
                        };
                    case 'updateCurrentTime':
                        return (newTime) => {
                            beginStateModification();
                            try {
                                const sourceEndTime = targetState._motionSource ? targetState._motionSource.endTime : 0;
                                if (targetState._executionPaused ||
                                    (targetState._speedFactor > 0 && newTime >= sourceEndTime) ||
                                    (targetState._speedFactor < 0 && newTime <= 0)) {
                                    targetState._frozenTimePoint = newTime;
                                } else {
                                    targetState._frozenTimePoint = null;
                                    targetState._offsetLag = (targetState._temporalContext.effectiveProgress - targetState._initialPlayTime) * targetState._speedFactor - newTime;
                                }
                                triggerAnimationRefresh();
                            } finally {
                                endStateModification(repeatLastAnimationTick);
                            }
                        };
                    case 'assignMotionSource':
                        return (newSource) => {
                            beginStateModification();
                            try {
                                if (hasValue(targetState._motionSource)) {
                                    // Assuming _detach method exists on source
                                    targetState._motionSource._detach && targetState._motionSource._detach(this);
                                }
                                targetState._motionSource = newSource;
                                if (hasValue(targetState._motionSource)) {
                                    // Assuming _attach method exists on source
                                    targetState._motionSource._attach && targetState._motionSource._attach(this);
                                    triggerAnimationRefresh();
                                }
                                // Original _checkForLegacyHandlers() logic would go here
                            } finally {
                                endStateModification(repeatLastAnimationTick);
                            }
                        };

                    default:
                        return Reflect.get(targetState, prop);
                }
            },
            set(targetState, prop, value) {
                switch (prop) {
                    case 'motionSource':
                        targetState.assignMotionSource(value);
                        return true;
                    case 'currentTimeProgress':
                        targetState.updateCurrentTime(value);
                        return true;
                    case 'playbackSpeed':
                        targetState._speedFactor = value;
                        triggerAnimationRefresh();
                        return true;
                    default:
                        return Reflect.set(targetState, prop, value);
                }
            }
        };

        const proxyInstance = new Proxy(controllerState, controllerProxyHandler);

        if (motionSource) {
            // Original calls _checkForLegacyHandlers, _update, maybeRestartAnimation
            // motionSource._attach(proxyInstance); // Handled by assignMotionSource if it's the first set
        }
        // Original calls _checkForLegacyHandlers(); // Would be a method on proxyInstance
        // Original calls initializeEventTarget(this); // Handled by NotificationSystem in constructor

        activeMotionControllers.add(proxyInstance);
        sortedControllersFlag = false;
        triggerAnimationRefresh();

        return proxyInstance;
    } finally {
        endStateModification(requireStyleRecalculation);
    }
};

(function() {
    'use strict';
})();