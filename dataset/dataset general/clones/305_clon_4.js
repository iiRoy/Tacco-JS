const SLIDE_FRICTION_FACTOR = 3;
const INTERPOLATION_START_MARKER = "{{";
const INTERPOLATION_END_MARKER = "}}";

function adjustLeftPosition(elementNode, displacement) {
    elementNode.style.left = `${displacement}px`;
    return elementNode;
}

function modifyOpacity(elementNode, transparency) {
    elementNode.style.opacity = transparency;
    return elementNode;
}

function hideElement(elementNode) {
    return modifyOpacity(elementNode, 0);
}

function showElement(elementNode) {
    return modifyOpacity(elementNode, 1);
}

function fetchElementWidth(elementNode) {
    const computedWidth = parseFloat(getComputedStyle(elementNode).width);
    return isNaN(computedWidth) ? elementNode.offsetWidth : computedWidth;
}

function fetchHalfWidth(elementNode) {
    return fetchElementWidth(elementNode) / 2;
}

function fetchViewportLeft(elementNode) {
    return elementNode.getBoundingClientRect().left;
}

function calculateElementGap(firstElement, secondElement) {
    const leftEdge1 = fetchViewportLeft(firstElement);
    const leftEdge2 = fetchViewportLeft(secondElement);
    const width1 = fetchElementWidth(firstElement);
    const width2 = fetchElementWidth(secondElement);

    if (leftEdge1 > leftEdge2) {
        return leftEdge1 - (leftEdge2 + width2);
    }
    return leftEdge2 - (leftEdge1 + width1);
}

function snapToGridValue(currentValue, precisionDigits, stepIncrement, lowerBound, upperBound) {
    precisionDigits = precisionDigits === undefined || !precisionDigits ? 0 : precisionDigits;
    stepIncrement = stepIncrement === undefined || !stepIncrement || stepIncrement === 0 ? (1 / Math.pow(10, precisionDigits)) : stepIncrement;
    lowerBound = lowerBound === undefined || !lowerBound ? 0 : lowerBound;
    currentValue = currentValue === undefined || !currentValue ? 0 : currentValue;

    const initialOffset = currentValue - lowerBound;
    const stepsFromLower = initialOffset / stepIncrement;
    const roundedSteps = Math.round(stepsFromLower);
    let snappedValue = lowerBound + (roundedSteps * stepIncrement);

    upperBound = upperBound === undefined ? snappedValue : upperBound;

    snappedValue = Math.min(Math.max(snappedValue, lowerBound), upperBound);
    return parseFloat(snappedValue.toFixed(precisionDigits));
}

function alignBufferToStep(stepIncrement, bufferValue) {
    if (stepIncrement > 0 && !isNaN(bufferValue)) {
        return Math.ceil(bufferValue / stepIncrement) * stepIncrement;
    }
    return bufferValue;
}

class SliderMechanism {
    constructor(hostElement, configuration = {}) {
        this.minimumBoundary = parseFloat(configuration.minimum || 0);
        this.maximumBoundary = parseFloat(configuration.maximum || 100);
        this.stepInterval = parseFloat(configuration.stepSize || configuration.gridSpacing || 1);
        this.decimalPrecision = parseInt(configuration.decimalPlaces || 0, 10);
        this.proximityBuffer = parseFloat(configuration.bufferAmount || 0);
        this.dragResistance = parseFloat(configuration.stickinessFactor || SLIDE_FRICTION_FACTOR);
        this.displayMarkers = !!configuration.showGridMarkers;
        this.currentLowVal = parseFloat(configuration.initialLowValue || this.minimumBoundary);
        this.currentHighVal = parseFloat(configuration.initialHighValue || this.maximumBoundary);
        this.isControlDisabled = !!configuration.lockedState;
        this.valueChangeHandler = configuration.onValueUpdate || (() => {});
        this.valueFormatter = configuration.formatValue || (val => String(val));
        this.rangeFormatter = configuration.formatRange || ((high, low) => `${String(low)}-${String(high)}`);
        this.combinedFormatter = configuration.formatCombined || (val => String(val));
        this.valueTransformer = configuration.scaleFunction || (val => val);
        this.inverseTransformer = configuration.unscaleFunction || (val => val);

        this.containerNode = hostElement;
        this.hasDualHandles = configuration.initialHighValue !== undefined;

        this._domElements = {};
        this._buildComponentDOM();
        this._attachInteractionHandlers();
        this._initializeControlValues();
        this._updateVisuals();
    }

