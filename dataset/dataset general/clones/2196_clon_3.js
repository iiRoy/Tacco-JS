// JavaScript Numeric Processor Engine

// Defines the default configuration for the computation engine's internal state.
const createInitialProcessorState = () => ({
    displayString: "0",             // The string currently shown on the display.
    lastInputWasOperator: false,    // Flag indicating if the last key pressed was an arithmetic operator.
    decimalActive: false,           // Flag indicating if a decimal point is present in the current number segment.
    isResultDisplaying: true,       // Flag indicating if the current display string is the result of a previous computation.
    memoryRegister: 0.0             // Numerical value stored in the calculator's memory.
});

// Initialize the program's state with defaults.
let programState = createInitialProcessorState();

// Check if a previous computation engine instance exists in the global scope.
// This allows the calculator's state to persist across script reloads in certain environments.
if (typeof computationEngine !== 'undefined' && computationEngine !== null) {
    // If a prior instance is found, restore its state for continuity.
    programState = {
        displayString: computationEngine.displayString,
        lastInputWasOperator: computationEngine.lastInputWasOperator,
        decimalActive: computationEngine.decimalActive,
        isResultDisplaying: computationEngine.isResultDisplaying,
        memoryRegister: computationEngine.memoryRegister
    };
}

// The core object responsible for all calculator logic and state management.
const computationEngine = {
    // Initialize properties from the determined programState.
    displayString: programState.displayString,
    lastInputWasOperator: programState.lastInputWasOperator,
    decimalActive: programState.decimalActive,
    isResultDisplaying: programState.isResultDisplaying,
    memoryRegister: programState.memoryRegister,

    /**
     * Internal helper to determine if a character represents an arithmetic operator.
     * @param {string} char The character to check.
     * @returns {boolean} True if the character is an operator, false otherwise.
     */
    _isAnArithmeticOperator(char) {
        return ['+', '-', '*', '/'].includes(char);
    },

    /**
     * Processes a single input (key stroke) from the user.
     * This is the central function for calculator operation.
     * @param {string|number} keyStroke The input character or number.
     */
    processInput: function (keyStroke) {
        // Basic validation for input type.
        if (typeof keyStroke !== 'string' && typeof keyStroke !== 'number') {
            // console.error("Invalid input type received:", keyStroke);
            return; // Ignore invalid input.
        }
        const inputChar = String(keyStroke); // Ensure input is always treated as a string.

        // Pre-compute flags for the current input character.
        const isNumericInput = !isNaN(Number(inputChar));
        const isDecimalPoint = (inputChar === '.');
        const isEqualsSign = (inputChar === '=');
        const isOperator = this._isAnArithmeticOperator(inputChar);
        const isSignOperator = (inputChar === '+' || inputChar === '-');

        // Logic branching based on the type of input received.
        if (isEqualsSign) {
            // Guard clause: prevent evaluation if the expression ends with an operator.
            if (this.lastInputWasOperator) {
                // uiScreen.setError("Incomplete expression; cannot evaluate.");
                return;
            }

            try {
                // Basic validation: prevent evaluation of expressions starting with non-negative operators.
                if (this.displayString.match(/^[+\-*/]/) && !this.displayString.startsWith('-')) {
                    // uiScreen.setError("Invalid expression start.");
                    return;
                }

                // Attempt to evaluate the expression.
                let evaluationResult = eval(this.displayString);

                // Update state based on evaluation outcome.
                if (typeof evaluationResult === 'number' && !isNaN(evaluationResult)) {
                    this.displayString = evaluationResult.toString();
                    this.isResultDisplaying = true;
                    this.lastInputWasOperator = false;
                    this.decimalActive = this.displayString.includes('.');
                } else {
                    this.displayString = "Error"; // Handle non-numeric or invalid results.
                    this.isResultDisplaying = true;
                    this.lastInputWasOperator = false;
                    this.decimalActive = false;
                }
            } catch (error) {
                // Catch and display any syntax or runtime errors during evaluation.
                this.displayString = "Syntax Error";
                this.isResultDisplaying = true;
                this.lastInputWasOperator = false;
                this.decimalActive = false;
                // console.error("Expression evaluation failed:", error);
            }
        } else if (isDecimalPoint) {
            // If a result is currently displayed, start a new number with "0."
            if (this.isResultDisplaying) {
                this.resetInput(); // Clears current entry
                this.displayString = "0";
            }

            // Guard clause: prevent multiple decimal points in a single number segment.
            if (this.decimalActive) {
                return;
            }

            this.decimalActive = true;
            this.displayString += inputChar;
            this.lastInputWasOperator = false; // A decimal point is not considered an operator for subsequent input logic.
        } else if (isOperator) {
            // Logic for handling arithmetic operators.
            if (this.lastInputWasOperator) {
                // If the last input was also an operator:
                // Allow changing an operator (e.g., 5 + * -> 5 *), but only if not dealing with decimals.
                if (isSignOperator && !this.decimalActive) {
                    const currentParts = this.displayString.trim().split(/\s+/);
                    if (currentParts.length > 0 && this._isAnArithmeticOperator(currentParts[currentParts.length - 1])) {
                        currentParts[currentParts.length - 1] = inputChar; // Replace the last operator.
                        this.displayString = currentParts.join(' ');
                    } else {
                        // If it's an operator and not replacing, append (e.g., for negative numbers: 5 + - 3)
                        this.displayString += " " + inputChar + " ";
                    }
                } else {
                    // Prevent consecutive operators (e.g., "5 + +"), unless it's a sign change.
                    return;
                }
            } else {
                // If the previous input was not an operator, simply append the new operator with spaces.
                this.displayString += " " + inputChar + " ";
            }

            this.isResultDisplaying = false;
            this.lastInputWasOperator = true;
            this.decimalActive = false; // Reset decimal state for the next number entry.
        } else if (isNumericInput) {
            // Logic for handling numeric input.
            if (this.isResultDisplaying || this.displayString === "0") {
                // If a result is displayed or the display is just "0", start a new number.
                this.displayString = inputChar;
                this.isResultDisplaying = false;
            } else {
                // Otherwise, append the digit to the current number.
                this.displayString += inputChar;
            }
            this.lastInputWasOperator = false; // A number is not an operator.
        } else {
            // Handle any other unexpected input characters.
            // console.warn("Unrecognized input character:", inputChar);
            return; // Ignore unknown inputs.
        }

        // Update the UI display after processing a valid input.
        uiScreen.updateDisplay(this.displayString);
    },

    /**
     * Resets the current input string and related flags, but does not clear the memory or set display to "0".
     * This is equivalent to a "C" (Clear Entry) button.
     */
    resetInput: function () {
        this.displayString = "";
        this.isResultDisplaying = false;
        this.decimalActive = false;
        this.lastInputWasOperator = false;
    },

    /**
     * Clears all calculator state, including the display, and resets it to the initial "0".
     * This is equivalent to an "AC" (All Clear) button.
     */
    resetAll: function () {
        this.displayString = "0";
        this.isResultDisplaying = true;
        this.decimalActive = false;
        this.lastInputWasOperator = false;
        // Note: memoryRegister is intentionally not cleared by resetAll.
        uiScreen.updateDisplay(this.displayString);
    },

    /**
     * Stores the current numerical value on the display into the memory register.
     */
    storeInMemory: function () {
        const numericValue = parseFloat(this.displayString);
        if (!isNaN(numericValue)) {
            this.memoryRegister = numericValue;
            // console.info("Memory register updated to:", this.memoryRegister);
            // uiScreen.showStatus("M+"); // Provide user feedback.
        } else {
            // console.warn("Attempted to store non-numeric value in memory.");
            // uiScreen.setError("Cannot store non-numeric value.");
        }
    },

    /**
     * Recalls the value from the memory register and inserts it into the current expression.
     */
    recallFromMemory: function () {
        // Guard clause: ensure memory contains a valid number.
        if (isNaN(this.memoryRegister)) {
            // console.warn("Memory register is empty or invalid.");
            // uiScreen.showStatus("Memory Empty");
            return;
        }

        // If a result is currently displayed, clear it before inserting the memory value.
        if (this.isResultDisplaying) {
            this.resetInput();
        }

        // Process the recalled number as a new input.
        this.processInput(String(this.memoryRegister));
    }
};

// Define a placeholder UI display object if a 'display' object is not globally provided.
// This allows the code to run in environments without a full UI framework.
const uiScreen = typeof display !== 'undefined' ? display : {
    updateDisplay: function (text) { console.log("UI Display Output:", text); },
    setError: function (message) { console.error("UI Error Message:", message); },
    showStatus: function (status) { console.info("UI Status Update:", status); }
};

// Set the initial display value upon script load.
uiScreen.updateDisplay(computationEngine.displayString);

// Attach event listeners to UI controls, if they exist in the global scope.
// This pattern allows for integration with various UI systems (e.g., Rhino, browser DOM).

// Configure the 'All Clear' button.
if (this.clearControl) {
    this.clearControl.setOnClickListener(() => {
        computationEngine.resetAll();
    });
}

// Configure memory operation buttons.
if (this.memStoreControl && this.memRecallControl) {
    this.memStoreControl.setOnClickListener(() => {
        computationEngine.storeInMemory();
    });

    this.memRecallControl.setOnClickListener(() => {
        computationEngine.recallFromMemory();
    });
}