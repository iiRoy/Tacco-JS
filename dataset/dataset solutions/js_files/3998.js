function Main(input){
  var [a,b] = input.split(" ");
  console.log((a==1||b==1)?((a==b)?0:Math.max(a,b)-2):a*b-((a-2)*2+(b-2)*2)-4)
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