    _buildComponentDOM() {
        this.containerNode.classList.add('slider-component-wrapper');
        this.containerNode.innerHTML = '';

        this._domElements.mainTrack = this._createDiv('main-track');
        this._domElements.markerTrack = this._createDiv('marker-track');
        this._domElements.markerLabelsContainer = this._createDiv('marker-label-area', this._domElements.markerTrack);
        this._domElements.selectedTrack = this._createDiv('selected-range-track');
        this._domElements.unselectedLeftTrack = this._createDiv('unselected-left-track');
        this._domElements.unselectedRightTrack = this._createDiv('unselected-right-track');
        this._domElements.lowHandle = this._createDiv('control-handle low-handle');
        this._domElements.highHandle = this._createDiv('control-handle high-handle');
        this._domElements.lowBubble = this._createDiv('value-bubble low-value-bubble');
        this._domElements.highBubble = this._createDiv('value-bubble high-value-bubble');
        this._domElements.centerBubble = this._createDiv('value-bubble center-value-bubble');
        this._domElements.rangeBubble = this._createDiv('value-bubble range-value-bubble');
        this._domElements.minLimitDisplay = this._createDiv('limit-bubble min-limit-bubble');
        this._domElements.maxLimitDisplay = this._createDiv('limit-bubble max-limit-bubble');
        this._domElements.hiddenInputLow = this._createInput('hidden-value-low', 'hidden');
        this._domElements.hiddenInputHigh = this._createInput('hidden-value-high', 'hidden');
        this._domElements.hiddenInputRange = this._createInput('hidden-value-range', 'hidden');

        this.containerNode.append(
            this._domElements.mainTrack,
            this._domElements.markerTrack,
            this._domElements.selectedTrack,
            this._domElements.unselectedLeftTrack,
            this._domElements.unselectedRightTrack,
            this._domElements.lowHandle,
            this._domElements.highHandle,
            this._domElements.lowBubble,
            this._domElements.highBubble,
            this._domElements.centerBubble,
            this._domElements.rangeBubble,
            this._domElements.minLimitDisplay,
            this._domElements.maxLimitDisplay,
            this._domElements.hiddenInputLow,
            this._domElements.hiddenInputHigh,
            this._domElements.hiddenInputRange
        );

        if (!this.hasDualHandles) {
            hideElement(this._domElements.highHandle);
            hideElement(this._domElements.highBubble);
            hideElement(this._domElements.unselectedRightTrack);
            hideElement(this._domElements.unselectedLeftTrack);
            hideElement(this._domElements.rangeBubble);
            showElement(this._domElements.centerBubble);
        } else {
            hideElement(this._domElements.centerBubble);
        }

        if (!this.displayMarkers) {
            hideElement(this._domElements.markerTrack);
        }

        if (this.isControlDisabled) {
            this.containerNode.classList.add('disabled-state');
        }
    }

    _createDiv(className, parentElement) {
        const div = document.createElement('div');
        div.className = className;
        if (parentElement) {
            parentElement.appendChild(div);
        }
        return div;
    }

    _createInput(className, type) {
        const input = document.createElement('input');
        input.className = className;
        input.type = type;
        return input;
    }

    _initializeControlValues() {
        this.currentLowVal = snapToGridValue(this.currentLowVal, this.decimalPrecision, this.stepInterval, this.minimumBoundary, this.maximumBoundary);
        if (this.hasDualHandles) {
            this.currentHighVal = snapToGridValue(this.currentHighVal, this.decimalPrecision, this.stepInterval, this.minimumBoundary, this.maximumBoundary);
            this.currentHighVal = Math.max(this.currentHighVal, this.currentLowVal + alignBufferToStep(this.stepInterval, this.proximityBuffer));
        } else {
            this.currentHighVal = this.currentLowVal;
        }
        this._syncHiddenInputs();
    }

