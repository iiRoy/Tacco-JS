function Main(arg)
{
  var S = arg;
 
 
  console.log("x".repeat(S.length));
  return;
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));