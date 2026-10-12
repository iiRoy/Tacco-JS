let largeNum=function(noValue){"use strict";
 var NUM_BASE=1e7,
  BASE_LOG=7,
  MAX_SAFE_INT=9007199254740992,
  SAFE_INT_DIGITS=splitSmallIntoDigits(MAX_SAFE_INT),
  LOG_SAFE_INT=Math.log(MAX_SAFE_INT);
 function NumWrapper(inputVal,baseVal){
  // Check if input value is undefined
  if(typeof inputVal==="undefined")
   return NumWrapper[0];
  // If base is provided, handle conversion
  if(typeof baseVal!=="undefined")
   return+baseVal===10?normalizeInput(inputVal):convertStringWithBase(inputVal,baseVal);
  // Default to parsing the value
  return normalizeInput(inputVal)
 }
 // Class for large numbers, stored as digit arrays
 function LargeNumber(numericValue,isNegativeFlag){
  this.numericValue=numericValue;
  this.isNegativeFlag=isNegativeFlag;
  this.isSmall=false
 }
 LargeNumber.prototype=Object.create(NumWrapper.prototype);
 // Class for small numbers, stored directly
 function TinyNumber(numericValue){
  this.numericValue=numericValue;
  this.isNegativeFlag=numericValue<0;
  this.isSmall=true
 }
 TinyNumber.prototype=Object.create(NumWrapper.prototype);
 // Checks if a number fits within JavaScript's safe integer range
 function isWithinSafeRange(val){
  return-MAX_SAFE_INT<val&&val<MAX_SAFE_INT
 }
 // Converts a small integer to an array of digits based on NUM_BASE
 function splitSmallIntoDigits(val){
  if(val<1e7)
   return[val];
  if(val<1e14)
   return[val%1e7,Math.floor(val/1e7)];
  return[val%1e7,Math.floor(val/1e7)%1e7,Math.floor(val/1e14)]
 }
 // Converts an array of digits back to a small integer if possible
 function mergeDigitsToSmall(digitList){
  removeLeadingZeros(digitList);
  var currentLength=digitList.length;
  if(currentLength<4&&compareAbsoluteValues(digitList,SAFE_INT_DIGITS)<0){
   switch(currentLength){
    case 0:return 0;
    case 1:return digitList[0];
    case 2:return digitList[0]+digitList[1]*NUM_BASE;
    default:return digitList[0]+(digitList[1]+digitList[2]*NUM_BASE)*NUM_BASE
   }
  }
  return digitList
 }
 // Removes trailing zeros from a digit array
 function removeLeadingZeros(v){
  var idx=v.length;
  while(v[--idx]===0);
  v.length=idx+1
 }
 // Creates an array filled with zeros
 function initZeroArray(currentLength){
  var arr=new Array(currentLength);
  var idx=-1;
  while(++idx<currentLength){
   arr[idx]=0
  }
  return arr
 }
 // Truncates a number (floor for positive, ceil for negative)
 function floorOrCeil(val){
  if(val>0)
   return Math.floor(val);
  return Math.ceil(val)
 }
 // Adds two digit arrays (non-negative)
 function addDigitArrays(firstOperand,secondOperand){
  var lenA=firstOperand.length,
   lenB=secondOperand.length,
   resultArray=new Array(lenA),
   overflow=0,
   base=NUM_BASE,
   currentSum,
   idx;
  for(idx=0;idx<lenB;idx++){
   currentSum=firstOperand[idx]+secondOperand[idx]+overflow;
   overflow=currentSum>=base?1:0;
   resultArray[idx]=currentSum-overflow*base
  }
  while(idx<lenA){
   currentSum=firstOperand[idx]+overflow;
   overflow=currentSum===base?1:0;
   resultArray[idx++]=currentSum-overflow*base
  }
  if(overflow>0)
   resultArray.push(overflow);
  return resultArray
 }
 // Adds two digit arrays, ensuring the longer one is first
 function addAnyDigitArrays(firstOperand,secondOperand){
  if(firstOperand.length>=secondOperand.length)
   return addDigitArrays(firstOperand,secondOperand);
  return addDigitArrays(secondOperand,firstOperand)
 }
 // Adds a small integer (carry) to a digit array
 function addSmallNumberToDigits(firstOperand,overflow){
  var currentLength=firstOperand.length,
   resultArray=new Array(currentLength),
   base=NUM_BASE,
   currentSum,
   idx;
  for(idx=0;idx<currentLength;idx++){
   currentSum=firstOperand[idx]-base+overflow;
   overflow=Math.floor(currentSum/base);
   resultArray[idx]=currentSum-overflow*base;
   overflow+=1
  }
  while(overflow>0){
   resultArray[idx++]=overflow%base;
   overflow=Math.floor(overflow/base)
  }
  return resultArray
 }
 LargeNumber.prototype.sum=function(otherNum){
  var parsedNum=normalizeInput(otherNum);
  if(this.isNegativeFlag!==parsedNum.isNegativeFlag){
   return this.difference(parsedNum.invertSign())
  }
  var arrA=this.numericValue,
   arrB=parsedNum.numericValue;
  if(parsedNum.isSmall){
   return new LargeNumber(addSmallNumberToDigits(arrA,Math.abs(arrB)),this.isNegativeFlag)
  }
  return new LargeNumber(addAnyDigitArrays(arrA,arrB),this.isNegativeFlag)
 };
 LargeNumber.prototype.plusVal=LargeNumber.prototype.sum;
 TinyNumber.prototype.sum=function(otherNum){
  var parsedNum=normalizeInput(otherNum);
  var currentValA=this.numericValue;
  if(currentValA<0!==parsedNum.isNegativeFlag){
   return this.difference(parsedNum.invertSign())
  }
  var currentValB=parsedNum.numericValue;
  if(parsedNum.isSmall){
   if(isWithinSafeRange(currentValA+currentValB))
    return new TinyNumber(currentValA+currentValB);
   currentValB=splitSmallIntoDigits(Math.abs(currentValB))
  }
  return new LargeNumber(addSmallNumberToDigits(currentValB,Math.abs(currentValA)),currentValA<0)
 };
 TinyNumber.prototype.plusVal=TinyNumber.prototype.sum;
 // Subtracts one digit array from another (firstOperand >= secondOperand)
 function subtractDigitArrays(firstOperand,secondOperand){
  var arrayLenA=firstOperand.length,
   arrayLenB=secondOperand.length,
   resultArray=new Array(arrayLenA),
   underflow=0,
   base=NUM_BASE,
   idx,
   diffResult;
  for(idx=0;idx<arrayLenB;idx++){
   diffResult=firstOperand[idx]-underflow-secondOperand[idx];
   if(diffResult<0){
    diffResult+=base;
    underflow=1
   } else underflow=0;
   resultArray[idx]=diffResult
  }
  for(idx=arrayLenB;idx<arrayLenA;idx++){
   diffResult=firstOperand[idx]-underflow;
   if(diffResult<0)
    diffResult+=base;
   else{
    resultArray[idx++]=diffResult;
    break
   }
   resultArray[idx]=diffResult
  }
  for(;idx<arrayLenA;idx++){
   resultArray[idx]=firstOperand[idx]
  }
  removeLeadingZeros(resultArray);
  return resultArray
 }
 // Subtracts any two digit arrays, handling sign
 function subtractAnyDigitArrays(firstOperand,secondOperand,isNegativeFlag){
  var numericValue;
  if(compareAbsoluteValues(firstOperand,secondOperand)>=0){
   numericValue=subtractDigitArrays(firstOperand,secondOperand)
  } else{
   numericValue=subtractDigitArrays(secondOperand,firstOperand);
   isNegativeFlag=!isNegativeFlag
  }
  numericValue=mergeDigitsToSmall(numericValue);
  if(typeof numericValue==="number"){
   if(isNegativeFlag)
    numericValue=-numericValue;
   return new TinyNumber(numericValue)
  }
  return new LargeNumber(numericValue,isNegativeFlag)
 }
 // Subtracts a small integer from a digit array
 function subtractSmallNumberFromDigits(firstOperand,secondOperand,isNegativeFlag){
  var currentLength=firstOperand.length,
   resultArray=new Array(currentLength),
   overflow=-secondOperand,
   base=NUM_BASE,
   idx,
   diffResult;
  for(idx=0;idx<currentLength;idx++){
   diffResult=firstOperand[idx]+overflow;
   overflow=Math.floor(diffResult/base);
   diffResult%=base;
   resultArray[idx]=diffResult<0?diffResult+base:diffResult
  }
  resultArray=mergeDigitsToSmall(resultArray);
  if(typeof resultArray==="number"){
   if(isNegativeFlag)
    resultArray=-resultArray;
   return new TinyNumber(resultArray)
  }
  return new LargeNumber(resultArray,isNegativeFlag)
 }
 LargeNumber.prototype.difference=function(otherNum){
  var parsedNum=normalizeInput(otherNum);
  if(this.isNegativeFlag!==parsedNum.isNegativeFlag){
   return this.sum(parsedNum.invertSign())
  }
  var arrA=this.numericValue,
   arrB=parsedNum.numericValue;
  if(parsedNum.isSmall)
   return subtractSmallNumberFromDigits(arrA,Math.abs(arrB),this.isNegativeFlag);
  return subtractAnyDigitArrays(arrA,arrB,this.isNegativeFlag)
 };
 LargeNumber.prototype.minusVal=LargeNumber.prototype.difference;
 TinyNumber.prototype.difference=function(otherNum){
  var parsedNum=normalizeInput(otherNum);
  var currentValA=this.numericValue;
  if(currentValA<0!==parsedNum.isNegativeFlag){
   return this.sum(parsedNum.invertSign())
  }
  var currentValB=parsedNum.numericValue;
  if(parsedNum.isSmall){
   return new TinyNumber(currentValA-currentValB)
  }
  return subtractSmallNumberFromDigits(currentValB,Math.abs(currentValA),currentValA>=0)
 };
 TinyNumber.prototype.minusVal=TinyNumber.prototype.difference;
 LargeNumber.prototype.invertSign=function(){
  return new LargeNumber(this.numericValue,!this.isNegativeFlag)
 };
 TinyNumber.prototype.invertSign=function(){
  var currentSign=this.isNegativeFlag;
  var tinyInst=new TinyNumber(-this.numericValue);
  tinyInst.isNegativeFlag=!currentSign;
  return tinyInst
 };
 LargeNumber.prototype.absoluteValue=function(){
  return new LargeNumber(this.numericValue,false)
 };
 TinyNumber.prototype.absoluteValue=function(){
  return new TinyNumber(Math.abs(this.numericValue))
 };
 // Multiplies two digit arrays using standard long multiplication
 function multiplyFull(firstOperand,secondOperand){
  var arrayLenA=firstOperand.length,
   arrayLenB=secondOperand.length,
   currentLength=arrayLenA+arrayLenB,
   resultArray=initZeroArray(currentLength),
   base=NUM_BASE,
   multProduct,
   overflow,
   idx,
   elementA,
   elementB;
  for(idx=0;idx<arrayLenA;++idx){
   elementA=firstOperand[idx];
   for(var j=0;j<arrayLenB;++j){
    elementB=secondOperand[j];
    multProduct=elementA*elementB+resultArray[idx+j];
    overflow=Math.floor(multProduct/base);
    resultArray[idx+j]=multProduct-overflow*base;
    resultArray[idx+j+1]+=overflow
   }
  }
  removeLeadingZeros(resultArray);
  return resultArray
 }
 // Multiplies a digit array by a small integer
 function multiplyDigitsBySmall(firstOperand,smallVal){
  var currentLength=firstOperand.length,
   resultArray=new Array(currentLength),
   base=NUM_BASE,
   overflow=0,
   multProduct,
   idx;
  for(idx=0;idx<currentLength;idx++){
   multProduct=firstOperand[idx]*smallVal+overflow;
   overflow=Math.floor(multProduct/base);
   resultArray[idx]=multProduct-overflow*base
  }
  while(overflow>0){
   resultArray[idx++]=overflow%base;
   overflow=Math.floor(overflow/base)
  }
  return resultArray
 }
 // Adds zeros to the start of a digit array (effectively shifts left)
 function padWithZeros(arr,numZeros){
  var result=[];
  while(numZeros-- >0)
   result.push(0);
  return result.concat(arr)
 }
 // Karatsuba multiplication algorithm for large numbers
 function karatsubaMultiply(operandX,operandY){
  var splitPoint=Math.max(operandX.length,operandY.length);
  if(splitPoint<=30)
   return multiplyFull(operandX,operandY);
  splitPoint=Math.ceil(splitPoint/2);
  var b_part=operandX.slice(splitPoint),
   a_part=operandX.slice(0,splitPoint),
   d_part=operandY.slice(splitPoint),
   c_part=operandY.slice(0,splitPoint);
  var prodAC=karatsubaMultiply(a_part,c_part),
   prodBD=karatsubaMultiply(b_part,d_part),
   prodABCD=karatsubaMultiply(addAnyDigitArrays(a_part,b_part),addAnyDigitArrays(c_part,d_part));
  var finalProduct=addAnyDigitArrays(addAnyDigitArrays(prodAC,padWithZeros(subtractDigitArrays(subtractDigitArrays(prodABCD,prodAC),prodBD),splitPoint)),padWithZeros(prodBD,2*splitPoint));
  removeLeadingZeros(finalProduct);
  return finalProduct
 }
 // Determines if Karatsuba algorithm should be used based on lengths
 function shouldUseKaratsuba(len1,len2){
  return-.012*len1-.012*len2+15e-6*len1*len2>0
 }
 LargeNumber.prototype.product=function(otherNum){
  var parsedNum=normalizeInput(otherNum),
   arrA=this.numericValue,
   arrB=parsedNum.numericValue,
   isNegativeFlag=this.isNegativeFlag!==parsedNum.isNegativeFlag,
   absoluteVal;
  if(parsedNum.isSmall){
   if(arrB===0)
    return NumWrapper[0];
   if(arrB===1)
    return this;
   if(arrB===-1)
    return this.invertSign();
   absoluteVal=Math.abs(arrB);
   if(absoluteVal<NUM_BASE){
    return new LargeNumber(multiplyDigitsBySmall(arrA,absoluteVal),isNegativeFlag)
   }
   arrB=splitSmallIntoDigits(absoluteVal)
  }
  if(shouldUseKaratsuba(arrA.length,arrB.length))
   return new LargeNumber(karatsubaMultiply(arrA,arrB),isNegativeFlag);
  return new LargeNumber(multiplyFull(arrA,arrB),isNegativeFlag)
 };
 LargeNumber.prototype.timesVal=LargeNumber.prototype.product;
 // Helper for multiplying small integer by a digit array
 function multiplySmallByDigits(smallVal,digitArr,isNegativeFlag){
  if(smallVal<NUM_BASE){
   return new LargeNumber(multiplyDigitsBySmall(digitArr,smallVal),isNegativeFlag)
  }
  return new LargeNumber(multiplyFull(digitArr,splitSmallIntoDigits(smallVal)),isNegativeFlag)
 }
 TinyNumber.prototype._scaleByTiny=function(tinyOperand){
  if(isWithinSafeRange(tinyOperand.numericValue*this.numericValue)){
   return new TinyNumber(tinyOperand.numericValue*this.numericValue)
  }
  return multiplySmallByDigits(Math.abs(tinyOperand.numericValue),splitSmallIntoDigits(Math.abs(this.numericValue)),this.isNegativeFlag!==tinyOperand.isNegativeFlag)
 };
 LargeNumber.prototype._scaleByTiny=function(tinyOperand){
  if(tinyOperand.numericValue===0)
   return NumWrapper[0];
  if(tinyOperand.numericValue===1)
   return this;
  if(tinyOperand.numericValue===-1)
   return this.invertSign();
  return multiplySmallByDigits(Math.abs(tinyOperand.numericValue),this.numericValue,this.isNegativeFlag!==tinyOperand.isNegativeFlag)
 };
 TinyNumber.prototype.product=function(otherNum){
  return normalizeInput(otherNum)._scaleByTiny(this)
 };
 TinyNumber.prototype.timesVal=TinyNumber.prototype.product;
 // Squares a digit array
 function squareDigits(firstOperand){
  var currentLength=firstOperand.length,
   resultArray=initZeroArray(currentLength+currentLength),
   base=NUM_BASE,
   multProduct,
   overflow,
   idx,
   elementA,
   elementB;
  for(idx=0;idx<currentLength;idx++){
   elementA=firstOperand[idx];
   overflow=0-elementA*elementA;
   for(var j=idx;j<currentLength;j++){
    elementB=firstOperand[j];
    multProduct=2*(elementA*elementB)+resultArray[idx+j]+overflow;
    overflow=Math.floor(multProduct/base);
    resultArray[idx+j]=multProduct-overflow*base
   }
   resultArray[idx+currentLength]=overflow
  }
  removeLeadingZeros(resultArray);
  return resultArray
 }
 LargeNumber.prototype.squareVal=function(){
  return new LargeNumber(squareDigits(this.numericValue),false)
 };
 TinyNumber.prototype.squareVal=function(){
  var squaredVal=this.numericValue*this.numericValue;
  if(isWithinSafeRange(squaredVal))
   return new TinyNumber(squaredVal);
  return new LargeNumber(squareDigits(splitSmallIntoDigits(Math.abs(this.numericValue))),false)
 };
 // Division algorithm 1 (Knuth's Algorithm D)
 function longDivisionAlgorithm(firstOperand,secondOperand){
  var arrayLenA=firstOperand.length,
   arrayLenB=secondOperand.length,
   base=NUM_BASE,
   resultArray=initZeroArray(secondOperand.length),
   msdDivisor=secondOperand[arrayLenB-1],
   scalingFactor=Math.ceil(base/(2*msdDivisor)),
   remResult=multiplyDigitsBySmall(firstOperand,scalingFactor),
   divisorScaled=multiplyDigitsBySmall(secondOperand,scalingFactor),
   tempQuotientDigit,
   shiftIdx,
   overflow,
   underflow,
   idx,
   currentLength,
   q_val;
  if(remResult.length<=arrayLenA)
   remResult.push(0);
  divisorScaled.push(0);
  msdDivisor=divisorScaled[arrayLenB-1];
  for(shiftIdx=arrayLenA-arrayLenB;shiftIdx>=0;shiftIdx--){
   tempQuotientDigit=base-1;
   if(remResult[shiftIdx+arrayLenB]!==msdDivisor){
    tempQuotientDigit=Math.floor((remResult[shiftIdx+arrayLenB]*base+remResult[shiftIdx+arrayLenB-1])/msdDivisor)
   }
   overflow=0;
   underflow=0;
   currentLength=divisorScaled.length;
   for(idx=0;idx<currentLength;idx++){
    overflow+=tempQuotientDigit*divisorScaled[idx];
    q_val=Math.floor(overflow/base);
    underflow+=remResult[shiftIdx+idx]-(overflow-q_val*base);
    overflow=q_val;
    if(underflow<0){
     remResult[shiftIdx+idx]=underflow+base;
     underflow=-1
    } else{
     remResult[shiftIdx+idx]=underflow;
     underflow=0
    }
   }
   while(underflow!==0){
    tempQuotientDigit-=1;
    overflow=0;
    for(idx=0;idx<currentLength;idx++){
     overflow+=remResult[shiftIdx+idx]-base+divisorScaled[idx];
     if(overflow<0){
      remResult[shiftIdx+idx]=overflow+base;
      overflow=0
     } else{
      remResult[shiftIdx+idx]=overflow;
      overflow=1
     }
    }
    underflow+=overflow
   }
   resultArray[shiftIdx]=tempQuotientDigit
  }
  remResult=divideDigitsBySmall(remResult,scalingFactor)[0];
  return[mergeDigitsToSmall(resultArray),mergeDigitsToSmall(remResult)]
 }
 // Division algorithm 2 (simpler, repeated subtraction)
 function shortDivisionAlgorithm(firstOperand,secondOperand){
  var arrayLenA=firstOperand.length,
   arrayLenB=secondOperand.length,
   divResult=[],
   partialDividend=[],
   base=NUM_BASE,
   estimation,
   xLength,
   highX,
   highY,
   checkValue;
  while(arrayLenA){
   partialDividend.unshift(firstOperand[--arrayLenA]);
   removeLeadingZeros(partialDividend);
   if(compareAbsoluteValues(partialDividend,secondOperand)<0){
    divResult.push(0);
    continue
   }
   xLength=partialDividend.length;
   highX=partialDividend[xLength-1]*base+partialDividend[xLength-2];
   highY=secondOperand[arrayLenB-1]*base+secondOperand[arrayLenB-2];
   if(xLength>arrayLenB){
    highX=(highX+1)*base
   }
   estimation=Math.ceil(highX/highY);
   do{
    checkValue=multiplyDigitsBySmall(secondOperand,estimation);
    if(compareAbsoluteValues(checkValue,partialDividend)<=0)
     break;
    estimation--
   } while(estimation);
   divResult.push(estimation);
   partialDividend=subtractDigitArrays(partialDividend,checkValue)
  }
  divResult.reverse();
  return[mergeDigitsToSmall(divResult),mergeDigitsToSmall(partialDividend)]
 }
 // Divides a digit array by a small integer
 function divideDigitsBySmall(numericValue,scalingFactor){
  var arrLength=numericValue.length,
   divResult=initZeroArray(arrLength),
   base=NUM_BASE,
   idx,
   q_val,
   remResult,
   currentDivisor;
  remResult=0;
  for(idx=arrLength-1;idx>=0;--idx){
   currentDivisor=remResult*base+numericValue[idx];
   q_val=floorOrCeil(currentDivisor/scalingFactor);
   remResult=currentDivisor-q_val*scalingFactor;
   divResult[idx]=q_val|0
  }
  return[divResult,remResult|0]
 }
 // Handles general division and modulo operations
 function performDivisionAndModulo(currentInstance,otherNum){
  var numericValue,
   parsedNum=normalizeInput(otherNum);
  var arrA=currentInstance.numericValue,
   arrB=parsedNum.numericValue;
  var divResult;
  if(arrB===0)
   throw new Error("Cannot divide by zero");
  if(currentInstance.isSmall){
   if(parsedNum.isSmall){
    return[new TinyNumber(floorOrCeil(arrA/arrB)),new TinyNumber(arrA%arrB)]
   }
   return[NumWrapper[0],currentInstance]
  }
  if(parsedNum.isSmall){
   if(arrB===1)
    return[currentInstance,NumWrapper[0]];
   if(arrB==-1)
    return[currentInstance.invertSign(),NumWrapper[0]];
   var absoluteVal=Math.abs(arrB);
   if(absoluteVal<NUM_BASE){
    numericValue=divideDigitsBySmall(arrA,absoluteVal);
    divResult=mergeDigitsToSmall(numericValue[0]);
    var remResult=numericValue[1];
    if(currentInstance.isNegativeFlag)
     remResult=-remResult;
    if(typeof divResult==="number"){
     if(currentInstance.isNegativeFlag!==parsedNum.isNegativeFlag)
      divResult=-divResult;
     return[new TinyNumber(divResult),new TinyNumber(remResult)]
    }
    return[new LargeNumber(divResult,currentInstance.isNegativeFlag!==parsedNum.isNegativeFlag),new TinyNumber(remResult)]
   }
   arrB=splitSmallIntoDigits(absoluteVal)
  }
  var comparison=compareAbsoluteValues(arrA,arrB);
  if(comparison===-1)
   return[NumWrapper[0],currentInstance];
  if(comparison===0)
   return[NumWrapper[currentInstance.isNegativeFlag===parsedNum.isNegativeFlag?1:-1],NumWrapper[0]];
  if(arrA.length+arrB.length<=200)
   numericValue=longDivisionAlgorithm(arrA,arrB);
  else
   numericValue=shortDivisionAlgorithm(arrA,arrB);
  divResult=numericValue[0];
  var qSign=currentInstance.isNegativeFlag!==parsedNum.isNegativeFlag,
   remResult=numericValue[1],
   mSign=currentInstance.isNegativeFlag;
  if(typeof divResult==="number"){
   if(qSign)
    divResult=-divResult;
   divResult=new TinyNumber(divResult)
  } else
   divResult=new LargeNumber(divResult,qSign);
  if(typeof remResult==="number"){
   if(mSign)
    remResult=-remResult;
   remResult=new TinyNumber(remResult)
  } else
   remResult=new LargeNumber(remResult,mSign);
  return[divResult,remResult]
 }
 LargeNumber.prototype.divisionAndRemainder=function(otherNum){
  var divModResult=performDivisionAndModulo(this,otherNum);
  return{divResult:divModResult[0],remResult:divModResult[1]}
 };
 TinyNumber.prototype.divisionAndRemainder=LargeNumber.prototype.divisionAndRemainder;
 LargeNumber.prototype.division=function(otherNum){
  return performDivisionAndModulo(this,otherNum)[0]
 };
 TinyNumber.prototype.overVal=TinyNumber.prototype.division=LargeNumber.prototype.overVal=LargeNumber.prototype.division;
 LargeNumber.prototype.remainder=function(otherNum){
  return performDivisionAndModulo(this,otherNum)[1]
 };
 TinyNumber.prototype.remainderVal=TinyNumber.prototype.remainder=LargeNumber.prototype.remainderVal=LargeNumber.prototype.remainder;
 LargeNumber.prototype.power=function(otherNum){
  var parsedNum=normalizeInput(otherNum),
   arrA=this.numericValue,
   arrB=parsedNum.numericValue,
   numericValue,
   operandX,
   operandY;
  if(arrB===0)
   return NumWrapper[1];
  if(arrA===0)
   return NumWrapper[0];
  if(arrA===1)
   return NumWrapper[1];
  if(arrA===-1)
   return parsedNum.isEvenNum()?NumWrapper[1]:NumWrapper[-1];
  if(parsedNum.isNegativeFlag){
   return NumWrapper[0]
  }
  if(!parsedNum.isSmall)
   throw new Error("The exponent "+parsedNum.toRepresentationString()+" is too large.");
  if(this.isSmall){
   if(isWithinSafeRange(numericValue=Math.pow(arrA,arrB)))
    return new TinyNumber(floorOrCeil(numericValue))
  }
  operandX=this;
  operandY=NumWrapper[1];
  while(true){
   if(arrB&1===1){
    operandY=operandY.timesVal(operandX);
    --arrB
   }
   if(arrB===0)
    break;
   arrB/=2;
   operandX=operandX.squareVal()
  }
  return operandY
 };
 TinyNumber.prototype.power=LargeNumber.prototype.power;
 LargeNumber.prototype.modularPower=function(exponentVal,modulusVal){
  exponentVal=normalizeInput(exponentVal);
  modulusVal=normalizeInput(modulusVal);
  if(modulusVal.isZeroVal())
   throw new Error("Cannot take modularPower with modulus 0");
  var result=NumWrapper[1],
   base=this.remainder(modulusVal);
  while(exponentVal.isPositiveNum()){
   if(base.isZeroVal())
    return NumWrapper[0];
   if(exponentVal.isOddNum())
    result=result.product(base).remainder(modulusVal);
   exponentVal=exponentVal.division(2);
   base=base.squareVal().remainder(modulusVal)
  }
  return result
 };
 TinyNumber.prototype.modularPower=LargeNumber.prototype.modularPower;
 // Compares absolute values of two digit arrays
 function compareAbsoluteValues(firstOperand,secondOperand){
  if(firstOperand.length!==secondOperand.length){
   return firstOperand.length>secondOperand.length?1:-1
  }
  for(var idx=firstOperand.length-1;idx>=0;idx--){
   if(firstOperand[idx]!==secondOperand[idx])
    return firstOperand[idx]>secondOperand[idx]?1:-1
  }
  return 0
 }
 LargeNumber.prototype.compareAbsVal=function(otherNum){
  var parsedNum=normalizeInput(otherNum),
   arrA=this.numericValue,
   arrB=parsedNum.numericValue;
  if(parsedNum.isSmall)
   return 1;
  return compareAbsoluteValues(arrA,arrB)
 };
 TinyNumber.prototype.compareAbsVal=function(otherNum){
  var parsedNum=normalizeInput(otherNum),
   absValA=Math.abs(this.numericValue),
   arrB=parsedNum.numericValue;
  if(parsedNum.isSmall){
   arrB=Math.abs(arrB);
   return absValA===arrB?0:absValA>arrB?1:-1
  }
  return-1
 };
 LargeNumber.prototype.compareWith=function(otherNum){
  if(otherNum===Infinity){
   return-1
  }
  if(otherNum===-Infinity){
   return 1
  }
  var parsedNum=normalizeInput(otherNum),
   arrA=this.numericValue,
   arrB=parsedNum.numericValue;
  if(this.isNegativeFlag!==parsedNum.isNegativeFlag){
   return parsedNum.isNegativeFlag?1:-1
  }
  if(parsedNum.isSmall){
   return this.isNegativeFlag?-1:1
  }
  return compareAbsoluteValues(arrA,arrB)*(this.isNegativeFlag?-1:1)
 };
 LargeNumber.prototype.compareToVal=LargeNumber.prototype.compareWith;
 TinyNumber.prototype.compareWith=function(otherNum){
  if(otherNum===Infinity){
   return-1
  }
  if(otherNum===-Infinity){
   return 1
  }
  var parsedNum=normalizeInput(otherNum),
   currentValA=this.numericValue,
   currentValB=parsedNum.numericValue;
  if(parsedNum.isSmall){
   return currentValA==currentValB?0:currentValA>currentValB?1:-1
  }
  if(currentValA<0!==parsedNum.isNegativeFlag){
   return currentValA<0?-1:1
  }
  return currentValA<0?1:-1
 };
 TinyNumber.prototype.compareToVal=TinyNumber.prototype.compareWith;
 LargeNumber.prototype.isEqualTo=function(otherNum){
  return this.compareWith(otherNum)===0
 };
 TinyNumber.prototype.equalsVal=TinyNumber.prototype.isEqualTo=LargeNumber.prototype.equalsVal=LargeNumber.prototype.isEqualTo;
 LargeNumber.prototype.isNotEqualTo=function(otherNum){
  return this.compareWith(otherNum)!==0
 };
 TinyNumber.prototype.notEqualsVal=TinyNumber.prototype.isNotEqualTo=LargeNumber.prototype.notEqualsVal=LargeNumber.prototype.isNotEqualTo;
 LargeNumber.prototype.isGreaterThan=function(otherNum){
  return this.compareWith(otherNum)>0
 };
 TinyNumber.prototype.greaterThanVal=TinyNumber.prototype.isGreaterThan=LargeNumber.prototype.greaterThanVal=LargeNumber.prototype.isGreaterThan;
 LargeNumber.prototype.isLessThan=function(otherNum){
  return this.compareWith(otherNum)<0
 };
 TinyNumber.prototype.lessThanVal=TinyNumber.prototype.isLessThan=LargeNumber.prototype.lessThanVal=LargeNumber.prototype.isLessThan;
 LargeNumber.prototype.isGreaterOrEqualTo=function(otherNum){
  return this.compareWith(otherNum)>=0
 };
 TinyNumber.prototype.greaterOrEqualToVal=TinyNumber.prototype.isGreaterOrEqualTo=LargeNumber.prototype.greaterOrEqualToVal=LargeNumber.prototype.isGreaterOrEqualTo;
 LargeNumber.prototype.isLesserOrEqualTo=function(otherNum){
  return this.compareWith(otherNum)<=0
 };
 TinyNumber.prototype.lesserOrEqualToVal=TinyNumber.prototype.isLesserOrEqualTo=LargeNumber.prototype.lesserOrEqualToVal=LargeNumber.prototype.isLesserOrEqualTo;
 LargeNumber.prototype.isEvenNum=function(){
  return(this.numericValue[0]&1)===0
 };
 TinyNumber.prototype.isEvenNum=function(){
  return(this.numericValue&1)===0
 };
 LargeNumber.prototype.isOddNum=function(){
  return(this.numericValue[0]&1)===1
 };
 TinyNumber.prototype.isOddNum=function(){
  return(this.numericValue&1)===1
 };
 LargeNumber.prototype.isPositiveNum=function(){
  return!this.isNegativeFlag
 };
 TinyNumber.prototype.isPositiveNum=function(){
  return this.numericValue>0
 };
 LargeNumber.prototype.isNegativeNum=function(){
  return this.isNegativeFlag
 };
 TinyNumber.prototype.isNegativeNum=function(){
  return this.numericValue<0
 };
 LargeNumber.prototype.isUnitVal=function(){
  return false
 };
 TinyNumber.prototype.isUnitVal=function(){
  return Math.abs(this.numericValue)===1
 };
 LargeNumber.prototype.isZeroVal=function(){
  return false
 };
 TinyNumber.prototype.isZeroVal=function(){
  return this.numericValue===0
 };
 LargeNumber.prototype.isDivisible=function(otherNum){
  var parsedNum=normalizeInput(otherNum);
  var numericValue=parsedNum.numericValue;
  if(numericValue===0)
   return false;
  if(numericValue===1)
   return true;
  if(numericValue===2)
   return this.isEvenNum();
  return this.remainder(parsedNum).isEqualTo(NumWrapper[0])
 };
 TinyNumber.prototype.isDivisible=LargeNumber.prototype.isDivisible;
 // Basic primality test for small numbers
 function isBasicPrimeTest(val){
  var absVal=val.absoluteValue();
  if(absVal.isUnitVal())
   return false;
  if(absVal.isEqualTo(2)||absVal.isEqualTo(3)||absVal.isEqualTo(5))
   return true;
  if(absVal.isEvenNum()||absVal.isDivisible(3)||absVal.isDivisible(5))
   return false;
  if(absVal.isLessThan(25))
   return true
 }
 LargeNumber.prototype.isProbablePrimeMillerRabin=function(){
  var isPrimeResult=isBasicPrimeTest(this);
  if(isPrimeResult!==noValue)
   return isPrimeResult;
  var absVal=this.absoluteValue(),
   prevAbsVal=absVal.decrement();
  var testBases=[2,3,5,7,11,13,17,19],
   d_val=prevAbsVal,
   flag,
   idx,
   tempX;
  while(d_val.isEvenNum())
   d_val=d_val.division(2);
  for(idx=0;idx<testBases.length;idx++){
   tempX=largeNum(testBases[idx]).modularPower(d_val,absVal);
   if(tempX.isEqualTo(NumWrapper[1])||tempX.isEqualTo(prevAbsVal))
    continue;
   for(flag=true,tempD=d_val;flag&&tempD.isLessThan(prevAbsVal);tempD=tempD.product(2)){
    tempX=tempX.squareVal().remainder(absVal);
    if(tempX.isEqualTo(prevAbsVal))
     flag=false
   }
   if(flag)
    return false
  }
  return true
 };
 TinyNumber.prototype.isProbablePrimeMillerRabin=LargeNumber.prototype.isProbablePrimeMillerRabin;
 LargeNumber.prototype.isProbablePrimeSimple=function(iterations){
  var isPrimeResult=isBasicPrimeTest(this);
  if(isPrimeResult!==noValue)
   return isPrimeResult;
  var absVal=this.absoluteValue();
  var numIterations=iterations===noValue?5:iterations;
  for(var idx=0;idx<numIterations;idx++){
   var randomBase=largeNum.randomBetween(2,absVal.minusVal(2));
   if(!randomBase.modularPower(absVal.decrement(),absVal).isUnitVal())
    return false
  }
  return true
 };
 TinyNumber.prototype.isProbablePrimeSimple=LargeNumber.prototype.isProbablePrimeSimple;
 LargeNumber.prototype.modularInverse=function(modulusVal){
  var oldT=largeNum.zero,
   newTermT=largeNum.one,
   oldR=normalizeInput(modulusVal),
   newTermR=this.absoluteValue(),
   quotientVal,
   prevT,
   prevR;
  while(!newTermR.isEqualTo(largeNum.zero)){
   quotientVal=oldR.division(newTermR);
   prevT=oldT;
   prevR=oldR;
   oldT=newTermT;
   oldR=newTermR;
   newTermT=prevT.difference(quotientVal.product(newTermT));
   newTermR=prevR.difference(quotientVal.product(newTermR))
  }
  if(!oldR.isEqualTo(1))
   throw new Error(this.toRepresentationString()+" and "+modulusVal.toRepresentationString()+" are not co-prime");
  if(oldT.compareWith(0)===-1){
   oldT=oldT.sum(modulusVal)
  }
  if(this.isNegativeNum()){
   return oldT.invertSign()
  }
  return oldT
 };
 TinyNumber.prototype.modularInverse=LargeNumber.prototype.modularInverse;
 LargeNumber.prototype.increment=function(){
  var currentValue=this.numericValue;
  if(this.isNegativeFlag){
   return subtractSmallNumberFromDigits(currentValue,1,this.isNegativeFlag)
  }
  return new LargeNumber(addSmallNumberToDigits(currentValue,1),this.isNegativeFlag)
 };
 TinyNumber.prototype.increment=function(){
  var currentValue=this.numericValue;
  if(currentValue+1<MAX_SAFE_INT)
   return new TinyNumber(currentValue+1);
  return new LargeNumber(SAFE_INT_DIGITS,false)
 };
 LargeNumber.prototype.decrement=function(){
  var currentValue=this.numericValue;
  if(this.isNegativeFlag){
   return new LargeNumber(addSmallNumberToDigits(currentValue,1),true)
  }
  return subtractSmallNumberFromDigits(currentValue,1,this.isNegativeFlag)
 };
 TinyNumber.prototype.decrement=function(){
  var currentValue=this.numericValue;
  if(currentValue-1>-MAX_SAFE_INT)
   return new TinyNumber(currentValue-1);
  return new LargeNumber(SAFE_INT_DIGITS,true)
 };
 var twoPowers=[1];
 while(2*twoPowers[twoPowers.length-1]<=NUM_BASE)
  twoPowers.push(2*twoPowers[twoPowers.length-1]);
 var numTwoPowers=twoPowers.length,
  maxTwoPower=twoPowers[numTwoPowers-1];
 // Checks if shift amount is small enough
 function isShiftAmountSmall(shiftAmount){
  return(typeof shiftAmount==="number"||typeof shiftAmount==="string")&&+Math.abs(shiftAmount)<=NUM_BASE||shiftAmount instanceof LargeNumber&&shiftAmount.numericValue.length<=1
 }
 LargeNumber.prototype.shiftBitsLeft=function(shiftAmount){
  if(!isShiftAmountSmall(shiftAmount)){
   throw new Error(String(shiftAmount)+" is too large for shifting.")
  }
  shiftAmount=+shiftAmount;
  if(shiftAmount<0)
   return this.shiftBitsRight(-shiftAmount);
  var currentResult=this;
  if(currentResult.isZeroVal())
   return currentResult;
  while(shiftAmount>=numTwoPowers){
   currentResult=currentResult.product(maxTwoPower);
   shiftAmount-=numTwoPowers-1
  }
  return currentResult.product(twoPowers[shiftAmount])
 };
 TinyNumber.prototype.shiftBitsLeft=LargeNumber.prototype.shiftBitsLeft;
 LargeNumber.prototype.shiftBitsRight=function(shiftAmount){
  var remainderAndQuotient;
  if(!isShiftAmountSmall(shiftAmount)){
   throw new Error(String(shiftAmount)+" is too large for shifting.")
  }
  shiftAmount=+shiftAmount;
  if(shiftAmount<0)
   return this.shiftBitsLeft(-shiftAmount);
  var currentResult=this;
  while(shiftAmount>=numTwoPowers){
   if(currentResult.isZeroVal()||currentResult.isNegativeNum()&&currentResult.isUnitVal())
    return currentResult;
   remainderAndQuotient=performDivisionAndModulo(currentResult,maxTwoPower);
   currentResult=remainderAndQuotient[1].isNegativeNum()?remainderAndQuotient[0].decrement():remainderAndQuotient[0];
   shiftAmount-=numTwoPowers-1
  }
  remainderAndQuotient=performDivisionAndModulo(currentResult,twoPowers[shiftAmount]);
  return remainderAndQuotient[1].isNegativeNum()?remainderAndQuotient[0].decrement():remainderAndQuotient[0]
 };
 TinyNumber.prototype.shiftBitsRight=LargeNumber.prototype.shiftBitsRight;
 // Generic bitwise operation handler
 var LOW_BIT_MASK_INT=1<<30,
  LOW_BIT_MASK_BIGINT=(NUM_BASE&-NUM_BASE)*(NUM_BASE&-NUM_BASE)|LOW_BIT_MASK_INT;
 function roughLowestBit(num){
  var internalValue=num.numericValue,
   maskedValue=typeof internalValue==="number"?internalValue|LOW_BIT_MASK_INT:internalValue[0]+internalValue[1]*NUM_BASE|LOW_BIT_MASK_BIGINT;
  return maskedValue&-maskedValue
 }
 function bitwiseOperation(operandX,operandY,operationFn){
  operandY=normalizeInput(operandY);
  var signX=operandX.isNegativeNum(),
   signY=operandY.isNegativeNum();
  var remainingX=signX?operandX.bitwiseNot():operandX,
   remainingY=signY?operandY.bitwiseNot():operandY;
  var digitX=0,
   digitY=0;
  var xDivResult=null,
   yDivResult=null;
  var finalResult=[];
  while(!remainingX.isZeroVal()||!remainingY.isZeroVal()){
   xDivResult=performDivisionAndModulo(remainingX,maxTwoPower);
   digitX=xDivResult[1].toJavascriptNumber();
   if(signX){
    digitX=maxTwoPower-1-digitX
   }
   yDivResult=performDivisionAndModulo(remainingY,maxTwoPower);
   digitY=yDivResult[1].toJavascriptNumber();
   if(signY){
    digitY=maxTwoPower-1-digitY
   }
   remainingX=xDivResult[0];
   remainingY=yDivResult[0];
   finalResult.push(operationFn(digitX,digitY))
  }
  var bitwiseSum=operationFn(signX?1:0,signY?1:0)!==0?largeNum(-1):largeNum(0);
  for(var idx=finalResult.length-1;idx>=0;idx-=1){
   bitwiseSum=bitwiseSum.product(maxTwoPower).sum(largeNum(finalResult[idx]))
  }
  return bitwiseSum
 }
 LargeNumber.prototype.bitwiseNot=function(){
  return this.invertSign().decrement()
 };
 TinyNumber.prototype.bitwiseNot=LargeNumber.prototype.bitwiseNot;
 LargeNumber.prototype.bitwiseAnd=function(otherNum){
  return bitwiseOperation(this,otherNum,function(valA,valB){return valA&valB})
 };
 TinyNumber.prototype.bitwiseAnd=LargeNumber.prototype.bitwiseAnd;
 LargeNumber.prototype.bitwiseOr=function(otherNum){
  return bitwiseOperation(this,otherNum,function(valA,valB){return valA|valB})
 };
 TinyNumber.prototype.bitwiseOr=LargeNumber.prototype.bitwiseOr;
 LargeNumber.prototype.bitwiseXor=function(otherNum){
  return bitwiseOperation(this,otherNum,function(valA,valB){return valA^valB})
 };
 TinyNumber.prototype.bitwiseXor=LargeNumber.prototype.bitwiseXor;
 // Calculates integer logarithm base 2
 function calcIntegerLog(valueNum,baseNum){
  if(baseNum.compareToVal(valueNum)<=0){
   var tempResult=calcIntegerLog(valueNum,baseNum.squareVal(baseNum));
   var powerPart=tempResult.powerPart;
   var exponentPart=tempResult.exponentPart;
   var testProduct=powerPart.product(baseNum);
   return testProduct.compareToVal(valueNum)<=0?{powerPart:testProduct,exponentPart:exponentPart*2+1}:{powerPart:powerPart,exponentPart:exponentPart*2}
  }
  return{powerPart:largeNum(1),exponentPart:0}
 }
 LargeNumber.prototype.getBitLength=function(){
  var currentNum=this;
  if(currentNum.compareWith(largeNum(0))<0){
   currentNum=currentNum.invertSign().difference(largeNum(1))
  }
  if(currentNum.compareWith(largeNum(0))===0){
   return largeNum(0)
  }
  return largeNum(calcIntegerLog(currentNum,largeNum(2)).exponentPart).sum(largeNum(1))
 };
 TinyNumber.prototype.getBitLength=LargeNumber.prototype.getBitLength;
 // Returns the maximum of two numbers
 function getMaximum(valA,valB){
  valA=normalizeInput(valA);
  valB=normalizeInput(valB);
  return valA.isGreaterThan(valB)?valA:valB
 }
 // Returns the minimum of two numbers
 function getMinimum(valA,valB){
  valA=normalizeInput(valA);
  valB=normalizeInput(valB);
  return valA.isLessThan(valB)?valA:valB
 }
 // Calculates the greatest common divisor
 function greatestCommonDivisor(valA,valB){
  valA=normalizeInput(valA).absoluteValue();
  valB=normalizeInput(valB).absoluteValue();
  if(valA.isEqualTo(valB))
   return valA;
  if(valA.isZeroVal())
   return valB;
  if(valB.isZeroVal())
   return valA;
  var commonFactor=NumWrapper[1],
   divisorVal,
   tempSwap;
  while(valA.isEvenNum()&&valB.isEvenNum()){
   divisorVal=Math.min(roughLowestBit(valA),roughLowestBit(valB));
   valA=valA.division(divisorVal);
   valB=valB.division(divisorVal);
   commonFactor=commonFactor.product(divisorVal)
  }
  while(valA.isEvenNum()){
   valA=valA.division(roughLowestBit(valA))
  }
  do{
   while(valB.isEvenNum()){
    valB=valB.division(roughLowestBit(valB))
   }
   if(valA.isGreaterThan(valB)){
    tempSwap=valB;
    valB=valA;
    valA=tempSwap
   }
   valB=valB.difference(valA)
  } while(!valB.isZeroVal());
  return commonFactor.isUnitVal()?valA:valA.product(commonFactor)
 }
 // Calculates the least common multiple
 function leastCommonMultiple(valA,valB){
  valA=normalizeInput(valA).absoluteValue();
  valB=normalizeInput(valB).absoluteValue();
  return valA.division(greatestCommonDivisor(valA,valB)).product(valB)
 }
 // Generates a random number between two bounds
 function randomBetween(lowerBound,upperBound){
  lowerBound=normalizeInput(lowerBound);
  upperBound=normalizeInput(upperBound);
  var low=getMinimum(lowerBound,upperBound),
   high=getMaximum(lowerBound,upperBound);
  var valueRange=high.difference(low).sum(1);
  if(valueRange.isSmall)
   return low.sum(Math.floor(Math.random()*valueRange));
  var arrLength=valueRange.numericValue.length-1;
  var resultDigits=[],
   isRestricted=true;
  for(var idx=arrLength;idx>=0;idx--){
   var currentMax=isRestricted?valueRange.numericValue[idx]:NUM_BASE;
   var digit=floorOrCeil(Math.random()*currentMax);
   resultDigits.unshift(digit);
   if(digit<currentMax)
    isRestricted=false
  }
  resultDigits=mergeDigitsToSmall(resultDigits);
  return low.sum(typeof resultDigits==="number"?new TinyNumber(resultDigits):new LargeNumber(resultDigits,false))
 }
 // Parses a string with a given base
 var convertStringWithBase=function(strInput,baseVal){
  var strLength=strInput.length;
  var idx;
  var absoluteBase=Math.abs(baseVal);
  for(var idx=0;idx<strLength;idx++){
   var charVal=strInput[idx].toLowerCase();
   if(charVal==="-")
    continue;
   if(/[a-z0-9]/.test(charVal)){
    if(/[0-9]/.test(charVal)&&+charVal>=absoluteBase){
     if(charVal==="1"&&absoluteBase===1)
      continue;
     throw new Error(charVal+" is not a valid digit in base "+baseVal+".")
    } else if(charVal.charCodeAt(0)-87>=absoluteBase){
     throw new Error(charVal+" is not a valid digit in base "+baseVal+".")
    }
   }
  }
  if(2<=baseVal&&baseVal<=36){
   if(strLength<=LOG_SAFE_INT/Math.log(baseVal)){
    var result=parseInt(strInput,baseVal);
    if(isNaN(result)){
     throw new Error(charVal+" is not a valid digit in base "+baseVal+".")
    }
    return new TinyNumber(parseInt(strInput,baseVal))
   }
  }
  baseVal=normalizeInput(baseVal);
  var digitList=[];
  var isNegativeInput=strInput[0]==="-";
  for(idx=isNegativeInput?1:0;idx<strInput.length;idx++){
   var charVal=strInput[idx].toLowerCase(),
    characterCode=charVal.charCodeAt(0);
   if(48<=characterCode&&characterCode<=57)
    digitList.push(normalizeInput(charVal));
   else if(97<=characterCode&&characterCode<=122)
    digitList.push(normalizeInput(charVal.charCodeAt(0)-87));
   else if(charVal==="<"){
    var startIndex=idx;
    do{
     idx++
    } while(strInput[idx]!==">");
    digitList.push(normalizeInput(strInput.slice(startIndex+1,idx)))
   } else
    throw new Error(charVal+" is not a valid character")
  }
  return convertDigitsToBase(digitList,baseVal,isNegativeInput)
 };
 // Converts an array of digits in a given base to a NumWrapper
 function convertDigitsToBase(digitList,baseVal,isNegativeInput){
  var currentVal=NumWrapper[0],
   currentPower=NumWrapper[1],
   idx;
  for(idx=digitList.length-1;idx>=0;idx--){
   currentVal=currentVal.sum(digitList[idx].timesVal(currentPower));
   currentPower=currentPower.timesVal(baseVal)
  }
  return isNegativeInput?currentVal.invertSign():currentVal
 }
 // Converts a single digit to its string representation
 function digitToString(digit){
  if(digit<=35){
   return"0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit)
  }
  return"<"+digit+">"
 }
 // Converts a number to a specific base representation
 function convertToBaseRepresentation(num,baseVal){
  baseVal=largeNum(baseVal);
  if(baseVal.isZeroVal()){
   if(num.isZeroVal())
    return{numericValue:[0],isNegativeOutput:false};
   throw new Error("Cannot convert nonzero numbers to base 0.")
  }
  if(baseVal.isEqualTo(-1)){
   if(num.isZeroVal())
    return{numericValue:[0],isNegativeOutput:false};
   if(num.isNegativeNum())
    return{numericValue:[].concat.apply([],Array.apply(null,Array(-num)).map(Array.prototype.valueOf,[1,0])),isNegativeOutput:false};
   var arr=Array.apply(null,Array(+num-1)).map(Array.prototype.valueOf,[0,1]);
   arr.unshift([1]);
   return{numericValue:[].concat.apply([],arr),isNegativeOutput:false}
  }
  var isNegativeOutput=false;
  if(num.isNegativeNum()&&baseVal.isPositiveNum()){
   isNegativeOutput=true;
   num=num.absoluteValue()
  }
  if(baseVal.isEqualTo(1)){
   if(num.isZeroVal())
    return{numericValue:[0],isNegativeOutput:false};
   return{numericValue:Array.apply(null,Array(+num)).map(Number.prototype.valueOf,1),isNegativeOutput:isNegativeOutput}
  }
  var outputDigits=[];
  var remainingVal=num,
   divModPair;
  while(remainingVal.isNegativeNum()||remainingVal.compareAbsVal(baseVal)>=0){
   divModPair=remainingVal.divisionAndRemainder(baseVal);
   remainingVal=divModPair.divResult;
   var digit=divModPair.remResult;
   if(digit.isNegativeNum()){
    digit=baseVal.difference(digit).absoluteValue();
    remainingVal=remainingVal.increment()
   }
   outputDigits.push(digit.toJavascriptNumber())
  }
  outputDigits.push(remainingVal.toJavascriptNumber());
  return{numericValue:outputDigits.reverse(),isNegativeOutput:isNegativeOutput}
 }
 // Formats a number to a string in a specific base
 function formatToBaseString(num,baseVal){
  var arr=convertToBaseRepresentation(num,baseVal);
  return(arr.isNegativeOutput?"-":"")+arr.numericValue.map(digitToString).join("")
 }
 LargeNumber.prototype.toDigitArray=function(baseVal){
  return convertToBaseRepresentation(this,baseVal)
 };
 TinyNumber.prototype.toDigitArray=function(baseVal){
  return convertToBaseRepresentation(this,baseVal)
 };
 LargeNumber.prototype.toRepresentationString=function(baseVal){
  if(baseVal===noValue)
   baseVal=10;
  if(baseVal!==10)
   return formatToBaseString(this,baseVal);
  var digits=this.numericValue,
   currentLength=digits.length,
   resultStr=String(digits[--currentLength]),
   zeroPad="0000000",
   currentDigit;
  while(--currentLength>=0){
   currentDigit=String(digits[currentLength]);
   resultStr+=zeroPad.slice(currentDigit.length)+currentDigit
  }
  var signStr=this.isNegativeFlag?"-":"";
  return signStr+resultStr
 };
 TinyNumber.prototype.toRepresentationString=function(baseVal){
  if(baseVal===noValue)
   baseVal=10;
  if(baseVal!=10)
   return formatToBaseString(this,baseVal);
  return String(this.numericValue)
 };
 LargeNumber.prototype.toJSONString=TinyNumber.prototype.toJSONString=function(){
  return this.toRepresentationString()
 };
 LargeNumber.prototype.getValue=function(){
  return parseInt(this.toRepresentationString(),10)
 };
 LargeNumber.prototype.toJavascriptNumber=LargeNumber.prototype.getValue;
 TinyNumber.prototype.getValue=function(){
  return this.numericValue
 };
 TinyNumber.prototype.toJavascriptNumber=TinyNumber.prototype.getValue;
 // Parses a string input value
 function parseStringInput(strInput){
  if(isWithinSafeRange(+strInput)){
   var numVal=+strInput;
   if(numVal===floorOrCeil(numVal))
    return new TinyNumber(numVal);
   throw new Error("Invalid integer: "+strInput)
  }
  var isNegativeInput=strInput[0]==="-";
  if(isNegativeInput)
   strInput=strInput.slice(1);
  var parts=strInput.split(/e/i);
  if(parts.length>2)
   throw new Error("Invalid integer: "+parts.join("e"));
  if(parts.length===2){
   var exponentVal=parts[1];
   if(exponentVal[0]==="+")
    exponentVal=exponentVal.slice(1);
   exponentVal=+exponentVal;
   if(exponentVal!==floorOrCeil(exponentVal)||!isWithinSafeRange(exponentVal))
    throw new Error("Invalid integer: "+exponentVal+" is not a valid exponent.");
   var stringValue=parts[0];
   var dotPosition=stringValue.indexOf(".");
   if(dotPosition>=0){
    exponentVal-=stringValue.length-dotPosition-1;
    stringValue=stringValue.slice(0,dotPosition)+stringValue.slice(dotPosition+1)
   }
   if(exponentVal<0)
    throw new Error("Cannot include negative exponent part for integers");
   stringValue+=new Array(exponentVal+1).join("0");
   strInput=stringValue
  }
  var isInputValid=/^([0-9][0-9]*)$/.test(strInput);
  if(!isInputValid)
   throw new Error("Invalid integer: "+strInput);
  var resultDigits=[],
   maxLength=strInput.length,
   currentLogBase=BASE_LOG,
   minLength=maxLength-currentLogBase;
  while(maxLength>0){
   resultDigits.push(+strInput.slice(minLength,maxLength));
   minLength-=currentLogBase;
   if(minLength<0)
    minLength=0;
   maxLength-=currentLogBase
  }
  removeLeadingZeros(resultDigits);
  return new LargeNumber(resultDigits,isNegativeInput)
 }
 // Parses a numeric input value
 function parseNumericInput(numVal){
  if(isWithinSafeRange(numVal)){
   if(numVal!==floorOrCeil(numVal))
    throw new Error(numVal+" is not an integer.");
   return new TinyNumber(numVal)
  }
  return parseStringInput(numVal.toRepresentationString())
 }
 // Normalizes any input to a NumWrapper instance
 function normalizeInput(inputVal){
  if(typeof inputVal==="number"){
   return parseNumericInput(inputVal)
  }
  if(typeof inputVal==="string"){
   return parseStringInput(inputVal)
  }
  return inputVal
 }
 for(var idx=0;idx<1e3;idx++){
  NumWrapper[idx]=new TinyNumber(idx);
  if(idx>0)
   NumWrapper[-idx]=new TinyNumber(-idx)
 }
 NumWrapper.one=NumWrapper[1];
 NumWrapper.zero=NumWrapper[0];
 NumWrapper.minusOne=NumWrapper[-1];
 NumWrapper.getMaximum=getMaximum;
 NumWrapper.getMinimum=getMinimum;
 NumWrapper.greatestCommonDivisor=greatestCommonDivisor;
 NumWrapper.leastCommonMultiple=leastCommonMultiple;
 NumWrapper.isInstance=function(inst){
  return inst instanceof LargeNumber||inst instanceof TinyNumber
 };
 NumWrapper.randomBetween=randomBetween;
 NumWrapper.fromArray=function(digitList,baseVal,isNegativeInput){
  return convertDigitsToBase(digitList.map(normalizeInput),normalizeInput(baseVal||10),isNegativeInput)
 };
 return NumWrapper
}();
// Data parsing utility for competitive programming
let DATA_PARSER=(function(){
 function createParser(sourceStr){return new Parser(sourceStr);}
 function Parser(sourceStr){
  this._sourceLines=sourceStr.trim().split("\n");
  this._currentLineIndex=0;
 }
 Parser.prototype.getNextAtom=function(returnString){
  let lines=this._sourceLines,
   lineIdx=this._currentLineIndex,
   resultItem;
  if(typeof lines[lineIdx]==="string")
   lines[lineIdx]=lines[lineIdx].split(" ").reverse();
  resultItem=lines[lineIdx].pop();
  if(!lines[lineIdx].length)this._currentLineIndex++;
  return returnString?resultItem:+resultItem;
 };
 Parser.prototype.getNextLine=function(returnString){
  let lineData=this._sourceLines[this._currentLineIndex++].split(" ");
  return returnString?lineData:lineData.map(val=>+val);
 };
 Parser.prototype.getNextMatrix=function(numRows,returnString){
  let matrixData=this._sourceLines.slice(this._currentLineIndex,this._currentLineIndex+=numRows).map(row=>row.split(" "));
  return returnString?matrixData:matrixData.map(row=>row.map(val=>+val));
 };
 Parser.prototype.getNextRawLines=function(numRows,returnString){
  let rawData=this._sourceLines.slice(this._currentLineIndex,this._currentLineIndex+=numRows);
  return returnString?rawData:rawData.map(val=>+val);
 };
 return createParser;
})();
let inputReader=DATA_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));
// Utility to create multi-dimensional arrays
function createMultiDimArray(initialValue){
 var args=arguments,
  numArgs=args.length,
  expression="Array(args["+--numArgs+"]).fill(0).map(x=>{return "+initialValue+";})";
 while(--numArgs)
  expression="Array(args["+numArgs+"]).fill(0).map(x=>"+expression+")";
 return eval(expression);
}
let moduloValue;
let baseNumberFactory=largeNum();
// Custom modular multiplication for 64-bit numbers (approx)
function applyModularArithmetic(){
 for(var operands=arguments,accumulator=operands[0],idx=1;idx<operands.length;)
  accumulator=((accumulator>>16)*operands[idx]%moduloValue*65536+(accumulator&65535)*operands[idx++])%moduloValue;
 return accumulator;
}
// Modular exponentiation
function modularExponentiation(base,exp){
 for(var result=1;exp;base=applyModularArithmetic(base,base),exp>>=1)
  if(exp&1)
   result=applyModularArithmetic(base,result);
 return result;
}