    _syncHiddenInputs() {
        this._domElements.hiddenInputLow.value = this.currentLowVal;
        if (this.hasDualHandles) {
            this._domElements.hiddenInputHigh.value = this.currentHighVal;
            this._domElements.hiddenInputRange.value = this.currentHighVal - this.currentLowVal;
        } else {
            this._domElements.hiddenInputRange.value = this.currentLowVal;
        }
    }

    _attachInteractionHandlers() {
        let activeDragHandle = null;
        let startClientCoord = 0;
        let initialLowValue = 0;
        let initialHighValue = 0;
        let trackWidth = 0;

        const handleDragStart = (evt, handleType) => {
            if (this.isControlDisabled) return;
            evt.preventDefault();
            activeDragHandle = handleType;
            startClientCoord = evt.clientX || evt.touches[0].clientX;
            trackWidth = this._domElements.mainTrack.offsetWidth;

            initialLowValue = this.currentLowVal;
            initialHighValue = this.currentHighVal;

            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('touchend', handleDragEnd);
            this.containerNode.classList.add('dragging');
        };

        const handleDragMove = (evt) => {
            if (!activeDragHandle) return;
            evt.preventDefault();
            const currentClientCoord = evt.clientX || evt.touches[0].clientX;
            const deltaPixels = currentClientCoord - startClientCoord;

            let newLow = this.currentLowVal;
            let newHigh = this.currentHighVal;

            const valuePerPixel = (this.valueTransformer(this.maximumBoundary) - this.valueTransformer(this.minimumBoundary)) / trackWidth;
            let valueDisplacement = deltaPixels * valuePerPixel;

            if (this.dragResistance > 1) {
                valueDisplacement /= this.dragResistance;
            }

            if (activeDragHandle === 'low') {
                newLow = initialLowValue + this.inverseTransformer(valueDisplacement);
            } else if (activeDragHandle === 'high') {
                newHigh = initialHighValue + this.inverseTransformer(valueDisplacement);
            } else if (activeDragHandle === 'selection-range') {
                newLow = initialLowValue + this.inverseTransformer(valueDisplacement);
                newHigh = initialHighValue + this.inverseTransformer(valueDisplacement);
            }

            this._updateSliderValues(newLow, newHigh);
        };

        const handleDragEnd = () => {
            activeDragHandle = null;
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
            this.containerNode.classList.remove('dragging');

            this._updateSliderValues(this.currentLowVal, this.currentHighVal, true);
        };

        this._domElements.lowHandle.addEventListener('mousedown', (e) => handleDragStart(e, 'low'));
        this._domElements.lowHandle.addEventListener('touchstart', (e) => handleDragStart(e, 'low'));

        if (this.hasDualHandles) {
            this._domElements.highHandle.addEventListener('mousedown', (e) => handleDragStart(e, 'high'));
            this._domElements.highHandle.addEventListener('touchstart', (e) => handleDragStart(e, 'high'));
            this._domElements.selectedTrack.addEventListener('mousedown', (e) => handleDragStart(e, 'selection-range'));
            this._domElements.selectedTrack.addEventListener('touchstart', (e) => handleDragStart(e, 'selection-range'));
        }

        this.containerNode.addEventListener('click', (e) => {
            if (this.isControlDisabled) return;
            if (e.target === this._domElements.lowHandle || e.target === this._domElements.highHandle || e.target === this._domElements.selectedTrack) {
                return;
            }

            const clickX = e.clientX || e.touches[0].clientX;
            const trackRect = this._domElements.mainTrack.getBoundingClientRect();
            const clickPositionRelative = clickX - trackRect.left;

            const targetValue = this._positionToValue(clickPositionRelative);

            if (this.hasDualHandles) {
                const lowHandlePos = this._valueToPosition(this.currentLowVal);
                const highHandlePos = this._valueToPosition(this.currentHighVal);

                if (Math.abs(clickPositionRelative - lowHandlePos) <= Math.abs(clickPositionRelative - highHandlePos)) {
                    this._updateSliderValues(targetValue, this.currentHighVal, true);
                } else {
                    this._updateSliderValues(this.currentLowVal, targetValue, true);
                }
            } else {
                this._updateSliderValues(targetValue, targetValue, true);
            }
        });
    }

