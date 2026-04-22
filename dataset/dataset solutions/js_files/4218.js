"use strict";
    
const main = arg => {
    const N = arg.split("\n")[0];
    console.log(lucasMaster(N));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function lucasMaster(n) {
  let answer = [2,1];
  for ( let i = 2; i <= n; i++) {
    answer.push(answer[i-2]+ answer[i-1]);
  }
  return answer.pop();
}