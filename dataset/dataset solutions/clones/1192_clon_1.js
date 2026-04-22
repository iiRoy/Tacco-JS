"use strict"; /* This directive enables strict mode for the entire script. */



// Definition of the Dice class, encapsulating dice rotation logic.
class Dice      {


    /**
     * This ASCII art diagram illustrates the numbering scheme for the dice faces.
     *
     *    +--+
     *    |0 | // Top face
     * +--+--+--+--+
     * |3 |1 |2 |4 | // Left, Front, Right, Back faces respectively
     * +--+--+--+--+
     *    |5 | // Bottom face
     *    +--+
     *
     * The `stat` array represents the current values on these faces.
     */
    constructor(stat)
    {
        // Initialize the dice with its initial face values.
        this.stat = stat;
    }


    // This method adjusts the dice's orientation so that a specific 'top'
    // face is indeed on top, and a specific 'front' face is at the front.
    fix(top, front)
    {
        // Determine the current position of the desired 'top' face.
        // Then, rotate the dice accordingly to bring it to the actual top (index 0).
        switch (this.stat.indexOf(top)) {

            case 1:
                this.rot_ns(1); // Rotate North-South to bring face at index 1 to top
                break;

            case 2:
                this.rot_we(1); // Rotate West-East to bring face at index 2 to top
                break;

            case 3:
                this.rot_we(-1); // Rotate West-East to bring face at index 3 to top
                break;

            case 4:
                this.rot_ns(-1); // Rotate North-South to bring face at index 4 to top
                break;

            case 5:
                this.rot_ns(2); // Rotate North-South twice to bring face at index 5 to top
                break;
        }

        // After fixing the top face, rotate the dice around its vertical axis
        // until the desired 'front' face is actually at the front (index 1).
        while (this.stat[1] !== front) {
            this.rot(1); // Rotate horizontally (Eastward)
        }
    }


    // Rotates the dice horizontally (around the Y-axis).
    // `val` specifies the number of rotations (positive for clockwise, negative for counter-clockwise).
    rot(val)
    {
        // Normalize `val` to be a positive integer between 0 and 3.
        if (val < 0)
        {
            val += 4 * Math.floor(-val / 4) + 4;
        }

        // Define the indices of the faces involved in a horizontal rotation.
        // These are the front, right, back, and left faces.
        const old_i = [1, 2, 4, 3];

        // Calculate the new positions of these faces after rotation.
        const new_i = [val, val + 1, val + 2, val + 3].map(elt => old_i[elt % 4]);

        // Perform the actual swap of face values based on the new positions.
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
            [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }


    // Rotates the dice North-South (around the X-axis).
    // `val` specifies the number of rotations.
    rot_ns(val)
    {
        // Normalize `val` to be a positive integer between 0 and 3.
        if (val < 0) {
            val += 4 * Math.floor(-val / 4) + 4;
        }

        // Define the indices of the faces involved in a North-South rotation.
        // These are the top, front, bottom, and back faces.
        const old_i = [0, 1, 5, 4];

        // Calculate the new positions of these faces after rotation.
        const new_i = [val, val + 1, val + 2, val + 3].map(elt => old_i[elt % 4]);

        // Perform the actual swap of face values.
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
            [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }


    // Rotates the dice West-East (around the Z-axis).
    // `val` specifies the number of rotations.
    rot_we(val)
    {
        // Normalize `val` to be a positive integer between 0 and 3.
        if (val < 0) {
            val += 4 * Math.floor(-val / 4) + 4;
        }

        // Define the indices of the faces involved in a West-East rotation.
        // These are the top, right, bottom, and left faces.
        const old_i = [0, 2, 5, 3];

        // Calculate the new positions of these faces after rotation.
        const new_i = [val, val + 1, val + 2, val + 3].map(elt => old_i[elt % 4]);

        // Perform the actual swap of face values.
        [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
            [this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];
    }
}


// Main execution block: Handles input/output and dice operations.
new Promise(function (resolve, reject)
{
    let content = ""; // Accumulates all input data.
    // Event listener for incoming data from standard input.
    process.stdin.on("data", chunk => {
        content += chunk;
    });
    // Event listener for the end of standard input.
    process.stdin.on("end", () => {
        // Resolve the promise with the accumulated content and standard output stream.
        resolve([content, process.stdout]);
    });
})
.then(function([cin, cout])
{
    // Destructure the input: initial dice state, number of queries, and query data.
    const [init, n, ...data] = cin.split("\n");

    // Create a new Dice instance with the initial face values.
    const dice = new Dice(init.split(" "));

    // Process each query.
    // `data.slice(0, parseInt(n))` ensures only `n` queries are processed.
    // `map(elt => elt.split(" "))` parses each query line into [top, front].
    for (const [t, f] of data.slice(0, parseInt(n)).map(elt => elt.split(" "))) {
        // Fix the dice orientation according to the current query.
        dice.fix(t, f);
        // Write the value of the right face (index 2) to standard output, followed by a newline.
        cout.write(`${dice.stat[2]}\n`);
    }
});