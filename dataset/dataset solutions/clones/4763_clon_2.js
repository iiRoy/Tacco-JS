function getPrimeFactors(  aGivenNumber  ) {
  let   primeFactorOccurrences  =  [  ] ;
  for  (  let  currentDivisor  =  2  ;  currentDivisor  *  currentDivisor  <=  aGivenNumber  ;  currentDivisor++  )   {
    let   currentPower  =  0  ;
    while  (  aGivenNumber  %  currentDivisor  ===  0  )   {
      aGivenNumber  /=  currentDivisor  ;
      currentPower++  ;
    }
    if  (  currentPower  >  0  )   {
      primeFactorOccurrences.push  (  {  basePrime  :  currentDivisor  ,  exponentValue  :  currentPower  }  )  ;
    }
  }

  if  (  aGivenNumber  !==  1  )   {
    primeFactorOccurrences.push  (  {  basePrime  :  aGivenNumber  ,  exponentValue  :  1  }  )  ;
  }
  return   primeFactorOccurrences  ;
}


function  calculateDivisorCount  (  inputString  )   {
  let   upperLimit  =  Number  (  inputString  )  ;
  let   remainderBase  =  1000000007  ; 
  
  let   totalPrimeCounts  =  {  }  ;
  for  (  let  currentNumber  =  1  ;  currentNumber  <=  upperLimit  ;  currentNumber++  )   {
    let   individualFactors  =  getPrimeFactors  (  currentNumber  )  ;
    individualFactors.forEach  (  primeDetail  =>  {
      let   basePrime  =  primeDetail.basePrime  ;
      let   currentExponent  =  primeDetail.exponentValue  ;
      if  (  totalPrimeCounts  [  basePrime  ]  )   {
        totalPrimeCounts  [  basePrime  ]  +=  currentExponent  ;
      }  else  {
        totalPrimeCounts  [  basePrime  ]  =  currentExponent  ;
      }
    }  )  ;
  }

  console.log  (  totalPrimeCounts  )  ; 
  let   finalResult  =  1  ;
  Object.keys  (  totalPrimeCounts  )  .forEach  (  primeKey  =>  {
    finalResult  *=  (  totalPrimeCounts  [  primeKey  ]  +  1  )  ;
    finalResult  %=  remainderBase  ;
  }  )  ;
  console.log  (  finalResult  )  ; 
}

calculateDivisorCount  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;