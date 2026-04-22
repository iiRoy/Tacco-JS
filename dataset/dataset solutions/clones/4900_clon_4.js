var initialStringContent = "FFFFdfadadadfd";

var finalOutcome;

function evaluatePattern(inputStringSegment) {
  var firstOccurrenceOfC = inputStringSegment.indexOf('C');

  if (firstOccurrenceOfC === -1) {
    return false;
  }

  var postCSubstring = inputStringSegment.substring(firstOccurrenceOfC + 1);

  var subsequentOccurrenceOfF = postCSubstring.indexOf('F');

  if (subsequentOccurrenceOfF !== -1) {
    return true;
  }

  // If 'C' is present but 'F' is not found later,
  // the function will implicitly return undefined,
  // mirroring the original implementation's behavior.
}

finalOutcome = evaluatePattern(initialStringContent);