function Main(input) {
  var dn = input[0].split(" ");
  console.log('%d', Math.round(Math.pow(100, dn[0]) * dn[1]));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
