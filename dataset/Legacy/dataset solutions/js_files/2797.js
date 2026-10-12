"use strict";
    
const main = arg => {
  let Num = arg.split("");
  let ans = "Good";
  for(let i = 0; i < 3; i++){
  	if(Num[i] == Num[i+1]){
       ans = "Bad";
    }
  }
  console.log(ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
