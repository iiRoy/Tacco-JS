// This script processes standard input to simulate a dice rolling problem.
// It reads initial dice face configurations and then subsequent roll instructions.

process.stdin.resume(); /* Ensure the standard input stream stays open */

process.stdin.setEncoding("utf8"); // Set the encoding for input data to UTF-8


// Initialize a readline interface for reading input line by line.
const reader = require("readline").createInterface(
  {
    input: process.stdin,   // Input source is standard input
    output: process.stdout  // Output destination is standard output (not used for prompts here)
  }
);


const lines = []; // This array will store all input lines read from stdin.


// Event listener: When a new line of input is received, add it to the 'lines' array.
reader.on(
  "line",
  (line) =>
  {
    lines.push(
      line
    ); // Append the current line to the collection
  }
);


// Event listener: When the input stream is closed (EOF), process all collected lines.
reader.on("close",
  () => {
    // Parse the first line to get the initial orientation of the dice faces.
    // The faces are assumed to be in the order: top, front, right, left, back, bottom.
    let [ top, front, right, left, back, bottom ] = lines[0].split(" ");

    // Parse the second line to get the number of subsequent roll operations.
    // Subtracting 0 ensures it's treated as a number.
    let n = lines[1] - 0;

    // Define possible orientations of the dice based on standard rotations.
    // s1: Represents the state after a 'N' (North) or 'S' (South) roll.
    let s1 = [ top, front, bottom, back ];
    // s2: Represents the state after an 'E' (East) or 'W' (West) roll.
    let s2 = [ top, right, bottom, left ];
    // s3: Represents the state after a 'R' (Right) or 'L' (Left) roll (rotation around vertical axis).
    let s3 = [ front, right, back, left ];

    // Loop through each roll instruction, starting from the third line (index 2).
    // The loop runs 'n' times.
    for (
      let i = 2;
      i < n + 2;
      i++
    )
    {
      // Each instruction line contains two faces: the current top face (t)
      // and the current front face (f) after some unknown rotations.
      let [ t, f ] = lines[i].split(" ");

      // Determine which orientation array (s1, s2, or s3) 't' belongs to.
      // This identifies the current axis of rotation or view.
      let s = s1.includes(t)
        ? (s2.includes(t) ? s3 : s2) // If 't' is in s1 AND s2, it must be the top/bottom, so s3 (side rotation)
        : s1;                         // Otherwise, if 't' is only in s1, use s1 (N/S rotation)

      // Find the index of the 'front' face 'f' within the selected orientation array 's'.
      let ixf = s.indexOf(f);

      // Adjust the index 'ixf' based on the 'top' face 't' to find the 'right' face.
      // This logic implicitly determines the direction of rotation (clockwise/counter-clockwise).
      if (
        t === top
        || t === right
        || t === back
      )
      {
        // If 't' is top, right, or back, a clockwise rotation is implied.
        // Move to the next element in the circular array (0 -> 1, 1 -> 2, 2 -> 3, 3 -> 0).
        ixf = ixf === 3 ? 0 : ixf + 1;
      }
      else
      {
        // Otherwise, a counter-clockwise rotation is implied.
        // Move to the previous element in the circular array (0 -> 3, 1 -> 0, 2 -> 1, 3 -> 2).
        ixf = ixf === 0 ? 3 : ixf - 1;
      }

      // The element at the calculated 'ixf' index is the face that should be on the 'right'.
      // Print this face to the console.
      console.log(
        s[ixf]
      );
    }
  }
);