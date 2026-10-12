moduleLoader=function(moduleDefinitions,loadedModulesCache,initialEntries,globalExportName){
 /*
  * Global function for loading modules in a Parcel-like environment.
  * It handles module definitions, caching, and dependency resolution.
  *
  * @param {Object} moduleDefinitions - Object mapping module IDs to their code and dependencies.
  * @param {Object} loadedModulesCache - Cache for already loaded module exports.
  * @param {Array<string>} initialEntries - List of module IDs to load initially.
  * @param {string|null} globalExportName - Name to assign exports of the last entry module to the global scope.
  */
 var encounteredError, // This variable will store any error that occurs during module loading.
  globalLoaderFunction="function"==typeof moduleLoader&&moduleLoader, // Reference to the existing global module loader.
  nodeRequireFunction="function"==typeof require&&require; // Reference to Node.js's native require function.

 // The core function responsible for loading and executing a module.
 function loadModule(moduleId,isEntry){
  // Check if the module is already in the cache. If so, return its exports.
  if(!loadedModulesCache[moduleId]){
   // If the module's definition is not found in the provided definitions.
   if(!moduleDefinitions[moduleId]){
    // If it's not an entry point and an external loader exists, try loading with it.
    var externalLoader="function"==typeof moduleLoader&&moduleLoader;
    if(!isEntry&&externalLoader)
     return externalLoader(moduleId,!0);
    // If a global loader function exists, try loading with it.
    if(globalLoaderFunction)
     return globalLoaderFunction(moduleId,!0);
    // If Node.js's require function is available and the module ID is a string, use it.
    if(nodeRequireFunction&&"string"==typeof moduleId)
     return nodeRequireFunction(moduleId);
    // If the module cannot be found by any means, throw an error.
    var moduleNotFoundErr=new Error("Cannot locate code unit '"+moduleId+"'");
    throw moduleNotFoundErr.code="MODULE_NOT_FOUND",moduleNotFoundErr
   }
   // Configure the local `localRequire` function for this module.
   localRequire.resolve=function(dependencyId){
    return moduleDefinitions[moduleId][1][dependencyId]||dependencyId
   };
   // Initialize the cache for this module's local dependencies.
   localRequire.cache={};
   // Create a new module instance and store it in the cache.
   var currentModuleInstance=loadedModulesCache[moduleId]=new loadModule.ModuleType(moduleId);
   // Execute the module's code, passing in the local `localRequire` and module context.
   moduleDefinitions[moduleId][0].call(currentModuleInstance.exports,localRequire,currentModuleInstance,currentModuleInstance.exports,this)
  }
  // Return the exports of the loaded module.
  return loadedModulesCache[moduleId].exports;

  // A local `require` function available within each module.
  function localRequire(dependencyPath){
   return loadModule(localRequire.resolve(dependencyPath))
  }
 }

 // Mark this loader as a custom module loader.
 loadModule.isCustomLoader=!0;
 // Define the constructor for module objects.
 loadModule.ModuleType=function(moduleIdentifier){
  this.id=moduleIdentifier;
  this.bundle=loadModule;
  this.exports={}
 };
 // Store references to the module definitions and the cache.
 loadModule.allDefinitions=moduleDefinitions;
 loadModule.moduleCache=loadedModulesCache;
 // Keep a reference to the parent loader, if any.
 loadModule.parentLoader=globalLoaderFunction;
 // Function to dynamically register new module definitions.
 loadModule.registerModule=function(moduleIdentifier,moduleContent){
  moduleDefinitions[moduleIdentifier]=[function(moduleLocalRequire,moduleInstance){
   moduleInstance.exports=moduleContent
  },{}
  ]
 };

 // Loop through all initial entry points and attempt to load them.
 for(var entryIndex=0;entryIndex<initialEntries.length;entryIndex++)
  try{
   loadModule(initialEntries[entryIndex])
  }catch(currentLoadError){
   // If an error occurs, store it if no other error has been encountered yet.
   encounteredError||(encounteredError=currentLoadError)
  }

 // If there are entry points, handle their exports.
 if(initialEntries.length){
  var lastEntryExports=loadModule(initialEntries[initialEntries.length-1]);
  // Export based on the environment: CommonJS, AMD, or global.
  "object"==typeof exports&&"undefined"!=typeof currentModule?currentModule.exports=lastEntryExports:"function"==typeof define&&define.amd?define(function(){
   return lastEntryExports
  }):globalExportName&&(this[globalExportName]=lastEntryExports)
 }

 // Update the global moduleLoader reference to this instance.
 if(moduleLoader=loadModule,encounteredError)
  throw encounteredError;
 // Return the main module loading function.
 return loadModule
}({
 "9xaU":[function(importModule,currentModule,moduleExports){
  // Start of the cloned big-integer library code.
  var bigNumberFactory=function(inputNumber){
   "use strict";
   // Base for digit arrays (10^7), chosen for efficient JavaScript number handling.
   var digitBase=10000000.0,
    // Length of each digit chunk when representing large numbers as arrays.
    chunkLength=7,
    // Maximum safe integer value in JavaScript (2^53), plus one.
    maxJsSafeInteger=9007199254740992,
    // Digit array representation of maxJsSafeInteger for comparisons.
    maxJsSafeIntegerDigits=numberToDigitArray(maxJsSafeInteger),
    // String containing digits for various bases (0-9, a-z).
    baseDigitsString="0123456789abcdefghijklmnopqrstuvwxyz",
    // Flag to check if native BigInt support is available in the environment.
    hasNativeBigInt="function"==typeof BigInt;

   // Main factory function to create a BigNumber instance.
   function createBigNumber(inputVal,baseVal,isStrict,isCaseSensitive){
    // If no input value, return the zero BigNumber.
    if(void 0===inputVal)
     return createBigNumber.zeroValue;
    // If a base is specified and it's not default base 10 or strict parsing is requested,
    // parse the input string from that base.
    if(void 0!==baseVal&&(10!=+baseVal||isStrict))
     return parseFromBaseString(inputVal,baseVal,isStrict,isCaseSensitive);
    // Otherwise, normalize the input to a BigNumber object.
    return normalizeInputToBigNumber(inputVal)
   }

   // Constructor for BigNumber instances that exceed JavaScript's safe integer range.
   function LargeValueObject(digitArray,isNegative){
    this.value=digitArray;
    this.sign=isNegative;
    this.isSmall=!1 // Explicitly mark as not a small number.
   }

   // Constructor for BigNumber instances that fit within JavaScript's safe integer range.
   function SmallValueObject(numericValue){
    this.value=numericValue;
    this.sign=numericValue<0;
    this.isSmall=!0 // Explicitly mark as a small number.
   }

   // Constructor for BigNumber instances that use native BigInt.
   function NativeBigIntWrapper(bigIntValue){
    this.value=bigIntValue
   }

   // Utility function to check if a numeric value is within JavaScript's safe integer limits.
   function isWithinSmallRange(numToCheck){
    return -maxJsSafeInteger<numToCheck&&numToCheck<maxJsSafeInteger
   }

   // Converts a standard JavaScript number into an array of digits based on `digitBase`.
   function numberToDigitArray(numToConvert){
    return numToConvert<10000000.0 // 1e7
    ?[numToConvert]:numToConvert<100000000000000.0 // 1e14
    ?[numToConvert%10000000.0,Math.floor(numToConvert/10000000.0)]:[numToConvert%10000000.0,Math.floor(numToConvert/10000000.0)%10000000.0,Math.floor(numToConvert/100000000000000.0)]
   }

   // Cleans and normalizes a digit array. If it represents a small number, converts it to a plain number.
   function cleanDigitArray(digitArr){
    trimLeadingZeros(digitArr);
    var arrLength=digitArr.length;
    // If the array is short and its value is within the safe integer range, convert to a number.
    if(arrLength<4&&compareDigitArrays(digitArr,maxJsSafeIntegerDigits)<0)
     switch(arrLength){
     case 0:
      return 0;
     case 1:
      return digitArr[0];
     case 2:
      return digitArr[0]+digitArr[1]*digitBase;
     default:
      return digitArr[0]+(digitArr[1]+digitArr[2]*digitBase)*digitBase
     }
    return digitArr
   }

   // Removes trailing zero digits from a digit array (representing the most significant parts).
   function trimLeadingZeros(digitArray){
    for(var idx=digitArray.length;0===digitArray[--idx];)
     digitArray.length=idx+1
   }

   // Creates a new array filled with zeros of a specified size.
   function createZeroArray(arraySize){
    for(var zeroArray=new Array(arraySize),idx=-1;++idx<arraySize;)
     zeroArray[idx]=0;
    return zeroArray
   }

   // Rounds a number to the nearest integer. Uses floor for positive, ceil for negative.
   function roundToInteger(numToRound){
    return numToRound>0?Math.floor(numToRound):Math.ceil(numToRound)
   }

   // Adds two digit arrays, assuming the first array is at least as long as the second.
   function addDigitArrays(firstArray,secondArray){
    var currentDigit,
     carryOver,
     lenFirst=firstArray.length,
     lenSecond=secondArray.length,
     resultArray=new Array(lenFirst),
     currentCarry=0,
     baseValue=digitBase;
    for(carryOver=0;carryOver<lenSecond;carryOver++)
     currentCarry=(currentDigit=firstArray[carryOver]+secondArray[carryOver]+currentCarry)>=baseValue?1:0,resultArray[carryOver]=currentDigit-currentCarry*baseValue;
    for(;carryOver<lenFirst;)
     currentCarry=(currentDigit=firstArray[carryOver]+currentCarry)===baseValue?1:0,resultArray[carryOver++]=currentDigit-currentCarry*baseValue;
    return currentCarry>0&&resultArray.push(currentCarry),resultArray
   }

   // Adds two digit arrays, handling cases where their lengths might differ.
   function addTwoDigitArrays(arr1,arr2){
    return arr1.length>=arr2.length?addDigitArrays(arr1,arr2):addDigitArrays(arr2,arr1)
   }

   // Adds a small JavaScript number (positive or negative) to a digit array.
   function addDigitArrayAndSmall(digitArr,smallNum){
    var currentDigit,
     carry,
     len=digitArr.length,
     result=new Array(len),
     base=digitBase;
    for(carry=0;carry<len;carry++)
     currentDigit=digitArr[carry]-base+smallNum,smallNum=Math.floor(currentDigit/base),result[carry]=currentDigit-smallNum*base,smallNum+=1;
    for(;smallNum>0;)
     result[len++]=smallNum%base,smallNum=Math.floor(smallNum/base);
    return result
   }

   // Subtracts one digit array from another. Assumes firstArr >= secondArr in magnitude.
   function subtractDigitArrays(firstArr,secondArr){
    var currentVal,
     borrowVal,
     lenFirst=firstArr.length,
     resultArr=new Array(lenFirst),
     currentBorrow=0,
     baseVal=digitBase;
    for(currentVal=0;currentVal<secondArr.length;currentVal++)
     (borrowVal=firstArr[currentVal]-currentBorrow-secondArr[currentVal])<0?(borrowVal+=baseVal,currentBorrow=1):currentBorrow=0,resultArr[currentVal]=borrowVal;
    for(currentVal=secondArr.length;currentVal<lenFirst;currentVal++){
     if(!((borrowVal=firstArr[currentVal]-currentBorrow)<0)){
      resultArr[currentVal++]=borrowVal;
      break
     }
     borrowVal+=baseVal,resultArr[currentVal]=borrowVal
    }
    for(;currentVal<lenFirst;currentVal++)
     resultArr[currentVal]=firstArr[currentVal];
    return trimLeadingZeros(resultArr),resultArr
   }

   // Subtracts a small JavaScript number from a digit array, handling sign inversion if result is negative.
   function subtractDigitArrayAndSmall(digitArr,smallNum,isNegative){
    var currentDigit,
     borrow,
     len=digitArr.length,
     result=new Array(len),
     offset=-smallNum,
     base=digitBase;
    for(currentDigit=0;currentDigit<len;currentDigit++)
     borrow=digitArr[currentDigit]+offset,offset=Math.floor(borrow/base),borrow%=base,result[currentDigit]=borrow<0?borrow+base:borrow;
    return result=cleanDigitArray(result),"number"==typeof result?(isNegative&&(result=-result),new SmallValueObject(result)):new LargeValueObject(result,isNegative)
   }

   // Multiplies two digit arrays using a standard algorithm.
   function multiplyDigitArrays(firstDigits,secondDigits){
    var currentProduct,
     carry,
     lenFirst=firstDigits.length,
     lenSecond=secondDigits.length,
     resultDigits=createZeroArray(lenFirst+lenSecond),
     base=digitBase;
    for(currentProduct=0;currentProduct<lenFirst;++currentProduct){
     carry=firstDigits[currentProduct];
     for(var j=0;j<lenSecond;++j)
      currentProduct=carry*secondDigits[j]+resultDigits[currentProduct+j],carry=Math.floor(currentProduct/base),resultDigits[currentProduct+j]=currentProduct-carry*base,resultDigits[currentProduct+j+1]+=carry
    }
    return trimLeadingZeros(resultDigits),resultDigits
   }