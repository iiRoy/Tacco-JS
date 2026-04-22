class RotaryControl {
    #elementTarget;
    #currentMagnitude;
    #initialMagnitudeOnInteraction;
    #lowerLimit;
    #upperLimit;
    #unitPerScreenPoint;
    #imageCount;
    #imageSegmentWidth;
    #pointerStartY;
    #interactionActive = false;

    #changeNotification;
    #startNotification;
    #endNotification;

    constructor(targetElement, configSettings) {
        this.#elementTarget = targetElement;

        const defaultSettings = {
            min: -100,
            max: 100,
            value: 0,
            unitsPerPixel: 1,
            numImages: 10,
            imageWidth: 32,
            onValueChange: null,
            onInteractionStart: null,
            onInteractionEnd: null
        };

        const finalSettings = { ...defaultSettings, ...configSettings };

        this.#lowerLimit = finalSettings.min;
        this.#upperLimit = finalSettings.max;
        this.#unitPerScreenPoint = finalSettings.unitsPerPixel;
        this.#imageCount = finalSettings.numImages;
        this.#imageSegmentWidth = finalSettings.imageWidth;

        this.#changeNotification = finalSettings.onValueChange;
        this.#startNotification = finalSettings.onInteractionStart;
        this.#endNotification = finalSettings.onInteractionEnd;

        this.#currentMagnitude = this.#constrainValue(finalSettings.value);
        this.#initialMagnitudeOnInteraction = this.#currentMagnitude;

        this.#elementTarget.classList.add("visual-rotary-control");
        this.#elementTarget.style.cursor = 'ns-resize';

        this.#setupInteractionListeners();
        this.#renderVisualState();
    }

    #constrainValue(val) {
        return Math.max(this.#lowerLimit, Math.min(val, this.#upperLimit));
    }

    #setupInteractionListeners() {
        this.#elementTarget.addEventListener('pointerdown', this.#handlePointerDown);
    }

    #removeInteractionListeners() {
        this.#elementTarget.removeEventListener('pointerdown', this.#handlePointerDown);
        document.removeEventListener('pointermove', this.#handlePointerMove);
        document.removeEventListener('pointerup', this.#handlePointerUp);
    }

    #handlePointerDown = (evt) => {
        evt.preventDefault();
        this.#interactionActive = true;
        this.#pointerStartY = evt.clientY;
        this.#initialMagnitudeOnInteraction = this.#currentMagnitude;

        document.addEventListener('pointermove', this.#handlePointerMove);
        document.addEventListener('pointerup', this.#handlePointerUp);

        if (this.#startNotification) {
            this.#startNotification({ currentMagnitude: this.#currentMagnitude });
        }
    };

    #handlePointerMove = (evt) => {
        if (!this.#interactionActive) return;

        const verticalDisplacement = evt.clientY - this.#pointerStartY;
        const potentialMagnitude = this.#initialMagnitudeOnInteraction + (verticalDisplacement * -this.#unitPerScreenPoint);
        
        const validatedMagnitude = this.#constrainValue(potentialMagnitude);

        if (validatedMagnitude !== this.#currentMagnitude) {
            this.#currentMagnitude = validatedMagnitude;
            this.#renderVisualState();
            if (this.#changeNotification) {
                this.#changeNotification({ currentMagnitude: this.#currentMagnitude });
            }
        }
    };

    #handlePointerUp = () => {
        this.#interactionActive = false;
        document.removeEventListener('pointermove', this.#handlePointerMove);
        document.removeEventListener('pointerup', this.#handlePointerUp);

        if (this.#endNotification) {
            this.#endNotification({ currentMagnitude: this.#currentMagnitude });
        }
    };

    #renderVisualState() {
        const rangeSpan = this.#upperLimit - this.#lowerLimit;
        const normalizedValue = (this.#currentMagnitude - this.#lowerLimit) / rangeSpan;
        const imageIndex = Math.round(normalizedValue * (this.#imageCount - 1));
        const backgroundOffset = imageIndex * this.#imageSegmentWidth;

        this.#elementTarget.style.backgroundPosition = `-${backgroundOffset}px 0`;
    }

    queryMagnitude() {
        return this.#currentMagnitude;
    }

    assignMagnitude(newVal) {
        if (typeof newVal === "number") {
            const constrainedVal = this.#constrainValue(newVal);
            if (constrainedVal !== this.#currentMagnitude) {
                this.#currentMagnitude = constrainedVal;
                this.#renderVisualState();
            }
        }
        return this;
    }

    deactivate() {
        this.#removeInteractionListeners();
        this.#elementTarget.classList.remove("visual-rotary-control");
        this.#elementTarget.style.cursor = '';
    }
}