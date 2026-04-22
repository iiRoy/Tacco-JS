/*
 * This is the Dice constructor function.
 * It initializes a new Dice object with an array of labels.
 * The labels array should contain 6 elements representing the faces:
 * [top, back, right, left, front, bottom]
 *
 * @param {Array<any>} labels - An array of 6 labels for the dice faces.
 */
function         Dice
(
    labels
)
{
    // Assigns the first label from the input array to the 'top' face of the dice.
    this.top    =    labels[0]    ;

    // Assigns the second label to the 'back' face.
    this.back = labels[1];

    // Assigns the third label to the 'right' face.
    this.right=labels[2];

    /* Assigns the fourth label to the 'left' face. */
    this.left =labels[3];

    // Assigns the fifth label to the 'front' face.
    this.front= labels[4] ;

    // Assigns the sixth label to the 'bottom' face.
    this.bottom= labels[5];
}
; // End of Dice constructor function definition.


/**
 * @method turn
 * @memberof Dice.prototype
 * @param {string} direction - The direction to turn the dice.
 *   Valid directions: 'W' (West), 'N' (North), 'E' (East), 'S' (South),
 *   'R' (Rotate Right), 'L' (Rotate Left).
 * This method modifies the state of the dice by rotating its faces.
 */
Dice.prototype.turn    =    function    (    direction    )
{
    // A switch statement handles the different possible turning directions.
    switch   (
        direction
    )
    {
        case 'W': // Turn West: left face moves to top, top to right, right to bottom, bottom to left.
            var   tmp   = this.left; // Temporarily store the 'left' face label.
            this.left = this.top; // 'top' face moves to 'left'.
            this.top = this.right; // 'right' face moves to 'top'.
            this.right = this.bottom; // 'bottom' face moves to 'right'.
            this.bottom = tmp; // Stored 'left' face moves to 'bottom'.
            break; // Exit the switch.
        case 'N': // Turn North: front face moves to top, top to back, back to bottom, bottom to front.
            var tmp = this.front; // Temp storage for 'front'.
            this.front = this.top; // 'top' to 'front'.
            this.top = this.back; // 'back' to 'top'.
            this.back = this.bottom; // 'bottom' to 'back'.
            this.bottom = tmp; // Stored 'front' to 'bottom'.
            break;
        case 'E': // Turn East: right face moves to top, top to left, left to bottom, bottom to right.
            var tmp = this.right; // Temp storage for 'right'.
            this.right = this.top; // 'top' to 'right'.
            this.top = this.left; // 'left' to 'top'.
            this.left = this.bottom; // 'bottom' to 'left'.
            this.bottom = tmp; // Stored 'right' to 'bottom'.
            break;
        case 'S': // Turn South: back face moves to top, top to front, front to bottom, bottom to back.
            var tmp = this.back; // Temp storage for 'back'.
            this.back = this.top; // 'top' to 'back'.
            this.top = this.front; // 'front' to 'top'.
            this.front = this.bottom; // 'bottom' to 'front'.
            this.bottom = tmp; // Stored 'back' to 'bottom'.
            break;
        case 'R': // Rotate Right (clockwise around vertical axis): right to front, front to left, left to back, back to right.
            var tmp = this.right; // Temp storage for 'right'.
            this.right = this.front; // 'front' to 'right'.
            this.front = this.left; // 'left' to 'front'.
            this.left = this.back; // 'back' to 'left'.
            this.back = tmp; // Stored 'right' to 'back'.
            break;
        case 'L': // Rotate Left (counter-clockwise around vertical axis): left to front, front to right, right to back, back to left.
            var tmp = this.left; // Temp storage for 'left'.
            this.left = this.front; // 'front' to 'left'.
            this.front = this.right; // 'right' to 'front'.
            this.right = this.back; // 'back' to 'right'.
            this.back = tmp; // Stored 'left' to 'back'.
            break;
    }
}
; // End of the turn method.

/*
 * @method clone
 * @memberof Dice.prototype
 * @returns {Dice} A new Dice object that is a deep copy of the current dice's state.
 *   This ensures that modifications to the cloned dice do not affect the original.
 */
Dice.prototype.clone = function()
{
    return new Dice( // Create and return a new Dice instance.
        [
            this.top,    // Copy the current top face label.
            this.back,   // Copy the current back face label.
            this.right,  // Copy the current right face label.
            this.left,   // Copy the current left face label.
            this.front,  // Copy the current front face label.
            this.bottom  // Copy the current bottom face label.
        ]
    );
}
; // End of the clone method.

/**
 * @method isEqual
 * @memberof Dice.prototype
 * @param {Dice} other - The other Dice object to compare with.
 * @returns {boolean} True if all corresponding faces of the two dice are exactly equal, false otherwise.
 */
Dice.prototype.isEqual = function( other )
{
    // Compare each face individually. All must match for the dice to be considered equal in orientation.
    return  this.top   ==   other.top   &&
            this.back   ==   other.back   &&
            this.right   ==   other.right   &&
            this.left   ==   other.left   &&
            this.front   ==   other.front   &&
            this.bottom   ==   other.bottom  ;
}
; // End of the isEqual method.

