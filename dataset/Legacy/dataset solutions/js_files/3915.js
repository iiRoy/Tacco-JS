"use strict"

const Main=(inputt)=>{

  const Array=inputt.split(" ").map((ele)=>{return ele-0})
  const A =Array[0]-0
  const B =Array[1]-0
  const K = Array[2]-0
  //iは配列番号K
  const resultArray=[]

  for(let i=A;i<=B;i+=1){
    resultArray.push(i)
  }
  
  const index=resultArray.length-1
  for(let j=0;j<=K-1;j+=1){
    console.log(resultArray[j])
  }

  for(let k=index-K+1;k<=index;k+=1){
    console.log(resultArray[k])
  }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
