(function() {
    let activeManipulators = new Map();
    let nextComponentId = 0;
    let scrollWheelGloballyEnabled = true;

    const attachHandler = (targetElement, eventType, actionFunction, useCapture = false) => {
        if (!targetElement) return;
        targetElement.addEventListener(eventType, actionFunction, useCapture);
    };

    const detachHandler = (targetElement, eventType, actionFunction, useCapture = false) => {
        if (!targetElement) return;
        targetElement.removeEventListener(eventType, actionFunction, useCapture);
    };

    const blockEvent = (evt) => {
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        return false;
    };

    const resolveCallable = (functionPath) => {
        if (!functionPath) return null;
        let currentScope = window;
        const parts = functionPath.split('.');
        for (let i = 0; i < parts.length; i++) {
            if (typeof currentScope[parts[i]] === 'undefined') {
                return null;
            }
            if (i === parts.length - 1) {
                if (typeof currentScope[parts[i]] === 'function') {
                    return currentScope[parts[i]].bind(currentScope);
                } else {
                    return null;
                }
            }
            currentScope = parts[i] ? currentScope[parts[i]] : currentScope; // Handle empty part for robustness
        }
        return null;
    };

    const extractComponentSettings = (sourceInput) => {
        const data = sourceInput.dataset;
        const settings = {
            element: sourceInput,
            minimum: parseFloat(data.vrMin || 0),
            maximum: parseFloat(data.vrMax || 100),
            stepIncrement: parseFloat(data.vrIncrement || 1),
            keyboardStep: parseFloat(data.vrKeyboardStep || 1),
            keyboardHop: parseFloat(data.vrKeyboardHop || 0),
            useTweening: data.vrTween !== undefined,
            verticalDisplay: data.vrVertical !== undefined,
            concealInput: data.vrHideInput !== undefined,
            enableJumpClick: data.vrJump !== undefined,
            fullAccessibility: data.vrFullAria !== undefined,
            disableScrollWheel: data.vrDisableWheel !== undefined,
            listeners: {}
        };

        if (settings.keyboardHop === 0) {
            settings.keyboardHop = settings.keyboardStep * 2;
        }

        for (const key in data) {
            if (key.startsWith('vrCb')) {
                const eventType = key.replace('vrCb', '').toLowerCase();
                const callbackFn = resolveCallable(data[key]);
                if (callbackFn) {
                    if (!settings.listeners[eventType]) {
                        settings.listeners[eventType] = [];
                    }
                    settings.listeners[eventType].push(callbackFn);
                }
            }
        }
        return settings;
    };

    class RangeInputManipulator {
        constructor(configuration) {
            this.config = configuration;
            this.sourceElement = configuration.element;
            this.componentIdentifier = this.sourceElement.id || `vr-${nextComponentId++}`;
            this.sourceElement.id = this.componentIdentifier;

            this.currentValue = 0;
            this.containerWrapper = null;
            this.trackArea = null;
            this.dragHandle = null;
            this.handleDimensions = { width: 0, height: 0 };
            this.trackLength = 0;
            this.valueToPixelRatio = 0;
            this.dragStartPointer = 0;
            this.handleStartOffset = 0;
            this.isDragging = false;
            this.isFocused = false;
            this.animationFrameRequest = null;
            this.precision = 0;

            this.buildComponentInterface();
            this.attachComponentHandlers();
            this.recalculateLayout();
            this.initializeValue();
            this.triggerEvent('create');
        }

        buildComponentInterface() {
            this.containerWrapper = document.createElement('div');
            this.containerWrapper.className = `vr-container ${this.config.verticalDisplay ? 'vr-vertical' : 'vr-horizontal'}`;
            if (this.sourceElement.className) {
                this.containerWrapper.classList.add(...this.sourceElement.className.split(' '));
            }
            this.containerWrapper.setAttribute('role', 'group');

            this.trackArea = document.createElement('div');
            this.trackArea.className = 'vr-track';
            this.containerWrapper.appendChild(this.trackArea);

            this.dragHandle = document.createElement('button');
            this.dragHandle.className = 'vr-marker';
            this.dragHandle.setAttribute('type', 'button');
            this.dragHandle.setAttribute('role', 'slider');
            this.dragHandle.setAttribute('aria-valuemin', this.config.minimum);
            this.dragHandle.setAttribute('aria-valuemax', this.config.maximum);
            this.dragHandle.setAttribute('aria-orientation', this.config.verticalDisplay ? 'vertical' : 'horizontal');
            this.dragHandle.setAttribute('aria-controls', this.componentIdentifier);
            this.containerWrapper.appendChild(this.dragHandle);

            this.sourceElement.parentNode.insertBefore(this.containerWrapper, this.sourceElement);
            if (this.config.concealInput) {
                this.sourceElement.style.display = 'none';
            }
            this.containerWrapper.appendChild(this.sourceElement);
        }

        attachComponentHandlers() {
            attachHandler(this.containerWrapper, 'pointerdown', this.handleContainerPointerDown.bind(this));
            attachHandler(this.containerWrapper, 'mouseenter', this.handleContainerHoverIn.bind(this));
            attachHandler(this.containerWrapper, 'mouseleave', this.handleContainerHoverOut.bind(this));

            attachHandler(this.dragHandle, 'focus', this.handleFocusEvent.bind(this));
            attachHandler(this.dragHandle, 'blur', this.handleBlurEvent.bind(this));
            attachHandler(this.dragHandle, 'keydown', this.handleKeyboardInput.bind(this));
            attachHandler(this.dragHandle, 'pointerdown', this.handleMarkerPointerDown.bind(this));
        }

        detachComponentHandlers() {
            detachHandler(this.containerWrapper, 'pointerdown', this.handleContainerPointerDown.bind(this));
            detachHandler(this.containerWrapper, 'mouseenter', this.handleContainerHoverIn.bind(this));
            detachHandler(this.containerWrapper, 'mouseleave', this.handleContainerHoverOut.bind(this));

            detachHandler(this.dragHandle, 'focus', this.handleFocusEvent.bind(this));
            detachHandler(this.dragHandle, 'blur', this.handleBlurEvent.bind(this));
            detachHandler(this.dragHandle, 'keydown', this.handleKeyboardInput.bind(this));
            detachHandler(this.dragHandle, 'pointerdown', this.handleMarkerPointerDown.bind(this));

            this.removeWheelListeners();
        }

        addWheelListeners() {
            if (!this.config.disableScrollWheel && scrollWheelGloballyEnabled) {
                attachHandler(window, 'wheel', this.handleMouseWheel.bind(this), { passive: false });
                attachHandler(window, 'DOMMouseScroll', this.handleMouseWheel.bind(this), { passive: false });
            }
        }

        removeWheelListeners() {
            detachHandler(window, 'wheel', this.handleMouseWheel.bind(this), { passive: false });
            detachHandler(window, 'DOMMouseScroll', this.handleMouseWheel.bind(this), { passive: false });
        }

        initializeValue() {
            let initialVal;
            const tagName = this.sourceElement.tagName.toLowerCase();
            if (tagName === 'select') {
                initialVal = this.sourceElement.selectedIndex;
                this.config.minimum = 0;
                this.config.maximum = this.sourceElement.options.length - 1;
                this.dragHandle.setAttribute('aria-valuemin', this.config.minimum);
                this.dragHandle.setAttribute('aria-valuemax', this.config.maximum);
            } else {
                initialVal = parseFloat(this.sourceElement.value);
            }
            if (isNaN(initialVal) || initialVal < this.config.minimum || initialVal > this.config.maximum) {
                initialVal = this.config.minimum;
            }
            this.precision = (this.config.stepIncrement.toString().split('.')[1] || '').length;
            this.setValue(initialVal, false);
        }

        recalculateLayout() {
            this.handleDimensions.width = this.dragHandle.offsetWidth;
            this.handleDimensions.height = this.dragHandle.offsetHeight;

            if (this.config.verticalDisplay) {
                this.trackLength = this.trackArea.offsetHeight - this.handleDimensions.height;
            } else {
                this.trackLength = this.trackArea.offsetWidth - this.handleDimensions.width;
            }

            const valueRange = this.config.maximum - this.config.minimum;
            this.valueToPixelRatio = valueRange === 0 ? 0 : this.trackLength / valueRange;

            this.updateMarkerPosition();
            this.triggerEvent('redraw');
        }

        setValue(newValue, triggerUpdate = true) {
            newValue = Math.max(this.config.minimum, Math.min(this.config.maximum, newValue));
            newValue = this.snapToIncrement(newValue);

            if (this.currentValue !== newValue) {
                this.currentValue = newValue;
                this.updateMarkerPosition();
                this.updateSourceElement();
                this.updateAriaAttributes();
                if (triggerUpdate) {
                    this.triggerEvent('update');
                }
                this.triggerEvent('move');
            }
        }

        snapToIncrement(val) {
            const numSteps = Math.round((val - this.config.minimum) / this.config.stepIncrement);
            let snappedValue = this.config.minimum + numSteps * this.config.stepIncrement;
            return parseFloat(snappedValue.toFixed(this.precision));
        }

        valueToPixelOffset(value) {
            const normalizedValue = (value - this.config.minimum) / (this.config.maximum - this.config.minimum);
            return normalizedValue * this.trackLength;
        }

        pixelOffsetToValue(pixelOffset) {
            pixelOffset = Math.max(0, Math.min(this.trackLength, pixelOffset));
            const normalizedOffset = pixelOffset / this.trackLength;
            return this.config.minimum + normalizedOffset * (this.config.maximum - this.config.minimum);
        }

        updateMarkerPosition() {
            const offset = this.valueToPixelOffset(this.currentValue);
            if (this.config.verticalDisplay) {
                this.dragHandle.style.top = `${offset}px`;
                this.dragHandle.style.left = '';
            } else {
                this.dragHandle.style.left = `${offset}px`;
                this.dragHandle.style.top = '';
            }
        }

        updateSourceElement() {
            if (this.sourceElement.tagName.toLowerCase() === 'select') {
                this.sourceElement.selectedIndex = this.currentValue;
            } else {
                this.sourceElement.value = this.currentValue;
            }
        }

        updateAriaAttributes() {
            this.dragHandle.setAttribute('aria-valuenow', this.currentValue);
            if (this.config.fullAccessibility) {
                 this.dragHandle.setAttribute('aria-valuetext', this.currentValue);
            }
        }

        handleContainerPointerDown(evt) {
            blockEvent(evt);
            if (evt.target === this.dragHandle) {
                return;
            }

            this.dragHandle.focus();

            if (this.config.enableJumpClick) {
                const rect = this.trackArea.getBoundingClientRect();
                let clickOffset;
                if (this.config.verticalDisplay) {
                    clickOffset = evt.clientY - rect.top - (this.handleDimensions.height / 2);
                } else {
                    clickOffset = evt.clientX - rect.left - (this.handleDimensions.width / 2);
                }
                const newValue = this.pixelOffsetToValue(clickOffset);
                this.setValue(newValue);
            }
        }

        handleMarkerPointerDown(evt) {
            blockEvent(evt);
            this.dragHandle.focus();
            this.isDragging = true;
            this.dragStartPointer = this.config.verticalDisplay ? evt.clientY : evt.clientX;
            this.handleStartOffset = this.config.verticalDisplay ? this.dragHandle.offsetTop : this.dragHandle.offsetLeft;

            this.containerWrapper.classList.add('vr-dragging');
            document.body.classList.add(`vr-dragging-${this.config.verticalDisplay ? 'vertical' : 'horizontal'}`);

            attachHandler(document, 'pointermove', this.handleDocumentPointerMove.bind(this));
            attachHandler(document, 'pointerup', this.handleDocumentPointerUp.bind(this));
        }

        handleDocumentPointerMove(evt) {
            if (!this.isDragging) return;
            blockEvent(evt);
            const currentPointerPos = this.config.verticalDisplay ? evt.clientY : evt.clientX;
            const delta = currentPointerPos - this.dragStartPointer;
            const newPixelOffset = this.handleStartOffset + delta;
            const newValue = this.pixelOffsetToValue(newPixelOffset);
            this.setValue(newValue);
        }

        handleDocumentPointerUp(evt) {
            if (!this.isDragging) return;
            blockEvent(evt);
            this.isDragging = false;
            this.containerWrapper.classList.remove('vr-dragging');
            document.body.classList.remove('vr-dragging-vertical', 'vr-dragging-horizontal');
            detachHandler(document, 'pointermove', this.handleDocumentPointerMove.bind(this));
            detachHandler(document, 'pointerup', this.handleDocumentPointerUp.bind(this));
        }

        handleKeyboardInput(evt) {
            let changeAmount = 0;
            let shouldUpdate = true;

            switch (evt.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                    changeAmount = -this.config.keyboardStep;
                    break;
                case 'ArrowRight':
                case 'ArrowUp':
                    changeAmount = this.config.keyboardStep;
                    break;
                case 'PageDown':
                    changeAmount = -this.config.keyboardHop;
                    break;
                case 'PageUp':
                    changeAmount = this.config.keyboardHop;
                    break;
                case 'Home':
                    this.setValue(this.config.minimum);
                    break;
                case 'End':
                    this.setValue(this.config.maximum);
                    break;
                default:
                    shouldUpdate = false;
                    break;
            }

            if (shouldUpdate && changeAmount !== 0) {
                this.setValue(this.currentValue + changeAmount);
            }

            if (shouldUpdate) {
                blockEvent(evt);
            }
        }

        handleMouseWheel(evt) {
            if (!this.isFocused || this.config.disableScrollWheel || !scrollWheelGloballyEnabled) {
                return;
            }
            blockEvent(evt);

            let scrollDelta = 0;
            if (evt.wheelDelta) {
                scrollDelta = evt.wheelDelta / 120;
            } else if (evt.detail) {
                scrollDelta = -evt.detail / 3;
            }

            if (this.config.verticalDisplay) {
                scrollDelta = -scrollDelta;
            }

            const newValue = this.currentValue + (scrollDelta > 0 ? this.config.stepIncrement : -this.config.stepIncrement);
            this.setValue(newValue);
        }

        handleFocusEvent() {
            this.isFocused = true;
            this.containerWrapper.classList.add('vr-focused');
            this.addWheelListeners();
            this.triggerEvent('focus');
        }

        handleBlurEvent() {
            this.isFocused = false;
            this.containerWrapper.classList.remove('vr-focused');
            this.removeWheelListeners();
            this.triggerEvent('blur');
        }

        handleContainerHoverIn() {
            this.containerWrapper.classList.add('vr-hover');
        }

        handleContainerHoverOut() {
            this.containerWrapper.classList.remove('vr-hover');
        }

        triggerEvent(eventType) {
            const listeners = this.config.listeners[eventType];
            if (listeners && listeners.length > 0) {
                const eventData = {
                    element: this.sourceElement,
                    value: this.currentValue,
                    id: this.componentIdentifier
                };
                listeners.forEach(callback => callback(eventData));
            }
        }

        resetComponent() {
            this.initializeValue();
            this.triggerEvent('update');
        }

        destroyComponent() {
            this.detachComponentHandlers();
            if (this.containerWrapper && this.containerWrapper.parentNode) {
                if (this.config.concealInput) {
                    this.sourceElement.style.display = '';
                    this.containerWrapper.parentNode.insertBefore(this.sourceElement, this.containerWrapper);
                }
                this.containerWrapper.parentNode.removeChild(this.containerWrapper);
            }
            if (this.animationFrameRequest) {
                cancelAnimationFrame(this.animationFrameRequest);
            }
            activeManipulators.delete(this.componentIdentifier);
            this.triggerEvent('destroy');
            this.config = null;
            this.sourceElement = null;
            this.containerWrapper = null;
            this.trackArea = null;
            this.dragHandle = null;
        }
    }

    const ComponentGlobalManager = {
        bootUp: (targetNode) => {
            const selectors = ['.value-ruler-control', 'input[data-vr-min][data-vr-max]', 'select.value-ruler-control'];
            let elementsToProcess = [];

            if (targetNode && targetNode.tagName) {
                if (selectors.some(s => targetNode.matches(s))) {
                    elementsToProcess.push(targetNode);
                }
            } else {
                selectors.forEach(selector => {
                    elementsToProcess = elementsToProcess.concat(Array.from(document.querySelectorAll(selector)));
                });
            }

            elementsToProcess.forEach(inputElement => {
                const existingInstance = activeManipulators.get(inputElement.id);
                if (existingInstance) {
                    existingInstance.destroyComponent();
                }
                const settings = extractComponentSettings(inputElement);
                if (settings) {
                    const manipulator = new RangeInputManipulator(settings);
                    activeManipulators.set(manipulator.componentIdentifier, manipulator);
                }
            });

            if (!ComponentGlobalManager._globalHandlersAttached) {
                attachHandler(window, 'unload', ComponentGlobalManager.powerDown);
                attachHandler(window, 'resize', ComponentGlobalManager.recalibrateAll);
                ComponentGlobalManager._globalHandlersAttached = true;
            }
            if (typeof jQuery !== 'undefined') {
                jQuery(document).trigger('rulersReady');
            } else {
                 document.dispatchEvent(new CustomEvent('rulersReady'));
            }
            return true;
        },

        powerDownOne: (identifier) => {
            const instance = activeManipulators.get(identifier);
            if (instance) {
                instance.destroyComponent();
                return true;
            }
            return false;
        },

        powerDown: () => {
            Array.from(activeManipulators.values()).forEach(instance => instance.destroyComponent());
            activeManipulators.clear();
            detachHandler(window, 'unload', ComponentGlobalManager.powerDown);
            detachHandler(window, 'resize', ComponentGlobalManager.recalibrateAll);
            ComponentGlobalManager._globalHandlersAttached = false;
        },

        recalibrateAll: () => {
            Array.from(activeManipulators.values()).forEach(instance => instance.recalculateLayout());
        },

        resetAll: () => {
             Array.from(activeManipulators.values()).forEach(instance => instance.resetComponent());
        },

        disableGlobalScrollWheel: () => {
            scrollWheelGloballyEnabled = false;
        }
    };

    attachHandler(document, 'DOMContentLoaded', () => ComponentGlobalManager.bootUp());
    attachHandler(window, 'load', () => ComponentGlobalManager.bootUp());

    window.ValueRulerManager = ComponentGlobalManager;
})();