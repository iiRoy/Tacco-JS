function Main(input) {
  input = input.split("\n");
  var n = Number(input[0]);
  var d = Number(input[1].split(" ")[0]);
  var x = Number(input[1].split(" ")[1]);

  var eaten = 0;

  for (var i = 0; i < n; i++) {
    var a = input[i + 2];
    eaten += Math.ceil(d / a);
  }

  console.log(eaten + x);
  // console.log('%d %s', a , b , c, d);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
