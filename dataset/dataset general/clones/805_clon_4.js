(function() {
    'use strict';

    const initialParameters = {
        enabled: true,
        direction: 'horizontal',
        increment: 0,
        decimalDigits: 0,
        displayValues: true,
        preventOverlap: false,
        attachValueDisplays: false
    };

    const pointerActions = window.navigator.pointerEnabled ? {
        begin: 'pointerdown',
        move: 'pointermove',
        terminate: 'pointerup'
    } : window.navigator.msPointerEnabled ? {
        begin: 'MSPointerDown',
        move: 'MSPointerMove',
        terminate: 'MSPointerUp'
    } : {
        begin: 'mousedown touchstart',
        move: 'mousemove touchmove',
        terminate: 'mouseup touchend'
    };

    const retrieveCoordinates = function(occurrence) {
        try {
            return [(occurrence.clientX || occurrence.originalEvent.clientX || occurrence.originalEvent.touches[0].clientX), (occurrence.clientY || occurrence.originalEvent.clientY || occurrence.originalEvent.touches[0].clientY)];
        } catch (e) {
            return ['x', 'y'];
        }
    };

    const confineValue = function(input) {
        return (input < 0 ? 0 : (input > 100 ? 100 : input));
    };

    const checkNumeric = function(val) {
        return !isNaN(parseFloat(val)) && isFinite(val);
    };

    class FlexiRange {
        constructor(parentElement, config = {}) {
            this.container = parentElement;
            this.internalState = {
                ...initialParameters,
                ...config
            };

            this.internalState.minimum = parseFloat(this.internalState.minimum);
            this.internalState.maximum = parseFloat(this.internalState.maximum);
            this.internalState.currentMinimum = parseFloat(this.internalState.currentMinimum || this.internalState.minimum);
            this.internalState.currentMaximum = parseFloat(this.internalState.currentMaximum || this.internalState.maximum);
            this.internalState.increment = parseFloat(this.internalState.increment);
            this.internalState.decimalDigits = parseInt(this.internalState.decimalDigits, 10);

            if (this.internalState.minimum > this.internalState.maximum) {
                console.error('Minimum value must be less than or equal to maximum value.');
                [this.internalState.minimum, this.internalState.maximum] = [this.internalState.maximum, this.internalState.minimum];
            }

            if (this.internalState.currentMinimum > this.internalState.currentMaximum) {
                console.warn('Current minimum value must be less than or equal to current maximum value. Adjusting current minimum.');
                this.internalState.currentMinimum = this.internalState.currentMaximum;
            }

            this.domRefs = {};
            this.activeHandle = null;
            this.initialDragCoord = null;
            this.initialHandlePercent = null;

            this.buildComponent();
            this.attachEventListeners();
            this.updateComponentVisuals();
        }

        buildComponent() {
            this.container.classList.add('flexi-slider-wrapper');
            if (this.internalState.direction.includes('vertical')) {
                this.container.classList.add('flexi-vertical');
            } else {
                this.container.classList.add('flexi-horizontal');
            }

            this.domRefs.trackElement = document.createElement('div');
            this.domRefs.trackElement.classList.add('flexi-track');

            this.domRefs.minHandle = document.createElement('div');
            this.domRefs.minHandle.classList.add('flexi-control', 'flexi-control-min');
            this.domRefs.minHandle.appendChild(document.createElement('i'));
            this.domRefs.trackElement.appendChild(this.domRefs.minHandle);

            this.domRefs.maxHandle = document.createElement('div');
            this.domRefs.maxHandle.classList.add('flexi-control', 'flexi-control-max');
            this.domRefs.maxHandle.appendChild(document.createElement('i'));
            this.domRefs.trackElement.appendChild(this.domRefs.maxHandle);

            this.domRefs.connectionLine = document.createElement('div');
            this.domRefs.connectionLine.classList.add('flexi-connection');
            this.domRefs.trackElement.appendChild(this.domRefs.connectionLine);

            this.container.appendChild(this.domRefs.trackElement);

            this.domRefs.valueDisplayContainer = document.createElement('div');
            this.domRefs.valueDisplayContainer.classList.add('flexi-value-track');
            if (this.internalState.attachValueDisplays) {
                this.domRefs.valueDisplayContainer.classList.add('flexi-attached-values');
            }

            this.domRefs.minValueDisplay = document.createElement('div');
            this.domRefs.minValueDisplay.classList.add('flexi-value', 'flexi-value-min');
            this.domRefs.minValueDisplayInner = document.createElement('div');
            this.domRefs.minValueDisplay.appendChild(this.domRefs.minValueDisplayInner);
            this.domRefs.valueDisplayContainer.appendChild(this.domRefs.minValueDisplay);

            this.domRefs.maxValueDisplay = document.createElement('div');
            this.domRefs.maxValueDisplay.classList.add('flexi-value', 'flexi-value-max');
            this.domRefs.maxValueDisplayInner = document.createElement('div');
            this.domRefs.maxValueDisplay.appendChild(this.domRefs.maxValueDisplayInner);
            this.domRefs.valueDisplayContainer.appendChild(this.domRefs.maxValueDisplay);

            this.container.appendChild(this.domRefs.valueDisplayContainer);
        }

        attachEventListeners() {
            const beginEvents = pointerActions.begin.split(' ');
            beginEvents.forEach(eventName => {
                this.domRefs.minHandle.addEventListener(eventName, this.handleInteractionStart.bind(this, 0), false);
                this.domRefs.maxHandle.addEventListener(eventName, this.handleInteractionStart.bind(this, 1), false);
            });
        }

        handleInteractionStart(handleIndex, event) {
            if (this.internalState.enabled === false) return;
            event.preventDefault();

            this.activeHandle = handleIndex;
            this.container.classList.add('flexi-active');
            this.domRefs.minHandle.classList.remove('flexi-down');
            this.domRefs.maxHandle.classList.remove('flexi-down');
            this.domRefs[handleIndex === 0 ? 'minHandle' : 'maxHandle'].classList.add('flexi-down');

            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';

            this.initialDragCoord = retrieveCoordinates(event);
            this.initialHandlePercent = this.valueToPercentage(this.internalState[handleIndex === 0 ? 'currentMinimum' : 'currentMaximum']);

            const moveEvents = pointerActions.move.split(' ');
            const terminateEvents = pointerActions.terminate.split(' ');

            moveEvents.forEach(eventName => document.addEventListener(eventName, this.handleInteractionMove, false));
            terminateEvents.forEach(eventName => document.addEventListener(eventName, this.handleInteractionEnd, false));

            if (typeof this.internalState.onGrasp === 'function') {
                this.internalState.onGrasp(handleIndex === 0 ? 'min' : 'max');
            }
        }

        handleInteractionMove = (event) => {
            event.preventDefault();

            if (this.activeHandle === null) return;

            const currentCoords = retrieveCoordinates(event);
            const trackRect = this.domRefs.trackElement.getBoundingClientRect();

            let deltaPercent;
            if (this.internalState.direction.includes('vertical')) {
                const trackHeight = trackRect.height;
                deltaPercent = ((this.initialDragCoord[1] - currentCoords[1]) / trackHeight) * 100;
            } else {
                const trackWidth = trackRect.width;
                deltaPercent = ((currentCoords[0] - this.initialDragCoord[0]) / trackWidth) * 100;
            }

            let newPercent = this.initialHandlePercent + deltaPercent;
            newPercent = confineValue(newPercent);

            let newValue = this.percentageToValue(newPercent);

            const rangeSpan = this.internalState.maximum - this.internalState.minimum;
            const minAllowedDifference = this.internalState.increment > 0 ? this.internalState.increment : 0;

            if (this.internalState.fixedHandle === 'min') {
                this.internalState.currentMaximum = newValue;
            } else if (this.internalState.fixedHandle === 'max') {
                this.internalState.currentMinimum = newValue;
            } else {
                if (this.activeHandle === 0) {
                    if (this.internalState.preventOverlap) {
                        newValue = Math.min(newValue, this.internalState.currentMaximum - minAllowedDifference);
                    }
                    this.internalState.currentMinimum = Math.min(Math.max(newValue, this.internalState.minimum), this.internalState.currentMaximum);
                } else {
                    if (this.internalState.preventOverlap) {
                        newValue = Math.max(newValue, this.internalState.currentMinimum + minAllowedDifference);
                    }
                    this.internalState.currentMaximum = Math.max(Math.min(newValue, this.internalState.maximum), this.internalState.currentMinimum);
                }
            }

            this.updateComponentVisuals();

            if (typeof this.internalState.onMove === 'function') {
                this.internalState.onMove(this.internalState.currentMinimum, this.internalState.currentMaximum);
            }
        }

        handleInteractionEnd = () => {
            const moveEvents = pointerActions.move.split(' ');
            const terminateEvents = pointerActions.terminate.split(' ');

            moveEvents.forEach(eventName => document.removeEventListener(eventName, this.handleInteractionMove, false));
            terminateEvents.forEach(eventName => document.removeEventListener(eventName, this.handleInteractionEnd, false));

            this.container.classList.remove('flexi-active');
            this.domRefs.minHandle.classList.remove('flexi-down');
            this.domRefs.maxHandle.classList.remove('flexi-down');

            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            this.activeHandle = null;
            this.initialDragCoord = null;
            this.initialHandlePercent = null;

            if (typeof this.internalState.onRelease === 'function') {
                this.internalState.onRelease(this.internalState.currentMinimum, this.internalState.currentMaximum);
            }
        }

        valueToPercentage(value) {
            const range = this.internalState.maximum - this.internalState.minimum;
            if (range === 0) return 0;
            return ((value - this.internalState.minimum) / range) * 100;
        }

        percentageToValue(percent) {
            const range = this.internalState.maximum - this.internalState.minimum;
            let value = this.internalState.minimum + (percent / 100) * range;

            if (this.internalState.increment > 0) {
                value = Math.round(value / this.internalState.increment) * this.internalState.increment;
            }

            return parseFloat(value.toFixed(this.internalState.decimalDigits));
        }

        applyValueFormatting(val) {
            if (this.internalState.formatter) {
                if (typeof this.internalState.formatter === 'function') {
                    return this.internalState.formatter(val);
                } else if (typeof this.internalState.formatter === 'string') {
                    if (this.internalState.formatter === 'currency' && this.internalState.formatterOptions) {
                        return this.internalState.formatterOptions + val.toFixed(this.internalState.decimalDigits);
                    }
                    if (this.internalState.formatter === 'number' && this.internalState.formatterOptions) {
                         return val.toFixed(parseInt(this.internalState.formatterOptions, 10));
                    }
                }
            }
            return val.toFixed(this.internalState.decimalDigits);
        }

        updateComponentVisuals() {
            const minPercent = confineValue(this.valueToPercentage(this.internalState.currentMinimum));
            const maxPercent = confineValue(this.valueToPercentage(this.internalState.currentMaximum));

            const styleProp = this.internalState.direction.includes('vertical') ? 'top' : 'left';
            const styleOppProp = this.internalState.direction.includes('vertical') ? 'bottom' : 'right';

            this.domRefs.minHandle.style[styleProp] = minPercent + '%';
            this.domRefs.maxHandle.style[styleProp] = maxPercent + '%';

            this.domRefs.connectionLine.style[styleProp] = minPercent + '%';
            this.domRefs.connectionLine.style[styleOppProp] = (100 - maxPercent) + '%';

            this.domRefs.minValueDisplayInner.textContent = this.applyValueFormatting(this.internalState.currentMinimum);
            this.domRefs.maxValueDisplayInner.textContent = this.applyValueFormatting(this.internalState.currentMaximum);

            this.domRefs.minValueDisplay.style.display = this.internalState.displayValues ? 'block' : 'none';
            this.domRefs.maxValueDisplay.style.display = this.internalState.displayValues ? 'block' : 'none';

            if (this.internalState.attachValueDisplays) {
                this.domRefs.minValueDisplay.style[styleProp] = minPercent + '%';
                this.domRefs.maxValueDisplay.style[styleProp] = maxPercent + '%';
                this.domRefs.maxValueDisplay.style[styleOppProp] = 'auto';
            }

            if (this.internalState.fixedHandle === 'min') {
                this.domRefs.minHandle.style.display = 'none';
                this.domRefs.maxHandle.style.display = 'block';
            } else if (this.internalState.fixedHandle === 'max') {
                this.domRefs.minHandle.style.display = 'block';
                this.domRefs.maxHandle.style.display = 'none';
            } else {
                this.domRefs.minHandle.style.display = 'block';
                this.domRefs.maxHandle.style.display = 'block';
            }

            if (this.internalState.enabled === false) {
                this.container.classList.add('flexi-disabled');
            } else {
                this.container.classList.remove('flexi-disabled');
            }

            if (minPercent > 95 && !this.internalState.direction.includes('vertical')) {
                this.domRefs.minHandle.style.zIndex = 3;
            } else {
                this.domRefs.minHandle.style.zIndex = '';
            }
        }

        setRange(newMin, newMax) {
            if (!checkNumeric(newMin) || !checkNumeric(newMax)) {
                console.error('Invalid numeric values for setRange.');
                return;
            }
            this.internalState.minimum = parseFloat(newMin);
            this.internalState.maximum = parseFloat(newMax);
            this.updateComponentVisuals();
        }

        setCurrentValues(newCurrentMin, newCurrentMax) {
            if (!checkNumeric(newCurrentMin) || !checkNumeric(newCurrentMax)) {
                console.error('Invalid numeric values for setCurrentValues.');
                return;
            }
            this.internalState.currentMinimum = parseFloat(newCurrentMin);
            this.internalState.currentMaximum = parseFloat(newCurrentMax);

            this.internalState.currentMinimum = Math.max(this.internalState.minimum, this.internalState.currentMinimum);
            this.internalState.currentMaximum = Math.min(this.internalState.maximum, this.internalState.currentMaximum);

            if (this.internalState.currentMinimum > this.internalState.currentMaximum) {
                this.internalState.currentMinimum = this.internalState.currentMaximum;
            }
            this.updateComponentVisuals();
        }

        disableComponent(status) {
            this.internalState.enabled = !status;
            this.updateComponentVisuals();
        }
    }

    window.FlexiRange = FlexiRange;

})();