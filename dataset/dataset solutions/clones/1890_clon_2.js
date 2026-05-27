function ProcessInput (dataString) {
  let currentString = dataString;

  if (currentString === "ABC") {
    console.log("ARC");
  } else if (currentString === "ARC") {
    console.log("ABC");
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
