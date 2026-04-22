class EngageSlider {
    static instanceCounter = 0;

    constructor(targetElement, initialSettings) {
        if (!(targetElement instanceof HTMLElement)) {
            throw new Error("Target element must be a valid HTMLElement.");
        }

        this.rootElement = targetElement;
        this.instanceId = `engage-slider-${EngageSlider.instanceCounter++}`;

        this.internalState = {
            isDragging: false,
            isAttemptingDrag: false,
            lastPointerX: 0,
            handleStartOffset: 0,
            currentProgressValue: 0,
            hasTriggeredActivation: false,
            activeAnimationId: null,
            eventSubscribers: new Map(),
        };

        this.domElements = {
            mainWrapper: null,
            textDisplay: null,
            trackArea: null,
            controlHandle: null,
        };

        this.configuration = {
            labelContent: "engage",
            isDeactivated: false,
            isCompact: false,
            flowDirection: "right", // "right" or "left"
            activationThreshold: 5, // Percentage from the edge
            activateOnRelease: true,
            fadeEffectFunction: (val) => 1.0 - (val / 50.0),
            transitionDuration: 200, // ms for reset animation
        };

        Object.assign(this.configuration, initialSettings);

        this._constructComponent();
        this._applyInitialConfiguration();
        this._bindInteractionEvents();
    }

    _constructComponent() {
        this.rootElement.innerHTML = '';
        this.rootElement.classList.add('engage-slider-root', this.instanceId);

        this.domElements.mainWrapper = document.createElement('div');
        this.domElements.mainWrapper.classList.add('engage-slider-wrapper');
        this.rootElement.appendChild(this.domElements.mainWrapper);

        this.domElements.textDisplay = document.createElement('span');
        this.domElements.textDisplay.classList.add('engage-slider-label');
        this.domElements.textDisplay.textContent = this.configuration.labelContent;
        this.domElements.mainWrapper.appendChild(this.domElements.textDisplay);

        this.domElements.trackArea = document.createElement('div');
        this.domElements.trackArea.classList.add('engage-slider-track');
        this.domElements.mainWrapper.appendChild(this.domElements.trackArea);

        this.domElements.controlHandle = document.createElement('div');
        this.domElements.controlHandle.classList.add('engage-slider-handle');
        this.domElements.controlHandle.setAttribute('role', 'slider');
        this.domElements.controlHandle.setAttribute('aria-valuemin', '0');
        this.domElements.controlHandle.setAttribute('aria-valuemax', '100');
        this.domElements.controlHandle.setAttribute('tabindex', '0');
        this.domElements.trackArea.appendChild(this.domElements.controlHandle);

        this._placeHandle(this.configuration.flowDirection === "left" ? 100 : 0);
        this._updateAppearance();
    }

    _applyInitialConfiguration() {
        this._updateConfiguration('isCompact', this.configuration.isCompact);
        this._updateConfiguration('flowDirection', this.configuration.flowDirection);
        this._updateConfiguration('isDeactivated', this.configuration.isDeactivated);
        this._updateConfiguration('labelContent', this.configuration.labelContent);
    }

    _bindInteractionEvents() {
        this.domElements.controlHandle.addEventListener('pointerdown', this._handlePointerDown);
        document.addEventListener('pointermove', this._handlePointerMove);
        document.addEventListener('pointerup', this._handlePointerUp);
        this.domElements.controlHandle.addEventListener('keydown', this._handleKeyboardInput);
    }

    _unbindInteractionEvents() {
        this.domElements.controlHandle.removeEventListener('pointerdown', this._handlePointerDown);
        document.removeEventListener('pointermove', this._handlePointerMove);
        document.removeEventListener('pointerup', this._handlePointerUp);
        this.domElements.controlHandle.removeEventListener('keydown', this._handleKeyboardInput);
    }

    _handlePointerDown = (event) => {
        if (this.configuration.isDeactivated || event.button !== 0) {
            return;
        }

        event.preventDefault();
        this.domElements.controlHandle.setPointerCapture(event.pointerId);

        this.internalState.isAttemptingDrag = true;
        this.internalState.hasTriggeredActivation = false;
        this.internalState.lastPointerX = event.clientX;
        this.internalState.handleStartOffset = this.domElements.controlHandle.offsetLeft;

        const initialStatus = this._dispatchCustomEvent('dragInitiated', { progress: this._measureCurrentProgress() });
        if (initialStatus === false) {
            this._resetToIdle(this.configuration.transitionDuration);
        } else {
            this.internalState.isDragging = true;
            this.domElements.mainWrapper.classList.add('is-dragging');
        }
    }

    _handlePointerMove = (event) => {
        if (!this.internalState.isDragging) {
            return;
        }

        event.preventDefault();

        const trackDimensions = this.domElements.trackArea.getBoundingClientRect();
        const movementDeltaX = event.clientX - this.internalState.lastPointerX;
        let newOffset = this.internalState.handleStartOffset + movementDeltaX;

        newOffset = Math.max(0, Math.min(newOffset, trackDimensions.width - this.domElements.controlHandle.offsetWidth));

        this._placeHandle(newOffset / (trackDimensions.width - this.domElements.controlHandle.offsetWidth) * 100);
        this.internalState.lastPointerX = event.clientX;
        this.internalState.handleStartOffset = newOffset;

        this._updateAppearance();

        const currentProgress = this._measureCurrentProgress();
        if (currentProgress !== this.internalState.currentProgressValue) {
            this.internalState.currentProgressValue = currentProgress;
            const allowed = this._dispatchCustomEvent('progressUpdate', { progress: currentProgress });
            if (allowed === false) {
                this._resetToIdle(this.configuration.transitionDuration);
                this.internalState.isDragging = false;
                this.domElements.mainWrapper.classList.remove('is-dragging');
                return;
            }

            if (!this.configuration.activateOnRelease) {
                this._checkActivationState();
            }
        }
    }

    _handlePointerUp = (event) => {
        if (!this.internalState.isAttemptingDrag && !this.internalState.isDragging) {
            return;
        }

        if (this.internalState.isDragging) {
            this.domElements.controlHandle.releasePointerCapture(event.pointerId);
            if (this.configuration.activateOnRelease) {
                this._checkActivationState();
            }
            this._dispatchCustomEvent('dragConcluded', { progress: this._measureCurrentProgress() });
        }

        this._resetToIdle(this.configuration.transitionDuration);
        this.internalState.isDragging = false;
        this.internalState.isAttemptingDrag = false;
        this.domElements.mainWrapper.classList.remove('is-dragging');
    }

    _handleKeyboardInput = (event) => {
        if (this.configuration.isDeactivated) {
            return;
        }
        let currentProgress = this._measureCurrentProgress();
        const stepSize = 5;

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            currentProgress = Math.min(100, currentProgress + stepSize);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            currentProgress = Math.max(0, currentProgress - stepSize);
        } else if (event.key === 'Home') {
            event.preventDefault();
            currentProgress = (this.configuration.flowDirection === 'right' ? 0 : 100);
        } else if (event.key === 'End') {
            event.preventDefault();
            currentProgress = (this.configuration.flowDirection === 'right' ? 100 : 0);
        } else {
            return;
        }

        this._placeHandle(currentProgress);
        this._updateAppearance();
        this.internalState.currentProgressValue = currentProgress;
        this._dispatchCustomEvent('progressUpdate', { progress: currentProgress });
        this._checkActivationState();
    }

    _measureCurrentProgress() {
        const handleDimensions = this.domElements.controlHandle.getBoundingClientRect();
        const trackDimensions = this.domElements.trackArea.getBoundingClientRect();
        if (trackDimensions.width === 0 || handleDimensions.width >= trackDimensions.width) return 0;

        const handleOffsetWithinTrack = handleDimensions.left - trackDimensions.left;
        const availableTrackWidth = trackDimensions.width - handleDimensions.width;
        const progress = (handleOffsetWithinTrack / availableTrackWidth) * 100;
        return Math.round(Math.max(0, Math.min(100, progress)));
    }

    _placeHandle(percentage) {
        this.domElements.controlHandle.style.left = `${percentage}%`;
        this.domElements.controlHandle.setAttribute('aria-valuenow', Math.round(percentage));
    }

    _updateAppearance() {
        const currentProgress = this._measureCurrentProgress();
        const opacityInput = this.configuration.flowDirection === "left"
            ? (100 - currentProgress)
            : currentProgress;
        const calculatedOpacity = this.configuration.fadeEffectFunction(opacityInput);
        this.domElements.textDisplay.style.opacity = Math.max(0, Math.min(1, calculatedOpacity));
    }

    _checkActivationState() {
        if (this.internalState.hasTriggeredActivation || this.configuration.isDeactivated) {
            return;
        }

        const currentProgress = this._measureCurrentProgress();
        const threshold = this.configuration.activationThreshold;

        let isNowActivated = false;
        if (this.configuration.flowDirection === "right" && currentProgress >= (100 - threshold)) {
            isNowActivated = true;
        } else if (this.configuration.flowDirection === "left" && currentProgress <= threshold) {
            isNowActivated = true;
        }

        if (isNowActivated) {
            this._dispatchCustomEvent('activated', { progress: currentProgress });
            this.internalState.hasTriggeredActivation = true;
        }
    }

    _resetToIdle(duration = 'instant') {
        window.cancelAnimationFrame(this.internalState.activeAnimationId);

        const targetProgress = this.configuration.flowDirection === "right" ? 0 : 100;
        const targetOpacity = this.configuration.fadeEffectFunction(0);

        if (duration === 'instant' || duration === null || duration === undefined || duration <= 0) {
            this._placeHandle(targetProgress);
            this.domElements.textDisplay.style.opacity = targetOpacity;
        } else {
            const startProgress = this._measureCurrentProgress();
            const startOpacity = parseFloat(this.domElements.textDisplay.style.opacity) || 1;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progressRatio = Math.min(1, elapsed / duration);

                const animatedProgress = startProgress + (targetProgress - startProgress) * progressRatio;
                const animatedOpacity = startOpacity + (targetOpacity - startOpacity) * progressRatio;

                this._placeHandle(animatedProgress);
                this.domElements.textDisplay.style.opacity = animatedOpacity;

                if (progressRatio < 1) {
                    this.internalState.activeAnimationId = window.requestAnimationFrame(animate);
                } else {
                    this.internalState.activeAnimationId = null;
                }
            };
            this.internalState.activeAnimationId = window.requestAnimationFrame(animate);
        }

        this.internalState.currentProgressValue = targetProgress;
        this.internalState.hasTriggeredActivation = false;
        this.domElements.controlHandle.setAttribute('aria-valuenow', targetProgress);
    }

    _updateConfiguration(key, value) {
        this.configuration[key] = value;

        switch (key) {
            case "labelContent":
                this.domElements.textDisplay.textContent = value;
                break;
            case "isCompact":
                this.domElements.mainWrapper.classList.toggle("engage-slider-compact", value);
                break;
            case "isDeactivated":
                if (value === true) {
                    this.rootElement.classList.add("is-deactivated");
                    this.domElements.controlHandle.setAttribute("aria-disabled", "true");
                    this.domElements.controlHandle.setAttribute("tabindex", "-1");
                    this.domElements.textDisplay.style.opacity = '';
                    this._resetToIdle();
                } else {
                    this.rootElement.classList.remove("is-deactivated");
                    this.domElements.controlHandle.setAttribute("aria-disabled", "false");
                    this.domElements.controlHandle.setAttribute("tabindex", "0");
                }
                break;
            case "flowDirection":
                this.domElements.mainWrapper.classList.toggle("flow-left", value === "left");
                this.domElements.mainWrapper.classList.toggle("flow-right", value === "right");
                this._resetToIdle();
                break;
            default:
                break;
        }
        this._updateAppearance();
    }

    // Public API Methods
    reconfigure(newSettings) {
        for (const key in newSettings) {
            if (Object.prototype.hasOwnProperty.call(newSettings, key)) {
                this._updateConfiguration(key, newSettings[key]);
            }
        }
    }

    getCurrentValue() {
        return this._measureCurrentProgress();
    }

    onDirective(eventName, callback) {
        if (!this.internalState.eventSubscribers.has(eventName)) {
            this.internalState.eventSubscribers.set(eventName, []);
        }
        this.internalState.eventSubscribers.get(eventName).push(callback);
    }

    offDirective(eventName, callback) {
        if (this.internalState.eventSubscribers.has(eventName)) {
            const handlers = this.internalState.eventSubscribers.get(eventName);
            this.internalState.eventSubscribers.set(eventName, handlers.filter(h => h !== callback));
        }
    }

    _dispatchCustomEvent(eventName, eventData) {
        const handlers = this.internalState.eventSubscribers.get(eventName);
        if (handlers) {
            for (const handler of handlers) {
                if (handler.call(this, eventData) === false) {
                    return false;
                }
            }
        }
        return true;
    }

    destroy() {
        this._unbindInteractionEvents();
        this.rootElement.innerHTML = '';
        this.rootElement.classList.remove('engage-slider-root', 'is-deactivated', 'engage-slider-compact', 'flow-left', 'flow-right', 'is-dragging', this.instanceId);
        window.cancelAnimationFrame(this.internalState.activeAnimationId);
        this.internalState.eventSubscribers.clear();
        this.domElements = null;
        this.internalState = null;
        this.configuration = null;
        this.rootElement = null;
    }
}