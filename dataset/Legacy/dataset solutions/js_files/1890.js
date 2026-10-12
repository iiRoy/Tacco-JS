function Main (input) {
  var s = input;
  if (s == "ABC") {
    console.log("ARC");
  } else if (s == "ARC") {
    console.log("ABC");
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));