console.log(executeMainLogic());
// Main program logic
function executeMainLogic(){
  var limitValStr = inputReader.getNextAtom(1);
  var offsetValStr = inputReader.getNextAtom(1);
  var baseValBStr = inputReader.getNextAtom(1);
  var limitBig = baseNumberFactory.sum(limitValStr);
  var offsetBig = baseNumberFactory.sum(offsetValStr);
  var baseBigB = baseNumberFactory.sum(baseValBStr);
  moduloValue = inputReader.getNextAtom(), limitVal = +limitValStr, offsetVal = +offsetValStr, baseValB = +baseValBStr;
  var resultMatrix = [[0,0,+baseBigB.remainder(moduloValue)]]; // Initial state matrix
  var currentSumBig = baseNumberFactory; // Represents 's' in the original logic
  // Loop for different powers of 10
  for(var loopCounter = 1; loopCounter < 19 && !currentSumBig.minusVal(limitBig).isZeroVal(); loopCounter++){
    var tempPower = baseNumberFactory.sum(10).power(loopCounter).minusVal(1); // Calculate 10^i - 1
    var diffBig = tempPower.minusVal(offsetBig).sum(baseBigB).division(baseBigB).minusVal(currentSumBig); // Calculate 'd'
    if(diffBig.isLesserOrEqualTo(0))
      continue;
    if(currentSumBig.sum(diffBig).isGreaterThan(limitBig))
      diffBig = limitBig.minusVal(currentSumBig); // Adjust 'd' if it exceeds the limit
    var rotationMatrix = matrixModularPower([[modularExponentiation(10,loopCounter),0,0],[1,1,0],[0,1,1]],diffBig); // Power of transformation matrix
    resultMatrix[0][1] = +baseBigB.timesVal(currentSumBig).sum(offsetBig).remainder(moduloValue); // Update result matrix element
    resultMatrix = matrixModularMultiplication(resultMatrix,rotationMatrix); // Apply transformation
    currentSumBig = currentSumBig.sum(diffBig); // Update current sum
  }
  return resultMatrix[0][0]; // Final result
}

