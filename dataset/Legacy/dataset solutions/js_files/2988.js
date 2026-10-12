'use strict'
function Main(input){
  const N=input.trim()-0;
  if(N===1){
    console.log(0);
    return;
  }
  const M=Math.floor(Math.sqrt(N))+1;
  const isPrime=[];
  for(let i=0;i<M;i++){
    isPrime[i]=true;
  }
  isPrime[0]=isPrime[1]=false;
  for(let i=0;i<M;i++){
    if(!isPrime[i])continue;
    for(let j=2;i*j<=M;j++){
      isPrime[i*j]=false;
    }
  }
  const primes=[];
  for(let i=0;i<=M;i++){
    if(isPrime[i])primes.push(i);
  }
  const factorized=[];
  for(let i=0;i<=primes.length;i++){
    factorized[i]=0;
  }
  var n=1;
  let i=0;
  while(n<N){
    while(N%(n*primes[i])===0){
      factorized[i]++;
      n*=primes[i];
    }
    i++;
    if(i===primes.length)break;
  }
  const concentrated=[];
  factorized.forEach(function(e,i){
    if(e>=1)
      concentrated.push([primes[i],e]);
  });
  if(concentrated.length===0)concentrated.push([N,1]);
  //console.log(concentrated);
  var ans=0;
  const factor=[];
  const L=concentrated.reduce((acc,cur)=>acc*(cur[1]+1), 1);
  //console.log(concentrated);
  for(let l=0;l<L;l++){
    let m=l;
    concentrated.forEach(function(cur,i){
      let p=cur[0];
      let e=cur[1];
      factor[i]=[p,m%(e+1)];
      m=(m-m%(e+1))/(e+1);
    });
    //console.log(factor);
    let r=factor.reduce((acc,cur)=>acc*(Math.pow(cur[0],cur[1])),1);
    //console.log(r);
    if(N/r-1>r)ans+=N/r-1;
  }
  console.log(ans);
}

Main(require('fs').readFileSync('/dev/stdin','utf8'));
