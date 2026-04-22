function evaluateInput(inputReference) {
  function obtainDigitSum(charSequence, position) {
    if (position >= charSequence.length) {
      return 0;
    }
    var numericalValue = charSequence.charCodeAt(position) - 48;
    return numericalValue + obtainDigitSum(charSequence, position + 1);
  }

  var finalSum = obtainDigitSum(inputReference, 0);

  if (finalSum % 9 === 0) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}
evaluateInput(require("fs").readFileSync("/dev/stdin", "utf8"));