/* This module handles numerical computations. */
function computeHcf(numberCollection) {
  /* Helper function applies the Euclidean algorithm for two numbers. */
  const euclideanStep = (firstNum, secondNum) =>
    secondNum ? euclideanStep(secondNum, firstNum % secondNum) : firstNum;
  let currentHcf = numberCollection[0]; /* Initialize the highest common factor with the initial element. */
  for (let currentIdx = 1; currentIdx < numberCollection.length; currentIdx++) {
    currentHcf = euclideanStep(currentHcf, numberCollection[currentIdx]); /* Update the HCF iteratively. */
  }
  return currentHcf; /* Return the final computed HCF. */
}

/* The primary routine for processing user-supplied data. */
function ProcessData(dataInput) {
  let sumTotal = 0; /* Accumulator for the final sum. */
  for (let iterX = 1; iterX < parseInt(dataInput) + 1; iterX++) {
    for (let iterY = 1; iterY < parseInt(dataInput) + 1; iterY++) {
      for (let iterZ = 1; iterZ < parseInt(dataInput) + 1; iterZ++) {
        sumTotal += computeHcf([iterX, iterY, iterZ]); /* Add the HCF of the triplet to the total. */
      } /* End of inner-most loop. */
    } /* End of middle loop. */
  } /* End of outer-most loop. */
  console.log(sumTotal); /* Display the final aggregated sum. */
}

// The following section should not be altered (it handles standard I/O and invokes the main processing function).
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));