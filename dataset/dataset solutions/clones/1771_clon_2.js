function DataProcessor(sourceContent) {
  // This section extracts and parses the numerical components from the input string.
  const firstComponent = Number(sourceContent
                                  .split(" ")[0]);

  // The second component is parsed as an integer.
  const secondComponent = parseInt(sourceContent
                                     .split(" ")[1],
                                   10);

  // A derived metric is calculated based on the two components.
  let computedValue = (2 * firstComponent) - (secondComponent / 2);

  // A conditional evaluation determines the final output.
  if ( (secondComponent % 2 === 0) && (computedValue >= 0) )
  {
    console.log('Yes'); // Output for a successful condition.
  }
  else
  {
    console.log("No");  // Output for an unsuccessful condition.
  }
}

// Execution starts here: reading from standard input and invoking the main processing function.
DataProcessor(
    require("fs")
        .readFileSync(
            "/dev/stdin",
            "utf8"
        )
);