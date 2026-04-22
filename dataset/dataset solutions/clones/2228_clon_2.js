"use strict";

// This module provides a streamlined way to read various data types from input.
var InputReader=(function(){
    // Factory method to instantiate the input processing stream.
    function createReader(inputContent){
        return new StreamProcessor(inputContent);
    }

    // The primary class for handling input data streams.
    function StreamProcessor(inputContent){
        // Internal storage for parsed input lines. Each element is an array of tokens or the original string.
        this._lines=inputContent.trim().split("\n");
        // Index indicating the currently active line for reading.
        this._currentLineIndex=0;
    }

    // Prototype method to extract the next individual data token from the stream.
    // It processes tokens from right to left on a line for efficiency.
    StreamProcessor.prototype.readNextToken=function(returnAsString){
        var currentLines=this._lines,
            linePointer=this._currentLineIndex,
            extractedToken;

        // If the current line is still a single string, convert it to an array of reversed tokens.
        if(typeof currentLines[linePointer]==="string")currentLines[linePointer]=currentLines[linePointer].split(" ").reverse();
        
        // Pop the last token (which was originally the first due to reversal).
        extractedToken=currentLines[linePointer].pop();
        
        // If the current line is now empty, advance to the subsequent line.
        if(!currentLines[linePointer].length)this._currentLineIndex++;
        
        // Return the token, converting to a number unless explicitly requested as a string.
        return returnAsString?extractedToken:+extractedToken;
    };

    // Prototype method to fetch all tokens from the current line as an array.
    // Automatically advances to the next line after reading.
    StreamProcessor.prototype.readLineTokens=function(returnAsStrings){
        // Retrieve the current line, split it by spaces, and then increment the line pointer.
        var lineParts=this._lines[this._currentLineIndex++].split(" ");
        // Map tokens to numbers if not requested as strings.
        return returnAsStrings?lineParts:lineParts.map(item=>+item);
    };

    // Prototype method to read a block of 'numRows' lines as a matrix.
    // Each line is split into an array of tokens.
    StreamProcessor.prototype.readMatrix=function(numRows,returnAsStrings){
        // Extract the specified number of lines and parse each into an array of strings.
        var matrixData=this._lines.slice(this._currentLineIndex,this._currentLineIndex+=numRows).map(rowString=>rowString.split(" "));
        // Convert all elements within the matrix to numbers if not requested as strings.
        return returnAsStrings?matrixData:matrixData.map(numericRow=>numericRow.map(element=>+element));
    };

    // Prototype method to read a specific 'numItems' lines as a one-dimensional list.
    StreamProcessor.prototype.readList=function(numItems,returnAsStrings){
        // Extract the required number of lines from the input.
        var listData=this._lines.slice(this._currentLineIndex,this._currentLineIndex+=numItems);
        // Convert each item in the list to a number if not requested as a string.
        return returnAsStrings?listData:listData.map(dataItem=>+dataItem);
    };

    // The factory function is returned to allow creation of reader instances.
    return createReader;
})();

// Initialize an input processing object by reading from standard input.
var inputData=InputReader(require("fs").readFileSync("/dev/stdin","utf8"));

// Generates a multi-dimensional array with a specified initial value.
// The dimensions are provided as subsequent arguments.
function createMultiDimArray(initValue){
    var funcArgs=arguments,
        dimCount=funcArgs.length,
        arrayCode="Array(funcArgs["+--dimCount+"]).fill(0).map(elem=>{return "+initValue+";})";
    // Construct the JavaScript code string for array creation iteratively.
    while(--dimCount)arrayCode="Array(funcArgs["+dimCount+"]).fill(0).map(elem=>"+arrayCode+")";
    // Execute the generated code string to create the array.
    return eval(arrayCode);
}

