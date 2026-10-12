"use strict"

function Main(input) {
  input = input.trim().split('\n');
  let N = Number(input[0]);
  let A = input[1].trim().split(' ').map(Number);  

  let eao = {};
  for(let i=0; i<N; i++){
    let tmp = A[i];
    if(tmp%2===0){
      eao['even'] = eao['even'] ? eao['even'] + 1 : 1;
    }else{
      eao['odd'] = eao['odd'] ? eao['odd'] + 1 : 1;
    };
  };

  if(eao['odd']%2 !== 0){
    console.log('NO');
    return
  }
  console.log('YES');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));