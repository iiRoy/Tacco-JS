function ExecuteCalculation(rawInput) {
  const inputSegments = rawInput.split('\n');
  const initialNumericSegment = inputSegments[0];
  const parsedInitialNumber = parseInt(initialNumericSegment);

  const targetReciprocalTotal = 4 / parsedInitialNumber;

  const maximumDenominatorConstraint = 3500;
  const minimumDenominatorConstraint = 1;

  const findExactReciprocalDenominator = (requiredFractionValue, lowerLimit, upperLimit) => {
    const performBinarySearch = (currentLower, currentUpper) => {
      if (currentLower > currentUpper) {
        return -1;
      }

      const middleDenominator = Math.floor((currentLower + currentUpper) / 2);
      const computedReciprocal = 1 / middleDenominator;

      if (computedReciprocal === requiredFractionValue) {
        return middleDenominator;
      } else if (computedReciprocal < requiredFractionValue) {
        return performBinarySearch(currentLower, middleDenominator - 1);
      } else {
        return performBinarySearch(middleDenominator + 1, currentUpper);
      }
    };
    return performBinarySearch(lowerLimit, upperLimit);
  };

  const validateAndOutputSolution = (denomH, denomN, denomW) => {
    if (targetReciprocalTotal === (1 / denomH + 1 / denomN + 1 / denomW)) {
      console.log([denomH, denomN, denomW].join(" "));
      return true;
    }
    return false;
  };

  const recursiveDenominatorSearch = (currentHValue) => {
    if (currentHValue > maximumDenominatorConstraint) {
      return false;
    }

    if (targetReciprocalTotal <= 1 / currentHValue) {
      return recursiveDenominatorSearch(currentHValue + 1);
    }

    const innerRecursiveSearchForN = (currentNValue) => {
      if (currentNValue > maximumDenominatorConstraint) {
        return false;
      }

      const sumOfHAndNReciprocals = 1 / currentHValue + 1 / currentNValue;

      if (targetReciprocalTotal <= sumOfHAndNReciprocals) {
        return innerRecursiveSearchForN(currentNValue + 1);
      }

      const remainingReciprocalForW = targetReciprocalTotal - sumOfHAndNReciprocals;
      const foundWValue = findExactReciprocalDenominator(remainingReciprocalForW, minimumDenominatorConstraint, maximumDenominatorConstraint);

      if (foundWValue !== -1) {
        if (validateAndOutputSolution(currentHValue, currentNValue, foundWValue)) {
          return true;
        }
      }
      return innerRecursiveSearchForN(currentNValue + 1);
    };

    if (innerRecursiveSearchForN(minimumDenominatorConstraint)) {
      return true;
    }

    return recursiveDenominatorSearch(currentHValue + 1);
  };

  if (!recursiveDenominatorSearch(minimumDenominatorConstraint)) {
    console.log("NG");
  }
}
ExecuteCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));