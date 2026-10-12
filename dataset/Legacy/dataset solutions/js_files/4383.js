var fs = require("fs");
Main(fs.readFileSync("/dev/stdin","utf-8"));

function Main(input){
  input = input.split("\n");
  N = parseInt(input[0],10);
  input=input[1].split(" ");
  input=input.map(function(value){
    return parseInt(value,10);
  });
  var ans=0;
  for(var i in input){
    var tmp =count(input,input[i]-1)+count(input,input[i])+count(input,input[i]+1);
    if(ans<tmp) ans=tmp;
  }
  console.log(ans);
}
function count(input,num){
  var count_num=0;
  for(var j=0;j<input.length;j++){
    if(input[j]==num) count_num++;
  }
  return count_num;
}