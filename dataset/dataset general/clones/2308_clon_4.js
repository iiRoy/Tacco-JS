const visualDefinitionSource = `
.numerical-adjuster-wrapper {
    display: inline-flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: sans-serif;
    font-size: 16px;
    padding: 2px;
}

.numerical-adjuster-input {
    width: 60px;
    text-align: center;
    border: none;
    outline: none;
    font-size: inherit;
    padding: 0 4px;
    -moz-appearance: textfield; /* Hide arrows in Firefox */
}

.numerical-adjuster-input::-webkit-outer-spin-button,
.numerical-adjuster-input::-webkit-inner-spin-button {
    -webkit-appearance: none; /* Hide arrows in Chrome, Safari */
    margin: 0;
}


.numerical-adjuster-button {
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    padding: 4px 8px;
    margin: 0 2px;
    font-size: inherit;
    line-height: 1;
    user-select: none;
}

.numerical-adjuster-button:hover {
    background-color: #ddd;
}

.numerical-adjuster-button:active {
    background-color: #ccc;
}
`;

function applyVisualSettings(cssContent) {
    const fashionElement = document.createElement('style');
    fashionElement.textContent = cssContent;
    document.head.appendChild(fashionElement);
}

applyVisualSettings(visualDefinitionSource);


function reportCurrentValue(presentDatum) {
    console.log(presentDatum);
}


class QuantityControl {
    constructor(insertionPoint, initialParameters) {
        this.insertionPoint = insertionPoint;
        this.componentConfiguration = {
            initialValue: initialParameters.initialValue || 0,
            minimumBound: initialParameters.minimumBound || 0,
            maximumBound: initialParameters.maximumBound || 1,
            incrementSize: initialParameters.incrementSize || 0.01,
            precisionDigits: initialParameters.precisionDigits || 2,
            callbackOnAlteration: initialParameters.callbackOnAlteration || (() => {}),
            styleClass: initialParameters.styleClass || ''
        };

        this.currentAmount = this.componentConfiguration.initialValue;
        this.managedElements = {};

        this.constructInterface();
        this.updateDisplay();
    }

    constructInterface() {
        const controlDisplay = document.createElement('div');
        controlDisplay.className = `numerical-adjuster-wrapper ${this.componentConfiguration.styleClass}`;

        const decreaseAction = document.createElement('button');
        decreaseAction.className = 'numerical-adjuster-button';
        decreaseAction.textContent = '−'; // Minus sign
        decreaseAction.addEventListener('click', () => this.adjustMagnitude(-this.componentConfiguration.incrementSize));

        const valueDisplayInput = document.createElement('input');
        valueDisplayInput.className = 'numerical-adjuster-input';
        valueDisplayInput.type = 'text';
        valueDisplayInput.setAttribute('inputmode', 'decimal'); // For mobile keyboards
        valueDisplayInput.addEventListener('change', (event) => this.processInput(event.target.value));
        valueDisplayInput.addEventListener('blur', (event) => this.processInput(event.target.value));

        const increaseAction = document.createElement('button');
        increaseAction.className = 'numerical-adjuster-button';
        increaseAction.textContent = '+';
        increaseAction.addEventListener('click', () => this.adjustMagnitude(this.componentConfiguration.incrementSize));

        controlDisplay.appendChild(decreaseAction);
        controlDisplay.appendChild(valueDisplayInput);
        controlDisplay.appendChild(increaseAction);

        this.managedElements.controlDisplay = controlDisplay;
        this.managedElements.valueDisplayInput = valueDisplayInput;
        this.insertionPoint.appendChild(controlDisplay);
    }

    formatNumericalValue(value) {
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            numValue = this.componentConfiguration.initialValue;
        }
        
        // Clamp to min/max
        numValue = Math.max(this.componentConfiguration.minimumBound, Math.min(this.componentConfiguration.maximumBound, numValue));
        
        // Round to nearest step for display, then to fixed precision
        const roundedToStep = Math.round(numValue / this.componentConfiguration.incrementSize) * this.componentConfiguration.incrementSize;
        return roundedToStep.toFixed(this.componentConfiguration.precisionDigits);
    }

    updateDisplay() {
        this.managedElements.valueDisplayInput.value = this.formatNumericalValue(this.currentAmount);
        this.componentConfiguration.callbackOnAlteration(parseFloat(this.managedElements.valueDisplayInput.value));
    }

    adjustMagnitude(delta) {
        let proposedAmount = this.currentAmount + delta;
        proposedAmount = Math.max(this.componentConfiguration.minimumBound, Math.min(this.componentConfiguration.maximumBound, proposedAmount));
        
        // Counteract floating point inaccuracies for additions/subtractions
        const scaleFactor = Math.pow(10, this.componentConfiguration.precisionDigits + 4); // Use higher precision for intermediate calculation
        proposedAmount = Math.round(proposedAmount * scaleFactor) / scaleFactor;

        if (proposedAmount !== this.currentAmount) {
            this.currentAmount = proposedAmount;
            this.updateDisplay();
        }
    }

    processInput(inputValue) {
        let parsedInput = parseFloat(inputValue);
        if (isNaN(parsedInput)) {
            parsedInput = this.componentConfiguration.initialValue;
        }
        parsedInput = Math.max(this.componentConfiguration.minimumBound, Math.min(this.componentConfiguration.maximumBound, parsedInput));
        
        // Snap to step grid
        parsedInput = Math.round(parsedInput / this.componentConfiguration.incrementSize) * this.componentConfiguration.incrementSize;

        if (parsedInput !== this.currentAmount) {
            this.currentAmount = parsedInput;
            this.updateDisplay();
        } else {
            // Re-format the input field even if value didn't strictly change (e.g., user typed "0.500" and it becomes "0.50")
            this.managedElements.valueDisplayInput.value = this.formatNumericalValue(this.currentAmount);
        }
    }
}


const hostElement = document.createElement('div');
document.body.appendChild(hostElement);

new QuantityControl(hostElement, {
    styleClass: "spinner",
    minimumBound: 0,
    maximumBound: 1,
    incrementSize: 0.01,
    precisionDigits: 2,
    callbackOnAlteration: reportCurrentValue
});