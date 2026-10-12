"use strict"

const Main=(input)=>{
  console.log(input)
  
  const Array=input.trim().split(/\n/)
  const Array1=Array[0].split(/\D/)
  const Array2=Array[1].split(/\D/)
  const Array3=Array[2].split(/\D/)
  const Answer=`${Array1[0]}${Array2[1]}${Array3[2]}`

  console.log(Answer)
}


Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
