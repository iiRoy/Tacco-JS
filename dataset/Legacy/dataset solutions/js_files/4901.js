function Main(input) {
  var input = input.split("\n");
  var K = parseInt(input[0].split(" ")[0]);
  var T = parseInt(input[0].split(" ")[1]);
  var a = input[1].split(" ").map((el,i)=>{
    return parseInt(el);
  });
  a.sort((a,b)=>{
    return a < b
  });
  console.log(Math.max.apply(null, [2*a[0] - 1 - a.reduce((a, b) => a + b, 0),0]));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));