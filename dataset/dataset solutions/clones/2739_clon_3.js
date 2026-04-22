// This module encapsulates a specific algorithm to determine binary states for a sequence of entities.
// It processes raw input data, applies a set of rules based on parity, and outputs the results.
function processInputData( inputConfigurationString ) {
    // --- Input Validation and Parsing (Type III Additions) ---

    // Guard clause: Ensure the input string is valid and not empty.
    if ( typeof inputConfigurationString !== 'string' || inputConfigurationString.trim() === '' ) {
        // If input is invalid or empty, there's nothing to process.
        // Output '0' to indicate no active elements and terminate.
        console.log( '0' );
        return;
    }

    // Split the entire input string into an array of individual lines.
    // This allows easy access to each configuration parameter.
    const configurationLines = inputConfigurationString.split( '\n' );

    // The first line contains the total number of elements (let's call them "items").
    // Parse this value as an integer, ensuring a base of 10 for consistency.
    const totalItemCount = parseInt( configurationLines[0], 10 );

    // Guard clause: Validate that the parsed count is a positive integer.
    if ( isNaN( totalItemCount ) || totalItemCount <= 0 ) {
        // If the count is not a valid positive number, no items can be processed.
        console.log( '0' ); // Output '0' and exit.
        return;
    }

    // --- Core Algorithm Initialization (Type II & III Changes) ---

    // Initialize an array to store the final binary states (0 or 1) for each item.
    // The array is 0-indexed, so its size is 'totalItemCount'.
    // We explicitly fill it with zeros, though values will be set during the loop.
    const itemStates = new Array( totalItemCount ).fill( 0 );

    // An array to keep track of the 1-indexed positions of items that end up in state '1'.
    const activeItemPositions = [];
    // A simple counter for the number of items in state '1'.
    let countOfActiveItems = 0;

    // --- Main Processing Loop (Type II & III Changes) ---

    // The algorithm iterates backward from the last item (index 'totalItemCount') down to the first (index '1').
    // This order is critical because an item's state depends on the states of its multiples,
    // which are at higher indices and must have already been determined.
    for ( let currentItemIdx = totalItemCount; currentItemIdx >= 1; --currentItemIdx ) {
        // Retrieve the target parity value for the current item from the input lines.
        // The input lines are 0-indexed, so `configurationLines[currentItemIdx]` corresponds to the
        // line for the `currentItemIdx`-th item (since `configurationLines[0]` was `totalItemCount`).
        const targetParityForCurrentItem = parseInt( configurationLines[currentItemIdx], 10 );

        // (Type III - Intermediate Step): Calculate the sum of states of all multiples of the current item.
        // Multiples are `2 * currentItemIdx`, `3 * currentItemIdx`, and so on, up to `totalItemCount`.
        let calculatedMultiplesParitySum = 0;
        let multipleFactor = 2; // Start checking from the second multiple (2x)

        // Loop through all potential multiples within the range of total items.
        while ( currentItemIdx * multipleFactor <= totalItemCount ) {
            // Convert the 1-indexed multiple position to a 0-indexed array position.
            const multipleArrayPosition = ( currentItemIdx * multipleFactor ) - 1;
            // Add the state of this multiple (which has already been determined) to the sum.
            calculatedMultiplesParitySum += itemStates[ multipleArrayPosition ];
            multipleFactor++; // Move to the next multiple (e.g., 3x, 4x, etc.)
        }

        // (Type III - Helper Variable): Determine if the calculated parity matches the target.
        const doesParityMatch = ( calculatedMultiplesParitySum % 2 === targetParityForCurrentItem );

        // Convert the 1-indexed current item position to a 0-indexed array position for `itemStates`.
        const currentItemArrangementIndex = currentItemIdx - 1;

        if ( doesParityMatch ) {
            // If the parity of multiples matches the target, the current item's state is '0'.
            itemStates[ currentItemArrangementIndex ] = 0;
        } else {
            // If there's a mismatch, the current item's state must be '1' to satisfy the condition.
            itemStates[ currentItemArrangementIndex ] = 1;
            countOfActiveItems++; // Increment the counter for '1' states.
            activeItemPositions.push( currentItemIdx ); // Store the 1-indexed position of this active item.
        }
    }

    // --- Output Generation (Type II & III Changes) ---

    // First, output the total number of items that are in state '1'.
    // Using a template literal for cleaner output (Type II change).
    console.log( `${countOfActiveItems}` );

    // If there are any active items, print their 1-indexed positions.
    if ( countOfActiveItems > 0 ) {
        // (Type III - Intermediate Step & Rewrite):
        // The `activeItemPositions` array was populated in decreasing order of `currentItemIdx`.
        // To match typical output expectations (ascending order) and simplify the original's
        // somewhat convoluted string building logic, we sort the positions.
        const sortedActivePositions = activeItemPositions.sort( ( a, b ) => a - b );

        // Join the sorted positions with spaces to form the output string.
        // This significantly rewrites the original's manual string concatenation (Type III deletion/rewrite).
        console.log( sortedActivePositions.join( ' ' ) );
    }
    // If `countOfActiveItems` is 0, only the '0' count was printed, which matches the original behavior.
}

// --- Standard I/O Boilerplate (Type II Change) ---
// This section is standard boilerplate for reading input in competitive programming environments.
// It reads the entire content of '/dev/stdin' as a UTF-8 string and passes it to our processing function.
// This part should typically remain untouched to ensure compatibility with the execution environment.
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );