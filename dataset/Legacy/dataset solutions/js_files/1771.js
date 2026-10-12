function Main(input) {
  var X = input.split(" ")[0];
  var Y = input.split(" ")[1];
  var tmp = 2 * X -Y/2;
  if (Y % 2 === 0 && tmp >= 0 ) {
    console.log('Yes');
  } else {
    console.log("No");
  }
  }

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));