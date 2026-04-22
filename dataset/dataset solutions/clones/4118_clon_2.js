/* This function processes the entire collection of input lines */
function ProcessInputData ( rawData ) {
  let firstNumDigits = rawData[0].split(' ')[0] - 0;
  let secondNumDigits = rawData[0].split(' ')[1] - 0;
  let targetString = rawData[1];
  const validationPattern = new RegExp("^\\d{" + firstNumDigits + "}-\\d{" + secondNumDigits + "}$");

  console.log(validationPattern.test(targetString) ? "Yes" : "No");
}

ProcessInputData( require("fs").readFileSync("/dev/stdin" , "utf8" ).trim().split("\n") );