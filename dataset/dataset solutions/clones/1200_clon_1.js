// This file contains a JavaScript implementation for a Dice class and a main program
// to determine if a set of dice contains any identical dice, considering rotations.
// The "use strict" directive helps to enforce stricter parsing and error handling in the code.
"use strict";


/*
 *
 *  The Dice class represents a six-sided die.
 *  Its internal state `stat` is an array of 6 numbers,
 *  representing the values on its faces.
 *
 *  Face mapping diagram:
 *
 *     +---+
 *     | 0 |  <-- Top face
 *   +---+---+---+---+
 *   | 3 | 1 | 2 | 4 |  <-- Side faces (Left, Front, Right, Back)
 *   +---+---+---+---+
 *     | 5 |  <-- Bottom face
 *     +---+
 *
 *  This diagram helps visualize the dice's orientation and face indices.
 *  The rotations manipulate these indices to simulate rolling the dice.
 */
class Dice {


    // The constructor initializes a new Dice object.
    // It takes an array `stat` representing the initial face values.
    constructor( stat )
    {
        // Slice the input array to ensure we only take the first 6 elements,
        // effectively copying the initial state to prevent external modification issues.
        this.stat = stat.slice(0, 6);
    }



    // The fix method attempts to orient the dice such that 'top' is on the top face (index 0)
    // and 'front' is on the front face (index 1).
    // It returns true if such an orientation is found, false otherwise.
    fix( top, front )
    {
        // First, rotate the dice so that the 'top' value is on the actual top face (index 0).
        // This involves checking where 'top' currently is and performing the necessary rotation.
        switch ( this.stat.indexOf(top) )
        {
            case 1:  // 'top' is currently on the front face (index 1)
                this.rot_ns(1);  // Rotate North-South once to bring it to the top.
                break;
            case 2:  // 'top' is currently on the right face (index 2)
                this.rot_we(1);  // Rotate West-East once to bring it to the top.
                break;
            case 3:  // 'top' is currently on the left face (index 3)
                this.rot_we(-1); // Rotate West-East negative once (or 3 times) to bring it to the top.
                break;
            case 4:  // 'top' is currently on the back face (index 4)
                this.rot_ns(-1); // Rotate North-South negative once to bring it to the top.
                break;
            case 5:  // 'top' is currently on the bottom face (index 5)
                this.rot_ns(2);  // Rotate North-South twice to bring it to the top.
                break;
            // If 'top' is already at index 0, no initial rotation is needed.
        }

        // After fixing the top face, we now need to rotate around the vertical axis
        // to find the correct front face. There are 4 possible orientations.
        for ( let i = 0; i < 4; ++i )
        {
            // Check if the current front face (index 1) matches the desired 'front' value.
            if ( this.stat[1] === front )
            {
                // If it matches, we've successfully fixed both top and front, so return true.
                return true;
            }
            // If it doesn't match, rotate the dice clockwise (around the vertical axis) once
            // and try again.
            this.rot(1);
        }

        // If after all 4 rotations (with 'top' fixed), we didn't find the 'front' value,
        // then this combination is impossible for the current dice state.
        return false;
    }



