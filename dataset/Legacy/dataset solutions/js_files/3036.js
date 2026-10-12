'use strict'
function Main(input){
  input=input.trim().split(/\n/);
  var N=input[0]-0,S=input[1].split(''),K=input[2];
  var e=S[K];
  var ans=S.map(x=>x===e?e:'*').join('');
  console.log(ans);
}

Main(require('fs').readFileSync('/dev/stdin','utf8'));