    _updateSliderValues(proposedLow, proposedHigh, forceSnap = false) {
        let actualLow = this.inverseTransformer(proposedLow);
        let actualHigh = this.inverseTransformer(proposedHigh);

        actualLow = Math.min(Math.max(actualLow, this.minimumBoundary), this.maximumBoundary);
        actualHigh = Math.min(Math.max(actualHigh, this.minimumBoundary), this.maximumBoundary);

        if (this.hasDualHandles) {
            const minAllowedHigh = actualLow + alignBufferToStep(this.stepInterval, this.proximityBuffer);
            if (actualHigh < minAllowedHigh) {
                if (proposedLow !== this.currentLowVal) {
                    actualHigh = minAllowedHigh;
                } else {
                    actualLow = actualHigh - alignBufferToStep(this.stepInterval, this.proximityBuffer);
                }
            }
        } else {
            actualHigh = actualLow;
        }

        if (forceSnap || this.stepInterval > 0) {
            actualLow = snapToGridValue(actualLow, this.decimalPrecision, this.stepInterval, this.minimumBoundary, this.maximumBoundary);
            actualHigh = snapToGridValue(actualHigh, this.decimalPrecision, this.stepInterval, this.minimumBoundary, this.maximumBoundary);

            if (this.hasDualHandles) {
                const minAllowedHigh = actualLow + alignBufferToStep(this.stepInterval, this.proximityBuffer);
                if (actualHigh < minAllowedHigh) {
                    actualHigh = minAllowedHigh;
                }
            }
        }

        actualLow = Math.min(Math.max(actualLow, this.minimumBoundary), this.maximumBoundary);
        actualHigh = Math.min(Math.max(actualHigh, this.minimumBoundary), this.maximumBoundary);

        if (this.currentLowVal !== actualLow || this.currentHighVal !== actualHigh) {
            this.currentLowVal = actualLow;
            this.currentHighVal = actualHigh;
            this._updateVisuals();
            this.valueChangeHandler({ low: this.currentLowVal, high: this.currentHighVal });
        }
    }

    _valueToPosition(value) {
        const scaledVal = this.valueTransformer(value);
        const scaledMin = this.valueTransformer(this.minimumBoundary);
        const scaledMax = this.valueTransformer(this.maximumBoundary);

        const scaledRange = scaledMax - scaledMin;
        if (scaledRange === 0) return 0;
        const fraction = (scaledVal - scaledMin) / scaledRange;
        return fraction * this._domElements.mainTrack.offsetWidth;
    }

    _positionToValue(pixelPosition) {
        const trackWidth = this._domElements.mainTrack.offsetWidth;
        if (trackWidth === 0) return this.currentLowVal;

        const fraction = pixelPosition / trackWidth;

        const scaledMin = this.valueTransformer(this.minimumBoundary);
        const scaledMax = this.valueTransformer(this.maximumBoundary);
        const scaledRange = scaledMax - scaledMin;

        const scaledResult = scaledMin + fraction * scaledRange;
        return this.inverseTransformer(scaledResult);
    }