// Comprehensive Big Integer library, encapsulated to avoid global scope pollution.
var largeNum=function(unspecified){
    "use strict";
    
    // Core parameters for the arbitrary-precision arithmetic.
    const RADIX_BASE=1e7, // Each digit in our internal array represents up to 10^7.
          RADIX_LOG=7,   // Log base 10 of RADIX_BASE.
          JS_MAX_SAFE_INT=9007199254740992, // JavaScript's largest safe integer.
          JS_MAX_SAFE_INT_DIGITS=numToDigitArray(JS_MAX_SAFE_INT), // JS_MAX_SAFE_INT represented in our digit array format.
          JS_MAX_SAFE_INT_LOG=Math.log(JS_MAX_SAFE_INT); // Log of JS_MAX_SAFE_INT for base conversions.

    // Base constructor for all numeric types within this library.
    function NumericType(numValue, numericalBase){
        // If no value is provided, default to the static zero instance.
        if(typeof numValue==="unspecified")return NumericType[0];
        // If a base is specified, parse the value accordingly.
        if(typeof numericalBase!=="unspecified")return+numericalBase===10?parseInput(numValue):parseFromBase(numValue,numericalBase);
        // Otherwise, perform a standard value parsing.
        return parseInput(numValue);
    }

    // Constructor for numbers that exceed JS's safe integer limits.
    function LargeNumber(digitArray, isNegative){
        this.digitArray=digitArray; // Array of digits representing the number.
        this.isNegative=isNegative; // Boolean indicating negativity.
        this.isCompact=false;       // Flag indicating it's a large number, not compact.
    }
    LargeNumber.prototype=Object.create(NumericType.prototype); // Inherit from NumericType.

    // Constructor for numbers that fit within JS's safe integer limits.
    function CompactNumber(numValue){
        this.digitArray=numValue;   // Direct JS number for compact representation.
        this.isNegative=numValue<0; // Sign derived directly from the number.
        this.isCompact=true;        // Flag indicating it's a compact number.
    }
    CompactNumber.prototype=Object.create(NumericType.prototype); // Inherit from NumericType.

    // Determines if a given number can be precisely represented by JavaScript's number type.
    function isWithinSafeRange(num){
        return-JS_MAX_SAFE_INT<num&&num<JS_MAX_SAFE_INT;
    }

    // Converts a standard JS number into a digit array (base RADIX_BASE).
    function numToDigitArray(num){
        if(num<1e7)return[num];
        if(num<1e14)return[num%1e7,Math.floor(num/1e7)];
        return[num%1e7,Math.floor(num/1e7)%1e7,Math.floor(num/1e14)];
    }

    // Attempts to convert a digit array back into a standard JS number if it fits.
    function digitArrayToNum(arr){
        removeLeadingZeros(arr); // Clean up any leading zeros.
        var len=arr.length;
        // If the array is small enough and its magnitude is within JS safe integer limits.
        if(len<4&&compareAbsoluteValues(arr,JS_MAX_SAFE_INT_DIGITS)<0){
            switch(len){
                case 0:return 0;
                case 1:return arr[0];
                case 2:return arr[0]+arr[1]*RADIX_BASE;
                default:return arr[0]+(arr[1]+arr[2]*RADIX_BASE)*RADIX_BASE
            }
        }
        return arr; // If it doesn't fit, return the array as is.
    }

    // Trims trailing zero digits from a digit array representation.
    function removeLeadingZeros(digitArray){
        var idx=digitArray.length;
        while(digitArray[--idx]===0 && idx >= 0); // Find the last non-zero digit.
        digitArray.length=idx+1; // Adjust array length.
    }

    // Creates a new array of a specified length, filled with zeros.
    function initializeDigitArray(len){
        var newArray=new Array(len);
        var idx=-1;
        while(++idx<len){newArray[idx]=0}
        return newArray;
    }

    // Returns the integer part of a number, rounding towards zero.
    function intPart(num){
        if(num>0)return Math.floor(num);
        return Math.ceil(num);
    }

    // Performs addition on two digit arrays. Assumes arrA is at least as long as arrB.
    function addDigitArrays(arrA,arrB){
        var lenA=arrA.length,lenB=arrB.length,
            resultArray=new Array(lenA),
            carryOver=0,radixVal=RADIX_BASE,currentSum,idx;
        
        for(idx=0;idx<lenB;idx++){ // Add corresponding digits.
            currentSum=arrA[idx]+arrB[idx]+carryOver;
            carryOver=currentSum>=radixVal?1:0;
            resultArray[idx]=currentSum-carryOver*radixVal;
        }
        while(idx<lenA){ // Propagate carry through remaining digits of the longer array.
            currentSum=arrA[idx]+carryOver;
            carryOver=currentSum===radixVal?1:0;
            resultArray[idx++]=currentSum-carryOver*radixVal;
        }
        if(carryOver>0)resultArray.push(carryOver); // Append final carry if any.
        return resultArray;
    }

    // Adds two digit arrays, handling cases where their lengths differ.
    function addAnyLengthArrays(arrA,arrB){
        if(arrA.length>=arrB.length)return addDigitArrays(arrA,arrB);
        return addDigitArrays(arrB,arrA); // Ensure longer array is first argument.
    }

    // Adds a small number (carry) to a digit array.
    function addDigitArrayWithSmall(arr,carryOver){
        var arrayLength=arr.length,resultArray=new Array(arrayLength),
            radixVal=RADIX_BASE,currentSum,idx;
        
        for(idx=0;idx<arrayLength;idx++){
            currentSum=arr[idx]-radixVal+carryOver; // Pre-adjust for base to simplify carry calculation.
            carryOver=Math.floor(currentSum/radixVal);
            resultArray[idx]=currentSum-carryOver*radixVal;
            carryOver+=1; // Adjust carry based on current sum.
        }
        while(carryOver>0){ // Propagate any remaining carry.
            resultArray[idx++]=carryOver%radixVal;
            carryOver=Math.floor(carryOver/radixVal);
        }
        return resultArray;
    }

    // LargeNumber's method for addition.
    LargeNumber.prototype.addValues=function(otherVal){
        var parsedOther=parseInput(otherVal);
        // If signs are different, convert to subtraction.
        if(this.isNegative!==parsedOther.isNegative){return this.subtractValues(parsedOther.flipSign())}
        var thisDigits=this.digitArray,otherDigits=parsedOther.digitArray;
        // Optimized for adding a compact number.
        if(parsedOther.isCompact){return new LargeNumber(addDigitArrayWithSmall(thisDigits,Math.abs(otherDigits)),this.isNegative)}
        // Standard large number addition.
        return new LargeNumber(addAnyLengthArrays(thisDigits,otherDigits),this.isNegative)};
    LargeNumber.prototype.plus=LargeNumber.prototype.addValues;

    // CompactNumber's method for addition.
    CompactNumber.prototype.addValues=function(otherVal){
        var parsedOther=parseInput(otherVal);
        var thisNum=this.digitArray;
        // If signs are different, convert to subtraction.
        if(thisNum<0!==parsedOther.isNegative){return this.subtractValues(parsedOther.flipSign())}
        var otherNum=parsedOther.digitArray;
        // If both are compact, perform direct JS addition.
        if(parsedOther.isCompact){
            if(isWithinSafeRange(thisNum+otherNum))return new CompactNumber(thisNum+otherNum);
            otherNum=numToDigitArray(Math.abs(otherNum)); // If overflow, convert other to digit array.
        }
        // Add compact number to a digit array.
        return new LargeNumber(addDigitArrayWithSmall(otherNum,Math.abs(thisNum)),thisNum<0)};
    CompactNumber.prototype.plus=CompactNumber.prototype.addValues;

    // Performs subtraction on two digit arrays (arrA - arrB). Assumes arrA >= arrB.
    function subtractDigitArrays(arrA,arrB){
        var arrALen=arrA.length,arrBLen=arrB.length,
            resultArray=new Array(arrALen),
            borrowVal=0,radixVal=RADIX_BASE,idx,diffResult;
        
        for(idx=0;idx<arrBLen;idx++){ // Subtract corresponding digits.
            diffResult=arrA[idx]-borrowVal-arrB[idx];
            if(diffResult<0){diffResult+=radixVal;borrowVal=1}else borrowVal=0;
            resultArray[idx]=diffResult;
        }
        for(idx=arrBLen;idx<arrALen;idx++){ // Propagate borrow for remaining digits in arrA.
            diffResult=arrA[idx]-borrowVal;
            if(diffResult<0)diffResult+=radixVal;
            else{resultArray[idx++]=diffResult;break} // No more borrow.
            resultArray[idx]=diffResult;
        }
        for(;idx<arrALen;idx++){resultArray[idx]=arrA[idx]} // Copy remaining digits.
        removeLeadingZeros(resultArray);
        return resultArray;
    }

    // Subtracts two digit arrays, determining the resulting sign and converting to compact if possible.
    function subtractAnyLengthArrays(arrA,arrB,isResultNegative){
        var calcValue;
        if(compareAbsoluteValues(arrA,arrB)>=0){calcValue=subtractDigitArrays(arrA,arrB)}
        else{ // If arrB is larger, swap and flip the sign of the result.
            calcValue=subtractDigitArrays(arrB,arrA);
            isResultNegative=!isResultNegative;
        }
        calcValue=digitArrayToNum(calcValue); // Attempt to convert to compact number.
        if(typeof calcValue==="number"){if(isResultNegative)calcValue=-calcValue;return new CompactNumber(calcValue)}
        return new LargeNumber(calcValue,isResultNegative);
    }

    // Subtracts a small number from a digit array.
    function subtractDigitArrayWithSmall(arr,smallNum,isNegative){
        var arrayLen=arr.length,resultArray=new Array(arrayLen),
            carryOver=-smallNum,radixVal=RADIX_BASE,idx,diffResult;
        
        for(idx=0;idx<arrayLen;idx++){
            diffResult=arr[idx]+carryOver;
            carryOver=Math.floor(diffResult/radixVal);
            diffResult%=radixVal;
            resultArray[idx]=diffResult<0?diffResult+radixVal:diffResult;
        }
        resultArray=digitArrayToNum(resultArray); // Attempt to convert to compact number.
        if(typeof resultArray==="number"){if(isNegative)resultArray=-resultArray;return new CompactNumber(resultArray)}
        return new LargeNumber(resultArray,isNegative);
    }

    // LargeNumber's method for subtraction.
    LargeNumber.prototype.subtractValues=function(otherVal){
        var parsedOther=parseInput(otherVal);
        // If signs are different, convert to addition with negated value.
        if(this.isNegative!==parsedOther.isNegative){return this.addValues(parsedOther.flipSign())}
        var thisDigits=this.digitArray,otherDigits=parsedOther.digitArray;
        // Optimized for subtracting a compact number.
        if(parsedOther.isCompact)return subtractDigitArrayWithSmall(thisDigits,Math.abs(otherDigits),this.isNegative);
        // Standard large number subtraction.
        return subtractAnyLengthArrays(thisDigits,otherDigits,this.isNegative)};
    LargeNumber.prototype.minus=LargeNumber.prototype.subtractValues;

    // CompactNumber's method for subtraction.
    CompactNumber.prototype.subtractValues=function(otherVal){
        var parsedOther=parseInput(otherVal);
        var thisNum=this.digitArray;
        // If signs are different, convert to addition with negated value.
        if(thisNum<0!==parsedOther.isNegative){return this.addValues(parsedOther.flipSign())}
        var otherNum=parsedOther.digitArray;
        // If both are compact, perform direct JS subtraction.
        if(parsedOther.isCompact){return new CompactNumber(thisNum-otherNum)}
        // Subtract compact number from a digit array.
        return subtractDigitArrayWithSmall(otherNum,Math.abs(thisNum),thisNum>=0)};
    CompactNumber.prototype.minus=CompactNumber.prototype.subtractValues;

    // Negates the number by flipping its sign flag.
    LargeNumber.prototype.flipSign=function(){return new LargeNumber(this.digitArray,!this.isNegative)};
    CompactNumber.prototype.flipSign=function(){
        var currentSign=this.isNegative;
        var flippedSmall=new CompactNumber(-this.digitArray);
        flippedSmall.isNegative=!currentSign; // Ensure sign is correctly set.
        return flippedSmall
    };

    // Returns the absolute value (magnitude) of the number.
    LargeNumber.prototype.absoluteValue=function(){return new LargeNumber(this.digitArray,false)};
    CompactNumber.prototype.absoluteValue=function(){return new CompactNumber(Math.abs(this.digitArray))};

    // Multiplies two digit arrays using the standard long multiplication algorithm.
    function multiplyFullArrays(arr1,arr2){
        var arr1Len=arr1.length,arr2Len=arr2.length,
            totalLen=arr1Len+arr2Len,
            productArray=initializeDigitArray(totalLen), // Result array for product.
            radixVal=RADIX_BASE,singleProduct,carryOver,idx,digitA,digitB;
        
        for(idx=0;idx<arr1Len;++idx){
            digitA=arr1[idx];
            for(var jdx=0;jdx<arr2Len;++jdx){
                digitB=arr2[jdx];
                singleProduct=digitA*digitB+productArray[idx+jdx];
                carryOver=Math.floor(singleProduct/radixVal);
                productArray[idx+jdx]=singleProduct-carryOver*radixVal;
                productArray[idx+jdx+1]+=carryOver; // Add carry to the next position.
            }
        }
        removeLeadingZeros(productArray);
        return productArray;
    }

    // Multiplies a digit array by a single small number.
    function multiplyArrayBySmall(arr,smallNum){
        var arrayLen=arr.length,resultArray=new Array(arrayLen),
            radixVal=RADIX_BASE,carryOver=0,singleProduct,idx;
        
        for(idx=0;idx<arrayLen;idx++){
            singleProduct=arr[idx]*smallNum+carryOver;
            carryOver=Math.floor(singleProduct/radixVal);
            resultArray[idx]=singleProduct-carryOver*radixVal;
        }
        while(carryOver>0){ // Propagate any remaining carry.
            resultArray[idx++]=carryOver%radixVal;
            carryOver=Math.floor(carryOver/radixVal);
        }
        return resultArray;
    }

    // Shifts an array left by padding with zeros, effectively multiplying by a power of RADIX_BASE.
    function padZerosLeft(arr,count){
        var paddedResult=[];
        while(count-- >0)paddedResult.push(0);
        return paddedResult.concat(arr);
    }

    // Implements the Karatsuba multiplication algorithm for efficiency with very large numbers.
    function karatsubaMultiply(arrX,arrY){
        var totalLen=Math.max(arrX.length,arrY.length);
        if(totalLen<=30)return multiplyFullArrays(arrX,arrY); // Fallback for small arrays.
        
        totalLen=Math.ceil(totalLen/2); // Split point for Karatsuba.
        var xHigh=arrX.slice(totalLen),xLow=arrX.slice(0,totalLen),
            yHigh=arrY.slice(totalLen),yLow=arrY.slice(0,totalLen);
        
        var prodAC=karatsubaMultiply(xLow,yLow), // ac
            prodBD=karatsubaMultiply(xHigh,yHigh), // bd
            prodABCD=karatsubaMultiply(addAnyLengthArrays(xLow,xHigh),addAnyLengthArrays(yLow,yHigh)); // (a+b)(c+d)
        
        // Calculate (a+b)(c+d) - ac - bd = ad + bc
        var middleTerm=subtractDigitArrays(subtractDigitArrays(prodABCD,prodAC),prodBD);
        
        // Combine the terms: ac * B^(2n) + (ad+bc) * B^n + bd
        var finalProduct=addAnyLengthArrays(addAnyLengthArrays(prodAC,padZerosLeft(middleTerm,totalLen)),padZerosLeft(prodBD,2*totalLen));
        removeLeadingZeros(finalProduct);
        return finalProduct;
    }

    // Heuristic to decide if Karatsuba multiplication would be beneficial.
    function shouldUseKaratsuba(len1,len2){
        return-.012*len1-.012*len2+15e-6*len1*len2>0;
    }

    // LargeNumber's method for multiplication.
    LargeNumber.prototype.multiplyValues=function(otherVal){
        var parsedOther=parseInput(otherVal),
            thisDigits=this.digitArray,otherDigits=parsedOther.digitArray,
            resultSign=this.isNegative!==parsedOther.isNegative,absOtherVal;
        
        if(parsedOther.isCompact){
            if(otherDigits===0)return NumericType[0];
            if(otherDigits===1)return this;
            if(otherDigits===-1)return this.flipSign();
            absOtherVal=Math.abs(otherDigits);
            if(absOtherVal<RADIX_BASE){return new LargeNumber(multiplyArrayBySmall(thisDigits,absOtherVal),resultSign)}
            otherDigits=numToDigitArray(absOtherVal); // Convert small number to digit array if large enough.
        }
        // Choose between Karatsuba and long multiplication.
        if(shouldUseKaratsuba(thisDigits.length,otherDigits.length))return new LargeNumber(karatsubaMultiply(thisDigits,otherDigits),resultSign);
        return new LargeNumber(multiplyFullArrays(thisDigits,otherDigits),resultSign)};
    LargeNumber.prototype.times=LargeNumber.prototype.multiplyValues;

    // Helper function for multiplying a small number by a digit array.
    function multiplySmallNumAndArray(smallNum,digitArray,isNegative){
        if(smallNum<RADIX_BASE){return new LargeNumber(multiplyArrayBySmall(digitArray,smallNum),isNegative)}
        return new LargeNumber(multiplyFullArrays(digitArray,numToDigitArray(smallNum)),isNegative);
    }

    // CompactNumber's internal multiplication by another compact number.
    CompactNumber.prototype._multiplyByCompact=function(otherCompact){
        if(isWithinSafeRange(otherCompact.digitArray*this.digitArray)){return new CompactNumber(otherCompact.digitArray*this.digitArray)}
        return multiplySmallNumAndArray(Math.abs(otherCompact.digitArray),numToDigitArray(Math.abs(this.digitArray)),this.isNegative!==otherCompact.isNegative)};

    // LargeNumber's internal multiplication by a compact number.
    LargeNumber.prototype._multiplyByCompact=function(otherCompact){
        if(otherCompact.digitArray===0)return NumericType[0];
        if(otherCompact.digitArray===1)return this;
        if(otherCompact.digitArray===-1)return this.flipSign();
        return multiplySmallNumAndArray(Math.abs(otherCompact.digitArray),this.digitArray,this.isNegative!==otherCompact.isNegative)};

    // CompactNumber's method for multiplication.
    CompactNumber.prototype.multiplyValues=function(otherVal){return parseInput(otherVal)._multiplyByCompact(this)};
    CompactNumber.prototype.times=CompactNumber.prototype.multiplyValues;

    // Squares a digit array.
    function squareDigitArray(arr){
        var arrayLen=arr.length,
            resultArray=initializeDigitArray(arrayLen+arrayLen), // Max length of square.
            radixVal=RADIX_BASE,singleProduct,carryOver,idx,digitI,digitJ;
        
        for(idx=0;idx<arrayLen;idx++){
            digitI=arr[idx];
            carryOver=0-digitI*digitI; // Initialize carry, handling 2*a_i*a_j for j=i.
            for(var jdx=idx;jdx<arrayLen;jdx++){
                digitJ=arr[jdx];
                singleProduct=2*(digitI*digitJ)+resultArray[idx+jdx]+carryOver;
                carryOver=Math.floor(singleProduct/radixVal);
                resultArray[idx+jdx]=singleProduct-carryOver*radixVal;
            }
            resultArray[idx+arrayLen]=carryOver; // Final carry for this row.
        }
        removeLeadingZeros(resultArray);
        return resultArray;
    }

    // LargeNumber's method for squaring.
    LargeNumber.prototype.square=function(){return new LargeNumber(squareDigitArray(this.digitArray),false)};
    // CompactNumber's method for squaring.
    CompactNumber.prototype.square=function(){
        var val=this.digitArray*this.digitArray;
        if(isWithinSafeRange(val))return new CompactNumber(val);
        return new LargeNumber(squareDigitArray(numToDigitArray(Math.abs(this.digitArray))),false)};

    // Division algorithm 1 (Knuth's D-algorithm) for large numbers.
    function longDivisionMethod1(dividendArr,divisorArr){
        var dividendLen=dividendArr.length,divisorLen=divisorArr.length,
            radixVal=RADIX_BASE,quotientDigits=initializeDigitArray(divisorArr.length),
            msdDivisor=divisorArr[divisorLen-1], // Most significant digit of divisor.
            normalizationFactor=Math.ceil(radixVal/(2*msdDivisor)), // Factor to normalize divisor.
            currentRemainder=multiplyArrayBySmall(dividendArr,normalizationFactor),
            normalizedDivisor=multiplyArrayBySmall(divisorArr,normalizationFactor),
            qDigit,posShift,carryOver,borrowVal,idx,divLen,tempQuotient;
        
        if(currentRemainder.length<=dividendLen)currentRemainder.push(0); // Ensure enough digits for remainder.
        normalizedDivisor.push(0); // Pad divisor.
        msdDivisor=normalizedDivisor[divisorLen-1]; // Re-get MSD after normalization.
        
        for(posShift=dividendLen-divisorLen;posShift>=0;posShift--){
            qDigit=radixVal-1; // Initial guess for quotient digit.
            if(currentRemainder[posShift+divisorLen]!==msdDivisor){
                qDigit=Math.floor((currentRemainder[posShift+divisorLen]*radixVal+currentRemainder[posShift+divisorLen-1])/msdDivisor)
            }
            carryOver=0;borrowVal=0;divLen=normalizedDivisor.length;
            for(idx=0;idx<divLen;idx++){ // Subtract (qDigit * normalizedDivisor) from currentRemainder.
                carryOver+=qDigit*normalizedDivisor[idx];
                tempQuotient=Math.floor(carryOver/radixVal);
                borrowVal+=currentRemainder[posShift+idx]-(carryOver-tempQuotient*radixVal);
                carryOver=tempQuotient;
                if(borrowVal<0){currentRemainder[posShift+idx]=borrowVal+radixVal;borrowVal=-1}
                else{currentRemainder[posShift+idx]=borrowVal;borrowVal=0}
            }
            while(borrowVal!==0){ // Adjust qDigit if subtraction was too large.
                qDigit-=1;carryOver=0;
                for(idx=0;idx<divLen;idx++){
                    carryOver+=currentRemainder[posShift+idx]-radixVal+normalizedDivisor[idx];
                    if(carryOver<0){currentRemainder[posShift+idx]=carryOver+radixVal;carryOver=0}
                    else{currentRemainder[posShift+idx]=carryOver;carryOver=1}
                }
                borrowVal+=carryOver;
            }
            quotientDigits[posShift]=qDigit;
        }
        currentRemainder=divideArrayBySmall(currentRemainder,normalizationFactor)[0]; // Denormalize remainder.
        return[digitArrayToNum(quotientDigits),digitArrayToNum(currentRemainder)];
    }

    // Division algorithm 2 (simpler long division simulation).
    function longDivisionMethod2(dividendArr,divisorArr){
        var dividendLen=dividendArr.length,divisorLen=divisorArr.length,
            quotientDigits=[],currentPart=[],radixVal=RADIX_BASE,
            currentGuess,partLen,highPart,highDivisor,guessProduct;
        
        while(dividendLen){
            currentPart.unshift(dividendArr[--dividendLen]); // Add next digit to current part.
            removeLeadingZeros(currentPart);
            if(compareAbsoluteValues(currentPart,divisorArr)<0){quotientDigits.push(0);continue} // If current part < divisor.
            
            partLen=currentPart.length;
            highPart=currentPart[partLen-1]*radixVal+currentPart[partLen-2];
            highDivisor=divisorArr[divisorLen-1]*radixVal+divisorArr[divisorLen-2];
            if(partLen>divisorLen){highPart=(highPart+1)*radixVal} // Adjust for length difference.
            currentGuess=Math.ceil(highPart/highDivisor); // Initial guess for quotient digit.
            
            do{ // Refine guess by trial subtraction.
                guessProduct=multiplyArrayBySmall(divisorArr,currentGuess);
                if(compareAbsoluteValues(guessProduct,currentPart)<=0)break;
                currentGuess--
            }while(currentGuess);
            quotientDigits.push(currentGuess);
            currentPart=subtractDigitArrays(currentPart,guessProduct); // Update current part.
        }
        quotientDigits.reverse(); // Reverse to correct order.
        return[digitArrayToNum(quotientDigits),digitArrayToNum(currentPart)];
    }

    // Divides a digit array by a single small number.
    function divideArrayBySmall(digitArray,smallDivisor){
        var arrayLen=digitArray.length,divResult=initializeDigitArray(arrayLen),
            radixVal=RADIX_BASE,idx,q,remResult,currentDivisor;
        
        remResult=0;
        for(idx=arrayLen-1;idx>=0;--idx){ // Process from most significant digit.
            currentDivisor=remResult*radixVal+digitArray[idx];
            q=intPart(currentDivisor/smallDivisor);
            remResult=currentDivisor-q*smallDivisor;
            divResult[idx]=q|0; // Ensure integer.
        }
        return[divResult,remResult|0]; // Return quotient array and final remainder.
    }

    // Performs division and modulo for any NumericType.
    function performDivision(self,otherVal){
        var intermediateVal,parsedOther=parseInput(otherVal);
        var thisDigits=self.digitArray,otherDigits=parsedOther.digitArray;
        var finalQuotient;
        
        if(otherDigits===0)throw new Error("Cannot divide by zero");
        
        if(self.isCompact){
            if(parsedOther.isCompact){return[new CompactNumber(intPart(thisDigits/otherDigits)),new CompactNumber(thisDigits%otherDigits)]}
            return[NumericType[0],self] // Small number divided by large number.
        }
        
        if(parsedOther.isCompact){
            if(otherDigits===1)return[self,NumericType[0]];
            if(otherDigits==-1)return[self.flipSign(),NumericType[0]];
            var absOther=Math.abs(otherDigits);
            if(absOther<RADIX_BASE){
                intermediateVal=divideArrayBySmall(thisDigits,absOther);
                finalQuotient=digitArrayToNum(intermediateVal[0]);
                var remainder=intermediateVal[1];
                if(self.isNegative)remainder=-remainder; // Correct remainder sign.
                if(typeof finalQuotient==="number"){
                    if(self.isNegative!==parsedOther.isNegative)finalQuotient=-finalQuotient;
                    return[new CompactNumber(finalQuotient),new CompactNumber(remainder)]
                }
                return[new LargeNumber(finalQuotient,self.isNegative!==parsedOther.isNegative),new CompactNumber(remainder)]
            }
            otherDigits=numToDigitArray(absOther); // Convert small divisor to digit array.
        }
        
        var absComparison=compareAbsoluteValues(thisDigits,otherDigits);
        if(absComparison===-1)return[NumericType[0],self]; // Dividend < Divisor.
        if(absComparison===0)return[NumericType[self.isNegative===parsedOther.isNegative?1:-1],NumericType[0]]; // Dividend == Divisor.
        
        if(thisDigits.length+otherDigits.length<=200)intermediateVal=longDivisionMethod1(thisDigits,otherDigits); // Choose algorithm.
        else intermediateVal=longDivisionMethod2(thisDigits,otherDigits);
        
        finalQuotient=intermediateVal[0];
        var quotientIsNegative=self.isNegative!==parsedOther.isNegative,
            moduloResult=intermediateVal[1],
            moduloIsNegative=self.isNegative;
        
        if(typeof finalQuotient==="number"){if(quotientIsNegative)finalQuotient=-finalQuotient;finalQuotient=new CompactNumber(finalQuotient)}
        else finalQuotient=new LargeNumber(finalQuotient,quotientIsNegative);
        
        if(typeof moduloResult==="number"){if(moduloIsNegative)moduloResult=-moduloResult;moduloResult=new CompactNumber(moduloResult)}
        else moduloResult=new LargeNumber(moduloResult,moduloIsNegative);
        
        return[finalQuotient,moduloResult];
    }

    // LargeNumber's method to get both quotient and remainder.
    LargeNumber.prototype.getDivMod=function(otherVal){
        var divModPair=performDivision(this,otherVal);
        return{quotient:divModPair[0],remainder:divModPair[1]}
    };
    CompactNumber.prototype.getDivMod=LargeNumber.prototype.getDivMod;

    // LargeNumber's method for division (returns quotient only).
    LargeNumber.prototype.divide=function(otherVal){return performDivision(this,otherVal)[0]};
    CompactNumber.prototype.over=CompactNumber.prototype.divide=LargeNumber.prototype.over=LargeNumber.prototype.divide;

    // LargeNumber's method for modulo (returns remainder only).
    LargeNumber.prototype.mod=function(otherVal){return performDivision(this,otherVal)[1]};
    CompactNumber.prototype.remainder=CompactNumber.prototype.mod=LargeNumber.prototype.remainder=LargeNumber.prototype.mod;

    // LargeNumber's method for exponentiation (integer power).
    LargeNumber.prototype.power=function(otherVal){
        var parsedExp=parseInput(otherVal),
            thisDigits=this.digitArray,exponentVal=parsedExp.digitArray,
            powResult,baseVal,accumulator;
        
        if(exponentVal===0)return NumericType[1];
        if(thisDigits===0)return NumericType[0];
        if(thisDigits===1)return NumericType[1];
        if(thisDigits===-1)return parsedExp.isEvenNumber()?NumericType[1]:NumericType[-1];
        if(parsedExp.isNegativeNumber()){return NumericType[0]} // Negative exponent for integers results in 0.
        if(!parsedExp.isCompact)throw new Error("The exponent "+parsedExp.toDisplayString()+" is too large.");
        
        if(this.isCompact){if(isWithinSafeRange(powResult=Math.pow(thisDigits,exponentVal)))return new CompactNumber(intPart(powResult))}
        
        baseVal=this;accumulator=NumericType[1];
        while(true){ // Binary exponentiation.
            if(exponentVal&1===1){accumulator=accumulator.times(baseVal);--exponentVal}
            if(exponentVal===0)break;
            exponentVal/=2;baseVal=baseVal.square()}
        return accumulator};
    CompactNumber.prototype.power=LargeNumber.prototype.power;

    // LargeNumber's method for modular exponentiation.
    LargeNumber.prototype.modularPower=function(exponentNum,modulusNum){
        exponentNum=parseInput(exponentNum);modulusNum=parseInput(modulusNum);
        if(modulusNum.isZeroValue())throw new Error("Cannot take modPow with modulus 0");
        
        var resultAcc=NumericType[1],currentBase=this.mod(modulusNum);
        while(exponentNum.isPositiveNumber()){
            if(currentBase.isZeroValue())return NumericType[0];
            if(exponentNum.isOddNumber())resultAcc=resultAcc.multiplyValues(currentBase).mod(modulusNum);
            exponentNum=exponentNum.divide(2);
            currentBase=currentBase.square().mod(modulusNum)
        }
        return resultAcc};
    CompactNumber.prototype.modularPower=LargeNumber.prototype.modularPower;

    // Compares the absolute values (magnitudes) of two digit arrays.
    function compareAbsoluteValues(arrA,arrB){
        if(arrA.length!==arrB.length){return arrA.length>arrB.length?1:-1}
        for(var compareIdx=arrA.length-1;compareIdx>=0;compareIdx--){
            if(arrA[compareIdx]!==arrB[compareIdx])return arrA[compareIdx]>arrB[compareIdx]?1:-1
        }
        return 0;
    }

    // LargeNumber's method to compare magnitudes.
    LargeNumber.prototype.compareMagnitude=function(otherVal){
        var parsedOther=parseInput(otherVal),thisDigits=this.digitArray,otherDigits=parsedOther.digitArray;
        if(parsedOther.isCompact)return 1;
        return compareAbsoluteValues(thisDigits,otherDigits)};
    // CompactNumber's method to compare magnitudes.
    CompactNumber.prototype.compareMagnitude=function(otherVal){
        var parsedOther=parseInput(otherVal),thisNum=Math.abs(this.digitArray),otherNum=parsedOther.digitArray;
        if(parsedOther.isCompact){otherNum=Math.abs(otherNum);return thisNum===otherNum?0:thisNum>otherNum?1:-1}
        return-1};

    // LargeNumber's method to compare two numeric values, considering their signs.
    LargeNumber.prototype.compareValues=function(otherVal){
        if(otherVal===Infinity){return-1}
        if(otherVal===-Infinity){return 1}
        var parsedOther=parseInput(otherVal),thisDigits=this.digitArray,otherDigits=parsedOther.digitArray;
        if(this.isNegative!==parsedOther.isNegative){return parsedOther.isNegative?1:-1} // Different signs.
        if(parsedOther.isCompact){return this.isNegative?-1:1} // One compact, one large, same sign.
        return compareAbsoluteValues(thisDigits,otherDigits)*(this.isNegative?-1:1)}; // Both large, same sign.
    LargeNumber.prototype.compareTo=LargeNumber.prototype.compareValues;

    // CompactNumber's method to compare two numeric values.
    CompactNumber.prototype.compareValues=function(otherVal){
        if(otherVal===Infinity){return-1}
        if(otherVal===-Infinity){return 1}
        var parsedOther=parseInput(otherVal),thisNumVal=this.digitArray,otherNumVal=parsedOther.digitArray;
        if(parsedOther.isCompact){return thisNumVal==otherNumVal?0:thisNumVal>otherNumVal?1:-1} // Both compact.
        if(thisNumVal<0!==parsedOther.isNegative){return thisNumVal<0?-1:1} // One compact, one large, different signs.
        return thisNumVal<0?1:-1}; // One compact, one large, same sign.
    CompactNumber.prototype.compareTo=CompactNumber.prototype.compareValues;

    // Equality checks.
    LargeNumber.prototype.isEqualTo=function(otherVal){return this.compareValues(otherVal)===0};
    CompactNumber.prototype.eq=CompactNumber.prototype.isEqualTo=LargeNumber.prototype.eq=LargeNumber.prototype.isEqualTo;

    LargeNumber.prototype.isNotEqualTo=function(otherVal){return this.compareValues(otherVal)!==0};
    CompactNumber.prototype.neq=CompactNumber.prototype.isNotEqualTo=LargeNumber.prototype.neq=LargeNumber.prototype.isNotEqualTo;

    // Greater than checks.
    LargeNumber.prototype.isGreaterThan=function(otherVal){return this.compareValues(otherVal)>0};
    CompactNumber.prototype.gt=CompactNumber.prototype.isGreaterThan=LargeNumber.prototype.gt=LargeNumber.prototype.isGreaterThan;

    // Less than checks.
    LargeNumber.prototype.isLesserThan=function(otherVal){return this.compareValues(otherVal)<0};
    CompactNumber.prototype.lt=CompactNumber.prototype.isLesserThan=LargeNumber.prototype.lt=LargeNumber.prototype.isLesserThan;

    // Greater than or equal to checks.
    LargeNumber.prototype.isGreaterOrEqualTo=function(otherVal){return this.compareValues(otherVal)>=0};
    CompactNumber.prototype.geq=CompactNumber.prototype.isGreaterOrEqualTo=LargeNumber.prototype.geq=LargeNumber.prototype.isGreaterOrEqualTo;

    // Less than or equal to checks.
    LargeNumber.prototype.isLesserOrEqualTo=function(otherVal){return this.compareValues(otherVal)<=0};
    CompactNumber.prototype.leq=CompactNumber.prototype.isLesserOrEqualTo=LargeNumber.prototype.leq=LargeNumber.prototype.isLesserOrEqualTo;

    // Parity checks.
    LargeNumber.prototype.isEvenNumber=function(){return(this.digitArray[0]&1)===0};
    CompactNumber.prototype.isEvenNumber=function(){return(this.digitArray&1)===0};

    LargeNumber.prototype.isOddNumber=function(){return(this.digitArray[0]&1)===1};
    CompactNumber.prototype.isOddNumber=function(){return(this.digitArray&1)===1};

    // Sign checks.
    LargeNumber.prototype.isPositiveNumber=function(){return!this.isNegative};
    CompactNumber.prototype.isPositiveNumber=function(){return this.digitArray>0};

    LargeNumber.prototype.isNegativeNumber=function(){return this.isNegative};
    CompactNumber.prototype.isNegativeNumber=function(){return this.digitArray<0};

    // Value specific checks.
    LargeNumber.prototype.isOneOrMinusOne=function(){return false}; // LargeNumber cannot be 1 or -1.
    CompactNumber.prototype.isOneOrMinusOne=function(){return Math.abs(this.digitArray)===1};

    LargeNumber.prototype.isZeroValue=function(){return false}; // LargeNumber cannot be 0.
    CompactNumber.prototype.isZeroValue=function(){return this.digitArray===0};

    // Divisibility check.
    LargeNumber.prototype.isExactlyDivisibleBy=function(otherVal){
        var parsedOther=parseInput(otherVal);
        var val=parsedOther.digitArray;
        if(val===0)return false;
        if(val===1)return true;
        if(val===2)return this.isEvenNumber();
        return this.mod(parsedOther).isEqualTo(NumericType[0])};
    CompactNumber.prototype.isExactlyDivisibleBy=LargeNumber.prototype.isExactlyDivisibleBy;

    // Helper to quickly check for small prime numbers.
    function checkBasicPrimes(num){
        var absNum=num.absoluteValue();
        if(absNum.isOneOrMinusOne())return false;
        if(absNum.isEqualTo(2)||absNum.isEqualTo(3)||absNum.isEqualTo(5))return true;
        if(absNum.isEvenNumber()||absNum.isExactlyDivisibleBy(3)||absNum.isExactlyDivisibleBy(5))return false;
        if(absNum.isLesserThan(25))return true;
    }

    // LargeNumber's primality test (Miller-Rabin).
    LargeNumber.prototype.isTrulyPrime=function(){
        var isPrime=checkBasicPrimes(this);
        if(isPrime!==unspecified)return isPrime;
        var numberToCheck=this.absoluteValue(),numberMinusOne=numberToCheck.decrementValue();
        var witnesses=[2,3,5,7,11,13,17,19],tempExponent=numberMinusOne,loopDivisor,flag,idx,currentPower;
        while(tempExponent.isEvenNumber())tempExponent=tempExponent.divide(2); // Find d such that n-1 = d * 2^s.
        for(idx=0;idx<witnesses.length;idx++){
            currentPower=largeNum(witnesses[idx]).modularPower(tempExponent,numberToCheck);
            if(currentPower.isEqualTo(NumericType[1])||currentPower.isEqualTo(numberMinusOne))continue;
            for(flag=true,loopDivisor=tempExponent;flag&&loopDivisor.isLesserThan(numberMinusOne);loopDivisor=loopDivisor.multiplyValues(2)){
                currentPower=currentPower.square().mod(numberToCheck);
                if(currentPower.isEqualTo(numberMinusOne))flag=false}
            if(flag)return false
        }
        return true};
    CompactNumber.prototype.isTrulyPrime=LargeNumber.prototype.isTrulyPrime;

    // LargeNumber's probabilistic primality test.
    LargeNumber.prototype.isProbablyPrime=function(numIterations){
        var isPrime=checkBasicPrimes(this);
        if(isPrime!==unspecified)return isPrime;
        var numberToCheck=this.absoluteValue();
        var numTests=numIterations===unspecified?5:numIterations;
        for(var idx=0;idx<numTests;idx++){
            var randomWitness=largeNum.RAND_BETWEEN_FUNC(2,numberToCheck.minus(2));
            if(!randomWitness.modularPower(numberToCheck.decrementValue(),numberToCheck).isOneOrMinusOne())return false
        }
        return true};
    CompactNumber.prototype.isProbablyPrime=LargeNumber.prototype.isProbablyPrime;

    // Calculates the modular multiplicative inverse using the Extended Euclidean Algorithm.
    LargeNumber.prototype.modularInverse=function(modulusNum){
        var oldT=largeNum.ZERO_VAL,currentT=largeNum.ONE_VAL,
            oldR=parseInput(modulusNum),currentR=this.absoluteValue(),
            quotientVal,prevT,prevR;
        while(!currentR.isEqualTo(largeNum.ZERO_VAL)){
            quotientVal=oldR.divide(currentR);
            prevT=oldT;prevR=oldR;
            oldT=currentT;oldR=currentR;
            currentT=prevT.subtractValues(quotientVal.multiplyValues(currentT));
            currentR=prevR.subtractValues(quotientVal.multiplyValues(currentR))
        }
        if(!oldR.isEqualTo(1))throw new Error(this.toDisplayString()+" and "+modulusNum.toDisplayString()+" are not co-prime");
        if(oldT.compareValues(0)===-1){oldT=oldT.addValues(modulusNum)} // Ensure result is positive.
        if(this.isNegativeNumber()){return oldT.flipSign()} // Adjust sign if original number was negative.
        return oldT};
    CompactNumber.prototype.modularInverse=LargeNumber.prototype.modularInverse;

    // Returns the number incremented by one.
    LargeNumber.prototype.incrementValue=function(){
        var val=this.digitArray;
        if(this.isNegative){return subtractDigitArrayWithSmall(val,1,this.isNegative)}
        return new LargeNumber(addDigitArrayWithSmall(val,1),this.isNegative)};
    CompactNumber.prototype.incrementValue=function(){
        var val=this.digitArray;
        if(val+1<JS_MAX_SAFE_INT)return new CompactNumber(val+1);
        return new LargeNumber(JS_MAX_SAFE_INT_DIGITS,false)}; // Overflow to LargeNumber.

    // Returns the number decremented by one.
    LargeNumber.prototype.decrementValue=function(){
        var val=this.digitArray;
        if(this.isNegative){return new LargeNumber(addDigitArrayWithSmall(val,1),true)}
        return subtractDigitArrayWithSmall(val,1,this.isNegative)};
    CompactNumber.prototype.decrementValue=function(){
        var val=this.digitArray;
        if(val-1>-JS_MAX_SAFE_INT)return new CompactNumber(val-1);
        return new LargeNumber(JS_MAX_SAFE_INT_DIGITS,true)}; // Underflow to LargeNumber.

    // Precomputed powers of two for bit shifting operations.
    var powersOfTwoArray=[1];
    while(2*powersOfTwoArray[powersOfTwoArray.length-1]<=RADIX_BASE)powersOfTwoArray.push(2*powersOfTwoArray[powersOfTwoArray.length-1]);
    var powersArrayLen=powersOfTwoArray.length,maxPowerOfTwo=powersOfTwoArray[powersArrayLen-1];

    // Checks if the shift amount is small enough for direct processing.
    function isShiftAmountCompact(shiftVal){return(typeof shiftVal==="number"||typeof shiftVal==="string")&&+Math.abs(shiftVal)<=RADIX_BASE||shiftVal instanceof LargeNumber&&shiftVal.digitArray.length<=1}

    // LargeNumber's method for bitwise left shift.
    LargeNumber.prototype.bitShiftLeft=function(shiftVal){
        if(!isShiftAmountCompact(shiftVal)){throw new Error(String(shiftVal)+" is too large for shifting.")}
        shiftVal=+shiftVal;
        if(shiftVal<0)return this.bitShiftRight(-shiftVal); // Delegate negative shifts.
        var shiftResult=this;
        if(shiftResult.isZeroValue())return shiftResult;
        while(shiftVal>=powersArrayLen){shiftResult=shiftResult.multiplyValues(maxPowerOfTwo);shiftVal-=powersArrayLen-1}
        return shiftResult.multiplyValues(powersOfTwoArray[shiftVal])};
    CompactNumber.prototype.bitShiftLeft=LargeNumber.prototype.bitShiftLeft;

    // LargeNumber's method for bitwise right shift.
    LargeNumber.prototype.bitShiftRight=function(shiftVal){
        var remainderAndQuotient;
        if(!isShiftAmountCompact(shiftVal)){throw new Error(String(shiftVal)+" is too large for shifting.")}
        shiftVal=+shiftVal;
        if(shiftVal<0)return this.bitShiftLeft(-shiftVal); // Delegate negative shifts.
        var shiftResult=this;
        while(shiftVal>=powersArrayLen){
            if(shiftResult.isZeroValue()||shiftResult.isNegativeNumber()&&shiftResult.isOneOrMinusOne())return shiftResult;
            remainderAndQuotient=performDivision(shiftResult,maxPowerOfTwo);
            shiftResult=remainderAndQuotient[1].isNegativeNumber()?remainderAndQuotient[0].decrementValue():remainderAndQuotient[0];
            shiftVal-=powersArrayLen-1
        }
        remainderAndQuotient=performDivision(shiftResult,powersOfTwoArray[shiftVal]);
        return remainderAndQuotient[1].isNegativeNumber()?remainderAndQuotient[0].decrementValue():remainderAndQuotient[0]};
    CompactNumber.prototype.bitShiftRight=LargeNumber.prototype.bitShiftRight;

    // Generic function for bitwise operations (AND, OR, XOR).
    function performBitwiseOp(operandX,operandY,operationFn){
        operandY=parseInput(operandY);
        var operandXSign=operandX.isNegativeNumber(),operandYSign=operandY.isNegativeNumber();
        var operandXRem=operandXSign?operandX.not():operandX,operandYRem=operandYSign?operandY.not():operandY;
        var xChunk=0,yChunk=0;
        var xDivModResult=null,yDivModResult=null;
        var bitwiseChunks=[];
        while(!operandXRem.isZeroValue()||!operandYRem.isZeroValue()){
            xDivModResult=performDivision(operandXRem,maxPowerOfTwo);
            xChunk=xDivModResult[1].toJavaScriptNumber();
            if(operandXSign){xChunk=maxPowerOfTwo-1-xChunk} // Two's complement for negative.
            yDivModResult=performDivision(operandYRem,maxPowerOfTwo);
            yChunk=yDivModResult[1].toJavaScriptNumber();
            if(operandYSign){yChunk=maxPowerOfTwo-1-yChunk} // Two's complement for negative.
            operandXRem=xDivModResult[0];operandYRem=yDivModResult[0];
            bitwiseChunks.push(operationFn(xChunk,yChunk))
        }
        var finalBitwiseResult=operationFn(operandXSign?1:0,operandYSign?1:0)!==0?largeNum(-1):largeNum(0);
        for(var idx=bitwiseChunks.length-1;idx>=0;idx-=1){finalBitwiseResult=finalBitwiseResult.multiplyValues(maxPowerOfTwo).addValues(largeNum(bitwiseChunks[idx]))}
        return finalBitwiseResult;
    }

    // LargeNumber's method for bitwise NOT.
    LargeNumber.prototype.not=function(){return this.flipSign().decrementValue()};
    CompactNumber.prototype.not=LargeNumber.prototype.not;

    // LargeNumber's method for bitwise AND.
    LargeNumber.prototype.and=function(otherNum){return performBitwiseOp(this,otherNum,function(a,b){return a&b})};
    CompactNumber.prototype.and=LargeNumber.prototype.and;

    // LargeNumber's method for bitwise OR.
    LargeNumber.prototype.or=function(otherNum){return performBitwiseOp(this,otherNum,function(a,b){return a|b})};
    CompactNumber.prototype.or=LargeNumber.prototype.or;

    // LargeNumber's method for bitwise XOR.
    LargeNumber.prototype.xor=function(otherNum){return performBitwiseOp(this,otherNum,function(a,b){return a^b})};
    CompactNumber.prototype.xor=LargeNumber.prototype.xor;

    // Masks for lowest order bit (LOB) approximation.
    const LOW_ORDER_BIT_MASK_INT=1<<30, // For standard JS numbers.
          LOW_ORDER_BIT_MASK_LARGE_INT=(RADIX_BASE&-RADIX_BASE)*(RADIX_BASE&-RADIX_BASE)|LOW_ORDER_BIT_MASK_INT; // For digit arrays.

    // Approximates the lowest order bit of a number.
    function approximateLowestBit(num){
        var digitOrNum=num.digitArray,
            maskedValue=typeof digitOrNum==="number"?digitOrNum|LOW_ORDER_BIT_MASK_INT:digitOrNum[0]+digitOrNum[1]*RADIX_BASE|LOW_ORDER_BIT_MASK_LARGE_INT;
        return maskedValue&-maskedValue;
    }

    // Calculates the integer logarithm (base 2 for bitLength).
    function calculateIntegerLog(val,base){
        if(base.compareValues(val)<=0){
            var logResult=calculateIntegerLog(val,base.square());
            var powerTerm=logResult.p;
            var exponentTerm=logResult.e;
            var testProduct=powerTerm.multiplyValues(base);
            return testProduct.compareValues(val)<=0?{p:testProduct,e:exponentTerm*2+1}:{p:powerTerm,e:exponentTerm*2}}
        return{p:largeNum(1),e:0}
    }

    // LargeNumber's method to get the bit length.
    LargeNumber.prototype.getBitLength=function(){
        var numberToCheck=this;
        if(numberToCheck.compareValues(largeNum(0))<0){numberToCheck=numberToCheck.flipSign().subtractValues(largeNum(1))}
        if(numberToCheck.compareValues(largeNum(0))===0){return largeNum(0)}
        return largeNum(calculateIntegerLog(numberToCheck,largeNum(2)).e).addValues(largeNum(1))};
    CompactNumber.prototype.getBitLength=LargeNumber.prototype.getBitLength;

    // Finds the maximum of two NumericType values.
    function findMaximum(numA,numB){numA=parseInput(numA);numB=parseInput(numB);return numA.isGreaterThan(numB)?numA:numB}
    // Finds the minimum of two NumericType values.
    function findMinimum(numA,numB){numA=parseInput(numA);numB=parseInput(numB);return numA.isLesserThan(numB)?numA:numB}

    // Calculates the greatest common divisor (GCD) using the binary GCD algorithm.
    function greatestCommonDivisor(numA,numB){
        numA=parseInput(numA).absoluteValue();numB=parseInput(numB).absoluteValue();
        if(numA.isEqualTo(numB))return numA;
        if(numA.isZeroValue())return numB;
        if(numB.isZeroValue())return numA;
        var commonFactor=NumericType[1],extractedFactor,tempSwap;
        while(numA.isEvenNumber()&&numB.isEvenNumber()){
            extractedFactor=Math.min(approximateLowestBit(numA),approximateLowestBit(numB));
            numA=numA.divide(extractedFactor);numB=numB.divide(extractedFactor);
            commonFactor=commonFactor.multiplyValues(extractedFactor)}
        while(numA.isEvenNumber()){numA=numA.divide(approximateLowestBit(numA))}
        do{
            while(numB.isEvenNumber()){numB=numB.divide(approximateLowestBit(numB))}
            if(numA.isGreaterThan(numB)){tempSwap=numB;numB=numA;numA=tempSwap}
            numB=numB.subtractValues(numA)}while(!numB.isZeroValue());
        return commonFactor.isOneOrMinusOne()?numA:numA.multiplyValues(commonFactor)}

    // Calculates the least common multiple (LCM).
    function leastCommonMultiple(numA,numB){
        numA=parseInput(numA).absoluteValue();numB=parseInput(numB).absoluteValue();
        return numA.divide(greatestCommonDivisor(numA,numB)).multiplyValues(numB)}

    // Generates a random NumericType value within a specified range (inclusive).
    function randomBetweenRange(lowerBound,upperBound){
        lowerBound=parseInput(lowerBound);upperBound=parseInput(upperBound);
        var low=findMinimum(lowerBound,upperBound),high=findMaximum(lowerBound,upperBound);
        var valueRange=high.subtractValues(low).addValues(1);
        if(valueRange.isCompact)return low.addValues(Math.floor(Math.random()*valueRange.digitArray));
        var rangeLen=valueRange.digitArray.length-1;
        var resultDigits=[],isRestricted=true;
        for(var idx=rangeLen;idx>=0;idx--){
            var currentTop=isRestricted?valueRange.digitArray[idx]:RADIX_BASE;
            var randomDigit=intPart(Math.random()*currentTop);
            resultDigits.unshift(randomDigit);
            if(randomDigit<currentTop)isRestricted=false
        }
        var resultNum=digitArrayToNum(resultDigits);
        return low.addValues(typeof resultNum==="number"?new CompactNumber(resultNum):new LargeNumber(resultNum,false))}

    // Parses a string representation of a number from a given base.
    var convertFromBaseString=function(inputStringRep,numericalBase){
        var strLen=inputStringRep.length;
        var idx;
        var absoluteBase=Math.abs(numericalBase);
        for(idx=0;idx<strLen;idx++){ // Validate characters.
            var charVal=inputStringRep[idx].toLowerCase();
            if(charVal==="-")continue;
            if(/[a-z0-9]/.test(charVal)){
                if(/[0-9]/.test(charVal)&&+charVal>=absoluteBase){if(charVal==="1"&&absoluteBase===1)continue;throw new Error(charVal+" is not a valid digit in base "+numericalBase+".")}
                else if(charVal.charCodeAt(0)-87>=absoluteBase){throw new Error(charVal+" is not a valid digit in base "+numericalBase+".")}}
        }
        // Optimized parsing for small numbers/bases that fit JS numbers.
        if(2<=numericalBase&&numericalBase<=36){
            if(strLen<=JS_MAX_SAFE_INT_LOG/Math.log(numericalBase)){
                var parsedNum=parseInt(inputStringRep,numericalBase);
                if(isNaN(parsedNum)){throw new Error(charVal+" is not a valid digit in base "+numericalBase+".")}
                return new CompactNumber(parseInt(inputStringRep,numericalBase))}
        }
        // General parsing for larger numbers/bases.
        numericalBase=parseInput(numericalBase);
        var digitCollection=[];
        var isNumberNegative=inputStringRep[0]==="-";
        for(idx=isNumberNegative?1:0;idx<inputStringRep.length;idx++){
            var charVal=inputStringRep[idx].toLowerCase(),charNumericCode=charVal.charCodeAt(0);
            if(48<=charNumericCode&&charNumericCode<=57)digitCollection.push(parseInput(charVal));
            else if(97<=charNumericCode&&charNumericCode<=122)digitCollection.push(parseInput(charVal.charCodeAt(0)-87));
            else if(charVal==="<"){var startIndex=idx;do{idx++}while(inputStringRep[idx]!==">");digitCollection.push(parseInput(inputStringRep.slice(startIndex+1,idx)))}
            else throw new Error(charVal+" is not a valid character")
        }
        return convertFromDigitArray(digitCollection,numericalBase,isNumberNegative)};

    // Converts an array of NumericType digits from a given base into a NumericType.
    function convertFromDigitArray(digits,numericalBase,isNegative){
        var accumulatedValue=NumericType[0],currentPower=NumericType[1],idx;
        for(idx=digits.length-1;idx>=0;idx--){
            accumulatedValue=accumulatedValue.addValues(digits[idx].times(currentPower));
            currentPower=currentPower.times(numericalBase)
        }
        return isNegative?accumulatedValue.flipSign():accumulatedValue}

    // Converts a single digit to its string representation (0-9, a-z, or <custom>).
    function digitToString(digit){
        if(digit<=35){return"0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit)}
        return"<"+digit+">"
    }

    // Converts a NumericType number to its string representation in a specified base.
    function convertToBaseRepresentation(num,numericalBase){
        numericalBase=largeNum(numericalBase);
        if(numericalBase.isZeroValue()){if(num.isZeroValue())return{value:[0],isNegative:false};throw new Error("Cannot convert nonzero numbers to base 0.")}
        if(numericalBase.isEqualTo(-1)){
            if(num.isZeroValue())return{value:[0],isNegative:false};
            if(num.isNegativeNumber())return{value:[].concat.apply([],Array.apply(null,Array(-num.toJavaScriptNumber())).map(Array.prototype.valueOf,[1,0])),isNegative:false};
            var tempArray=Array.apply(null,Array(+num.toJavaScriptNumber()-1)).map(Array.prototype.valueOf,[0,1]);
            tempArray.unshift([1]);
            return{value:[].concat.apply([],tempArray),isNegative:false}
        }
        var isOutputNegative=false;
        if(num.isNegativeNumber()&&numericalBase.isPositiveNumber()){isOutputNegative=true;num=num.absoluteValue()}
        if(numericalBase.isEqualTo(1)){
            if(num.isZeroValue())return{value:[0],isNegative:false};
            return{value:Array.apply(null,Array(+num.toJavaScriptNumber())).map(Number.prototype.valueOf,1),isNegative:isOutputNegative}}
        var outputDigits=[];
        var remainingValue=num,divisionResult;
        while(remainingValue.isNegativeNumber()||remainingValue.compareMagnitude(numericalBase)>=0){
            divisionResult=remainingValue.getDivMod(numericalBase);
            remainingValue=divisionResult.quotient;
            var digit=divisionResult.remainder;
            if(digit.isNegativeNumber()){digit=numericalBase.minus(digit).absoluteValue();remainingValue=remainingValue.incrementValue()}
            outputDigits.push(digit.toJavaScriptNumber())
        }
        outputDigits.push(remainingValue.toJavaScriptNumber());
        return{value:outputDigits.reverse(),isNegative:isOutputNegative}
    }

    // Returns the string representation of a NumericType in a given base.
    function getBaseString(num,numericalBase){
        var arr=convertToBaseRepresentation(num,numericalBase);
        return(arr.isNegative?"-":"")+arr.value.map(digitToString).join("")
    }

    // LargeNumber's method to convert to an array of digits in a given base.
    LargeNumber.prototype.toDigitArray=function(numericalBase){return convertToBaseRepresentation(this,numericalBase)};
    CompactNumber.prototype.toDigitArray=function(numericalBase){return convertToBaseRepresentation(this,numericalBase)};

    // LargeNumber's method to get its string representation.
    LargeNumber.prototype.toDisplayString=function(outputBase){
        if(outputBase===unspecified)outputBase=10;
        if(outputBase!==10)return getBaseString(this,outputBase);
        var digitsArr=this.digitArray,arrLen=digitsArr.length,
            stringRep=String(digitsArr[--arrLen]),
            zeroPadding="0000000",currentDigit;
        while(--arrLen>=0){currentDigit=String(digitsArr[arrLen]);stringRep+=zeroPadding.slice(currentDigit.length)+currentDigit}
        var outputSign=this.isNegative?"-":"";
        return outputSign+stringRep};
    // CompactNumber's method to get its string representation.
    CompactNumber.prototype.toDisplayString=function(outputBase){
        if(outputBase===unspecified)outputBase=10;
        if(outputBase!=10)return getBaseString(this,outputBase);
        return String(this.digitArray)};

    // JSON serialization for both LargeNumber and CompactNumber.
    LargeNumber.prototype.toJsonRepresentation=CompactNumber.prototype.toJsonRepresentation=function(){return this.toDisplayString()};

    // ValueOf and ToJSNumber methods for compatibility.
    LargeNumber.prototype.toNumberValue=function(){return parseInt(this.toDisplayString(),10)};
    LargeNumber.prototype.toJavaScriptNumber=LargeNumber.prototype.toNumberValue;

    CompactNumber.prototype.toNumberValue=function(){return this.digitArray};
    CompactNumber.prototype.toJavaScriptNumber=CompactNumber.prototype.toNumberValue;

    // Parses a string value into a NumericType.
    function parseFromString(inputValue){
        if(isWithinSafeRange(+inputValue)){var numericValue=+inputValue;if(numericValue===intPart(numericValue))return new CompactNumber(numericValue);throw new Error("Invalid integer: "+inputValue)}
        var isNegative=inputValue[0]==="-";
        if(isNegative)inputValue=inputValue.slice(1);
        var expSplit=inputValue.split(/e/i); // Handle scientific notation.
        if(expSplit.length>2)throw new Error("Invalid integer: "+expSplit.join("e"));
        if(expSplit.length===2){
            var exponentPart=expSplit[1];
            if(exponentPart[0]==="+")exponentPart=exponentPart.slice(1);
            exponentPart=+exponentPart;
            if(exponentPart!==intPart(exponentPart)||!isWithinSafeRange(exponentPart))throw new Error("Invalid integer: "+exponentPart+" is not a valid exponent.");
            var numericText=expSplit[0];
            var decimalPointIndex=numericText.indexOf(".");
            if(decimalPointIndex>=0){exponentPart-=numericText.length-decimalPointIndex-1;numericText=numericText.slice(0,decimalPointIndex)+numericText.slice(decimalPointIndex+1)}
            if(exponentPart<0)throw new Error("Cannot include negative exponent part for integers");
            numericText+=new Array(exponentPart+1).join("0");
            inputValue=numericText
        }
        var stringIsValid=/^([0-9][0-9]*)$/.test(inputValue);
        if(!stringIsValid)throw new Error("Invalid integer: "+inputValue);
        var digitChunks=[],maxIdx=inputValue.length,chunkSize=RADIX_LOG,minIdx=maxIdx-chunkSize;
        while(maxIdx>0){
            digitChunks.push(+inputValue.slice(minIdx,maxIdx));
            minIdx-=chunkSize;
            if(minIdx<0)minIdx=0;
            maxIdx-=chunkSize
        }
        removeLeadingZeros(digitChunks);
        return new LargeNumber(digitChunks,isNegative)}

    // Parses a standard JavaScript number into a NumericType.
    function parseFromNumber(numVal){
        if(isWithinSafeRange(numVal)){if(numVal!==intPart(numVal))throw new Error(numVal+" is not an integer.");return new CompactNumber(numVal)}
        return parseFromString(numVal.toDisplayString())}

    // General parsing function for any input value into a NumericType.
    function parseAnyInput(val){
        if(typeof val==="number"){return parseFromNumber(val)}
        if(typeof val==="string"){return parseFromString(val)}
        return val}

    // Pre-instantiate common small integer values for performance.
    for(var idx=0;idx<1e3;idx++){
        NumericType[idx]=new CompactNumber(idx);
        if(idx>0)NumericType[-idx]=new CompactNumber(-idx)}

    // Static properties and utility functions on the NumericType constructor.
    NumericType.ONE_VAL=NumericType[1];
    NumericType.ZERO_VAL=NumericType[0];
    NumericType.NEG_ONE_VAL=NumericType[-1];
    NumericType.MAX_VAL=findMaximum;
    NumericType.MIN_VAL=findMinimum;
    NumericType.GCD_FUNC=greatestCommonDivisor;
    NumericType.LCM_FUNC=leastCommonMultiple;
    NumericType.isNumericInstance=function(obj){return obj instanceof LargeNumber||obj instanceof CompactNumber};
    NumericType.RAND_BETWEEN_FUNC=randomBetweenRange;
    NumericType.fromDigitArray=function(digits,numericalBase,isNegative){return convertFromDigitArray(digits.map(parseAnyInput),parseAnyInput(numericalBase||10),isNegative)};
    
    return NumericType
}();

// Initialize the big integer library, creating its interface object.
var bi=largeNum();
// Define a constant for modulo operations.
var moduloConstant=1e9+7;

// Execute the main program logic and capture its output.
var programOutput=executeProgram();

// If the program's execution yields a result, display it.
if(programOutput!==unspecified)console.log(programOutput);

// The primary function containing the application's core logic.
function executeProgram(){
    // Read the total number of elements from input.
    var countElements=inputData.readNextToken();
    // Read the array of numeric elements from input.
    var elementsArray=inputData.readLineTokens();
    
    // Initialize the Least Common Multiple (LCM) with the first element.
    var currentLcm=bi.addValues(elementsArray[0]);
    // Iterate through the remaining elements to calculate the overall LCM.
    for(var loopCounter=1;loopCounter<countElements;loopCounter++){
        currentLcm=largeNum.LCM_FUNC(currentLcm,elementsArray[loopCounter]);
    }
    // Apply the modulo to the calculated LCM.
    currentLcm=currentLcm.mod(moduloConstant);
    
    // Initialize an accumulator for the final answer.
    var finalAnswer=bi;
    // Iterate through the elements to sum their modular inverses.
    for(var loopCounter=0;loopCounter<countElements;loopCounter++){
        finalAnswer=finalAnswer.addValues(bi.addValues(elementsArray[loopCounter]).modularInverse(moduloConstant));
    }
    // Compute the final result: (sum of modular inverses * LCM) mod moduloConstant.
    return+finalAnswer.times(currentLcm).mod(moduloConstant);
}