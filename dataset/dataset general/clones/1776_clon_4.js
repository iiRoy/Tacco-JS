(function() {
    const defaultSettings = {
        animationDuration: 400,
        minLimit: 1,
        maxLimit: 10
    };

    function initiateRangeController(targetSelector, customOptions = {}) {
        const mergedSettings = Object.assign({}, defaultSettings, customOptions);

        document.querySelectorAll(targetSelector).forEach(initialInput => {
            if (initialInput.tagName !== 'INPUT') {
                console.warn('Range control can only be applied to input elements.', initialInput);
                return;
            }
            new RangeInteractionHandler(initialInput, mergedSettings);
        });
    }

    class RangeInteractionHandler {
        constructor(inputElement, config) {
            this.sourceInput = inputElement;
            this.configuration = config;
            this.isDraggingActive = false;
            this.trackOffset = 0;
            this.trackDimension = 0;
            this.indicatorWidth = 0;

            this.constructVisualComponents();
            this.setupEventBindings();
            this.establishInitialState();
        }

        constructVisualComponents() {
            this.sourceInput.classList.add('valueInput');

            const originalParent = this.sourceInput.parentNode;
            const existingLabel = originalParent.querySelector('label');

            const displayWrapper = document.createElement('div');
            displayWrapper.classList.add('controlWrapper');

            const labelDisplay = document.createElement('label');
            labelDisplay.classList.add('labelDisplay');
            if (existingLabel) {
                labelDisplay.innerHTML = existingLabel.innerHTML;
            } else {
                labelDisplay.innerHTML = '';
            }

            this.sliderTrack = document.createElement('span');
            this.sliderTrack.classList.add('sliderTrack');

            this.sliderFill = document.createElement('span');
            this.sliderFill.classList.add('sliderFill');

            this.sliderThumb = document.createElement('span');
            this.sliderThumb.classList.add('sliderThumb');

            this.sliderFill.appendChild(this.sliderThumb);
            this.sliderTrack.appendChild(this.sliderFill);

            const inputHolder = document.createElement('span');
            inputHolder.appendChild(this.sourceInput);

            displayWrapper.appendChild(labelDisplay);
            displayWrapper.appendChild(this.sliderTrack);
            displayWrapper.appendChild(inputHolder);

            while (originalParent.firstChild) {
                originalParent.removeChild(originalParent.firstChild);
            }
            originalParent.appendChild(displayWrapper);

            this.sliderTrack = displayWrapper.querySelector('.sliderTrack');
            this.sliderFill = displayWrapper.querySelector('.sliderFill');
            this.sliderThumb = displayWrapper.querySelector('.sliderThumb');
            this.sourceInput = displayWrapper.querySelector('.valueInput');
        }

        establishInitialState() {
            this.updateComponentDimensions();
            const initialInputVal = parseFloat(this.sourceInput.value);
            const initialPercentage = this.constrainPercentageValue(initialInputVal * 10);
            this.applyVisualAndInputValue(initialPercentage, false);
        }

        updateComponentDimensions() {
            const trackRect = this.sliderTrack.getBoundingClientRect();
            this.trackOffset = trackRect.left + window.scrollX;
            this.trackDimension = this.sliderTrack.offsetWidth;
            this.indicatorWidth = this.sliderThumb.offsetWidth;
        }

        setupEventBindings() {
            window.addEventListener('resize', this.updateComponentDimensions.bind(this));

            this.sliderTrack.addEventListener('click', this.handleTrackClick.bind(this));
            this.sliderThumb.addEventListener('mousedown', this.handleThumbMouseDown.bind(this));
            this.sourceInput.addEventListener('change', this.handleInputValueChange.bind(this));
        }

        applyVisualAndInputValue(newPercentage, shouldAnimate) {
            const constrainedPercentage = this.constrainPercentageValue(newPercentage);

            if (shouldAnimate) {
                this.sliderFill.style.transition = `width ${this.configuration.animationDuration}ms ease-out`;
            } else {
                this.sliderFill.style.transition = 'none';
            }

            this.sliderFill.style.width = `${constrainedPercentage}%`;
            this.sourceInput.value = (constrainedPercentage / 10).toFixed(0);
        }

        handleTrackClick(evt) {
            evt.preventDefault();
            const calculatedPercentage = this.calculatePercentageFromEvent(evt);
            this.applyVisualAndInputValue(calculatedPercentage, true);
        }

        handleThumbMouseDown(evt) {
            evt.preventDefault();
            this.isDraggingActive = true;
            this.sliderFill.style.transition = 'none';

            const moveHandler = this.handleDocumentMouseMove.bind(this);
            const releaseHandler = this.handleDocumentMouseUp.bind(this, moveHandler);

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', releaseHandler);
        }

        handleDocumentMouseMove(evt) {
            evt.preventDefault();
            if (this.isDraggingActive) {
                const calculatedPercentage = this.calculatePercentageFromEvent(evt);
                this.applyVisualAndInputValue(calculatedPercentage, false);
            }
        }

        handleDocumentMouseUp(moveHandler, evt) {
            evt.preventDefault();
            this.isDraggingActive = false;
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', this.handleDocumentMouseUp);
        }

        handleInputValueChange() {
            let inputVal = parseFloat(this.sourceInput.value);
            if (inputVal > this.configuration.maxLimit) {
                inputVal = this.configuration.maxLimit;
                this.sourceInput.value = inputVal;
            } else if (inputVal < this.configuration.minLimit) {
                inputVal = this.configuration.minLimit;
                this.sourceInput.value = inputVal;
            }
            const newPercentage = inputVal * 10;
            this.applyVisualAndInputValue(newPercentage, true);
        }

        calculatePercentageFromEvent(eventObject) {
            const normalizedX = eventObject.pageX - this.trackOffset + (this.indicatorWidth / 2);
            const rawPercentage = (normalizedX / this.trackDimension) * 100;
            return Math.round(rawPercentage);
        }

        constrainPercentageValue(valueToConstrain) {
            const lowerBoundPct = this.configuration.minLimit * 10;
            const upperBoundPct = this.configuration.maxLimit * 10;

            if (valueToConstrain < lowerBoundPct) {
                return lowerBoundPct;
            } else if (valueToConstrain > upperBoundPct) {
                return upperBoundPct;
            } else {
                return valueToConstrain;
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initiateRangeController('input');
    });
})();