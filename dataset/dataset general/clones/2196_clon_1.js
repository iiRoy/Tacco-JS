/* JavaScript Calculator Demonstration */

// This object defines the initial state for our calculator application.
var initialState =
{
    currentExpression: "0",     // The string representing the current calculation.
    endsInSymbol:      false,   // Flag to check if the last input was a symbol.
    inDecimal:         false,   // Flag to check if a decimal point has been entered for the current number.
    expressionIsAns:   true,    // True if the current expression is the result of a previous calculation or "0".
    memValue:          0        // Stores the value in calculator memory.
};


// Keep the old state if we're reloading this file.
// This block ensures persistence across reloads in certain environments.
if
(
    typeof calculator
    !=
    'undefined'
)
{
    initialState = calculator;
}


/* Main calculator logic object */
calculator =
{
    // Initialize properties from the determined initial state.
    currentExpression: initialState.currentExpression,
    endsInSymbol:      initialState.endsInSymbol,
    inDecimal:         initialState.inDecimal,
    expressionIsAns:   initialState.expressionIsAns,
    memValue:          initialState.memValue,


    // Handles the press of any calculator button.
    buttonPress: function
    (
        operation // The character or string representing the button pressed.
    )
    {
        /* Core logic for handling button presses */

        var isSymbol = isNaN(operation);


        // Handle the '=' button press.
        if ( operation === "=" )
        {
            // If the expression currently ends in a symbol, do nothing.
            if (this.endsInSymbol)
                return;

            // Evaluate the current expression and convert the result to a string.
            this.currentExpression = eval(this.currentExpression).toString();
            this.expressionIsAns   = true;
        }
        // Handle the '.' (decimal) button press.
        else if ( operation === '.' )
        {
            // If the current expression is an answer, clear it before adding decimal.
            if (this.expressionIsAns)
            {
                this.clear();
            }

            // If a decimal point already exists in the current number, do nothing.
            if (this.inDecimal)
                return;

            this.inDecimal         = true;                      // Mark that a decimal has been added.
            this.currentExpression += operation;                // Append the decimal point.
            this.endsInSymbol      = true;                      // A decimal acts like a symbol for input purposes.
        }
        // Handle symbol button presses (+, -, *, /).
        else if ( isSymbol )
        {
            var isSign = (operation === '+' || operation === '-'); // Check if the symbol is a plus or minus sign.

            // Prevent adding multiple symbols consecutively unless it's a sign change after a number.
            if (this.endsInSymbol && (!isSign || this.inDecimal))
                return;

            this.currentExpression += " " + operation + " ";    // Add spaces around the symbol for readability and `eval`.
            this.expressionIsAns    = false;                    // The expression is no longer just an answer.
            this.endsInSymbol       = true;                     // The expression now ends in a symbol.
            this.inDecimal          = false;                    // Reset decimal flag for the next number.
        }
        // Handle number button presses.
        else
        {
            // Pressed a number

            // If the current expression is an answer, clear it before adding a new number.
            if (this.expressionIsAns)
            {
                this.clear();
            }

            this.currentExpression += operation; // Append the number.
            this.endsInSymbol       = false;     // The expression no longer ends in a symbol.
        }

        // Update the display with the current expression.
        display.setText(this.currentExpression);
    },


    // Clears the current expression and resets related flags.
    clear: function()
    {
        this.currentExpression = "";        // Empty the expression string.
        this.expressionIsAns   = false;     // Not an answer.
        this.inDecimal         = false;     // No decimal in current number.
        this.endsInSymbol      = false;     // Does not end in a symbol.
    },


    // Clears the calculator display to '0' and resets all flags.
    clearToZero: function()
    {
        this.currentExpression = "0";       // Set expression to "0".
        this.expressionIsAns   = true;      // "0" is considered an initial answer state.
        this.inDecimal         = false;     // No decimal.
        this.endsInSymbol      = false;     // Does not end in a symbol.
        display.setText(this.currentExpression); // Update display.
    },


    // Stores the current expression (if it's a valid number) into memory.
    memStore: function()
    {
        if ( !isNaN(this.currentExpression) )
        {
            this.memValue = this.currentExpression; // Store the numeric value.
            console.log("mem set to: "+this.memValue); // Log for debugging.
            /* TODO: Implement visual feedback for memory store operation. */
        }
    },


    // Recalls the value from memory and inputs it as if a button was pressed.
    memRecall: function()
    {
        this.buttonPress(this.memValue); // Simulate a button press with the memory value.
    }
};


// Intentional global-this to check existence safely

// Event listener for the clear button, if available in the environment.
if ( this.clearButton )
{
    /* Note: Standard bind() method is avoided here due to compatibility issues with specific runtime environments like Rhino, which may not properly handle bound functions when an interface is expected. */
    clearButton.setOnClickListener(function()
    {
        calculator.clearToZero(); // Call the calculator's clearToZero method.
    });
}


// Event listeners for memory store and recall buttons, if available.
if ( this.memStoreButton && this.memRecallButton )
{
    memStoreButton.setOnClickListener(function()
    {
        calculator.memStore(); // Store current value to memory.
    });

    memRecallButton.setOnClickListener(function()
    {
        calculator.memRecall(); // Recall value from memory.
    });
}


// Initialize the display with the calculator's current expression.
display.setText(calculator.currentExpression);


// Log a message to indicate the script has finished loading.
console.log("Loaded calc.js.");