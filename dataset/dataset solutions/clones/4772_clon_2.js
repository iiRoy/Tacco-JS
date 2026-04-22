exportObject.value=function(sourceModules){
 // This object caches loaded modules by their identifier.
 var cachedPackages={};

 /**
  * Loads a module from the sourceModules map.
  * @param {string|number} packageIdentifier The ID of the module to load.
  * @returns {object} The exports of the requested module.
  */
 function importPackage(packageIdentifier){
  // Check if the module is already in the cache.
  if(cachedPackages[packageIdentifier]) return cachedPackages[packageIdentifier].exports;

  // If not, create a new entry for the module in the cache.
  var packageEntry=cachedPackages[packageIdentifier]={
   id:packageIdentifier,
   isLoaded:false,
   exports:{}
  };

  // Execute the module function, passing its exports object and the loader itself.
  sourceModules[packageIdentifier].call(packageEntry.exports,packageEntry,packageEntry.exports,importPackage);

  // Mark the module as loaded.
  packageEntry.isLoaded=true;

  // Return the module's exports.
  return packageEntry.exports;
 }

 // Attach the module definitions to the loader itself.
 importPackage.moduleDefinitions=sourceModules;

 // Attach the module cache to the loader.
 importPackage.moduleCache=cachedPackages;

 /**
  * Defines a getter for a property on an object.
  * Used for Webpack's module exports.
  * @param {object} targetObject The object on which to define the property.
  * @param {string} propertyName The name of the property to define.
  * @param {Function} getterFunc The getter function for the property.
  */
 importPackage.definePropertyGetter=function(targetObject,propertyName,getterFunc){
  // Only define if the property doesn't already exist.
  if(!importPackage.hasOwnProp(targetObject,propertyName)){
   Object.defineProperty(targetObject,propertyName,{
    enumerable:true, // Make it enumerable so it shows up in loops.
    get:getterFunc // Assign the getter function.
   });
  }
 };

 /**
  * Marks an object as an ES Module.
  * @param {object} targetObject The object to mark as an ES module.
  */
 importPackage.markAsEsModule=function(targetObject){
  // If Symbol and Symbol.toStringTag are available, set the toStringTag.
  if(typeof Symbol!=="undefined"&&Symbol.toStringTag){
   Object.defineProperty(targetObject,Symbol.toStringTag,{value:"Module"});
  }
  // Define __esModule property to true.
  Object.defineProperty(targetObject,"__esModule",{value:true});
 };

 /**
  * Retrieves a module's exports, handling different import modes.
  * @param {any} value The module or its ID.
  * @param {number} mode The import mode bitmask.
  * @returns {any} The module's exports.
  */
 importPackage.getModuleExports=function(value,mode){
  // Bitmask 1: If value is a module ID, load it.
  if(1&mode&&(value=importPackage(value)));
  // Bitmask 8: Return value as is.
  if(8&mode) return value;
  // Bitmask 4: If value is an object and an ES module, return it.
  if(4&mode&&typeof value==="object"&&value&&value.__esModule) return value;

  // Create a default object for non-ES modules.
  var defaultExportObj=Object.create(null);
  importPackage.markAsEsModule(defaultExportObj); // Mark it as an ES module.
  // Set the 'default' export to the value.
  Object.defineProperty(defaultExportObj,"default",{enumerable:true,value:value});

  // Bitmask 2: If value is not a string, copy all its properties to the defaultExportObj.
  if(2&mode&&typeof value!=="string"){
   for(var propName in value){
    importPackage.definePropertyGetter(defaultExportObj,propName,(function(p){return value[p];}).bind(null,propName));
   }
  }
  return defaultExportObj;
 };

 /**
  * Helper for the default export.
  * @param {object} moduleExports The module exports object.
  * @returns {Function} A function that returns the default export.
  */
 importPackage.defaultExportGetter=function(moduleExports){
  var getterFunction=moduleExports&&moduleExports.__esModule?function(){return moduleExports.default;}:function(){return moduleExports;};
  importPackage.definePropertyGetter(getterFunction,"a",getterFunction); // Define 'a' property as the getter itself.
  return getterFunction;
 };

 /**
  * Checks if an object has a specific property.
  * @param {object} obj The object to check.
  * @param {string} prop The property name.
  * @returns {boolean} True if the object has the property, false otherwise.
  */
 importPackage.hasOwnProp=function(obj,prop){
  return Object.prototype.hasOwnProperty.call(obj,prop);
 };

 // Public path for assets (empty in this case).
 importPackage.basePath="";

 // Set the entry point module (module 0) and immediately load it.
 return importPackage(importPackage.startupModule=0);
}([
 /* Module 0: Application Entry Point */
 function(appModule,appExports,appLoader){
  // Require module 1 (main calculation logic) and execute it with input from module 3 (fs).
  appLoader(1)(
   // Read content from standard input, decode as UTF-8, and split into lines.
   appLoader(3).obtainFileContents("/dev/stdin","UTF-8").split("\n")
  );
 },

 /* Module 1: Main Calculation Logic */
 function(calcModule,calcExports,calcLoader){
  /**
   * Safely destructures an array, handling non-array inputs or insufficient length.
   * @param {Array<any>} sourceList The array to destructure.
   * @param {number} elementCount The number of elements to extract.
   * @returns {Array<any>} An array containing the extracted elements.
   */
  function extractElements(sourceList,elementCount){
   // If it's already an array, return it.
   if(Array.isArray(sourceList)) return sourceList;

   // If not an array, attempt to iterate and collect elements.
   var collectedItems=[],
    isDone=true,
    hasError=false,
    errorObj=void 0; // undefined

   try{
    // Iterate over the sourceList using its iterator.
    for(var iterator=sourceList[Symbol.iterator]();!(isDone=(iterator.next()).done)&&(collectedItems.push(iterator.value),!elementCount||collectedItems.length!==elementCount);isDone=true);
   }catch(err){
    hasError=true;
    errorObj=err;
   }finally{
    try{
     // Ensure the iterator is closed if it wasn't done naturally.
     if(!isDone&&null!=iterator.return) iterator.return();
    }finally{
     // Re-throw any error caught during iteration.
     if(hasError) throw errorObj;
    }
   }
   // If we reach here, it means it's not an iterable or destructuring failed.
   return collectedItems;
  }

  // Import the LargeNumberClass (BigNumber.js) from module 2.
  var LargeNumberClass=calcLoader(2);

  /**
   * Processes an array of input lines to perform a specific calculation.
   * @param {Array<string>} textLines An array of strings, where each string is a line of input.
   */
  calcModule.exports=function(textLines){
   // Parse the first line to get N, M, K.
   // Split by space, convert to Number, then destructure.
   var configValues=extractElements(textLines[0].split(" ").map(function(strValue){return Number(strValue);}),3),
    numItems=configValues[0], // N: Number of items/segments.
    multiplierVal=configValues[1], // M: Multiplier for difference.
    thresholdVal=configValues[2]; // K: Threshold value.

   // Parse the second line to get the sequence of numbers.
   var numericSequence=textLines[1].split(" ").map(function(strValue){return Number(strValue);});

   // Initialize the accumulated total using the LargeNumberClass.
   var accumulatedTotal=new LargeNumberClass(0);

   // Loop through the numeric sequence, calculating differences and accumulating totals.
   for(var currentIdx=0;currentIdx<numItems-1;currentIdx++){
    var stepDifference=numericSequence[currentIdx+1]-numericSequence[currentIdx], // Calculate difference between adjacent numbers.
     scaledProduct=new LargeNumberClass(multiplierVal).multiplyBy(stepDifference); // M * difference using LargeNumber.

    // If the scaled product is greater than the threshold (K), add K to the total.
    // Otherwise, add the scaled product itself.
    accumulatedTotal=
     (1===scaledProduct.compareWith(thresholdVal))
      ?accumulatedTotal.addValue(thresholdVal)
      :accumulatedTotal.addValue(scaledProduct);
   }

   // Print the final accumulated total to the console.
   console.log(accumulatedTotal.toTextRepresentation());
  };
 },

 /* Module 2: BigNumber.js Library (Renamed extensively) */
 function(mathModule,mathExports,mathLoader){
  var BigNumberHandle; // Placeholder for the DecimalValue constructor.
  !function(DecimalValueScope){
   "use strict";

   var BigNumberFactory,
    numericRegex=/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i, // Regex for valid numeric strings.
    ceilingFunction=Math.ceil,
    floorFunction=Math.floor,
    errorPrefix="[DecimalValue Error] ",
    precisionWarning=errorPrefix+"Number primitive has more than 15 significant digits: ",
    maxChunkVal=1e14, // Maximum value for a coefficient chunk.
    chunkDigits=14, // Number of digits in a coefficient chunk.
    maxSafeInt=9007199254740991, // Max safe integer in JavaScript.
    powerOfTens=[1,10,100,1e3,1e4,1e5,1e6,1e7,1e8,1e9,1e10,1e11,1e12,1e13], // Powers of 10.
    baseChunk=1e7, // Base for internal calculations.
    maxPrecision=1e9; // Max precision setting.

   /**
    * Returns the integer part of a number, handling negative values correctly.
    * @param {number} val The number.
    * @returns {number} The integer part.
    */
   function getIntegerPart(val){
    var intPart=0|val;
    return val>0||val===intPart?intPart:intPart-1;
   }

   /**
    * Formats an array of coefficients into a single string representation.
    * @param {Array<number>} coeffArray The array of coefficients.
    * @returns {string} The formatted string.
    */
   function formatCoefficients(coeffArray){
    var currentItem,
     nextItem,
     idx=1,
     len=coeffArray.length,
     resultStr=coeffArray[0]+"";
    for(;idx<len;){
     for(currentItem=coeffArray[idx++]+"",nextItem=chunkDigits-currentItem.length;nextItem--;currentItem="0"+currentItem);
     resultStr+=currentItem;
    }
    // Trim trailing zeros.
    for(len=resultStr.length;48===resultStr.charCodeAt(--len););
    return resultStr.slice(0,len+1||1);
   }

   /**
    * Performs a comparison between two DecimalValue instances.
    * @param {DecimalValue} firstVal The first value.
    * @param {DecimalValue} secondVal The second value.
    * @returns {number} -1 if firstVal < secondVal, 0 if equal, 1 if firstVal > secondVal.
    */
   function performComparison(firstVal,secondVal){
    var firstCoeffs,
     secondCoeffs,
     firstSign=firstVal.s,
     secondSign=secondVal.s,
     firstExp=firstVal.e,
     secondExp=secondVal.e;

    // Handle NaN or Zero cases.
    if(!firstSign||!secondSign) return null;
    if(firstCoeffs=firstVal.c&&!firstVal.c[0],secondCoeffs=secondVal.c&&!secondVal.c[0],firstCoeffs||secondCoeffs){
     return firstCoeffs?secondCoeffs?0:-secondSign:firstSign;
    }

    // Handle different signs.
    if(firstSign!==secondSign) return firstSign;

    // If signs are the same, determine if negative.
    if(firstCoeffs=firstSign<0,secondCoeffs=firstExp===secondExp,!firstVal.c||!secondVal.c){
     return secondCoeffs?0:!firstVal.c^firstCoeffs?1:-1;
    }

    // If exponents are different, compare based on exponent.
    if(!secondCoeffs) return firstExp>secondExp^firstCoeffs?1:-1;

    // Compare coefficients chunk by chunk.
    for(secondSign=(firstExp=firstVal.c.length)<(secondExp=secondVal.c.length)?firstExp:secondExp,firstSign=0;firstSign<secondSign;firstSign++){
     if(firstVal.c[firstSign]!==secondVal.c[firstSign]) return firstVal.c[firstSign]>secondVal.c[firstSign]^firstCoeffs?1:-1;
    }
    // If one has more chunks, it's larger.
    return firstExp===secondExp?0:firstExp>secondExp^firstCoeffs?1:-1;
   }

   /**
    * Validates an argument against a numeric range and type.
    * @param {number} value The value to validate.
    * @param {number} min The minimum allowed value.
    * @param {number} max The maximum allowed value.
    * @param {string} [argName] The name of the argument for error messages.
    * @throws {Error} If validation fails.
    */
   function validateInputRange(value,min,max,argName){
    if(value<min||value>max||value!==floorFunction(value)){
     throw Error(errorPrefix+(argName||"Argument")+(typeof value==="number"?value<min||value>max?" out of range: ":" not an integer: ":" not a primitive number: ")+String(value));
    }
   }

   /**
    * Checks if a DecimalValue represents an odd integer.
    * @param {DecimalValue} val The value to check.
    * @returns {boolean} True if odd, false otherwise.
    */
   function isOddNumber(val){
    var lastCoeffIdx=val.c.length-1;
    return getIntegerPart(val.e/chunkDigits)===lastCoeffIdx&&val.c[lastCoeffIdx]%2!==0;
   }

   /**
    * Converts a number string to scientific notation.
    * @param {string} numStr The number string.
    * @param {number} exponent The exponent.
    * @returns {string} The scientific notation string.
    */
   function toScientificString(numStr,exponent){
    return (numStr.length>1?numStr.charAt(0)+"."+numStr.slice(1):numStr)+(exponent<0?"e":"e+")+exponent;
   }

   /**
    * Formats a number string to a fixed decimal or exponential format.
    * @param {string} numStr The number string.
    * @param {number} exponent The exponent.
    * @param {string} paddingChar The character to use for padding.
    * @returns {string} The formatted string.
    */
   function formatDecimalString(numStr,exponent,paddingChar){
    var leadingZeros,
     trailingZeros;

    // Pad with leading zeros if exponent is negative.
    if(exponent<0){
     for(leadingZeros=paddingChar+".";++exponent;leadingZeros+=paddingChar);
     numStr=leadingZeros+numStr;
    } else if(++exponent>(leadingZeros=numStr.length)){
     // Pad with trailing zeros if exponent is positive and string is too short.
     for(trailingZeros=paddingChar,exponent-=leadingZeros;--exponent;trailingZeros+=paddingChar);
     numStr+=trailingZeros;
    } else if(exponent<leadingZeros){
     // Insert decimal point if exponent is within string length.
     numStr=numStr.slice(0,exponent)+"."+numStr.slice(exponent);
    }
    return numStr;
   }

   /**
    * DecimalValue constructor.
    * @param {any} initialValue The initial value for the BigNumber.
    * @param {number} [base] The base of the initial value if it's a string.
    * @returns {DecimalValue} A new DecimalValue instance.
    */
   (BigNumberFactory=function DecimalValue(initialValue,base){
    var digit, // Current digit.
     alphaChar, // Current character in alphabet.
     isNum, // Is initialValue a number?
     len, // Length.
     idx, // Index.
     decimalPointIdx, // Index of decimal point.
     exponentIdx, // Index of 'e' for exponent.
     currentCoeff, // Current coefficient.
     sign, // Sign of the number.
     tempStr, // Temporary string.
     currentDecimalValue=this;

    if(!(currentDecimalValue instanceof DecimalValue)) return new DecimalValue(initialValue,base);

    // Handle cloning existing DecimalValue instances.
    if(null==base){
     if(initialValue&&true===initialValue._isDecimalValue){
      return (currentDecimalValue.s=initialValue.s,void(!initialValue.c||initialValue.e>MAX_EXPONENT?currentDecimalValue.c=currentDecimalValue.e=null:initialValue.e<MIN_EXPONENT?currentDecimalValue.c=[currentDecimalValue.e=0]:(currentDecimalValue.e=initialValue.e,currentDecimalValue.c=initialValue.c.slice())));
     }
     // Handle number primitives.
     if((isNum=typeof initialValue==="number")&&0*initialValue===0){
      if(currentDecimalValue.s=1/initialValue<0?(initialValue=-initialValue,-1):1,initialValue===~~initialValue){
       for(decimalPointIdx=0,currentCoeff=initialValue;currentCoeff>=10;currentCoeff/=10,decimalPointIdx++);
       return void(decimalPointIdx>MAX_EXPONENT?currentDecimalValue.c=currentDecimalValue.e=null:(currentDecimalValue.e=decimalPointIdx,currentDecimalValue.c=[initialValue]));
      }
      tempStr=String(initialValue);
     }else{
      // Handle string inputs for base 10.
      if(!numericRegex.test(tempStr=String(initialValue))) return handleInvalidInput(currentDecimalValue,tempStr,isNum);
      currentDecimalValue.s=45===tempStr.charCodeAt(0)?(tempStr=tempStr.slice(1),-1):1;
     }
     (decimalPointIdx=tempStr.indexOf("."))>-1&&(tempStr=tempStr.replace(".",""));
     (exponentIdx=tempStr.search(/e/i))>0?(decimalPointIdx<0&&(decimalPointIdx=exponentIdx),decimalPointIdx+=+tempStr.slice(exponentIdx+1),tempStr=tempStr.substring(0,exponentIdx)):decimalPointIdx<0&&(decimalPointIdx=tempStr.length);
    }else{
     // Handle custom base inputs.
     validateInputRange(base,2,CUSTOM_ALPHABET.length,"Base");
     if(10===base) return applyRounding(currentDecimalValue=new DecimalValue(initialValue),DEFAULT_DECIMALS+currentDecimalValue.e+1,ROUNDING_STRATEGY);
     if(tempStr=String(initialValue),isNum=typeof initialValue==="number"){
      if(0*initialValue!==0) return handleInvalidInput(currentDecimalValue,tempStr,isNum,base);
      if(currentDecimalValue.s=1/initialValue<0?(tempStr=tempStr.slice(1),-1):1,DecimalValue.DEBUG&&tempStr.replace(/^0\.0*|\./,"").length>15) throw Error(precisionWarning+initialValue);
     }else currentDecimalValue.s=45===tempStr.charCodeAt(0)?(tempStr=tempStr.slice(1),-1):1;

     // Validate characters against custom alphabet.
     for(digit=CUSTOM_ALPHABET.slice(0,base),decimalPointIdx=exponentIdx=0,len=tempStr.length;exponentIdx<len;exponentIdx++){
      if(digit.indexOf(alphaChar=tempStr.charAt(exponentIdx))<0){
       if("."==alphaChar){
        if(exponentIdx>decimalPointIdx){decimalPointIdx=len;continue;}
       }else if(!currentCoeff&&(tempStr==tempStr.toUpperCase()&&(tempStr=tempStr.toLowerCase())||tempStr==tempStr.toLowerCase()&&(tempStr=tempStr.toUpperCase()))){
        currentCoeff=true,exponentIdx=-1,decimalPointIdx=0;continue;
       }
       return handleInvalidInput(currentDecimalValue,String(initialValue),isNum,base);
      }
     }
     isNum=false;
     // Convert from custom base to base 10.
     (decimalPointIdx=(tempStr=convertToBase(tempStr,base,10,currentDecimalValue.s)).indexOf("."))>-1?tempStr=tempStr.replace(".",""):decimalPointIdx=tempStr.length;
    }

    // Trim leading zeros.
    for(exponentIdx=0;48===tempStr.charCodeAt(exponentIdx);exponentIdx++);
    // Trim trailing zeros.
    for(len=tempStr.length;48===tempStr.charCodeAt(--len););

    if(tempStr=tempStr.slice(exponentIdx,++len)){
     if(len-=exponentIdx,isNum&&DecimalValue.DEBUG&&len>15&&(initialValue>maxSafeInt||initialValue!==floorFunction(initialValue))) throw Error(precisionWarning+currentDecimalValue.s*initialValue);
     if((decimalPointIdx=decimalPointIdx-exponentIdx-1)>MAX_EXPONENT) currentDecimalValue.c=currentDecimalValue.e=null;
     else if(decimalPointIdx<MIN_EXPONENT) currentDecimalValue.c=[currentDecimalValue.e=0];
     else{
      if(currentDecimalValue.e=decimalPointIdx,currentDecimalValue.c=[],exponentIdx=(decimalPointIdx+1)%chunkDigits,decimalPointIdx<0&&(exponentIdx+=chunkDigits),exponentIdx<len){
       for(exponentIdx&&currentDecimalValue.c.push(+tempStr.slice(0,exponentIdx)),len-=chunkDigits;exponentIdx<len;)currentDecimalValue.c.push(+tempStr.slice(exponentIdx,exponentIdx+=chunkDigits));
       exponentIdx=chunkDigits-(tempStr=tempStr.slice(exponentIdx)).length;
      }else exponentIdx-=len;
      for(;exponentIdx--;tempStr+="0");
      currentDecimalValue.c.push(+tempStr);
     }
    }else currentDecimalValue.c=[currentDecimalValue.e=0];
   }).prototype=DecimalProto={
    constructor:BigNumberFactory,
    toString:null,
    valueOf:null
   };

   // Constants for common values.
   var CONST_ONE=new BigNumberFactory(1);

   // Default configuration settings.
   var DEFAULT_DECIMALS=20, // Default number of decimal places.
    ROUNDING_STRATEGY=4, // Default rounding mode (ROUND_HALF_UP).
    EXP_FORMAT_LOWER=-7, // Exponential notation lower threshold.
    EXP_FORMAT_UPPER=21, // Exponential notation upper threshold.
    MIN_EXPONENT=-1e7, // Minimum exponent value.
    MAX_EXPONENT=1e7, // Maximum exponent value.
    USE_CRYPTO_RANDOM=!1, // Use crypto random by default.
    MODULO_BEHAVIOR=1, // Default modulo mode (ROUND_DOWN).
    POWER_PRECISION=0, // Precision for power operations.
    DISPLAY_FORMAT={prefix:"",groupSize:3,secondaryGroupSize:0,groupSeparator:",",decimalSeparator:".",fractionGroupSize:0,fractionGroupSeparator:" ",suffix:""}, // Default display format.
    CUSTOM_ALPHABET="0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for base conversions.

   /**
    * Handles invalid input by setting the DecimalValue to NaN or null.
    * @param {DecimalValue} instance The DecimalValue instance.
    * @param {string} inputStr The input string.
    * @param {boolean} isNumber Is the input a number primitive?
    * @param {number} [base] The base if provided.
    */
   function handleInvalidInput(instance,inputStr,isNumber,base){
    var processedStr=isNumber?inputStr:inputStr.replace(whitespaceTrimRegex,"");
    if(specialValueRegex.test(processedStr)){
     instance.s=isNaN(processedStr)?null:processedStr<0?-1:1;
    }else{
     if(!isNumber&&(processedStr=processedStr.replace(basePrefixRegex,function(match,signChar,baseType){
      var detectedBase="x"===(baseType=baseType.toLowerCase())?16:"b"===baseType?2:8;
      return base&&base!==detectedBase?match:signChar;
     }),base&&(detectedBase=base,processedStr=processedStr.replace(trailingDotRegex,"$1").replace(leadingDotRegex,"0.$1")),inputStr!==processedStr)) return new BigNumberFactory(processedStr,detectedBase);
     if(DecimalValue.DEBUG) throw Error(errorPrefix+"Not a"+(base?" base "+base:"")+" number: "+inputStr);
     instance.s=null;
    }
    instance.c=instance.e=null;
   }

   /**
    * Formats a DecimalValue to a string based on specific parameters.
    * @param {DecimalValue} val The DecimalValue instance.
    * @param {number} [decimalPlaces] Number of decimal places.
    * @param {number} [roundingMode] Rounding mode.
    * @param {number} [formatType] 1 for exponential, 2 for precision.
    * @returns {string} The formatted string.
    */
   function convertValueToString(val,decimalPlaces,roundingMode,formatType){
    var coeffLength,
     exponentVal,
     formattedStr,
     strLen;

    if(null==roundingMode?roundingMode=ROUNDING_STRATEGY:validateInputRange(roundingMode,0,8),!val.c) return val.toString();

    if(coeffLength=val.c[0],exponentVal=val.e,null==decimalPlaces){
     formattedStr=formatCoefficients(val.c);
     formattedStr=1===formatType||2===formatType&&(exponentVal<=EXP_FORMAT_LOWER||exponentVal>=EXP_FORMAT_UPPER)?toScientificString(formattedStr,exponentVal):formatDecimalString(formattedStr,exponentVal,"0");
    }else{
     // Apply rounding if decimalPlaces is provided.
     coeffLength=(val=applyRounding(new BigNumberFactory(val),decimalPlaces,roundingMode)).e;
     strLen=(formattedStr=formatCoefficients(val.c)).length;
     // Exponential format.
     if(1===formatType||2===formatType&&(decimalPlaces<=coeffLength||coeffLength<=EXP_FORMAT_LOWER)){
      for(;strLen<decimalPlaces;formattedStr+="0",strLen++);
      formattedStr=toScientificString(formattedStr,coeffLength);
     }else if(decimalPlaces-=coeffLength,formattedStr=formatDecimalString(formattedStr,coeffLength,"0"),coeffLength+1>strLen){
      if(--decimalPlaces>0) for(formattedStr+=".";decimalPlaces--;formattedStr+="0");
     }else if((decimalPlaces+=coeffLength-strLen)>0) for(coeffLength+1===strLen&&(formattedStr+=".");decimalPlaces--;formattedStr+="0");
    }
    return val.s<0&&coeffLength?"-"+formattedStr:formattedStr;
   }

   /**
    * Helper for `max` and `min` operations. Finds the maximum or minimum in an array of DecimalValues.
    * @param {Array<DecimalValue>} valueArray The array of DecimalValues.
    * @param {Function} comparator The comparison function (e.g., DecimalProto.lt for max, gt for min).
    * @returns {DecimalValue} The maximum or minimum value.
    */
   function processArrayForMinMax(valueArray,comparator){
    for(var idx=1,resultVal=new BigNumberFactory(valueArray[0]);idx<valueArray.length;idx++){
     if(!(nextVal=new BigNumberFactory(valueArray[idx])).s){
      resultVal=nextVal;
      break;
     }
     comparator.call(resultVal,nextVal)&&(resultVal=nextVal);
    }
    return resultVal;
   }

   /**
    * Sets the coefficients and exponent for a DecimalValue instance.
    * @param {DecimalValue} instance The DecimalValue instance.
    * @param {Array<number>} coefficients The array of coefficients.
    * @param {number} exponent The exponent.
    * @returns {DecimalValue} The modified instance.
    */
   function setNumericValue(instance,coefficients,exponent){
    for(var idx=1,len=coefficients.length;!coefficients[--len];coefficients.pop());
    for(len=coefficients[0];len>=10;len/=10,idx++);
    return (exponent=(idx+exponent*chunkDigits-1)>MAX_EXPONENT?instance.c=instance.e=null:exponent<MIN_EXPONENT?instance.c=[instance.e=0]:(instance.e=exponent,instance.c=coefficients),instance);
   }

   /**
    * Applies rounding to a DecimalValue based on precision and mode.
    * @param {DecimalValue} instance The DecimalValue to round.
    * @param {number} precision The precision (number of significant digits or decimal places).
    * @param {number} roundingMode The rounding strategy.
    * @param {boolean} [isPower] Internal flag for power function.
    * @returns {DecimalValue} The rounded DecimalValue.
    */
   function applyRounding(instance,precision,roundingMode,isPower){
    var coeffLength,
     idx,
     coeffVal,
     divisor,
     multiplier,
     remainder,
     coeffArray=instance.c,
     powerOfTensLocal=powerOfTens; // Use local alias for powers of 10.

    if(coeffArray){
     // Label for breaking out of specific rounding logic.
     roundingProcess: {
      for(coeffLength=1,coeffVal=coeffArray[0];coeffVal>=10;coeffVal/=10,coeffLength++);

      // Calculate how many digits to shift.
      if((idx=precision-coeffLength)<0){
       idx+=chunkDigits;
       coeffVal=precision;
       divisor=(multiplier=coeffArray[remainder=0])/powerOfTensLocal[coeffLength-coeffVal-1]%10|0;
      } else if((remainder=floorFunction((idx+1)/chunkDigits))>=coeffArray.length){
       // If precision is beyond existing coefficients.
       if(!isPower) break roundingProcess;
       for(;coeffArray.length<=remainder;coeffArray.push(0));
       multiplier=divisor=0;
       coeffLength=1;
       coeffVal=(idx%=chunkDigits)-chunkDigits+1;
      } else{
       for(multiplier=coeffVal=coeffArray[remainder],coeffLength=1;coeffVal>=10;coeffVal/=10,coeffLength++);
       divisor=(coeffVal=(idx%=chunkDigits)-chunkDigits+coeffLength)<0?0:multiplier/powerOfTensLocal[coeffLength-coeffVal-1]%10|0;
      }

      // Determine if rounding up is necessary.
      isPower=isPower||precision<0||null!=coeffArray[remainder+1]||(coeffVal<0?multiplier:multiplier%powerOfTensLocal[coeffLength-coeffVal-1]);
      isPower=roundingMode<4?(divisor||isPower)&&(0===roundingMode||roundingMode===(instance.s<0?3:2)):divisor>5||5===divisor&&(4===roundingMode||isPower||6===roundingMode&&(idx>0?coeffVal>0?multiplier/powerOfTensLocal[coeffLength-coeffVal]:0:coeffArray[remainder-1])%10&1||roundingMode===(instance.s<0?8:7));

      if(precision<1||!coeffArray[0]){
       coeffArray.length=0;
       isPower?(precision-=instance.e+1,coeffArray[0]=powerOfTensLocal[(chunkDigits-precision%chunkDigits)%chunkDigits],instance.e=-precision||0):coeffArray[0]=instance.e=0;
       return instance;
      }

      // Perform rounding.
      if(0===idx?(coeffArray.length=remainder,coeffLength=1,remainder--):(coeffArray.length=remainder+1,coeffLength=powerOfTensLocal[chunkDigits-idx],coeffArray[remainder]=coeffVal>0?floorFunction(multiplier/powerOfTensLocal[coeffLength-coeffVal]%powerOfTensLocal[coeffVal])*coeffLength:0),isPower){
       for(;;){
        if(0===remainder){
         for(idx=1,coeffVal=coeffArray[0];coeffVal>=10;coeffVal/=10,idx++);
         for(coeffVal=coeffArray[0]+=coeffLength,coeffLength=1;coeffVal>=10;coeffVal/=10,coeffLength++);
         idx!==coeffLength&&(instance.e++,coeffArray[0]===maxChunkVal&&(coeffArray[0]=1));
         break;
        }
        if(coeffArray[remainder]+=coeffLength,coeffArray[remainder]!==maxChunkVal) break;
        coeffArray[remainder--]=0;
        coeffLength=1;
       }
      }
      // Trim trailing zeros in coefficients.
      for(idx=coeffArray.length;0===coeffArray[--idx];coeffArray.pop());
     }
     instance.e>MAX_EXPONENT?instance.c=instance.e=null:instance.e<MIN_EXPONENT&&(instance.c=[instance.e=0]);
    }
    return instance;
   }

   /**
    * Gets the string representation of a DecimalValue.
    * @param {DecimalValue} instance The DecimalValue instance.
    * @returns {string} The string representation.
    */
   function getValueString(instance){
    var resultStr,exponent;
    return null===instance.e?instance.toString():(resultStr=formatCoefficients(instance.c),resultStr=instance.e<=EXP_FORMAT_LOWER||instance.e>=EXP_FORMAT_UPPER?toScientificString(resultStr,instance.e):formatDecimalString(resultStr,instance.e,"0"),instance.s<0?"-"+resultStr:resultStr);
   }

   // Attach static properties and methods to the DecimalValue constructor.
   BigNumberFactory.createClone=DecimalValueScope; // Allows cloning the BigNumber factory.
   BigNumberFactory.ROUND_UP=0;
   BigNumberFactory.ROUND_DOWN=1;
   BigNumberFactory.ROUND_CEIL=2;
   BigNumberFactory.ROUND_FLOOR=3;
   BigNumberFactory.ROUND_HALF_UP=4;
   BigNumberFactory.ROUND_HALF_DOWN=5;
   BigNumberFactory.ROUND_HALF_EVEN=6;
   BigNumberFactory.ROUND_HALF_CEIL=7;
   BigNumberFactory.ROUND_HALF_FLOOR=8;
   BigNumberFactory.EUCLID=9;

   /**
    * Configures global settings for DecimalValue.
    * @param {object} settingsObj An object containing settings to update.
    * @returns {object} The current settings.
    */
   BigNumberFactory.configureSettings=BigNumberFactory.set=function(settingsObj){
    var settingName,settingValue;
    if(null!=settingsObj){
     if(typeof settingsObj!=="object") throw Error(errorPrefix+"Object expected: "+settingsObj);
     if(settingsObj.hasOwnProperty(settingName="DECIMAL_PLACES")&&(validateInputRange(settingValue=settingsObj[settingName],0,maxPrecision,settingName),DEFAULT_DECIMALS=settingValue));
     if(settingsObj.hasOwnProperty(settingName="ROUNDING_MODE")&&(validateInputRange(settingValue=settingsObj[settingName],0,8,settingName),ROUNDING_STRATEGY=settingValue));
     if(settingsObj.hasOwnProperty(settingName="EXPONENTIAL_AT")){
      if((settingValue=settingsObj[settingName])&&settingValue.pop?(validateInputRange(settingValue[0],-maxPrecision,0,settingName),validateInputRange(settingValue[1],0,maxPrecision,settingName),EXP_FORMAT_LOWER=settingValue[0],EXP_FORMAT_UPPER=settingValue[1]):(validateInputRange(settingValue,-maxPrecision,maxPrecision,settingName),EXP_FORMAT_LOWER=-(EXP_FORMAT_UPPER=settingValue<0?-settingValue:settingValue)));
     }
     if(settingsObj.hasOwnProperty(settingName="RANGE")){
      if((settingValue=settingsObj[settingName])&&settingValue.pop)validateInputRange(settingValue[0],-maxPrecision,-1,settingName),validateInputRange(settingValue[1],1,maxPrecision,settingName),MIN_EXPONENT=settingValue[0],MAX_EXPONENT=settingValue[1];
      else{
       if(validateInputRange(settingValue,-maxPrecision,maxPrecision,settingName),!settingValue) throw Error(errorPrefix+settingName+" cannot be zero: "+settingValue);
       MIN_EXPONENT=-(MAX_EXPONENT=settingValue<0?-settingValue:settingValue);
      }
     }
     if(settingsObj.hasOwnProperty(settingName="CRYPTO")){
      if((settingValue=settingsObj[settingName])!==!!settingValue) throw Error(errorPrefix+settingName+" not true or false: "+settingValue);
      if(settingValue){
       if(typeof crypto==="undefined"||!crypto||!crypto.getRandomValues&&!crypto.randomBytes) throw USE_CRYPTO_RANDOM=!settingValue,Error(errorPrefix+"crypto unavailable");
       USE_CRYPTO_RANDOM=settingValue;
      }else USE_CRYPTO_RANDOM=settingValue;
     }
     if(settingsObj.hasOwnProperty(settingName="MODULO_MODE")&&(validateInputRange(settingValue=settingsObj[settingName],0,9,settingName),MODULO_BEHAVIOR=settingValue));
     if(settingsObj.hasOwnProperty(settingName="POW_PRECISION")&&(validateInputRange(settingValue=settingsObj[settingName],0,maxPrecision,settingName),POWER_PRECISION=settingValue));
     if(settingsObj.hasOwnProperty(settingName="FORMAT")){
      if(typeof(settingValue=settingsObj[settingName])!=="object") throw Error(errorPrefix+settingName+" not an object: "+settingValue);
      DISPLAY_FORMAT=settingValue;
     }
     if(settingsObj.hasOwnProperty(settingName="ALPHABET")){
      if(typeof(settingValue=settingsObj[settingName])!=="string"||/^.$|[+-.\s]|(.).*\1/.test(settingValue)) throw Error(errorPrefix+settingName+" invalid: "+settingValue);
      CUSTOM_ALPHABET=settingValue;
     }
    }
    return {
     DECIMAL_PLACES:DEFAULT_DECIMALS,
     ROUNDING_MODE:ROUNDING_STRATEGY,
     EXPONENTIAL_AT:[EXP_FORMAT_LOWER,EXP_FORMAT_UPPER],
     RANGE:[MIN_EXPONENT,MAX_EXPONENT],
     CRYPTO:USE_CRYPTO_RANDOM,
     MODULO_MODE:MODULO_BEHAVIOR,
     POW_PRECISION:POWER_PRECISION,
     FORMAT:DISPLAY_FORMAT,
     ALPHABET:CUSTOM_ALPHABET
    };
   };

   /**
    * Checks if a given object is a DecimalValue instance.
    * @param {any} candidate The object to check.
    * @returns {boolean} True if it's a DecimalValue, false otherwise.
    */
   BigNumberFactory.checkIsDecimalValue=function(candidate){
    if(!candidate||true!==candidate._isDecimalValue) return false;
    if(!BigNumberFactory.DEBUG) return true;
    // Debug checks for internal consistency.
    var coeffArr,exponentVal,signVal;
    validateStructure:if("[object Array]"==={}.toString.call(coeffArr=candidate.c)){
     if((1===signVal||-1===signVal)&&(exponentVal=candidate.e)>=-maxPrecision&&exponentVal<=maxPrecision&&exponentVal===floorFunction(exponentVal)){
      if(0===coeffArr[0]){
       if(0===exponentVal&&1===coeffArr.length) return true;
       break validateStructure;
      }
      if((exponentVal=(exponentVal+1)%chunkDigits)<1&&(exponentVal+=chunkDigits),String(coeffArr[0]).length==exponentVal){
       for(exponentVal=0;exponentVal<coeffArr.length;exponentVal++) if((signVal=coeffArr[exponentVal])<0||signVal>=maxChunkVal||signVal!==floorFunction(signVal)) break validateStructure;
       if(0!==signVal) return true;
      }
     }else if(null===coeffArr&&null===exponentVal&&(null===signVal||1===signVal||-1===signVal)) return true;
     throw Error(errorPrefix+"Invalid DecimalValue: "+candidate);
    }
    return false;
   };

   BigNumberFactory.findMaximum=BigNumberFactory.max=function(){return processArrayForMinMax(arguments,DecimalProto.lt);};
   BigNumberFactory.findMinimum=BigNumberFactory.min=function(){return processArrayForMinMax(arguments,DecimalProto.gt);};

   // Random number generator helper.
   var cachedRandomFunc=(function(){return floorFunction(9007199254740992*Math.random())})
    ?function(){return floorFunction(9007199254740992*Math.random())}
    :function(){return 8388608*(1073741824*Math.random()|0)+(8388608*Math.random()|0)};

   /**
    * Generates a random DecimalValue.
    * @param {number} [decimalPlaces] The number of decimal places for the random number.
    * @returns {DecimalValue} A random DecimalValue.
    */
   BigNumberFactory.generateRandom=function(decimalPlaces){
    var randomResult, // Result from crypto or Math.random.
     currentIdx, // Loop index.
     coeffArr=[], // Coefficients array.
     targetChunks=new BigNumberFactory(CONST_ONE); // Placeholder.

    if(null==decimalPlaces?decimalPlaces=DEFAULT_DECIMALS:validateInputRange(decimalPlaces,0,maxPrecision),currentIdx=ceilingFunction(decimalPlaces/chunkDigits),USE_CRYPTO_RANDOM){
     if(crypto.getRandomValues){
      for(randomResult=crypto.getRandomValues(new Uint32Array(currentIdx*=2));currentIdx;){
       (targetChunks=131072*randomResult[currentIdx-2]+(randomResult[currentIdx-1]>>>11))>=9e15?
        (randomResult=crypto.getRandomValues(new Uint32Array(2)),randomResult[currentIdx-2]=randomResult[0],randomResult[currentIdx-1]=randomResult[1]):
        (coeffArr.push(targetChunks%1e14),currentIdx-=2);
      }
      currentIdx/=2;
     }else{
      if(!crypto.randomBytes) throw USE_CRYPTO_RANDOM=!1,Error(errorPrefix+"crypto unavailable");
      for(randomResult=crypto.randomBytes(currentIdx*=7);currentIdx;){
       (targetChunks=281474976710656*(31&randomResult[currentIdx-7])+1099511627776*randomResult[currentIdx-6]+4294967296*randomResult[currentIdx-5]+16777216*randomResult[currentIdx-4]+(randomResult[currentIdx-3]<<16)+(randomResult[currentIdx-2]<<8)+randomResult[currentIdx-1])>=9e15?
        crypto.randomBytes(7).copy(randomResult,currentIdx-7):
        (coeffArr.push(targetChunks%1e14),currentIdx-=7);
      }
      currentIdx/=7;
     }
    }
    if(!USE_CRYPTO_RANDOM) for(;currentIdx;) (targetChunks=cachedRandomFunc())<9e15&&(coeffArr[--currentIdx]=targetChunks%1e14);

    for(currentIdx=coeffArr.length-1,decimalPlaces%=chunkDigits,targetChunks=coeffArr[currentIdx];targetChunks&&decimalPlaces&&(targetChunks=powerOfTens[chunkDigits-decimalPlaces],coeffArr[currentIdx]=floorFunction(coeffArr[currentIdx]/targetChunks)*targetChunks););
    for(;0===coeffArr[currentIdx];coeffArr.pop(),currentIdx--);

    if(currentIdx<0) coeffArr=[randomResult=0];
    else{
     for(randomResult=-1;0===coeffArr[0];coeffArr.splice(0,1),randomResult-=chunkDigits);
     for(currentIdx=1,targetChunks=coeffArr[0];targetChunks>=10;targetChunks/=10,currentIdx++);
     currentIdx<chunkDigits&&(randomResult-=chunkDigits-currentIdx);
    }
    return targetChunks.e=randomResult,targetChunks.c=coeffArr,targetChunks;
   };

   /**
    * Calculates the sum of multiple DecimalValue instances.
    * @returns {DecimalValue} The sum.
    */
   BigNumberFactory.calculateSum=function(){
    for(var idx=1,args=arguments,sumResult=new BigNumberFactory(args[0]);idx<args.length;) sumResult=sumResult.addValue(args[idx++]);
    return sumResult;
   };

   // Helper functions for base conversion (internal to BigNumber.js)
   BigNumberHandle=function(){
    function convertToBase(numberString,inputBase,outputBase,useAlphabet){
     for(var i,j,digits=[0],power=0,numLen=numberString.length;power<numLen;){
      for(j=digits.length;j--;digits[j]*=inputBase);
      for(digits[0]+=useAlphabet.indexOf(numberString.charAt(power++)),i=0;i<digits.length;i++){
       digits[i]>outputBase-1&&(null==digits[i+1]&&(digits[i+1]=0),digits[i+1]+=digits[i]/outputBase|0,digits[i]%=outputBase);
      }
     }
     return digits.reverse();
    }
    return function(stringValue,inputBase,outputBase,signVal,useAlphabet){
     var decimalIdx,tempStr,precisionVal=DEFAULT_DECIMALS,roundingModeVal=ROUNDING_STRATEGY;
     for(decimalIdx=stringValue.indexOf(".");decimalIdx>=0&&(tempStr=POWER_PRECISION,POWER_PRECISION=0,stringValue=stringValue.replace(".",""),power=new BigNumberFactory(inputBase).powerOf(stringValue.length-decimalIdx),POWER_PRECISION=tempStr,power.c=convertToBase(formatCoefficients(power.c),10,outputBase,"0123456789"),power.e=power.c.length),tempStr=decimalIdx=(numberParts=convertToBase(stringValue,inputBase,outputBase,useAlphabet?(power=CUSTOM_ALPHABET,"0123456789"):(power="0123456789",CUSTOM_ALPHABET))).length;0==numberParts[--decimalIdx];numberParts.pop());
     if(!numberParts[0]) return power.charAt(0);
     if(decimalIdx<0?--tempStr:(power.c=numberParts,power.e=tempStr,power.s=signVal,numberParts=(power=performDivision(power,power,precisionVal,roundingModeVal,outputBase)).c,currentRemainder=power.r,tempStr=power.e),decimalIdx=numberParts[currentRemainder=tempStr+precisionVal+1],halfpoint=outputBase/2,currentRemainder=currentRemainder||halfpoint<0||null!=numberParts[currentRemainder+1],currentRemainder=roundingModeVal<4?(null!=decimalIdx||currentRemainder)&&(0===roundingModeVal||roundingModeVal===(power.s<0?3:2)):decimalIdx>halfpoint||decimalIdx==halfpoint&&(4===roundingModeVal||currentRemainder||6===roundingModeVal&&1&numberParts[currentRemainder-1]||roundingModeVal===(power.s<0?8:7)),tempStr<1||!numberParts[0]) stringValue=currentRemainder?formatDecimalString(power.charAt(1),-precisionVal,power.charAt(0)):power.charAt(0);
     else{
      if(numberParts.length=currentRemainder,currentRemainder) for(--outputBase;++numberParts[--currentRemainder]>outputBase;)numberParts[currentRemainder]=0,currentRemainder||(++tempStr,numberParts=[1].concat(numberParts));
      for(halfpoint=numberParts.length;!numberParts[--halfpoint];);
      for(decimalIdx=0,stringValue="";decimalIdx<=halfpoint;stringValue+=power.charAt(numberParts[decimalIdx++]));
      stringValue=formatDecimalString(stringValue,tempStr,power.charAt(0));
     }
     return stringValue;
    };
   }();

   // Division logic helper functions (internal to BigNumber.js)
   // e: multiplyCoeffs, r: compareCoeffs, n: subtractCoeffs
   var performDivision=function(){
    /**
     * Multiplies an array of coefficients by a single digit, handling carries.
     * @param {Array<number>} coeffArr The coefficients array.
     * @param {number} digit The single digit multiplier.
     * @param {number} base The base (maxChunkVal).
     * @returns {Array<number>} The new coefficients array.
     */
    function multiplyCoeffs(coeffArr,digit,base){
     var carry,
      product,
      coeff,
      idx=0,
      len=coeffArr.length,
      lowPart=digit%baseChunk,
      highPart=digit/baseChunk|0;
     for(coeffArr=coeffArr.slice();len--;){
      carry=((product=lowPart*(coeff=coeffArr[len]%baseChunk)+(coeff=highPart*coeff+(coeffArr[len]/baseChunk|0)*lowPart)%baseChunk*baseChunk+coeffArr[len])/base|0)+(coeff/baseChunk|0)+highPart*coeffArr[len]/baseChunk|0;
      coeffArr[len]=product%base;
     }
     return carry&&(coeffArr=[carry].concat(coeffArr)),coeffArr;
    }

    /**
     * Compares two coefficient arrays.
     * @param {Array<number>} arr1 The first array.
     * @param {Array<number>} arr2 The second array.
     * @param {number} len The length to compare.
     * @returns {number} -1 if arr1 < arr2, 0 if equal, 1 if arr1 > arr2.
     */
    function compareCoeffs(arr1,arr2,len){
     var idx,result;
     if(len!==len) result=len>len?1:-1;
     else for(idx=result=0;idx<len;idx++) if(arr1[idx]!==arr2[idx]){result=arr1[idx]>arr2[idx]?1:-1;break;}
     return result;
    }

    /**
     * Subtracts one coefficient array from another.
     * @param {Array<number>} minuend The array to subtract from.
     * @param {Array<number>} subtrahend The array to subtract.
     * @param {number} len The length to subtract.
     * @param {number} base The base (maxChunkVal).
     */
    function subtractCoeffs(minuend,subtrahend,len,base){
     for(var carry=0;len--;) minuend[len]-=carry,carry=minuend[len]<subtrahend[len]?1:0,minuend[len]=carry*base+minuend[len]-subtrahend[len];
     for(;!minuend[0]&&minuend.length>1;minuend.splice(0,1));
    }

    /**
     * Performs division of two DecimalValue instances.
     * @param {DecimalValue} dividend The dividend.
     * @param {DecimalValue} divisor The divisor.
     * @param {number} decimalPlaces The number of decimal places for the result.
     * @param {number} roundingMode The rounding mode.
     * @param {number} [base] The base for internal calculations.
     * @returns {DecimalValue} The result of the division.
     */
    return function(dividend,divisor,decimalPlaces,roundingMode,base){
     var signResult, // Sign of the result.
      coeffDividend, // Coefficients of dividend.
      coeffDivisor, // Coefficients of divisor.
      quotientCoeffs, // Coefficients of the quotient.
      lenDividend, // Length of dividend coeffs.
      lenDivisor, // Length of divisor coeffs.
      idx, // Loop index.
      numChunks, // Number of coefficient chunks.
      alignExp, // Exponent alignment.
      currentQuotient, // Current quotient digit.
      tempDividend, // Temporary dividend for subtraction.
      tempDivisor, // Temporary divisor for subtraction.
      dividendCoeffLen, // Length of dividend coeffs.
      divisorCoeffLen, // Length of divisor coeffs.
      tempCoeffs, // Temporary coefficients array.
      leadingDivisorDigit, // Leading digit of divisor.
      divisorHalfBase, // Divisor value half the base.
      remainderFlag; // Flag for remainder.

     // Handle NaN, Infinity, Zero cases.
     if(!(coeffDividend=dividend.c&&dividend.c[0])||!(coeffDivisor=divisor.c&&divisor.c[0])) return new BigNumberFactory(dividend.s&&divisor.s&&(coeffDividend?!coeffDivisor||coeffDividend[0]!==coeffDivisor[0]:coeffDivisor)?coeffDividend&&0===coeffDividend[0]||!coeffDivisor?0*signResult:signResult/0:NaN);

     signResult=dividend.s===divisor.s?1:-1;
     // Calculate initial exponent for the result.
     numChunks=decimalPlaces+(alignExp=dividend.e-divisor.e)+1;
     // If base is not provided, use default baseChunk.
     base||(base=maxChunkVal,alignExp=getIntegerPart(dividend.e/chunkDigits)-getIntegerPart(divisor.e/chunkDigits),numChunks=numChunks/chunkDigits|0);

     // Find the first differing coefficient chunk.
     for(idx=0;coeffDivisor[idx]===(coeffDividend[idx]||0);idx++);

     // Adjust exponent if divisor's leading digits are greater than dividend's.
     if(coeffDivisor[idx]>(coeffDividend[idx]||0)&&alignExp--);
     if(numChunks<0) quotientCoeffs=[1],remainderFlag=true; // If precision is negative, quotient is 1.
     else{
      // Prepare coefficient arrays for long division.
      for(tempCoeffs=(quotientCoeffs=new BigNumberFactory(signResult)).c=[],signResult=decimalPlaces+2,(divisorCoeffLen=coeffDivisor.length)<(dividendCoeffLen=coeffDividend.length)?(tempDividend=coeffDividend.slice(0,divisorCoeffLen),alignExp=divisorCoeffLen):(tempDividend=coeffDividend.slice(),alignExp=dividendCoeffLen);tempDividend.length<divisorCoeffLen;tempDividend.push(0));

      // Scale coefficients if leading divisor digit is small.
      if((currentQuotient=floorFunction(base/(coeffDivisor[0]+1)))>1){
       coeffDivisor=multiplyCoeffs(coeffDivisor,currentQuotient,base);
       coeffDividend=multiplyCoeffs(coeffDividend,currentQuotient,base);
       divisorCoeffLen=coeffDivisor.length;
       dividendCoeffLen=coeffDividend.length;
      }
      tempDivisor=coeffDivisor.slice(),tempDivisor=[0].concat(tempDivisor),leadingDivisorDigit=coeffDivisor[0],divisorHalfBase=coeffDivisor[1]>=base/2&&leadingDivisorDigit++;

      // Long division loop.
      do{
       if(currentQuotient=0,(lenDividend=compareCoeffs(coeffDivisor,tempDividend,divisorCoeffLen,dividendCoeffLen))<0){
        if(tempCoeffs=tempDividend[0],divisorCoeffLen!==dividendCoeffLen&&(tempCoeffs=tempCoeffs*base+(tempDividend[1]||0)),(currentQuotient=floorFunction(tempCoeffs/leadingDivisorDigit))>1){
         for(currentQuotient>=base&&(currentQuotient=base-1),remainderFlag=(numChunks=multiplyCoeffs(coeffDivisor,currentQuotient,base)).length,lenDividend=compareCoeffs(numChunks,tempDividend,remainderFlag,dividendCoeffLen);1===lenDividend;){
          currentQuotient--;
          subtractCoeffs(numChunks,divisorCoeffLen<remainderFlag?tempDivisor:coeffDivisor,remainderFlag,base);
          remainderFlag=numChunks.length;
          lenDividend=1;
         }
        }else 0===currentQuotient&&(lenDividend=currentQuotient=1),remainderFlag=(numChunks=coeffDivisor.slice()).length;
        if(remainderFlag<dividendCoeffLen&&(numChunks=[0].concat(numChunks)),subtractCoeffs(tempDividend,numChunks,dividendCoeffLen,base),dividendCoeffLen=tempDividend.length,-1===lenDividend) for(;compareCoeffs(coeffDivisor,tempDividend,divisorCoeffLen,dividendCoeffLen)<1;)currentQuotient++,subtractCoeffs(tempDividend,divisorCoeffLen<dividendCoeffLen?tempDivisor:coeffDivisor,dividendCoeffLen,base),dividendCoeffLen=tempDividend.length;
       }else 0===lenDividend&&(currentQuotient++,tempDividend=[0]);
       quotientCoeffs.push(currentQuotient);
       tempDividend[0]?tempDividend[dividendCoeffLen++]=coeffDividend[alignExp]||0:(tempDividend=[coeffDividend[alignExp]],dividendCoeffLen=1);
      }while((alignExp++<dividendCoeffLen||null!=tempDividend[0])&&signResult--);
      remainderFlag=null!=tempDividend[0];
      quotientCoeffs[0]||quotientCoeffs.splice(0,1); // Remove leading zero if present.
     }

     // Final rounding and exponent adjustment.
     if(base===maxChunkVal){
      for(idx=1,signResult=quotientCoeffs[0];signResult>=10;signResult/=10,idx++);
      applyRounding(quotientCoeffs,decimalPlaces+(quotientCoeffs.e=idx+alignExp*chunkDigits-1)+1,roundingMode,remainderFlag);
     }else quotientCoeffs.e=alignExp,quotientCoeffs.r=+remainderFlag;
     return quotientCoeffs;
    };
   }();

   // Regular expressions for parsing.
   var basePrefixRegex=/^(-?)0([xbo])(?=\w[\w.]*$)/i, // Hex, binary, octal prefix.
    trailingDotRegex=/^([^.]+)\.$/, // Number ending with a dot.
    leadingDotRegex=/^\.([^.]+)$/, // Number starting with a dot.
    specialValueRegex=/^-?(Infinity|NaN)$/, // Infinity or NaN.
    whitespaceTrimRegex=/^\s*\+(?=[\w.])|^\s+|\s+$/g; // Leading/trailing whitespace and plus sign.

   // Prototype methods for DecimalValue.
   DecimalProto.absoluteValue=DecimalProto.abs=function(){var clonedVal=new BigNumberFactory(this);return clonedVal.s<0&&(clonedVal.s=1),clonedVal;};
   DecimalProto.compareWith=function(otherValue,otherBase){return performComparison(this,new BigNumberFactory(otherValue,otherBase));};
   DecimalProto.getDecimalPlaces=DecimalProto.dp=function(decimalPlaces,roundingMode){
    var coeffArr,exponent,idx,result;
    if(null!=decimalPlaces) return validateInputRange(decimalPlaces,0,maxPrecision),null==roundingMode?roundingMode=ROUNDING_STRATEGY:validateInputRange(roundingMode,0,8),applyRounding(new BigNumberFactory(this),decimalPlaces+this.e+1,roundingMode);
    if(!(coeffArr=this.c)) return null;
    if(result=((idx=coeffArr.length-1)-getIntegerPart(this.e/chunkDigits))*chunkDigits,idx=coeffArr[idx]) for(;idx%10==0;idx/=10,result--);
    return result<0&&(result=0),result;
   };
   DecimalProto.divideBy=DecimalProto.div=function(otherValue,otherBase){return performDivision(this,new BigNumberFactory(otherValue,otherBase),DEFAULT_DECIMALS,ROUNDING_STRATEGY);};
   DecimalProto.integerDivideBy=DecimalProto.idiv=function(otherValue,otherBase){return performDivision(this,new BigNumberFactory(otherValue,otherBase),0,1);};
   DecimalProto.powerOf=DecimalProto.pow=function(exponentValue,moduloValue){
    var baseExponent,
     currentExponent,
     isModulo,
     powerValue,
     tempResult,
     isNegativeExponent,
     isOddResult,
     remainderExponent,
     currentDecimalValue=this;

    if((exponentValue=new BigNumberFactory(exponentValue)).c&&!exponentValue.isWholeNumber()) throw Error(errorPrefix+"Exponent not an integer: "+getValueString(exponentValue));
    if(null!=moduloValue&&(moduloValue=new BigNumberFactory(moduloValue)),isNegativeExponent=exponentValue.e>14,
     !currentDecimalValue.c||!currentDecimalValue.c[0]||1===currentDecimalValue.c[0]&&!currentDecimalValue.e&&1===currentDecimalValue.c.length||!exponentValue.c||!exponentValue.c[0]) return powerValue=new BigNumberFactory(Math.pow(+getValueString(currentDecimalValue),isNegativeExponent?2-isOddNumber(exponentValue):+getValueString(exponentValue))),moduloValue?powerValue.calculateModulo(moduloValue):powerValue;

    isModulo=exponentValue.s<0;
    if(moduloValue){
     if(moduloValue.c?!moduloValue.c[0]:!moduloValue.s) return new BigNumberFactory(NaN);
     (currentExponent=!isModulo&&currentDecimalValue.isWholeNumber()&&moduloValue.isWholeNumber())&&(currentDecimalValue=currentDecimalValue.calculateModulo(moduloValue));
    }else{
     if(exponentValue.e>9&&(currentDecimalValue.e>0||currentDecimalValue.e<-1||(0===currentDecimalValue.e?currentDecimalValue.c[0]>1||isNegativeExponent&&currentDecimalValue.c[1]>=24e7:currentDecimalValue.c[0]<8e13||isNegativeExponent&&currentDecimalValue.c[0]<=9999975e7))) return powerValue=currentDecimalValue.s<0&&isOddNumber(exponentValue)?-0:0,currentDecimalValue.e>-1&&(powerValue=1/powerValue),new BigNumberFactory(isModulo?1/powerValue:powerValue);
     POWER_PRECISION&&(powerValue=ceilingFunction(POWER_PRECISION/chunkDigits+2));
    }
    for(isNegativeExponent?(baseExponent=new BigNumberFactory(.5),isModulo&&(exponentValue.s=1),isOddResult=isOddNumber(exponentValue)):isOddResult=(powerValue=Math.abs(+getValueString(exponentValue)))%2,tempResult=new BigNumberFactory(CONST_ONE);;){
     if(isOddResult){
      if(!(tempResult=tempResult.multiplyBy(currentDecimalValue)).c) break;
      powerValue?tempResult.c.length>powerValue&&(tempResult.c.length=powerValue):currentExponent&&(tempResult=tempResult.calculateModulo(moduloValue));
     }
     if(powerValue){
      if(0===(powerValue=floorFunction(powerValue/2))) break;
      isOddResult=powerValue%2;
     }else if(applyRounding(exponentValue=exponentValue.multiplyBy(baseExponent),exponentValue.e+1,1),exponentValue.e>14)isOddResult=isOddNumber(exponentValue);
     else{
      if(0===(powerValue=+getValueString(exponentValue))) break;
      isOddResult=powerValue%2;
     }
     if(!(currentDecimalValue=currentDecimalValue.multiplyBy(currentDecimalValue)).c) break;
     powerValue?currentDecimalValue.c&&currentDecimalValue.c.length>powerValue&&(currentDecimalValue.c.length=powerValue):currentExponent&&(currentDecimalValue=currentDecimalValue.calculateModulo(moduloValue));
    }
    return currentExponent?tempResult:(isModulo&&(tempResult=CONST_ONE.divideBy(tempResult)),moduloValue?tempResult.calculateModulo(moduloValue):powerValue?applyRounding(tempResult,POWER_PRECISION,ROUNDING_STRATEGY,void 0):tempResult);
   };
   DecimalProto.getIntegerValue=function(roundingMode){var resultVal=new BigNumberFactory(this);return null==roundingMode?roundingMode=ROUNDING_STRATEGY:validateInputRange(roundingMode,0,8),applyRounding(resultVal,resultVal.e+1,roundingMode);};
   DecimalProto.isEqual=DecimalProto.eq=function(otherValue,otherBase){return 0===performComparison(this,new BigNumberFactory(otherValue,otherBase));};
   DecimalProto.isFiniteValue=function(){return!!this.c;};
   DecimalProto.isGreaterThan=DecimalProto.gt=function(otherValue,otherBase){return performComparison(this,new BigNumberFactory(otherValue,otherBase))>0;};
   DecimalProto.isGreaterOrEqualTo=DecimalProto.gte=function(otherValue,otherBase){return 1===(otherBase=performComparison(this,new BigNumberFactory(otherValue,otherBase)))||0===otherBase;};
   DecimalProto.isWholeNumber=function(){return!!this.c&&getIntegerPart(this.e/chunkDigits)>this.c.length-2;};
   DecimalProto.isLessThan=DecimalProto.lt=function(otherValue,otherBase){return performComparison(this,new BigNumberFactory(otherValue,otherBase))<0;};
   DecimalProto.isLessOrEqualTo=DecimalProto.lte=function(otherValue,otherBase){return-1===(otherBase=performComparison(this,new BigNumberFactory(otherValue,otherBase)))||0===otherBase;};
   DecimalProto.isNotANumber=function(){return!this.s;};
   DecimalProto.isNegativeValue=function(){return this.s<0;};
   DecimalProto.isPositiveValue=function(){return this.s>0;};
   DecimalProto.isZeroValue=function(){return!!this.c&&0===this.c[0];};
   DecimalProto.subtractValue=DecimalProto.minus=function(otherValue,otherBase){
    var sign, // Sign of this value.
     otherSign, // Sign of other value.
     expThis, // Exponent of this.
     expOther, // Exponent of other.
     coeffsThis, // Coefficients of this.
     coeffsOther, // Coefficients of other.
     lenThis, // Length of this coeffs.
     lenOther, // Length of other coeffs.
     idx; // Loop index.

    if(otherBase=(otherValue=new BigNumberFactory(otherValue,otherBase)).s,!(sign=this.s)||!otherBase) return new BigNumberFactory(NaN);
    if(sign!==otherBase) return otherValue.s=-otherBase,this.addValue(otherValue);

    expThis=this.e/chunkDigits,expOther=otherValue.e/chunkDigits,coeffsThis=this.c,coeffsOther=otherValue.c;

    if(!expThis||!expOther){
     if(!coeffsThis||!coeffsOther) return coeffsThis?(otherValue.s=-otherBase,otherValue):new BigNumberFactory(coeffsOther?this:NaN);
     if(!coeffsThis[0]||!coeffsOther[0]) return coeffsOther[0]?(otherValue.s=-otherBase,otherValue):new BigNumberFactory(coeffsThis[0]?this:3===ROUNDING_STRATEGY?-0:0);
    }

    expThis=getIntegerPart(expThis),expOther=getIntegerPart(expOther),coeffsThis=coeffsThis.slice();

    if(sign=expThis-expOther){
     for((otherSign=sign<0)?(sign=-sign,idx=coeffsThis):(expOther=expThis,idx=coeffsOther),idx.reverse(),otherBase=sign;otherBase--;idx.push(0));
     idx.reverse();
    }else{
     for(lenThis=(otherSign=(lenThis=coeffsThis.length)<(lenOther=coeffsOther.length))?lenThis:lenOther,sign=lenOther=0;lenOther<lenThis;lenOther++) if(coeffsThis[lenOther]!==coeffsOther[lenOther]){otherSign=coeffsThis[lenOther]<coeffsOther[lenOther];break;}
    }

    if(otherSign&&(idx=coeffsThis,coeffsThis=coeffsOther,coeffsOther=idx,otherValue.s=-otherValue.s),(lenOther=(lenThis=coeffsOther.length)-(idx=coeffsThis.length))>0) for(;lenOther--;coeffsThis[idx++]=0);
    for(lenOther=maxChunkVal-1;lenThis>sign;){
     if(coeffsThis[--lenThis]<coeffsOther[lenThis]){
      for(idx=lenThis;idx&&!coeffsThis[--idx];coeffsThis[idx]=lenOther);
      --coeffsThis[idx],coeffsThis[lenThis]+=maxChunkVal;
     }
     coeffsThis[lenThis]-=coeffsOther[lenThis];
    }
    for(;0===coeffsThis[0];coeffsThis.splice(0,1),--expOther);
    return coeffsThis[0]?setNumericValue(otherValue,coeffsThis,expOther):(otherValue.s=3===ROUNDING_STRATEGY?-1:1,otherValue.c=[otherValue.e=0],otherValue);
   };
   DecimalProto.calculateModulo=DecimalProto.mod=function(otherValue,otherBase){
    var tempVal,signVal,currentDecimalValue=this;
    return otherValue=new BigNumberFactory(otherValue,otherBase),!currentDecimalValue.c||!otherValue.s||otherValue.c&&!otherValue.c[0]?new BigNumberFactory(NaN):!otherValue.c||currentDecimalValue.c&&!currentDecimalValue.c[0]?new BigNumberFactory(currentDecimalValue):(9===MODULO_BEHAVIOR?(signVal=otherValue.s,otherValue.s=1,tempVal=performDivision(currentDecimalValue,otherValue,0,3),otherValue.s=signVal,tempVal.s*=signVal):tempVal=performDivision(currentDecimalValue,otherValue,0,MODULO_BEHAVIOR),(otherValue=currentDecimalValue.subtractValue(tempVal.multiplyBy(otherValue))).c[0]||1!==MODULO_BEHAVIOR||(otherValue.s=currentDecimalValue.s),otherValue);
   };
   DecimalProto.multiplyBy=DecimalProto.times=function(otherValue,otherBase){
    var carry, // Carry digit.
     product, // Product of two digits.
     idx, // Loop index.
     lenA, // Length of first operand coeffs.
     lenB, // Length of second operand coeffs.
     resultCoeffs, // Resulting coefficients array.
     multiplierA, // First operand coeffs.
     multiplierB, // Second operand coeffs.
     tempLen, // Temporary length.
     digitA, // Current digit from operand A.
     digitB, // Current digit from operand B.
     sumIdx, // Summation index.
     maxVal=maxChunkVal, // Max chunk value.
     baseDiv=baseChunk, // Base for division.
     currentDecimalValue=this,
     otherDecimalValue=(otherValue=new BigNumberFactory(otherValue,otherBase));

    if(!(multiplierA=currentDecimalValue.c&&currentDecimalValue.c[0])||!(multiplierB=otherDecimalValue.c&&otherDecimalValue.c[0])) return!currentDecimalValue.s||!otherDecimalValue.s||multiplierA&&!multiplierA[0]&&!multiplierB||multiplierB&&!multiplierB[0]&&!multiplierA?(otherDecimalValue.c=otherDecimalValue.e=otherDecimalValue.s=null):(otherDecimalValue.s*=currentDecimalValue.s,multiplierA&&multiplierB?(otherDecimalValue.c=[0],otherDecimalValue.e=0):otherDecimalValue.c=otherDecimalValue.e=null),otherDecimalValue;

    carry=getIntegerPart(currentDecimalValue.e/chunkDigits)+getIntegerPart(otherDecimalValue.e/chunkDigits);
    otherDecimalValue.s*=currentDecimalValue.s;

    // Ensure multiplierA is the longer array for optimization.
    (lenA=currentDecimalValue.c.length)<(lenB=otherDecimalValue.c.length)&&(tempLen=currentDecimalValue.c,currentDecimalValue.c=otherDecimalValue.c,otherDecimalValue.c=tempLen,idx=lenA,lenA=lenB,lenB=idx);

    for(idx=lenA+lenB,resultCoeffs=[];idx--;resultCoeffs.push(0));

    for(digitA=lenB;--digitA>=0;){
     for(carry=0,digitB=otherDecimalValue.c[digitA]%baseDiv,sumIdx=otherDecimalValue.c[digitA]/baseDiv|0,idx=digitA+(tempLen=lenA);idx>digitA;)
      carry=((product=digitB*(product=currentDecimalValue.c[--tempLen]%baseDiv)+(product=sumIdx*product+(digitA=currentDecimalValue.c[tempLen]/baseDiv|0)*digitB)%baseDiv*baseDiv+resultCoeffs[idx]+carry)/maxVal|0)+(product/baseDiv|0)+sumIdx*digitA,resultCoeffs[idx--]=product%maxVal;
     resultCoeffs[idx]=carry;
    }
    return carry?++carry:resultCoeffs.splice(0,1),setNumericValue(otherDecimalValue,resultCoeffs,carry);
   };
   DecimalProto.negateValue=function(){var clonedVal=new BigNumberFactory(this);return clonedVal.s=-clonedVal.s||null,clonedVal;};
   DecimalProto.addValue=DecimalProto.plus=function(otherValue,otherBase){
    var carry, // Carry digit.
     sign, // Sign of this value.
     otherSign, // Sign of other value.
     expThis, // Exponent of this.
     expOther, // Exponent of other.
     coeffsThis, // Coefficients of this.
     coeffsOther, // Coefficients of other.
     lenThis, // Length of this coeffs.
     lenOther, // Length of other coeffs.
     idx; // Loop index.

    if(otherBase=(otherValue=new BigNumberFactory(otherValue,otherBase)).s,!(sign=this.s)||!otherBase) return new BigNumberFactory(NaN);
    if(sign!==otherBase) return otherValue.s=-otherBase,this.subtractValue(otherValue);

    expThis=this.e/chunkDigits,expOther=otherValue.e/chunkDigits,coeffsThis=this.c,coeffsOther=otherValue.c;

    if(!expThis||!expOther){
     if(!coeffsThis||!coeffsOther) return new BigNumberFactory(sign/0);
     if(!coeffsThis[0]||!coeffsOther[0]) return coeffsOther[0]?otherValue:new BigNumberFactory(coeffsThis[0]?this:0*sign);
    }
    expThis=getIntegerPart(expThis),expOther=getIntegerPart(expOther),coeffsThis=coeffsThis.slice();

    if(sign=expThis-expOther){
     for(sign>0?(expOther=expThis,idx=coeffsOther):(sign=-sign,idx=coeffsThis),idx.reverse();sign--;idx.push(0));
     idx.reverse();
    }
    for((lenThis=coeffsThis.length)-(lenOther=coeffsOther.length)<0&&(idx=coeffsOther,coeffsOther=coeffsThis,coeffsThis=idx,lenOther=lenThis),idx=0;lenOther;){
     idx=(coeffsThis[--lenOther]=coeffsThis[lenOther]+coeffsOther[lenOther]+idx)/maxChunkVal|0;
     coeffsThis[lenOther]=maxChunkVal===coeffsThis[lenOther]?0:coeffsThis[lenOther]%maxChunkVal;
    }
    return idx&&(coeffsThis=[idx].concat(coeffsThis),++expOther),setNumericValue(otherValue,coeffsThis,expOther);
   };
   DecimalProto.getTotalPrecision=DecimalProto.sd=function(significantDigits,roundingMode){
    var coeffArr,len,idx,result;
    if(null!=significantDigits&&significantDigits!==!!significantDigits) return validateInputRange(significantDigits,1,maxPrecision),null==roundingMode?roundingMode=ROUNDING_STRATEGY:validateInputRange(roundingMode,0,8),applyRounding(new BigNumberFactory(this),significantDigits,roundingMode);
    if(!(coeffArr=this.c)) return null;
    if(len=(idx=coeffArr.length-1)*chunkDigits+1,idx=coeffArr[idx]){for(;idx%10==0;idx/=10,len--);for(idx=coeffArr[0];idx>=10;idx/=10,len++);}
    return significantDigits&&this.e+1>len&&(len=this.e+1),len;
   };
   DecimalProto.shiftExponent=function(exponentShift){return validateInputRange(exponentShift,-maxSafeInt,maxSafeInt),this.multiplyBy("1e"+exponentShift);};
   DecimalProto.getSquareRoot=DecimalProto.sqrt=function(){
    var rootResult,
     remainder,
     tempVal,
     precision,
     isIterating,
     currentVal=this,
     currentSign=currentVal.s,
     currentCoeffs=currentVal.c,
     currentExp=currentVal.e,
     calcPrecision=DEFAULT_DECIMALS+4,
     halfFactor=new BigNumberFactory("0.5");

    if(1!==currentSign||!currentCoeffs||!currentCoeffs[0]) return new BigNumberFactory(!currentSign||currentSign<0&&(!currentCoeffs||currentCoeffs[0])?NaN:currentCoeffs?currentVal:1/0);

    // Initial estimate for square root.
    if(0===(currentSign=Math.sqrt(+getValueString(currentVal)))||currentSign===1/0){
     ((rootResult=formatCoefficients(currentCoeffs)).length+currentExp)%2===0&&(rootResult+="0");
     currentSign=Math.sqrt(+rootResult);
     currentExp=getIntegerPart((currentExp+1)/2)-(currentExp<0||currentExp%2);
     tempVal=new BigNumberFactory(rootResult=currentSign===1/0?"1e"+currentExp:(rootResult=currentSign.toExponential()).slice(0,rootResult.indexOf("e")+1)+currentExp);
    }else tempVal=new BigNumberFactory(currentSign+"");

    if(tempVal.c[0]){
     for((currentSign=(currentExp=tempVal.e)+calcPrecision)<3&&(currentSign=0);;)
      if(isIterating=tempVal,tempVal=halfFactor.multiplyBy(isIterating.addValue(performDivision(currentVal,isIterating,calcPrecision,1))),formatCoefficients(isIterating.c).slice(0,currentSign)===(rootResult=formatCoefficients(tempVal.c)).slice(0,currentSign)){
       if(tempVal.e<currentExp&&--currentSign,"9999"!==(rootResult=rootResult.slice(currentSign-3,currentSign+1))&&(precision||"4999"!==rootResult)){
        +rootResult&&(+rootResult.slice(1)||"5"!==rootResult.charAt(0))||(applyRounding(tempVal,tempVal.e+DEFAULT_DECIMALS+2,1),remainderFlag=!tempVal.multiplyBy(tempVal).isEqual(currentVal));
        break;
       }
       if(!precision&&(applyRounding(isIterating,isIterating.e+DEFAULT_DECIMALS+2,0),isIterating.multiplyBy(isIterating).isEqual(currentVal))){
        tempVal=isIterating;
        break;
       }
       calcPrecision+=4,currentSign+=4,precision=1;
      }
    }
    return applyRounding(tempVal,tempVal.e+DEFAULT_DECIMALS+1,ROUNDING_STRATEGY,remainderFlag);
   };
   DecimalProto.toExponentialFormat=function(decimalPlaces,roundingMode){return null!=decimalPlaces&&(validateInputRange(decimalPlaces,0,maxPrecision),decimalPlaces++),convertValueToString(this,decimalPlaces,roundingMode,1);};
   DecimalProto.toFixedFormat=function(decimalPlaces,roundingMode){return null!=decimalPlaces&&(validateInputRange(decimalPlaces,0,maxPrecision),decimalPlaces=decimalPlaces+this.e+1),convertValueToString(this,decimalPlaces,roundingMode);};
   DecimalProto.toFormattedString=function(decimalPlaces,roundingMode,formatConfig){
    var formattedText,
     currentDecimalValue=this;
    if(null==formatConfig) null!=decimalPlaces&&roundingMode&&typeof roundingMode==="object"?(formatConfig=roundingMode,roundingMode=null):decimalPlaces&&typeof decimalPlaces==="object"?(formatConfig=decimalPlaces,decimalPlaces=roundingMode=null):formatConfig=DISPLAY_FORMAT;
    else if(typeof formatConfig!=="object") throw Error(errorPrefix+"Argument not an object: "+formatConfig);

    if(formattedText=currentDecimalValue.toFixedFormat(decimalPlaces,roundingMode),currentDecimalValue.c){
     var parts,
      groupSize=+formatConfig.groupSize,
      secondaryGroupSize=+formatConfig.secondaryGroupSize,
      groupSeparator=formatConfig.groupSeparator||"",
      integerPart,
      fractionPart,
      isNegative=currentDecimalValue.s<0,
      integerPartLength;

     parts=formattedText.split("."),integerPart=parts[0],fractionPart=parts[1];

     if(secondaryGroupSize&&(parts=groupSize,groupSize=secondaryGroupSize,secondaryGroupSize=parts,integerPartLength=isNegative?integerPart.slice(1).length:integerPart.length,integerPartLength-=parts),groupSize>0&&integerPartLength>0){
      for(parts=integerPartLength%groupSize||groupSize,integerPart=isNegative?integerPart.slice(0,1)+integerPart.slice(1,parts+1):integerPart.slice(0,parts);parts<integerPartLength;parts+=groupSize)integerPart+=groupSeparator+integerPart.slice(parts,parts+groupSize);
      secondaryGroupSize>0&&(integerPart+=groupSeparator+integerPart.slice(parts));
      isNegative&&(integerPart="-"+integerPart);
     }
     formattedText=fractionPart?integerPart+(formatConfig.decimalSeparator||"")+((secondaryGroupSize=+formatConfig.fractionGroupSize)?fractionPart.replace(new RegExp("\\d{"+secondaryGroupSize+"}\\B","g"),"$&"+(formatConfig.fractionGroupSeparator||"")):fractionPart):integerPart;
    }
    return (formatConfig.prefix||"")+formattedText+(formatConfig.suffix||"");
   };
   DecimalProto.toFractionRepresentation=function(maxDenominator){
    var num, // Numerator.
     den, // Denominator.
     prevNum, // Previous numerator.
     prevDen, // Previous denominator.
     quotient, // Quotient from division.
     currentVal=this,
     currentCoeffs=currentVal.c;

    if(null!=maxDenominator&&(!(num=new BigNumberFactory(maxDenominator)).isWholeNumber()&&(num.c||1!==num.s)||num.isLessThan(CONST_ONE))) throw Error(errorPrefix+"Argument "+(num.isWholeNumber()?"out of range: ":"not an integer: ")+getValueString(num));
    if(!currentCoeffs) return new BigNumberFactory(currentVal);

    // Initialize fractions.
    num=new BigNumberFactory(CONST_ONE),prevNum=new BigNumberFactory(CONST_ONE),den=new BigNumberFactory(CONST_ONE),prevDen=new BigNumberFactory(CONST_ONE);

    // Convert to string and get exponent.
    var strCoeffs=formatCoefficients(currentCoeffs);
    num.e=strCoeffs.length-currentVal.e-1; // Adjust exponent for fraction.
    num.c[0]=powerOfTens[(prevNum=num.e%chunkDigits)<0?chunkDigits+prevNum:prevNum];

    // Set maxDenominator or default.
    maxDenominator=!maxDenominator||num.compareWith(CONST_ONE)>0?num.e>0?num:prevNum:maxDenominator;

    // Save current range settings and set to infinite range.
    var savedMaxExp=MAX_EXPONENT,savedMinExp=MIN_EXPONENT;
    MAX_EXPONENT=1/0;

    // Convert to DecimalValue for calculations.
    num=new BigNumberFactory(strCoeffs);
    prevDen.c[0]=0; // Set initial previous denominator to zero.

    // Continued fraction algorithm.
    for(;quotient=performDivision(num,den,0,1),1!==(prevNum=prevNum.addValue(quotient.multiplyBy(den))).compareWith(maxDenominator);)
     den=prevNum,prevNum=den,num=prevDen.addValue(quotient.multiplyBy(prevNum)),prevDen=num,den=den.subtractValue(quotient.multiplyBy(prevNum)),num=prevNum;

    // Reset range settings.
    MAX_EXPONENT=savedMaxExp;
    MIN_EXPONENT=savedMinExp;

    // Determine which fraction is closer.
    quotient=performDivision(maxDenominator.subtractValue(den),num,0,1);
    num=prevDen.addValue(quotient.multiplyBy(prevNum));
    den=prevNum.addValue(quotient.multiplyBy(den));

    // Set signs and return the closer fraction.
    num.s=prevNum.s=currentVal.s;
    remainder=performDivision(prevNum,den,prevNum=num.e*2,ROUNDING_STRATEGY).subtractValue(currentVal).abs().compareWith(performDivision(num,prevDen,prevNum,ROUNDING_STRATEGY).subtractValue(currentVal).abs())<1?[prevNum,den]:[num,prevDen];
    return remainder;
   };
   DecimalProto.convertToNumber=function(){return+getValueString(this);};
   DecimalProto.toPrecisionFormat=function(significantDigits,roundingMode){return null!=significantDigits&&validateInputRange(significantDigits,1,maxPrecision),convertValueToString(this,significantDigits,roundingMode,2);};
   DecimalProto.convertToString=function(base){
    var resultStr, // Result string.
     currentDecimalValue=this,
     currentSign=currentDecimalValue.s,
     currentExp=currentDecimalValue.e;

    // Handle null exponent (NaN/Infinity).
    if(null===currentExp) return currentSign?(resultStr="Infinity",currentSign<0&&(resultStr="-"+resultStr)):resultStr="NaN",resultStr;

    // Base 10 conversion.
    if(null==base){
     resultStr=currentExp<=EXP_FORMAT_LOWER||currentExp>=EXP_FORMAT_UPPER?toScientificString(formatCoefficients(currentDecimalValue.c),currentExp):formatDecimalString(formatCoefficients(currentDecimalValue.c),currentExp,"0");
    }else if(10===base){
     // Convert to base 10 with rounding based on DEFAULT_DECIMALS.
     resultStr=formatDecimalString(formatCoefficients((currentDecimalValue=applyRounding(new BigNumberFactory(currentDecimalValue),DEFAULT_DECIMALS+currentExp+1,ROUNDING_STRATEGY)).c),currentDecimalValue.e,"0");
    }else{
     // Custom base conversion.
     validateInputRange(base,2,CUSTOM_ALPHABET.length,"Base");
     resultStr=BigNumberHandle(formatDecimalString(formatCoefficients(currentDecimalValue.c),currentExp,"0"),10,base,currentSign,!0);
    }
    return currentSign<0&&currentDecimalValue.c[0]&&(resultStr="-"+resultStr),resultStr;
   };
   DecimalProto.getValueOf=DecimalProto.toJsonRepresentation=function(){return getValueString(this);};
   DecimalProto._isDecimalValue=true;

   // If a base configuration is provided during initialization, apply it.
   null!=mathExports&&BigNumberFactory.configureSettings(mathExports);

   // Export the DecimalValue constructor.
   void 0===(BigNumberHandle=(function(){return BigNumberFactory}.call(mathExports,mathLoader,mathExports,mathModule)))||(mathModule.exports=BigNumberHandle);
  }(mathExports)}
 ,
 /* Module 3: File System (fs) Module Wrapper */
 function(fileModule,fileExports){
  // Simply export the Node.js 'fs' module.
  fileModule.exports=require("node:fs");
 }]);