// Modernized Unobtrusive Range Input Control System
// Version 1.0 (Derived from frequency decoder v2.4 logic)
// (C) 2023 [Your Name/Organization] - All Rights Reserved.
// This code is a derivative work, maintaining similar core functionality.

const RangeControlSystem = (function() {
    const CLASS_PREFIX = 'rc-';
    let activeWidgetInstances = {};
    let nextWidgetIdentifier = 0;
    let globalScrollInputAllowed = true;

    // --- Core Utility Functions ---

    // Disables system-wide mouse wheel input processing for all controls.
    const disableGlobalScrollHandling = () => {
        globalScrollInputAllowed = false;
    };

    // Attaches an event listener to an element.
    const attachDomListener = (targetElem, eventType, handlerFn, useCapture = false) => {
        if (targetElem && typeof targetElem.addEventListener === 'function') {
            targetElem.addEventListener(eventType, handlerFn, useCapture);
        }
    };

    // Detaches an event listener from an element.
    const detachDomListener = (targetElem, eventType, handlerFn, useCapture = false) => {
        if (targetElem && typeof targetElem.removeEventListener === 'function') {
            targetElem.removeEventListener(eventType, handlerFn, useCapture);
        }
    };

    // Prevents default event behavior and stops propagation.
    const preventEventDefault = (eventObj) => {
        if (!eventObj) return false;
        eventObj.stopPropagation();
        eventObj.preventDefault();
        return false;
    };

    // Combines multiple NodeList-like objects into a single array of elements.
    const mergeNodeCollections = (...nodeLists) => {
        if (!nodeLists || nodeLists.length === 0) return [];
        return nodeLists.flatMap(list => Array.from(list || []));
    };

    // Parses class names to extract and format callback functions.
    const extractEventHandlers = (classString) => {
        const handlerMap = {};
        if (!classString || typeof classString !== 'string') return handlerMap;

        const callbackRegex = new RegExp(`(${CLASS_PREFIX}widget_handler_(update|create|destroy|redraw|move|focus|blur)_)([^\s|$]+)`, 'ig');
        let match;
        while ((match = callbackRegex.exec(classString)) !== null) {
            const handlerName = match[3].replace(/-/g, ".");
            const eventType = match[2];

            let resolvedFunc = null;
            try {
                if (handlerName.includes(".")) {
                    const parts = handlerName.split('.');
                    let currentScope = window;
                    for (const part of parts) {
                        if (currentScope === undefined || currentScope === null) {
                            currentScope = undefined;
                            break;
                        }
                        currentScope = currentScope[part];
                    }
                    resolvedFunc = currentScope;
                } else {
                    resolvedFunc = window[handlerName];
                }

                if (typeof resolvedFunc === 'function') {
                    if (!handlerMap[eventType]) {
                        handlerMap[eventType] = [];
                    }
                    handlerMap[eventType].push(resolvedFunc);
                }
            } catch (err) {
                console.error(`RangeControlSystem: Error resolving handler '${handlerName}' for event '${eventType}':`, err);
            }
        }
        return handlerMap;
    };

    // Extracts and formats custom CSS class names from input's class attribute.
    const parseCustomClasses = (classString) => {
        if (!classString || typeof classString !== 'string') return "";
        const classRegex = new RegExp(`(${CLASS_PREFIX}widget_class_([a-zA-Z0-9_\\-]+))`, 'ig');
        const customClasses = [];
        let match;
        while ((match = classRegex.exec(classString)) !== null) {
            customClasses.push(match[2]);
        }
        return customClasses.join(" ");
    };

    // --- Main Control Logic ---

    // Instantiates a single range control widget.
    const initializeSingleWidget = (widgetOptions) => {
        if (!widgetOptions.inputElement || !widgetOptions.inputElement.id) {
            console.warn("RangeControlSystem: Input element or its ID is missing for widget creation. Skipping.");
            return false;
        }
        if (activeWidgetInstances[widgetOptions.inputElement.id]) {
             disposeRangeWidget(widgetOptions.inputElement.id);
        }
        activeWidgetInstances[widgetOptions.inputElement.id] = new RangeHandleWidget(widgetOptions);
        return true;
    };

    // Initializes all eligible input/select elements on the page as range controls.
    const setupAllControls = (optionalTargetElement = null) => {
        const rangeClassPattern = new RegExp(`${CLASS_PREFIX}range_([-]?\\d+(\\.\\d+)?){1}_([-]?\\d+(\\.\\d+)?){1}`, 'i');
        const incrementClassPattern = new RegExp(`${CLASS_PREFIX}inc_([-]?\\d+(\\.\\d+)?){1}`);
        const maxIncrementClassPattern = new RegExp(`${CLASS_PREFIX}maxinc_([-]?\\d+(\\.\\d+)?){1}`);
        const kbIncrementClassPattern = new RegExp(`${CLASS_PREFIX}kbinc_([-]?\\d+(\\.\\d+)?){1}`);
        const kbHopClassPattern = new RegExp(`${CLASS_PREFIX}kbhop_([-]?\\d+(\\.\\d+)?){1}`);

        const targetElements = optionalTargetElement && optionalTargetElement.tagName && optionalTargetElement.tagName.match(/input|select/i)
            ? [optionalTargetElement]
            : mergeNodeCollections(document.getElementsByTagName('input'), document.getElementsByTagName('select'));

        for (const inputElem of targetElements) {
            const tagName = inputElem.tagName.toLowerCase();
            const classAttr = inputElem.className;

            const isInputTextControl = tagName === "input" && inputElem.type === "text" && (classAttr.match(rangeClassPattern) || classAttr.includes(`${CLASS_PREFIX}slider`));
            const isSelectControl = tagName === "select" && classAttr.includes(`${CLASS_PREFIX}slider`);

            if (isInputTextControl || isSelectControl) {
                if (!optionalTargetElement && inputElem.id && document.getElementById(`${CLASS_PREFIX}widget-${inputElem.id}`)) {
                    continue;
                }

                if (!inputElem.id) {
                    inputElem.id = `${CLASS_PREFIX}id-${nextWidgetIdentifier++}`;
                }

                const widgetOptions = {
                    inputElement: inputElem,
                    valueRange: [0, 100],
                    increment: '1',
                    maxIncrement: null,
                    keyboardIncrement: '1',
                    keyboardHop: null,
                    eventHandlers: extractEventHandlers(classAttr),
                    customClasses: parseCustomClasses(classAttr),
                    enableAnimation: classAttr.includes(`${CLASS_PREFIX}tween`),
                    isVertical: classAttr.includes(`${CLASS_PREFIX}vertical`),
                    hideSourceInput: classAttr.includes(`${CLASS_PREFIX}hide_input`),
                    allowDirectJump: classAttr.includes(`${CLASS_PREFIX}jump`),
                    fullAccessibility: classAttr.includes(`${CLASS_PREFIX}full_aria`),
                    noScrollWheel: classAttr.includes(`${CLASS_PREFIX}disable_mousewheel`)
                };

                const extractAndParse = (pattern, prefix) => {
                    const match = classAttr.match(pattern);
                    return match ? parseFloat(match[0].replace(prefix, "").replace("d", ".")) : null;
                };

                widgetOptions.increment = extractAndParse(incrementClassPattern, `${CLASS_PREFIX}inc_`) || '1';
                widgetOptions.maxIncrement = extractAndParse(maxIncrementClassPattern, `${CLASS_PREFIX}maxinc_`);
                widgetOptions.keyboardIncrement = extractAndParse(kbIncrementClassPattern, `${CLASS_PREFIX}kbinc_`) || '1';
                widgetOptions.keyboardHop = extractAndParse(kbHopClassPattern, `${CLASS_PREFIX}kbhop_`);

                if (tagName === "select") {
                    widgetOptions.valueRange = [0, inputElem.options.length - 1];
                } else if (classAttr.match(rangeClassPattern)) {
                    const rangeMatch = classAttr.match(rangeClassPattern)[0].replace(`${CLASS_PREFIX}range_`, "").replace(/d/g, ".").split("_");
                    widgetOptions.valueRange = [parseFloat(rangeMatch[0]), parseFloat(rangeMatch[1])];
                }

                initializeSingleWidget(widgetOptions);
            }
        }
        return true;
    };

    // Disposes of a single range control widget by its input ID.
    const disposeRangeWidget = (inputId) => {
        if (activeWidgetInstances[inputId]) {
            activeWidgetInstances[inputId].destroyWidget();
            delete activeWidgetInstances[inputId];
            return true;
        }
        return false;
    };

    // Disposes of all active range control widgets.
    const clearAllWidgets = () => {
        for (const id in activeWidgetInstances) {
            if (Object.prototype.hasOwnProperty.call(activeWidgetInstances, id)) {
                activeWidgetInstances[id].destroyWidget();
            }
        }
        activeWidgetInstances = {};
    };

    // Cleans up global event listeners on page unload.
    const teardownSystem = () => {
        clearAllWidgets();
        detachDomListener(window, "unload", teardownSystem);
        detachDomListener(window, "resize", adjustAllWidgetLayouts);
        deregisterInitialLoadHandler();
    };

    // Recalculates dimensions and positions for all widgets on window resize.
    const adjustAllWidgetLayouts = () => {
        for (const id in activeWidgetInstances) {
            if (Object.prototype.hasOwnProperty.call(activeWidgetInstances, id)) {
                activeWidgetInstances[id].recalculateLayout();
            }
        }
    };

    // Forces an update of all widget visual positions.
    const synchronizeAllVisuals = () => {
        for (const id in activeWidgetInstances) {
            if (Object.prototype.hasOwnProperty.call(activeWidgetInstances, id)) {
                activeWidgetInstances[id].refreshVisualState();
            }
        }
    };

    // Removes the initial page load event handler.
    const deregisterInitialLoadHandler = () => {
        detachDomListener(window, "load", setupAllControls);
    };

    // --- RangeHandleWidget Constructor (Core Slider Logic) ---

    function RangeHandleWidget(options) {
        const inputElement = options.inputElement;
        const inputTagName = inputElement.tagName.toLowerCase();

        const configuredMinValue = +options.valueRange[0];
        const configuredMaxValue = +options.valueRange[1];
        const valueSpan = Math.abs(configuredMaxValue - configuredMinValue);

        let effectiveIncrementStep = inputTagName === "select" ? 1 : parseFloat(options.increment) || 1;
        let effectiveMaxIncrement = parseFloat(options.maxIncrement) || effectiveIncrementStep * 2;
        let effectiveKeyboardIncrement = parseFloat(options.keyboardIncrement) || 1;
        let effectiveKeyboardHop = parseFloat(options.keyboardHop) || effectiveKeyboardIncrement * 2;

        const decimalPrecision = (effectiveIncrementStep.toString().includes("."))
            ? effectiveIncrementStep.toString().split(".")[1].length
            : 0;

        const totalSteps = Math.ceil(valueSpan / effectiveIncrementStep);

        const enableSmoothAnimation = !!options.enableAnimation;
        const enableFullAccessibility = !!options.fullAccessibility;
        const shouldHideSourceInput = !!options.hideSourceInput;
        const enableDirectJump = enableSmoothAnimation ? false : !!options.allowDirectJump;
        const isVerticalOrientation = !!options.isVertical;
        const widgetEventHandlers = options.eventHandlers;
        const widgetCustomClasses = options.customClasses;
        const disableWidgetScroll = !!options.noScrollWheel;

        let currentAnimationTimer = null;
        let isKeyboardInputEnabled = true;
        let containerHeightPx = 0;
        let containerWidthPx = 0;
        let maxThumbPixelOffset = 0;
        let thumbCurrentPosition = 0;
        let thumbTargetPixelPosition = 0;
        let mouseDragStartOffset = 0;
        let pixelStepForMaxInc = 0;
        let singleStepPixelSize = 0;

        if (configuredMaxValue < configuredMinValue) {
            effectiveIncrementStep = -effectiveIncrementStep;
            effectiveMaxIncrement = -effectiveMaxIncrement;
            effectiveKeyboardIncrement = -effectiveKeyboardIncrement;
            effectiveKeyboardHop = -effectiveKeyboardHop;
        }

        let mainWidgetWrapper, trackContainer, thumbHandleElement;

        // --- Private Helper Functions ---

        const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

        const updateInputAndTrigger = (newValue, eventType = "update") => {
            let formattedValue = parseFloat(newValue).toFixed(decimalPrecision);
            if (decimalPrecision === 0) formattedValue = Math.round(parseFloat(newValue));
            formattedValue = parseFloat(formattedValue);

            if (inputTagName === "select") {
                inputElement.selectedIndex = clamp(Math.round(formattedValue), 0, inputElement.options.length - 1);
            } else {
                inputElement.value = formattedValue;
            }

            if (typeof Event === 'function') {
                inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                const changeEvent = document.createEvent('HTMLEvents');
                changeEvent.initEvent('change', true, true);
                inputElement.dispatchEvent(changeEvent);
            }

            triggerEventCallback(eventType);
        };

        const triggerEventCallback = (type) => {
            const currentInputValue = inputTagName === "select" ? inputElement.options[inputElement.selectedIndex].value : inputElement.value;
            const callbackPayload = { targetElement: inputElement, currentValue: currentInputValue };

            if (widgetEventHandlers[type]) {
                widgetEventHandlers[type].forEach(func => func(callbackPayload));
            }
        };

        const syncValueToPixels = (explicitValue = null) => {
            let valueToMap = explicitValue;
            if (valueToMap === null) {
                valueToMap = inputTagName === "select" ? inputElement.selectedIndex : parseFloat(inputElement.value);
                if (isNaN(valueToMap)) {
                    valueToMap = configuredMinValue;
                }
            }
            valueToMap = clamp(valueToMap, configuredMinValue, configuredMaxValue);

            let pixelCalc;
            if (isVerticalOrientation) {
                pixelCalc = (valueToMap - configuredMinValue) / valueSpan * maxThumbPixelOffset;
                pixelCalc = maxThumbPixelOffset - pixelCalc;
            } else {
                pixelCalc = (valueToMap - configuredMinValue) / valueSpan * maxThumbPixelOffset;
            }

            thumbTargetPixelPosition = clamp(pixelCalc, 0, maxThumbPixelOffset);
            applyThumbAnimation();
            updateInputAndTrigger(valueToMap, "move");
        };

        const syncPixelsToValue = (pixelOffset) => {
            thumbCurrentPosition = clamp(pixelOffset, 0, maxThumbPixelOffset);

            let calculatedValue;
            if (isVerticalOrientation) {
                calculatedValue = (maxThumbPixelOffset - thumbCurrentPosition) / maxThumbPixelOffset * valueSpan + configuredMinValue;
            } else {
                calculatedValue = thumbCurrentPosition / maxThumbPixelOffset * valueSpan + configuredMinValue;
            }

            calculatedValue = Math.round(calculatedValue / effectiveIncrementStep) * effectiveIncrementStep;
            calculatedValue = parseFloat(calculatedValue.toFixed(decimalPrecision));

            updateInputAndTrigger(calculatedValue, "move");
            applyThumbAnimation();
        };

        const snapPixelToIncrement = (rawPixelOffset) => {
            const tempValue = isVerticalOrientation
                ? (maxThumbPixelOffset - rawPixelOffset) / maxThumbPixelOffset * valueSpan + configuredMinValue
                : rawPixelOffset / maxThumbPixelOffset * valueSpan + configuredMinValue;

            const snappedValue = Math.round(tempValue / effectiveIncrementStep) * effectiveIncrementStep;
            const snappedPixelOffset = isVerticalOrientation
                ? maxThumbPixelOffset - ((snappedValue - configuredMinValue) / valueSpan * maxThumbPixelOffset)
                : ((snappedValue - configuredMinValue) / valueSpan * maxThumbPixelOffset);

            return clamp(snappedPixelOffset, 0, maxThumbPixelOffset);
        };

        // --- Event Handlers ---

        const onFocusHandler = () => {
            mainWidgetWrapper.classList.add(`${CLASS_PREFIX}focused`);
            mainWidgetWrapper.classList.remove(`${CLASS_PREFIX}hover`);
            if (globalScrollInputAllowed && !disableWidgetScroll) {
                attachDomListener(window, 'DOMMouseScroll', onMouseWheelScroll);
                attachDomListener(document, 'mousewheel', onMouseWheelScroll);
            }
            triggerEventCallback("focus");
        };

        const onBlurHandler = () => {
            mainWidgetWrapper.classList.remove(`${CLASS_PREFIX}focused`, `${CLASS_PREFIX}focused-hover`, `${CLASS_PREFIX}hover`);
            if (globalScrollInputAllowed && !disableWidgetScroll) {
                detachDomListener(document, 'mousewheel', onMouseWheelScroll);
                detachDomListener(window, 'DOMMouseScroll', onMouseWheelScroll);
            }
            triggerEventCallback("blur");
        };

        const onMouseWheelScroll = (eventObj) => {
            if (!isKeyboardInputEnabled) return;
            const event = eventObj || window.event;
            let scrollDelta = 0;

            if (event.wheelDelta) {
                scrollDelta = event.wheelDelta / 120;
            } else if (event.detail) {
                scrollDelta = -event.detail / 3;
            }

            if (isVerticalOrientation) {
                scrollDelta = -scrollDelta;
            }

            if (scrollDelta) {
                const currentOffset = isVerticalOrientation ? thumbHandleElement.offsetTop : thumbHandleElement.offsetLeft;
                const newOffset = (scrollDelta < 0)
                    ? Math.ceil(currentOffset + pixelStepForMaxInc)
                    : Math.floor(currentOffset - pixelStepForMaxInc);
                syncPixelsToValue(clamp(newOffset, 0, maxThumbPixelOffset));
            }
            return preventEventDefault(event);
        };

        const onKeyPressHandler = (eventObj) => {
            const keyCode = eventObj.keyCode || eventObj.charCode;
            if ((keyCode >= 33 && keyCode <= 40) || keyCode === 45 || keyCode === 46) {
                return preventEventDefault(eventObj);
            }
            return true;
        };

        const onKeyDownHandler = (eventObj) => {
            if (!isKeyboardInputEnabled) return true;

            const keyCode = eventObj.keyCode || eventObj.charCode;

            if (keyCode < 33 || (keyCode > 40 && keyCode !== 45 && keyCode !== 46)) return true;

            let currentVal = inputTagName === "input" ? parseFloat(inputElement.value) : inputElement.selectedIndex;
            if (isNaN(currentVal)) {
                currentVal = configuredMinValue;
            }

            let stepAmount = effectiveKeyboardIncrement;
            if (eventObj.ctrlKey || keyCode === 34 || keyCode === 33) {
                stepAmount = effectiveKeyboardHop;
            }

            switch (keyCode) {
                case 37:
                case 40:
                case 46:
                    currentVal -= stepAmount;
                    break;
                case 39:
                case 38:
                case 45:
                case 33:
                    currentVal += stepAmount;
                    break;
                case 35:
                    currentVal = configuredMaxValue;
                    break;
                case 36:
                    currentVal = configuredMinValue;
                    break;
                default:
                    return true;
            }

            updateInputAndTrigger(currentVal, "update");
            syncValueToPixels(currentVal);

            return preventEventDefault(eventObj);
        };

        const onMouseOverHandler = () => {
            mainWidgetWrapper.classList.add(`${CLASS_PREFIX}hover`);
        };

        const onMouseOutHandler = () => {
            mainWidgetWrapper.classList.remove(`${CLASS_PREFIX}hover`);
        };

        const onThumbMouseUp = (eventObj) => {
            detachDomListener(document, 'mousemove', onMouseMoveDrag);
            detachDomListener(document, 'mouseup', onThumbMouseUp);
            isKeyboardInputEnabled = true;
            document.body.classList.remove(`${CLASS_PREFIX}dragging-vertical`, `${CLASS_PREFIX}dragging-horizontal`);
            try { thumbHandleElement.focus(); } catch(e) {}
            return preventEventDefault(eventObj);
        };

        const onThumbMouseDown = (eventObj) => {
            mouseDragStartOffset = isVerticalOrientation ? eventObj.clientY : eventObj.clientX;
            thumbCurrentPosition = parseInt(isVerticalOrientation ? thumbHandleElement.offsetTop : thumbHandleElement.offsetLeft) || 0;
            isKeyboardInputEnabled = false;
            clearTimeout(currentAnimationTimer);
            currentAnimationTimer = null;

            attachDomListener(document, 'mousemove', onMouseMoveDrag);
            attachDomListener(document, 'mouseup', onThumbMouseUp);

            try { thumbHandleElement.focus(); } catch(e) {}
            document.body.classList.add(`${CLASS_PREFIX}dragging-${isVerticalOrientation ? "vertical" : "horizontal"}`);
            return preventEventDefault(eventObj);
        };

        const onTrackMouseUp = (eventObj) => {
            detachDomListener(document, 'mouseup', onTrackMouseUp);
            if (!enableSmoothAnimation) {
                clearTimeout(currentAnimationTimer);
                currentAnimationTimer = null;
                isKeyboardInputEnabled = true;
            }
            return preventEventDefault(eventObj);
        };

        const onMouseMoveDrag = (eventObj) => {
            const newMouseCoord = isVerticalOrientation ? eventObj.clientY : eventObj.clientX;
            syncPixelsToValue(snapPixelToIncrement(thumbCurrentPosition + (newMouseCoord - mouseDragStartOffset)));
        };

        const onTrackMouseDown = (eventObj) => {
            const clickedElement = eventObj.target || eventObj.srcElement;
            if (clickedElement && clickedElement.classList && clickedElement.classList.contains(`${CLASS_PREFIX}widget-thumb`)) {
                return true;
            }

            try { thumbHandleElement.focus(); } catch(e) {}

            clearTimeout(currentAnimationTimer);
            currentAnimationTimer = null;
            isKeyboardInputEnabled = false;

            const wrapperRect = mainWidgetWrapper.getBoundingClientRect();
            let clickCoordInPx;
            if (isVerticalOrientation) {
                clickCoordInPx = eventObj.clientY - wrapperRect.top - (thumbHandleElement.offsetHeight / 2);
            } else {
                clickCoordInPx = eventObj.clientX - wrapperRect.left - (thumbHandleElement.offsetWidth / 2);
            }

            if (enableDirectJump) {
                syncPixelsToValue(snapPixelToIncrement(clickCoordInPx));
            } else {
                thumbTargetPixelPosition = clamp(clickCoordInPx, 0, maxThumbPixelOffset);
                thumbCurrentPosition = isVerticalOrientation ? thumbHandleElement.offsetTop : thumbHandleElement.offsetLeft;
                applyThumbAnimation(true);
            }

            attachDomListener(document, 'mouseup', onTrackMouseUp);
            return preventEventDefault(eventObj);
        };

        // --- Animation Logic ---

        const easeInOutQuad = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        let tweenStartTime = 0;
        let tweenStartValue = 0;
        let tweenChangeValue = 0;
        const tweenDurationMs = 150;

        const setThumbVisualPosition = (pixelOffset) => {
            if (isVerticalOrientation) {
                thumbHandleElement.style.top = `${pixelOffset}px`;
            } else {
                thumbHandleElement.style.left = `${pixelOffset}px`;
            }
        };

        const applyThumbAnimation = (forceStart = false) => {
            if (!enableSmoothAnimation) {
                setThumbVisualPosition(thumbTargetPixelPosition);
                return;
            }

            const currentVisualPosition = isVerticalOrientation ? thumbHandleElement.offsetTop : thumbHandleElement.offsetLeft;
            const distanceToTarget = Math.abs(currentVisualPosition - thumbTargetPixelPosition);

            if (!forceStart && distanceToTarget < 1) {
                setThumbVisualPosition(thumbTargetPixelPosition);
                return;
            }

            cancelAnimationFrame(currentAnimationTimer);

            tweenStartTime = performance.now();
            tweenStartValue = currentVisualPosition;
            tweenChangeValue = thumbTargetPixelPosition - tweenStartValue;

            const animateFrame = (timestamp) => {
                const elapsed = timestamp - tweenStartTime;
                if (elapsed < tweenDurationMs) {
                    const interpolatedPosition = easeInOutQuad(elapsed, tweenStartValue, tweenChangeValue, tweenDurationMs);
                    setThumbVisualPosition(interpolatedPosition);
                    currentAnimationTimer = requestAnimationFrame(animateFrame);
                } else {
                    setThumbVisualPosition(thumbTargetPixelPosition);
                    currentAnimationTimer = null;
                }
            };
            currentAnimationTimer = requestAnimationFrame(animateFrame);
        };


        // --- DOM Creation and Initialization ---

        const buildDomElements = () => {
            mainWidgetWrapper = document.createElement('div');
            mainWidgetWrapper.id = `${CLASS_PREFIX}widget-${inputElement.id}`;
            mainWidgetWrapper.className = `${CLASS_PREFIX}widget-container ${isVerticalOrientation ? `${CLASS_PREFIX}vertical` : `${CLASS_PREFIX}horizontal`} ${widgetCustomClasses}`;
            mainWidgetWrapper.setAttribute('role', 'slider');
            mainWidgetWrapper.setAttribute('aria-valuemin', configuredMinValue);
            mainWidgetWrapper.setAttribute('aria-valuemax', configuredMaxValue);
            mainWidgetWrapper.setAttribute('aria-valuenow', inputElement.value);
            mainWidgetWrapper.setAttribute('aria-orientation', isVerticalOrientation ? 'vertical' : 'horizontal');
            mainWidgetWrapper.setAttribute('aria-labelledby', inputElement.id);

            trackContainer = document.createElement('div');
            trackContainer.className = `${CLASS_PREFIX}widget-track`;

            thumbHandleElement = document.createElement('div');
            thumbHandleElement.className = `${CLASS_PREFIX}widget-thumb`;
            thumbHandleElement.tabIndex = 0;
            thumbHandleElement.setAttribute('role', 'slider');
            thumbHandleElement.setAttribute('aria-valuemin', configuredMinValue);
            thumbHandleElement.setAttribute('aria-valuemax', configuredMaxValue);
            thumbHandleElement.setAttribute('aria-valuenow', inputElement.value);
            if (enableFullAccessibility) {
                thumbHandleElement.setAttribute('aria-controls', inputElement.id);
            }

            trackContainer.appendChild(thumbHandleElement);
            mainWidgetWrapper.appendChild(trackContainer);

            inputElement.parentNode.insertBefore(mainWidgetWrapper, inputElement);
            if (shouldHideSourceInput) {
                inputElement.style.display = 'none';
            } else {
                inputElement.setAttribute('aria-hidden', 'true');
            }
            mainWidgetWrapper.appendChild(inputElement);
        };

        const attachWidgetListeners = () => {
            attachDomListener(mainWidgetWrapper, "mouseover", onMouseOverHandler);
            attachDomListener(mainWidgetWrapper, "mouseout", onMouseOutHandler);
            attachDomListener(mainWidgetWrapper, "mousedown", onTrackMouseDown);
            attachDomListener(thumbHandleElement, "focus", onFocusHandler);
            attachDomListener(thumbHandleElement, "blur", onBlurHandler);
            attachDomListener(thumbHandleElement, "keydown", onKeyDownHandler);
            attachDomListener(thumbHandleElement, "keypress", onKeyPressHandler);
            attachDomListener(thumbHandleElement, "mousedown", onThumbMouseDown);
        };

        // --- Public Methods ---

        this.destroyWidget = () => {
            detachDomListener(mainWidgetWrapper, "mouseover", onMouseOverHandler);
            detachDomListener(mainWidgetWrapper, "mouseout", onMouseOutHandler);
            detachDomListener(mainWidgetWrapper, "mousedown", onTrackMouseDown);
            detachDomListener(thumbHandleElement, "focus", onFocusHandler);
            detachDomListener(thumbHandleElement, "blur", onBlurHandler);
            detachDomListener(thumbHandleElement, "keydown", onKeyDownHandler);
            detachDomListener(thumbHandleElement, "keypress", onKeyPressHandler);
            detachDomListener(thumbHandleElement, "mousedown", onThumbMouseDown);

            detachDomListener(document, 'mousemove', onMouseMoveDrag);
            detachDomListener(document, 'mouseup', onThumbMouseUp);
            detachDomListener(document, 'mouseup', onTrackMouseUp);

            if (globalScrollInputAllowed && !disableWidgetScroll) {
                detachDomListener(document, 'mousewheel', onMouseWheelScroll);
                detachDomListener(window, 'DOMMouseScroll', onMouseWheelScroll);
            }

            cancelAnimationFrame(currentAnimationTimer);

            if (shouldHideSourceInput) {
                inputElement.style.display = '';
            }
            inputElement.removeAttribute('aria-hidden');
            mainWidgetWrapper.parentNode.insertBefore(inputElement, mainWidgetWrapper);
            mainWidgetWrapper.parentNode.removeChild(mainWidgetWrapper);

            triggerEventCallback("destroy");
            mainWidgetWrapper = trackContainer = thumbHandleElement = currentAnimationTimer = null;
        };

        this.recalculateLayout = () => {
            containerWidthPx = mainWidgetWrapper.offsetWidth;
            containerHeightPx = mainWidgetWrapper.offsetHeight;
            maxThumbPixelOffset = isVerticalOrientation
                ? containerHeightPx - thumbHandleElement.offsetHeight
                : containerWidthPx - thumbHandleElement.offsetWidth;
            singleStepPixelSize = maxThumbPixelOffset / totalSteps;
            pixelStepForMaxInc = maxThumbPixelOffset / Math.ceil(valueSpan / effectiveMaxIncrement);

            syncValueToPixels();
            triggerEventCallback("redraw");
        };

        this.refreshVisualState = () => {
            this.recalculateLayout();
            syncValueToPixels();
        };

        // --- Widget Initialization Sequence ---
        buildDomElements();
        attachWidgetListeners();
        this.recalculateLayout();
        updateInputAndTrigger(inputTagName === "select" ? inputElement.selectedIndex : parseFloat(inputElement.value) || configuredMinValue, "create");
        syncValueToPixels();
    }

    // --- Global Module Initialization ---
    attachDomListener(window, "load", setupAllControls);
    attachDomListener(window, "unload", teardownSystem);
    attachDomListener(window, "resize", adjustAllWidgetLayouts);

    // Expose public API for external interaction.
    return {
        initializeWidgets: setupAllControls,
        removeWidgetById: disposeRangeWidget,
        removeAllWidgets: clearAllWidgets,
        updateAllWidgetVisuals: synchronizeAllVisuals,
        disableGlobalScrollInput: disableGlobalScrollHandling
    };
})();