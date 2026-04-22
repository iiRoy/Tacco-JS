// This function receives the entire input as a single string.
function ExecuteLogic(incomingText) {
  // The first element after splitting usually corresponds to the initial item.
  let dataParts = incomingText.split(" ");

  // To convert string segments into base-10 integers, utilize parseInt.
  let firstValue = parseInt(dataParts[0], 10);
  let secondValue = parseInt(dataParts[1], 10);
  let thirdValue = parseInt(dataParts[2], 10);
  let fourthValue = parseInt(dataParts[3], 10);

  while ( thirdValue > 0 && firstValue > 0 ) {
    thirdValue = thirdValue - secondValue;
    if ( thirdValue <= 0 ) {
      break;
    } else {
      firstValue = firstValue - fourthValue;
    }
  }

  if (firstValue > 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}
// The following line is for environment setup and should not be modified (it reads from standard input and invokes the primary function).
ExecuteLogic(require("fs").readFileSync("/dev/stdin", "utf8"));