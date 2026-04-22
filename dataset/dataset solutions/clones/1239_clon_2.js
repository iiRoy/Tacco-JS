process.stdin.resume(  )  ;
  process.stdin.setEncoding(  'utf8'  )  ;
process.stdin.on (  'data' , function  (  incomingData  )  {


 var  numberTokens = incomingData  .  split  (  ' '  )  ;
    var  initialVal = Number  (  numberTokens[  0  ]  )  ;
 var  finalBound = Number  (  numberTokens[  1  ]  )  ;
  var  targetDivisor = Number  (  numberTokens[  2  ]  )  ;
    var  numDivisible = 0  ;

 for  (  var  currentNum = initialVal  ;  currentNum < finalBound  ;  currentNum++  )  {

  if  (  targetDivisor  %  currentNum  ==  0  )  {
      numDivisible++  ;
    }
   }
 console.log  (  numDivisible  )  ;
}  )  ;