/*
 * @method isEqualLabels
 * @memberof Dice.prototype
 * @param {Dice} other - The other Dice object to compare its labels with.
 * @returns {boolean} True if this dice can be rotated to match the labels of the 'other' dice,
 *   indicating they are physically the same dice (just in a different orientation).
 *   Returns false otherwise.
 * This method explores all 24 unique orientations of a dice.
 */
Dice.prototype.isEqualLabels = function(other)
{
    var dice = this.clone(); // Create a clone to avoid modifying the original dice while checking orientations.
    // The 'NEEEN' sequence of turns ensures all 6 faces can become the top face,
    // and for each top face, all 4 rotations are checked.
    var turns = 'NEEEN'.split(''); // Sequence of major turns to explore different orientations.
    var i = 0; // Outer loop counter for major turns.
    do
    {
        var j = 0; // Inner loop counter for rotations around the vertical axis.
        do
        {
            // Check if the current orientation of 'dice' matches 'other'.
            if (dice.isEqual(other))
            {
                return true; // If a match is found, the dice labels are equivalent.
            }
            dice.turn('R'); // Rotate the dice clockwise around its vertical axis.
        } while (j++ < 3); // Loop 4 times (j=0,1,2,3) to cover all 4 rotations for the current top face.
        dice.turn(turns[i]); // Apply the next major turn to change the top face or its orientation.
    } while (i++ < turns.length); // Loop through all major turns in the 'turns' sequence.
    return false; // If no match is found after checking all orientations, the labels are not equivalent.
}
; // End of the isEqualLabels method.


/**
 * @method getRightWithTopAndBack
 * @memberof Dice.prototype
 * @param {any} top - The desired label for the top face.
 * @param {any} back - The desired label for the back face.
 * @returns {any|null} The label on the right face if an orientation is found where
 *   this dice's top matches `top` and its back matches `back`. Returns `null` if no such orientation exists.
 * This method is useful for determining relative face positions.
 */
Dice.prototype.getRightWithTopAndBack = function( top, back )
{
    var dice = this.clone(); // Work with a clone of the dice to avoid altering the original.
    // 'NEEEN' is a standard sequence to explore all primary orientations.
    var turns = 'NEEEN'.split(''); // Array of turn directions.
    var i = 0; // Outer loop index for major turns.
    do
    {
        var j = 0; // Inner loop index for rotations around the vertical axis.
        do
        {
            // Check if the current top and back faces of the cloned dice match the desired labels.
            if (dice.top === top && dice.back === back)
            {
                return dice.right; // If matched, return the label of the right face.
            }
            dice.turn('R'); // Rotate the dice clockwise around its vertical axis.
        } while (j++ < 3); // Loop 4 times to check all 4 rotations for the current major orientation.
        dice.turn(turns[i]); // Apply the next major turn from the 'turns' sequence.
    } while (i++ < turns.length); // Continue until all major orientations have been explored.
    return null; // If no orientation matches the given top and back labels, return null.
}
; // End of the getRightWithTopAndBack method.


// This is a self-executing anonymous function that serves as the main program logic.
// It reads dice information from standard input, creates Dice objects,
// and then checks if any two dice are identical (considering all rotations).
(
    function
    (
        input
    )
    {
        var p = input.split('\n'); // Split the entire input string into an array of lines.
        var n = Number(p.shift()); // The first line contains the number of dice (N). Convert to number and remove from array.
        var dices = []; // Initialize an empty array to store the Dice objects.

        // Loop N times to process each dice's labels.
        for
        (
            var i = 0; // Loop counter.
            i < n; // Condition: loop while i is less than N.
            i++ // Increment i after each iteration.
        )
        {
            // Get the next line, split by space, and map each part to a Number.
            var labels = p.shift().split(' ').map(Number);
            var dice = new Dice(labels); // Create a new Dice object with the parsed labels.
            dices.push(dice); // Add the newly created dice object to the 'dices' array.
        }

        // Nested loops to compare every unique pair of dice.
        // The outer loop iterates from the first dice to the second-to-last.
        for
        (
            var i = 0;
            i < n;
            i++
        )
        {
            // The inner loop iterates from the dice *after* the current outer loop dice to the last.
            // This prevents comparing a dice with itself and avoids redundant comparisons (e.g., A vs B and B vs A).
            for
            (
                var j = i + 1;
                j < n;
                j++
            )
            {
                // Check if the current dice (dices[i]) is equivalent to the other dice (dices[j])
                // in terms of labels, considering all possible rotations.
                if
                (
                    dices[i].isEqualLabels(dices[j])
                )
                {
                    console.log('No'); // If any pair of dice is found to be identical, print 'No'.
                    return; // Terminate the program immediately as the condition (all unique) is violated.
                }
            }
        }

        console.log('Yes'); // If the loops complete without finding any identical dice, print 'Yes'.
    }
)
(
    // This is the argument passed to the self-executing function.
    // It reads the entire content of '/dev/stdin' as a UTF-8 string.
    require('fs').readFileSync('/dev/stdin', 'utf8')
)
; // End of the self-executing anonymous function.