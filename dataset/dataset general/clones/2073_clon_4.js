class AnimationDirector {
    #frameId = null;
    #startedAt = 0;
    #totalDuration = 0;
    #initialValue = 0;
    #finalValue = 0;
    #updateFunction = null;
    #completionFunction = null;

    constructor(updateFn, completeFn) {
        this.#updateFunction = updateFn;
        this.#completionFunction = completeFn;
    }

    begin(startVal, endVal, durationMillis, previousElapsedTime = 0) {
        if (this.#frameId !== null) {
            cancelAnimationFrame(this.#frameId);
            this.#frameId = null;
        }

        this.#initialValue = startVal;
        this.#finalValue = endVal;
        this.#totalDuration = previousElapsedTime > 0 ? previousElapsedTime : durationMillis;
        this.#startedAt = performance.now();

        const animateFrame = (currentTime) => {
            const elapsed = currentTime - this.#startedAt;
            let progress = Math.min(elapsed / this.#totalDuration, 1);
            let currentValue = this.#initialValue + (this.#finalValue - this.#initialValue) * progress;

            this.#updateFunction(currentValue);

            if (progress < 1) {
                this.#frameId = requestAnimationFrame(animateFrame);
            } else {
                this.#frameId = null;
                this.#completionFunction();
            }
        };
        this.#frameId = requestAnimationFrame(animateFrame);
    }

    halt() {
        if (this.#frameId !== null) {
            cancelAnimationFrame(this.#frameId);
            this.#frameId = null;
        }
    }

    get currentValue() {
        if (this.#frameId === null) {
            return this.#finalValue;
        }
        const elapsed = performance.now() - this.#startedAt;
        let progress = Math.min(elapsed / this.#totalDuration, 1);
        return this.#initialValue + (this.#finalValue - this.#initialValue) * progress;
    }

    get elapsedTime() {
        if (this.#frameId === null) {
            return this.#totalDuration;
        }
        return performance.now() - this.#startedAt;
    }

    get isActive() {
        return this.#frameId !== null;
    }
}

class InteractiveIndicator {
    #hostElement;
    #triggerArea;
    #iconDisplay;
    #baseCircle;
    #actionHandler;

    #isIconVisible = false;
    #fadeTimeoutId = null;
    #pointerOverIcon = false;
    #animationController;

    #boundHandlers = new Map();

    static #DISPLAY_SIZE = 13;
    static #FADE_DURATION_MS = 500;
    static #FADE_OUT_SCHEDULE_DELAY_MS = 0;

    constructor(areaToClick, areaToHover, iconIdentifier, circleIdentifier, onActionCallback) {
        this.#hostElement = areaToClick;
        this.#triggerArea = areaToHover;
        this.#actionHandler = onActionCallback;

        this.#iconDisplay = this.#createVisualElement('img', {
            position: 'absolute',
            top: '0',
            left: '0',
            opacity: '0'
        }, {
            alt: 'Information'
        });
        this.#iconDisplay.width = InteractiveIndicator.#DISPLAY_SIZE;
        this.#iconDisplay.height = InteractiveIndicator.#DISPLAY_SIZE;

        this.#baseCircle = this.#createVisualElement('div', {
            position: 'absolute',
            top: '0',
            left: '0',
            width: `${InteractiveIndicator.#DISPLAY_SIZE}px`,
            height: `${InteractiveIndicator.#DISPLAY_SIZE}px`,
            visibility: 'hidden'
        });
        this.setCircleTransparency(0.25);

        this.#hostElement.appendChild(this.#baseCircle);
        this.#hostElement.appendChild(this.#iconDisplay);

        this.#applyStyles(iconIdentifier, circleIdentifier);

        this.#animationController = new AnimationDirector(
            (currentVal) => {
                this.#iconDisplay.style.opacity = currentVal;
            },
            () => {
                // Animation completion callback
            }
        );

        this.#setupInteractionEvents();
    }

    #createVisualElement(tag, initialStyles = {}, attributes = {}) {
        const el = document.createElement(tag);
        Object.assign(el.style, initialStyles);
        for (const attr in attributes) {
            el.setAttribute(attr, attributes[attr]);
        }
        return el;
    }

    #setupInteractionEvents() {
        this.#boundHandlers.set('triggerMove', this.#handleTriggerMovement.bind(this));
        this.#boundHandlers.set('triggerLeave', this.#handleTriggerExit.bind(this));
        this.#boundHandlers.set('hostPress', this.#handleHostPress.bind(this));
        this.#boundHandlers.set('hostEnter', this.#handleHostEnter.bind(this));
        this.#boundHandlers.set('hostLeave', this.#handleHostLeave.bind(this));
        this.#boundHandlers.set('documentRelease', this.#handleDocumentRelease.bind(this));
        this.#boundHandlers.set('preventClick', this.#preventHostClick.bind(this));

        this.#triggerArea.addEventListener('mousemove', this.#boundHandlers.get('triggerMove'), true);
        this.#triggerArea.addEventListener('mouseout', this.#boundHandlers.get('triggerLeave'), true);

        this.#hostElement.addEventListener('mousedown', this.#boundHandlers.get('hostPress'), true);
        this.#hostElement.addEventListener('mouseover', this.#boundHandlers.get('hostEnter'), true);
        this.#hostElement.addEventListener('mouseout', this.#boundHandlers.get('hostLeave'), true);
        this.#hostElement.addEventListener('click', this.#boundHandlers.get('preventClick'), true);
    }

    #handleTriggerMovement() {
        if (this.#fadeTimeoutId !== null) {
            clearTimeout(this.#fadeTimeoutId);
            this.#fadeTimeoutId = null;
        }
        if (this.#isIconVisible) return;

        const startFrom = this.#animationController.isActive ? this.#animationController.currentValue : 0.0;
        const previousElapsed = this.#animationController.isActive ? this.#animationController.elapsedTime : 0;

        this.#animationController.begin(startFrom, 1.0, InteractiveIndicator.#FADE_DURATION_MS, previousElapsed);
        this.#isIconVisible = true;
    }

    #handleTriggerExit() {
        if (this.#fadeTimeoutId === null) {
            this.#fadeTimeoutId = setTimeout(this.#initiateFadeOut.bind(this), InteractiveIndicator.#FADE_OUT_SCHEDULE_DELAY_MS);
        }
    }

    #initiateFadeOut() {
        if (this.#fadeTimeoutId !== null) {
            clearTimeout(this.#fadeTimeoutId);
            this.#fadeTimeoutId = null;
        }
        if (!this.#isIconVisible) return;

        const startFrom = this.#animationController.isActive ? this.#animationController.currentValue : 1.0;
        const previousElapsed = this.#animationController.isActive ? this.#animationController.elapsedTime : 0;

        this.#animationController.begin(startFrom, 0.0, InteractiveIndicator.#FADE_DURATION_MS, previousElapsed);
        this.#isIconVisible = false;
    }

    #handleHostEnter() {
        this.#pointerOverIcon = true;
        this.#baseCircle.style.visibility = 'visible';
    }

    #handleHostLeave() {
        this.#pointerOverIcon = false;
        this.#baseCircle.style.visibility = 'hidden';
    }

    #handleHostPress(e) {
        document.addEventListener('mouseup', this.#boundHandlers.get('documentRelease'), true);
        e.stopPropagation();
        e.preventDefault();
    }

    #handleDocumentRelease(e) {
        document.removeEventListener('mouseup', this.#boundHandlers.get('documentRelease'), true);

        if (this.#pointerOverIcon) {
            this.#executeAction(e);
        }
    }

    #executeAction(e) {
        this.#baseCircle.style.visibility = 'hidden';

        try {
            if (this.actionCallback instanceof Function) {
                this.actionCallback(e);
            }
        } catch (ex) {
            throw ex;
        } finally {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    #preventHostClick(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    destroy() {
        this.#triggerArea.removeEventListener('mousemove', this.#boundHandlers.get('triggerMove'), true);
        this.#triggerArea.removeEventListener('mouseout', this.#boundHandlers.get('triggerLeave'), true);

        this.#hostElement.removeEventListener('mousedown', this.#boundHandlers.get('hostPress'), true);
        this.#hostElement.removeEventListener('mouseover', this.#boundHandlers.get('hostEnter'), true);
        this.#hostElement.removeEventListener('mouseout', this.#boundHandlers.get('hostLeave'), true);
        this.#hostElement.removeEventListener('click', this.#boundHandlers.get('preventClick'), true);

        document.removeEventListener('mouseup', this.#boundHandlers.get('documentRelease'), true);

        this.#animationController.halt();
        this.#fadeTimeoutId && clearTimeout(this.#fadeTimeoutId);

        const parent = this.#iconDisplay.parentNode;
        if (parent) {
            parent.removeChild(this.#baseCircle);
            parent.removeChild(this.#iconDisplay);
        }

        this.#boundHandlers.clear();
        this.#hostElement = null;
        this.#triggerArea = null;
        this.#iconDisplay = null;
        this.#baseCircle = null;
        this.#actionHandler = null;
        this.#animationController = null;
    }

    get actionCallback() {
        return this.#actionHandler;
    }

    set actionCallback(newCallback) {
        if (typeof newCallback === 'function' || newCallback === null) {
            this.#actionHandler = newCallback;
        } else {
            console.warn("Invalid type for actionCallback. Must be a function or null.");
        }
    }

    setVisuals(iconIdentifier, circleIdentifier) {
        this.#applyStyles(iconIdentifier, circleIdentifier);
    }

    setCircleTransparency(transparency) {
        this.#baseCircle.style.opacity = transparency;
    }

    #applyStyles(iconIdentifier, circleIdentifier) {
        this.#iconDisplay.src = `file:///System/Library/WidgetResources/ibutton/${iconIdentifier}_i.png`;
        this.#baseCircle.style.background = `url(file:///System/Library/WidgetResources/ibutton/${circleIdentifier}_rollie.png) no-repeat top left`;
    }
}