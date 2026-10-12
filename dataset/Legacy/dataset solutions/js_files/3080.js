function Main(input) {
  var inputary = input.split(" ");
  var a = parseInt(inputary[0], 10);
  var b = parseInt(inputary[1], 10);
  var c = parseInt(inputary[2], 10);

  if(a === b && b === c) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));