    _updateVisuals() {
        const trackWidth = this._domElements.mainTrack.offsetWidth;
        if (trackWidth === 0) {
            requestAnimationFrame(() => this._updateVisuals());
            return;
        }

        const lowHandlePixelPos = this._valueToPosition(this.currentLowVal);
        const highHandlePixelPos = this._valueToPosition(this.currentHighVal);

        adjustLeftPosition(this._domElements.lowHandle, lowHandlePixelPos - fetchHalfWidth(this._domElements.lowHandle));
        if (this.hasDualHandles) {
            adjustLeftPosition(this._domElements.highHandle, highHandlePixelPos - fetchHalfWidth(this._domElements.highHandle));
        }

        if (this.hasDualHandles) {
            this._domElements.selectedTrack.style.left = `${lowHandlePixelPos}px`;
            this._domElements.selectedTrack.style.width = `${highHandlePixelPos - lowHandlePixelPos}px`;

            this._domElements.unselectedLeftTrack.style.width = `${lowHandlePixelPos}px`;
            this._domElements.unselectedRightTrack.style.left = `${highHandlePixelPos}px`;
            this._domElements.unselectedRightTrack.style.width = `${trackWidth - highHandlePixelPos}px`;
        } else {
            this._domElements.selectedTrack.style.left = '0px';
            this._domElements.selectedTrack.style.width = `${lowHandlePixelPos}px`;
            hideElement(this._domElements.unselectedLeftTrack);
            hideElement(this._domElements.unselectedRightTrack);
        }

        this._domElements.minLimitDisplay.textContent = this.valueFormatter(this.minimumBoundary);
        adjustLeftPosition(this._domElements.minLimitDisplay, 0);

        this._domElements.maxLimitDisplay.textContent = this.valueFormatter(this.maximumBoundary);
        adjustLeftPosition(this._domElements.maxLimitDisplay, trackWidth - fetchElementWidth(this._domElements.maxLimitDisplay));

        this._domElements.lowBubble.textContent = this.valueFormatter(this.currentLowVal);
        adjustLeftPosition(this._domElements.lowBubble, lowHandlePixelPos - fetchHalfWidth(this._domElements.lowBubble));

        if (this.hasDualHandles) {
            this._domElements.highBubble.textContent = this.valueFormatter(this.currentHighVal);
            adjustLeftPosition(this._domElements.highBubble, highHandlePixelPos - fetchHalfWidth(this._domElements.highBubble));

            this._domElements.rangeBubble.textContent = this.rangeFormatter(this.currentHighVal, this.currentLowVal);
            adjustLeftPosition(this._domElements.rangeBubble, lowHandlePixelPos + (highHandlePixelPos - lowHandlePixelPos) / 2 - fetchHalfWidth(this._domElements.rangeBubble));
        } else {
            this._domElements.centerBubble.textContent = this.combinedFormatter(this.currentLowVal);
            adjustLeftPosition(this._domElements.centerBubble, lowHandlePixelPos - fetchHalfWidth(this._domElements.centerBubble));
        }

        if (this.displayMarkers) {
            this._generateStepMarkers();
        }

        this._syncHiddenInputs();
    }

    _generateStepMarkers() {
        this._domElements.markerLabelsContainer.innerHTML = '';
        const effectiveRange = this.maximumBoundary - this.minimumBoundary;
        if (this.stepInterval <= 0 || effectiveRange <= 0) return;

        const numSteps = effectiveRange / this.stepInterval;
        const totalTrackWidth = this._domElements.mainTrack.offsetWidth;

        for (let i = 0; i <= numSteps; i++) {
            const markerValue = this.minimumBoundary + i * this.stepInterval;
            const markerLabel = this._createDiv('step-label');
            markerLabel.textContent = this.valueFormatter(markerValue);
            const markerPosition = this._valueToPosition(markerValue);
            adjustLeftPosition(markerLabel, markerPosition - fetchHalfWidth(markerLabel));
            this._domElements.markerLabelsContainer.appendChild(markerLabel);
        }
    }

    setLowerBound(value) {
        this._updateSliderValues(value, this.currentHighVal, true);
    }

    setUpperBound(value) {
        if (!this.hasDualHandles) return;
        this._updateSliderValues(this.currentLowVal, value, true);
    }

    setRangeValues(low, high) {
        if (!this.hasDualHandles) return;
        this._updateSliderValues(low, high, true);
    }

    toggleLock(lockState) {
        this.isControlDisabled = lockState;
        this.containerNode.classList.toggle('disabled-state', lockState);
    }
}

window.CustomRangeSliderFactory = {
    manufacture: function(targetContainerId, sliderOptions) {
        const targetElement = document.getElementById(targetContainerId);
        if (!targetElement) {
            console.error(`CustomRangeSliderFactory: Target element with ID '${targetContainerId}' not found.`);
            return null;
        }
        return new SliderMechanism(targetElement, sliderOptions);
    }
};