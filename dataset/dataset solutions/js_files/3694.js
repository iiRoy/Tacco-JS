var input = parseInt(require("fs").readFileSync("/dev/stdin","utf-8").trim());
var answer;
if(input%2===0){
  answer = input;
}else{
  answer= input*2;
}

console.log(answer);
