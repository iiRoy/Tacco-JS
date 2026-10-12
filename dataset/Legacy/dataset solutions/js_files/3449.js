function Main(input){
var N = input.split("\n")[0];
var T = input.split("\n")[1].split(" ")[0];
var A = input.split("\n")[1].split(" ")[1];
var H = input.split("\n")[2].split(" ");
var a = [];
var min;
for(i=0;i<=(H.length-1);i++){
  var temp_hi = parseInt(T,10) - parseInt(H[i],10)*0.006;
  if(parseInt(A,10)>=0){
    var x = parseInt(A,10) - temp_hi;
  }else{
    var x = parseInt(A,10) + temp_hi;
  }
  a[i] = Math.abs(x);
  if(i>=1&& a[i-1]>a[i]){
    min = i+1;
  }else if(i>=1&& a[i]>=a[i-1]){
    min = i;
  }
}
console.log(min);
}
  Main(require('fs').readFileSync('/dev/stdin','utf8'));