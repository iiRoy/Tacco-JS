
function Main (input) {
  var S = input.split(" ")[0];
  var W = input.split(" ")[1];
  if (W > S) {
  	console.log("safe");
  } else {
  	console.log("unsafe");
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));