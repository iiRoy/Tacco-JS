'use strict'

function Main(input){
  input=input.split(/\s+/);
  for(let i=0;i<input.length;i++){
    input[i]=parseInt(input[i]);
  }
  var N=input.shift();
  var M=input.shift();
  var Entry=[false,0,0,0,0,0,0,0,0,0,];
  var numToCost=[false,2,5,5,4,5,6,3,7,6,];
  var costToNum=[false,false,0,0,0,0,0,0,];
  for(let i=0;i<M;i++){
    let num=input[i]
    let cost=numToCost[input[i]];
    if(num>costToNum[cost]){
      costToNum[cost]=num;
    }
  }
  for(let i=2;i<8;i++){
    if(costToNum[i]===0){
      costToNum[i]=false;
    }
  } 
  var dp=[];
  dp[0]=[true,'','','','','','','','',''];
  var i=1;
  while(i<N+1){
    for(let j=1;j<10;j++){
      if(dp[i-j]&&dp[i-j][0]&&costToNum[j]){
        let challenger=dp[i-j].concat();
        let num=costToNum[j];
        challenger[num]=dp[i-j][num]+num;
//        console.log(i+':'+challenger);
        dp[i]=larger(dp[i],challenger);
      }
    }
    i++;
  }
  var str='';
  for(let i=1;i<10;i++){
    str=dp[N][i]+str;
  }
  console.log(str);
}

function larger(a1,a2){
  if(a1===undefined)return a2;
  if(a1.join().length>a2.join().length)return a1;
  if(a1.join().length<a2.join().length)return a2;
  for(let num=9;num>0;num--){
    if(a1[num].length>a2[num].length)return a1;
    if(a1[num].length<a2[num].length)return a2;
  }
return a1;
}

Main(require('fs').readFileSync('/dev/stdin','utf8'));