// Calculates matrix power modulo a value
function matrixModularPower(matrixBase,matrixPower){
  var matrixDim = matrixBase.length,
   identityMatrix = createMultiDimArray(0,matrixDim,matrixDim);
  for(var rowIdx = 0; rowIdx < matrixDim; rowIdx++)
    identityMatrix[rowIdx][rowIdx] = 1; // Initialize identity matrix
  while(!matrixPower.isZeroVal()){
    if(!matrixPower.bitwiseAnd(1).isZeroVal())
      identityMatrix = matrixModularMultiplication(identityMatrix,matrixBase); // If exponent bit is 1, multiply
    matrixBase = matrixModularMultiplication(matrixBase,matrixBase); // Square the base matrix
    matrixPower = matrixPower.division(2); // Halve the exponent
  }
  return identityMatrix;
}

// Performs matrix multiplication modulo a value
function matrixModularMultiplication(matrixLeft,matrixRight){
  var x_val,y_val;
  // Ensure inputs are 2D arrays
  if(typeof matrixLeft[0]==="object")
    x_val = matrixLeft;
  else
    x_val = [matrixLeft];
  if(typeof matrixRight[0]==="object")
    y_val = matrixRight;
  else
    y_val = [matrixRight];
  var rows = x_val.length,
   cols = y_val[0].length;
  var finalMatrix = createMultiDimArray(0,rows,cols);
  // Perform matrix multiplication
  for(var rowIdx = 0; rowIdx < rows; rowIdx++){
    for(var colIdx = 0; colIdx < cols; colIdx++){
      for(var innerIdx = 0; innerIdx < cols; innerIdx++){
        finalMatrix[rowIdx][colIdx] += applyModularArithmetic(matrixLeft[rowIdx][innerIdx],matrixRight[innerIdx][colIdx]);
      }
      finalMatrix[rowIdx][colIdx] %= moduloValue; // Apply modulo
    }
  }
  return finalMatrix;
}