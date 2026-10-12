function Main(input){
  input = input.split("\n");
   var arr = input[1].split(" ").map(Number);
  var t = 0;
  var f = 0;
  arr.forEach(function(val){
    if(val%4==0)f++;
    else if(val%2==0)t++;
  });
  t-=2;
  t = Math.max(t,0)
  var n = arr.length;
  console.log(f*3+t>=n?"Yes":"No")
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());