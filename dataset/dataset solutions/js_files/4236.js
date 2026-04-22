function Main(input) {
  input = input.split("\n");
  var x = parseInt(input[0].split(" ")[0]);
  var y = parseInt(input[0].split(" ")[1]);
  var z = parseInt(input[0].split(" ")[2]);
  var ans=0;
  ans=Math.floor((x-z)/(z+y));
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));