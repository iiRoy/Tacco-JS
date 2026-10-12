function Main(input) {
  input = input.split("\n");
  var x1 = parseInt(input[0].split(" ")[0]);
  var y1 = parseInt(input[0].split(" ")[1]);
  var x2 = parseInt(input[0].split(" ")[2]);
  var y2 = parseInt(input[0].split(" ")[3]);
  var ans = 0;
  var x3=x2-(y2-y1);
  var y3=y2+(x2-x1);
  var x4=x1-(y2-y1);
  var y4=y1+(x2-x1);
  var ans=x3+" "+y3+" "+x4+" "+y4;

  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));