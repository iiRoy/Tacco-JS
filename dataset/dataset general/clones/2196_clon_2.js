// This file demonstrates a JavaScript-based arithmetic processor.

// Initial settings for the arithmetic unit's state.
const startingSettings = {
    activeInputString: "0", // The string currently shown on the display.
    trailingOperator: false, // Indicates if the last character entered was an operator.
    decimalMode: false, // True if a decimal point has been used in the current number.
    resultDisplayed: true, // True if the current display value is a final answer.
    storedValue: 0 // A number held in memory.
};

// If the global computationEngine object already exists, reuse its state.
if (typeof computationEngine !== 'undefined') {
    startingSettings = computationEngine;
}

// Define the core calculation logic object.
let computationEngine = {
    activeInputString: startingSettings.activeInputString,
    trailingOperator: startingSettings.trailingOperator,
    decimalMode: startingSettings.decimalMode,
    resultDisplayed: startingSettings.resultDisplayed,
    storedValue: startingSettings.storedValue,
    
    // Handles various button presses from the user interface.
    processKey: function ( userAction ) {
        // Core logic for processing user input.
        
        const isOperator = isNaN(userAction); // Check if the input is a non-numeric operator.
        
        if (userAction === "=") {
            // If an equals sign was pressed.
            if (this.trailingOperator) return; // Prevent evaluation if trailing operator.

            this.activeInputString = eval(this.activeInputString).toString(); // Evaluate and convert to string.
            this.resultDisplayed = true; // Mark as a final result.
        }
        else if (userAction === '.') {
            // If a decimal point was pressed.
            if (this.resultDisplayed) {
                this.resetInput(); // Clear if previous input was a result.
            }

            if (this.decimalMode) return; // Only one decimal allowed per number.

            this.decimalMode = true; // Set decimal flag.
            this.activeInputString += userAction; // Append the decimal.
            this.trailingOperator = true; // Consider decimal as a trailing operator for logic purposes.
        }
        else if (isOperator) {
            // If an arithmetic operator (+, -, *, /) was pressed.
            const isAdditiveOp = (userAction === '+' || userAction === '-'); // Check for plus or minus.
            if (this.trailingOperator && (!isAdditiveOp || this.decimalMode)) return; // Prevent multiple consecutive operators or operator after decimal.

            this.activeInputString = this.activeInputString + " " + userAction + " "; // Add operator with spaces.
            this.resultDisplayed = false; // Result is no longer displayed.
            this.trailingOperator = true; // Mark that an operator was last.
            this.decimalMode = false; // Reset decimal flag for next number.
        }
        else {
            // If a numeric digit was pressed.
            if (this.resultDisplayed) {
                this.resetInput(); // Clear if previous input was a result.
            }
            
            this.activeInputString = this.activeInputString + userAction; // Append the digit.
            this.trailingOperator = false; // Last input was a number.
        }
        
        outputScreen.updateText( this.activeInputString ); // Update the display element.
    },

    // Resets the current input string and flags.
    resetInput: function() {
        this.activeInputString = ""; // Clear the input.
        this.resultDisplayed = false; // No result currently.
        this.decimalMode = false; // No decimal entered.
        this.trailingOperator = false; // No trailing operator.
    },

    // Clears all input and sets the display to zero.
    initializeDisplay: function() {
        this.activeInputString = "0"; // Set display to default zero.
        this.resultDisplayed = true; // Zero is considered a result.
        this.decimalMode = false; // No decimal in zero.
        this.trailingOperator = false; // No operator after zero.
        outputScreen.updateText(this.activeInputString); // Update display.
    },

    // Stores the current expression into memory, if it's a valid number.
    saveToMemory: function() {
        if (!isNaN(this.activeInputString)) {
            this.storedValue = this.activeInputString; // Store the numeric string.
            console.log("Memory value set to: " + this.storedValue); // Log the memory operation.
            // A visual confirmation for the user might be useful here.
        }
    },

    // Recalls the stored memory value and inputs it into the current expression.
    retrieveFromMemory: function() {
        this.processKey(this.storedValue); // Simulate a button press with the memory value.
    }
};

// The following section handles UI element interactions.

// Check for the existence of a global clear button.
if (this.resetBtn) {
    // Attach an event listener to the reset button.
    resetBtn.onPressHandler( function() {
        computationEngine.initializeDisplay(); // Call the engine's clear function.
    } );
}

// Check for memory store and recall buttons.
if (this.storeBtn && this.recallBtn) {
    // Set up the click handler for the memory store button.
    storeBtn.onPressHandler( function() {
        computationEngine.saveToMemory(); // Invoke memory storage.
    } );
    
    // Set up the click handler for the memory recall button.
    recallBtn.onPressHandler( function() {
        computationEngine.retrieveFromMemory(); // Invoke memory retrieval.
    } );
}

outputScreen.updateText( computationEngine.activeInputString ); // Initialize the screen display with the current value.

console.log("Computation module loaded successfully."); // Log completion of script loading.