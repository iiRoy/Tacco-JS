function  processData(
  sourceText
) {
  // Break down the received content by newlines
  const  lineSegments = sourceText
    .split(
      "\n"
    );

  // Designate the primary string from the initial segment
  const  mainString = lineSegments[
    0
  ];

  // Initialize a tally of points
  let  pointAccumulator = 0;

  // Traverse through each individual character of the main string
  for(
    let  idx = 0;
    idx < mainString.length;
    idx++
  ) {
    // If the character at the current position is 'p', deduct a point
    if (
      mainString[
        idx
      ] === 'p'
    ) {
      pointAccumulator
        --;
    }
  }

  // Compute the final value and output it to the console
  console
    .log(
      Math
        .floor(
          mainString.length
          /
          2
        )
      +
      pointAccumulator
    );
}

// Do not modify the following segment. It handles reading input and invoking the primary function.
processData(
  require("fs")
    .readFileSync(
      "/dev/stdin",
      "utf8"
    )
);