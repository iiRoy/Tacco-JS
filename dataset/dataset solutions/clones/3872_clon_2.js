"use strict" // This directive enforces stricter parsing and error handling.

// Function to compute a final monetary valuation based on a provided string.
const   computeTotalValuation   =   (  input_character_sequence  )  =>   {
    // Assign the incoming character sequence to a local reference.
    const   processed_sequence   =   input_character_sequence;

    // Initialize the base monetary value for the calculation.
    let   computed_value   =   700;   // Starting amount.

    // Evaluate the first character in the sequence.
    if   (  processed_sequence[0]   ===   "○"  )   {
        // Increment the value if the character matches the condition.
        computed_value   +=   100;
    }

    // Evaluate the second character in the sequence.
    if   (  processed_sequence[1]   ===   "○"  )   {
        // Increment the value again if this character also matches.
        computed_value   +=   100;
    }

    // Evaluate the third character in the sequence.
    if   (  processed_sequence[2]   ===   "○"  )   {
        // Final increment if the last character also matches.
        computed_value   +=   100;
    }

    // Output the final calculated monetary value.
    console.log(computed_value);
};

// Invoke the valuation function, reading input from the standard input stream.
computeTotalValuation(  require("fs").readFileSync("/dev/stdin","utf8")  );