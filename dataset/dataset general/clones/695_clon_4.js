const DUMMY_DOM_ELEMENT_FOR_CHECK = typeof document !== 'undefined' ? document.createElement('div') : {};

const getVendorPrefixedStyleProperty = (styleObject, basePropertyName) => {
    const propertyCandidates = [
        basePropertyName,
        `webkit${basePropertyName[0].toUpperCase()}${basePropertyName.slice(1)}`,
        `moz${basePropertyName[0].toUpperCase()}${basePropertyName.slice(1)}`,
        `ms${basePropertyName[0].toUpperCase()}${basePropertyName.slice(1)}`
    ];
    for (const prop of propertyCandidates) {
        if (styleObject && typeof styleObject[prop] !== 'undefined') {
            return prop;
        }
    }
    return undefined;
};

const CSS_TOUCH_ACTION_KEY = getVendorPrefixedStyleProperty(DUMMY_DOM_ELEMENT_FOR_CHECK.style, 'touchAction');
const BROWSER_HAS_NATIVE_TOUCH_ACTION = CSS_TOUCH_ACTION_KEY !== undefined;

const BEHAVIOR_FLAGS = {
    DERIVE_FROM_RECOGNIZERS: 'calculate',
    DEFAULT_BEHAVIOR: 'auto',
    INTERACTION_OPTIMIZED: 'manipulation',
    PREVENT_ALL: 'none',
    PAN_X_AXIS_ONLY: 'pan-x',
    PAN_Y_AXIS_ONLY: 'pan-y'
};

const iterateCollection = (items, processCallback) => {
    if (Array.isArray(items)) {
        items.forEach(processCallback);
    } else if (items && typeof items.length === 'number' && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            processCallback(items[i], i, items);
        }
    }
};

const evaluateLogicGate = (conditionOrFunction, functionArguments) => {
    if (typeof conditionOrFunction === 'function') {
        return conditionOrFunction(...functionArguments);
    }
    return !!conditionOrFunction;
};

const checkStringInclusion = (mainText, subText) => mainText.includes(subText);

const HORIZONTAL_MOTION_MASK = 2;
const VERTICAL_MOTION_MASK = 4;

const consolidateTouchDirectives = (rawDirectives) => {
    const directiveList = rawDirectives.split(' ').filter(d => d);

    if (directiveList.includes(BEHAVIOR_FLAGS.PREVENT_ALL)) {
        return BEHAVIOR_FLAGS.PREVENT_ALL;
    }

    const hasXPan = directiveList.includes(BEHAVIOR_FLAGS.PAN_X_AXIS_ONLY);
    const hasYPan = directiveList.includes(BEHAVIOR_FLAGS.PAN_Y_AXIS_ONLY);

    if (hasXPan && hasYPan) {
        return `${BEHAVIOR_FLAGS.PAN_X_AXIS_ONLY} ${BEHAVIOR_FLAGS.PAN_Y_AXIS_ONLY}`;
    }
    if (hasXPan) {
        return BEHAVIOR_FLAGS.PAN_X_AXIS_ONLY;
    }
    if (hasYPan) {
        return BEHAVIOR_FLAGS.PAN_Y_AXIS_ONLY;
    }

    if (directiveList.includes(BEHAVIOR_FLAGS.INTERACTION_OPTIMIZED)) {
        return BEHAVIOR_FLAGS.INTERACTION_OPTIMIZED;
    }

    return BEHAVIOR_FLAGS.DEFAULT_BEHAVIOR;
};

class TouchBehaviorRegulator {
    #hostManager;
    #currentDirectiveSet;
    #targetElementStyle;

    constructor(managerInstance, initialDirective) {
        this.#hostManager = managerInstance;
        this.#targetElementStyle = managerInstance.element.style;
        this.applyDirective(initialDirective);
    }

    applyDirective(directive) {
        let finalDirective = directive;
        if (directive === BEHAVIOR_FLAGS.DERIVE_FROM_RECOGNIZERS) {
            finalDirective = this.calculateOptimalDirective();
        }

        if (BROWSER_HAS_NATIVE_TOUCH_ACTION) {
            this.#targetElementStyle[CSS_TOUCH_ACTION_KEY] = finalDirective;
        }
        this.#currentDirectiveSet = finalDirective.toLowerCase().trim();
    }

    reapplyConfiguredDirective() {
        this.applyDirective(this.#hostManager.options.touchAction);
    }

    calculateOptimalDirective() {
        const collectedDirectives = [];
        iterateCollection(this.#hostManager.recognizers, (recognizerComponent) => {
            if (evaluateLogicGate(recognizerComponent.options.enable, [recognizerComponent])) {
                collectedDirectives.push(recognizerComponent.getTouchAction());
            }
        });
        return consolidateTouchDirectives(collectedDirectives.join(' '));
    }

    interceptAndPreventDefaults(inputDetails) {
        if (BROWSER_HAS_NATIVE_TOUCH_ACTION) {
            return;
        }

        const sourceEventObject = inputDetails.srcEvent;
        const currentMotionDirection = inputDetails.offsetDirection;

        if (this.#hostManager.session.prevented) {
            sourceEventObject.preventDefault();
            return;
        }

        const activeDirectives = this.#currentDirectiveSet;
        const directiveBlocksAll = checkStringInclusion(activeDirectives, BEHAVIOR_FLAGS.PREVENT_ALL);
        const directiveAllowsPanY = checkStringInclusion(activeDirectives, BEHAVIOR_FLAGS.PAN_Y_AXIS_ONLY);
        const directiveAllowsPanX = checkStringInclusion(activeDirectives, BEHAVIOR_FLAGS.PAN_X_AXIS_ONLY);

        if (directiveBlocksAll ||
            (directiveAllowsPanY && (currentMotionDirection & HORIZONTAL_MOTION_MASK)) ||
            (directiveAllowsPanX && (currentMotionDirection & VERTICAL_MOTION_MASK))) {
            this.blockEventSource(sourceEventObject);
        }
    }

    blockEventSource(eventToBlock) {
        this.#hostManager.session.prevented = true;
        eventToBlock.preventDefault();
    }
}