    // The rot method rotates the dice around its North-South axis (vertical axis).
    // This changes the values on the side faces (front, right, back, left).
    // 'val' specifies the number of rotations (positive for clockwise, negative for counter-clockwise).
    rot( val )
    {
        // Normalize 'val' to be a positive integer between 0 and 3, representing rotations.
        // This handles negative values and values greater than 3.
        if ( val < 0 )
        {
            val += 4 * Math.floor(-val / 4) + 4;
        }

        // old_i: Indices of the faces involved in this rotation: Front, Right, Back, Left.
        const old_i = [1, 2, 4, 3];
        // new_i: Calculate the target indices for the values from old_i after rotation.
        // For example, if val=1 (clockwise), old_i[0] (front) moves to old_i[1] (right), etc.
        const new_i = [val, val + 1, val + 2, val + 3].map( elt => old_i[elt % 4] );

        // Perform the actual rotation by destructuring assignment.
        // The value at old_i[0] moves to new_i[0]'s position, and so on.
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
        [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }



    // The rot_ns method rotates the dice around its East-West axis (North-South rotation).
    // This changes the values on the Top, Front, Bottom, and Back faces.
    // 'val' specifies the number of rotations.
    rot_ns( val )
    {
        // Normalize 'val' to be a positive integer between 0 and 3.
        if ( val < 0 )
        {
            val += 4 * Math.floor(-val / 4) + 4;
        }

        // old_i: Indices of the faces involved: Top, Front, Bottom, Back.
        const old_i = [0, 1, 5, 4];
        // new_i: Calculate target indices for values after rotation.
        const new_i = [val, val + 1, val + 2, val + 3].map( elt => old_i[elt % 4] );

        // Perform the rotation using destructuring assignment.
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
        [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }



    // The rot_we method rotates the dice around its North-South axis (West-East rotation).
    // This changes the values on the Top, Right, Bottom, and Left faces.
    // 'val' specifies the number of rotations.
    rot_we( val )
    {
        // Normalize 'val' to be a positive integer between 0 and 3.
        if ( val < 0 )
        {
            val += 4 * Math.floor(-val / 4) + 4;
        }

        // old_i: Indices of the faces involved: Top, Right, Bottom, Left.
        const old_i = [0, 2, 5, 3];
        // new_i: Calculate target indices for values after rotation.
        const new_i = [val, val + 1, val + 2, val + 3].map( elt => old_i[elt % 4] );

        // Perform the rotation using destructuring assignment.
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
        [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }



    // The equals method checks if this Dice object is rotationally equivalent to another Dice object.
    // It tries all 24 possible orientations of this dice and compares its state to the other dice.
    equals( dice )
    {
        // Helper function 'cmp' to compare two dice states (arrays) element by element.
        // Returns true if all elements are equal, false otherwise.
        const cmp = (u, v) => u.map((e, i) => e === v[i]).reduce((car, cdr) => car && cdr, true);

        // Create a copy of the current dice so we can rotate it without altering the original.
        const self = new Dice(this.stat);

        // --- Phase 1: Rotate around the NS axis (Top-Front-Bottom-Back) ---
        // There are 4 possible orientations for the top and bottom faces.
        for ( let i = 0; i < 4; ++i )
        {
            // After each NS rotation, check if the dice states are equal.
            if ( cmp(self.stat, dice.stat) )
            {
                return true;
            }
            // Rotate NS once.
            self.rot_ns(1);

            // For each NS orientation, rotate around the vertical axis (Front-Right-Back-Left).
            // There are 4 such orientations for the side faces.
            for ( let j = 0; j < 4; ++j )
            {
                // After each vertical rotation, check for equality.
                if ( cmp(self.stat, dice.stat) )
                {
                    return true;
                }
                // Rotate vertically once.
                self.rot(1);
            }
            // Restore NS rotation for the next outer loop iteration.
            // This line might seem redundant if rot_ns(1) is always applied at the end of the outer loop.
            // However, it ensures the state is consistent before the next rot_ns(1) in the next iteration.
            self.rot_ns(-1); // Undo the last rot_ns(1) before the next iteration's rot_ns(1)
            self.rot(1); // This rot(1) is part of the overall 24-state exploration logic,
                         // ensuring all unique states are visited.
        }

        // --- Phase 2: Handle the case where the initial top face is not one of the four NS-rotatable ones ---
        // This accounts for the 5th and 6th possible top faces by rotating the dice to bring them to the top.
        // We've already covered 4 top faces in the loop above.
        // Here, we perform a specific rotation to bring a new face to the top (e.g., the original bottom face).
        self.rot_ns(2); // Rotate NS twice to bring the original bottom face to the top.

        // With this new top face, again iterate through all 4 vertical rotations.
        for ( let j = 0; j < 4; ++j )
        {
            // Check for equality in each of these 4 orientations.
            if ( cmp(self.stat, dice.stat) )
            {
                return true;
            }
            // Rotate vertically once.
            self.rot(1);
        }

        // If none of the 24 possible orientations matched, the dice are not equivalent.
        return false;
    }

} // End of Dice class definition.



// Main program execution starts here.
// It uses a Promise to handle asynchronous input from stdin.
new Promise( function (resolve, reject)
{
    let content = ""; // Buffer to store input data.

    // Event listener for incoming data from standard input.
    process.stdin.on("data", chunk => {
        content += chunk; // Append each chunk of data.
    });

    // Event listener for the end of standard input.
    process.stdin.on("end", () => {
        // Resolve the promise with the collected content and the stdout stream.
        resolve([content, process.stdout]);
    });
})

// Once the promise resolves (all input is received), process the data.
.then( function([cin, cout])
{
    // Parse the input:
    // 1. Split by newline to get individual lines.
    // 2. Map each line:
    //    a. Split by space to get individual numbers as strings.
    //    b. Map each string to an integer using parseInt.
    const [[n], ...data] = cin.split("\n").map( elt => elt.split(" ").map(e => parseInt(e)) );

    // Create an array of Dice objects from the parsed input data.
    // The first 'n' lines of 'data' represent the 'n' dice.
    const dices = data.slice(0, n).map( elt => new Dice(elt) );

    // Iterate through all unique pairs of dice to check for equality.
    // Outer loop for the first dice in the pair.
    for ( let i = 0; i < n; ++i )
    {
        // Inner loop for the second dice in the pair, starting from 'i + 1' to avoid duplicates
        // and self-comparison.
        for ( let j = i + 1; j < n; ++j )
        {
            // If two dice are found to be rotationally equivalent...
            if ( dices[i].equals(dices[j]) )
            {
                // ...write "No" to standard output and terminate the program.
                cout.write("No\n");
                return;
            }
        }
    }

    // If no equivalent dice pairs were found after checking all combinations,
    // write "Yes" to standard output.
    cout.write("Yes\n");
}); // End of promise chain.