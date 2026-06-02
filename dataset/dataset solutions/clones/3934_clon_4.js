function Main(input) {
  const inputVal = parseInt(input);

  if (inputVal < 3 || inputVal > 20000) {
    console.log("しね");
    return;
  }

  // Generate the sequence elements from index 2 up to inputVal - 1
  // using a functional reduce pattern. The `Array.from` creates an array of indices.
  const generatedElements = Array.from({ length: Math.max(0, inputVal - 2) }, (_, currentOffset) => currentOffset + 2)
    .reduce((accumulator, currentIdx) => {
      let elementValue;
      if (currentIdx < 10002) {
        // Corresponds to the first original loop's formula
        elementValue = currentIdx * 3 - 4 - (currentIdx % 2);
      } else if (currentIdx < 15000) {
        // Corresponds to the second original loop's formula
        elementValue = (currentIdx - 10000) * 6 + 3;
      } else {
        // Corresponds to the third original loop's formula
        elementValue = (currentIdx - 14999) * 6;
      }
      accumulator.push(elementValue);
      return accumulator;
    }, []);

  // Combine the fixed initial values (3, 9) with the dynamically generated elements
  let finalSequence = [3, 9, ...generatedElements];

  // Apply specific overrides based on inputVal, mirroring the original conditional logic
  if (inputVal === 3) {
    // Special case for N=3
    finalSequence[1] = 25;
  } else if (inputVal % 2 === 1 || inputVal < 15000) {
    // This condition applies if inputVal is odd (and not 3, as 3 is handled above)
    // OR if inputVal is even and less than 15000.
    // Effectively, it applies unless inputVal is even AND inputVal >= 15000.
    finalSequence[inputVal - 1] = 6;
  }

  // Sort the sequence numerically in ascending order
  finalSequence.sort((valA, valB) => valA - valB);

  // Output the space-separated elements
  console.log(finalSequence.join(" "));
}

// Standard input reading for competitive programming environments
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
