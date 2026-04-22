function       circle (   part   )     {
  // This function performs a 90-degree clockwise rotation on a given 2D array (matrix).
  // It assumes the input 'part' is a square matrix.

  var
      m     =     part.length,    // 'm' stores the dimension of the square matrix.
      i,    j,                    // Loop counters for iterating through rows and columns.
      part2     =     [];         // 'part2' will hold the result of the rotation.

  // First, initialize the 'part2' array with empty sub-arrays to form a 2D structure.
  for     (   i     =     0;     i     <     m;     i++   )
  {
    part2[i]     =     [];
  }

  // Now, populate 'part2' with the rotated elements.
  // The rotation logic for a 90-degree clockwise turn is:
  // new_matrix[row][col] = original_matrix[col][matrix_size - 1 - row]
  // In this specific implementation: part2[i][m - j - 1] = part[j][i];
  for     (   i     =     0;     i     <     m;     i++   )
  {
    for     (   j     =     0;     j     <     m;     j++   )
    {
      part2[i][m     -     j     -     1]     =     part[j][i];
    }
  }

  // Return the newly created and rotated matrix.
  return     part2;
}


// --- Separator for clarity ---


function       main (   )     {
  // This is the main function where the program execution begins after input processing.
  // It reads image and part data, searches for the part within the image,
  // and prints the coordinates if found.

  var
      image,         // The main image represented as a 2D array of numbers.
      part,          // A smaller pattern (part) to be searched for within the image.
      parts,         // An array storing the 'part' and its three 90-degree rotations.
      searchFlag,    // A boolean flag, though its usage might be limited in the final logic.
      checkFlag,     // A boolean flag to indicate if a specific part rotation matches at a given location.
      i,     j,       // General-purpose loop counters.
      x,     y,       // Temporary variables to store 1-based coordinates of a potential match.
      ax,    ay,      // Stores the 1-based coordinates of the *best* match found so far (top-most, then left-most).
      h,     k,     l, // More loop counters, specifically for iterating through rotations and part dimensions.
      n,     m,       // Dimensions: 'n' for the image (N x N), 'm' for the part (M x M).
      line;          // A temporary array to hold parsed input line values.

  // The program runs in an infinite loop, processing multiple test cases until
  // an end-of-input condition is met (N=0 and M=0).
  for     (   ;  ;   )
  {
    // --- Input Processing Section ---
    // Read the first line for N and M values.
    line     =     input.shift().split(/\s+/).map(parseFloat);
    n     =     line[0]; // Image dimension.
    m     =     line[1]; // Part dimension.

    // Check for the termination condition.
    if     (   n     ===     0     &&     m     ===     0   )
    {
      break; // Exit the infinite loop.
    }

    // Initialize and populate the 'image' 2D array.
    image     =     [];
    for     (   i     =     0;     i     <     n;     i++   )
    {
      image.push(input.shift().split(/ +/).map(parseFloat));
    }

    // Initialize and populate the 'part' 2D array.
    part     =     [];
    for     (   i     =     0;     i     <     m;     i++   )
    {
      part.push(input.shift().split(/ +/).map(parseFloat));
    }

    // Generate all four rotations of the 'part' and store them in the 'parts' array.
    parts     =     [];
    for     (   i     =     0;     i     <     4;     i++,     part     =     circle(part)   )
    {
      parts.push(part);
    }

    // --- Pattern Matching Search Algorithm ---
    searchFlag     =     true;               // This flag is actually not utilized to control flow significantly.
    ax     =     ay     =     99999999;       // Initialize best match coordinates to a very large number.
                                             // This acts as an "infinity" to find the smallest (top-leftmost) match.

    search:   // Label for the outermost loop, allowing for early exit from all search loops if needed (though not used).
    for     (   i     =     0;     i     <     n     -     m;     i++   )
    {
      for     (   j     =     0;     j     <     n     -     m;     j++   )
      {
        for     (   h     =     0;     h     <     4;     h++   )
        {
          // For each possible position (i, j) in the image and each rotation 'h' of the part:
          checkFlag     =     true;           // Assume a match initially.
          x     =     y     =     0;          // Reset temporary match coordinates.

          check:   // Label for the inner loops, allowing to break out upon a mismatch.
          for     (   k     =     0;     k     <     m;     k++   )
          {
            for     (   l     =     0;     l     <     m;     l++   )
            {
              // Check each element of the current part rotation against the corresponding image element.
              if     (   parts[h][k][l]     ===     -1   )
              {
                continue; // If the part element is -1, it's a wildcard, so skip this comparison.
              }
              if     (   parts[h][k][l]     !==     image[i     +     k][j     +     l]   )
              {
                checkFlag     =     false;    // Mismatch found!
                break   check;              // No need to check further elements for this part rotation and position.
              }
              // If this is the very first non-wildcard element matched, record its 1-based coordinates.
              if     (   x     ===     0     &&     y     ===     0   )
              {
                x     =     j     +     l     +     1; // Column (1-based).
                y     =     i     +     k     +     1; // Row (1-based).
              }
            }
          }

          // If 'checkFlag' is still true, it means the current part rotation matched at (i, j).
          if     (   checkFlag   )
          {
            // Update 'ax' and 'ay' if this match is "better" (smaller y, then smaller x).
            if     (   x     <     ax   )
            {
              ax     =     x;
              ay     =     y;
            }
            if     (   x     ===     ax     &&     y     <     ay   )
            {
              ay     =     y;
            }
          }
        }
      }
    }

    // --- Output Results ---
    // Check if a valid match was found (i.e., ax and ay were updated from their initial large values).
    if     (   ax     !==     99999999     &&     ay     !==     99999999   )
    {
      console.log(ax     +     '     '     +     ay); // Output the 1-based coordinates of the top-leftmost match.
    }
    else
    {
      console.log('NA'); // No match was found.
    }
  }
}


// --- Global Input Handling Setup ---
// These lines are responsible for capturing standard input from the environment.

var
    input     =     ''; // A global string to accumulate all incoming data.

process.stdin.resume();                 // Ensures the standard input stream stays open.
process.stdin.setEncoding('utf8');      // Sets the character encoding for the input stream.

process.stdin.on('data',     function (   chunk   )     {
  // Event listener: This function is called whenever a new chunk of data is received.
  input     +=     chunk; // Append the received chunk to the 'input' string.
});

process.stdin.on('end',     function (   )     {
  // Event listener: This function is called when the input stream has ended.
  input     =     input.split('\n'); // Split the accumulated input string into an array of lines.
  main();                            // Call the main program function to start processing.
});