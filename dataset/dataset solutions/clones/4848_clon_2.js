function ProcessInput(inputString) {
  inputString = inputString.trim();
  const strLen = inputString.length;
  if ((strLen & 1) ^ (inputString[0] === inputString[strLen - 1])) {
    console.log("First");
  } else {
    console.log("Second");
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
