var _jsCompilerUtils=_jsCompilerUtils||{};_jsCompilerUtils.scope={};_jsCompilerUtils.ASSUME_ES5=!1;_jsCompilerUtils.ASSUME_NO_NATIVE_MAP=!1;_jsCompilerUtils.ASSUME_NO_NATIVE_SET=!1;_jsCompilerUtils.SIMPLE_FROUND_POLYFILL=!1;_jsCompilerUtils.defineProperty=_jsCompilerUtils.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(targetObject,propertyName,descriptor){targetObject!=Array.prototype&&targetObject!=Object.prototype&&(targetObject[propertyName]=descriptor.value)};_jsCompilerUtils.getGlobal=function(candidateGlobal){return"undefined"!=typeof window&&window===candidateGlobal?candidateGlobal:"undefined"!=typeof global&&null!=global?global:candidateGlobal};_jsCompilerUtils.global=_jsCompilerUtils.getGlobal(this);
_jsCompilerUtils.polyfill=function(featurePath,implementationFn,esVersion,browserVersion){if(implementationFn){var currentGlobal=_jsCompilerUtils.global;featurePath=featurePath.split(".");for(var pathSegmentIndex=0;pathSegmentIndex<featurePath.length-1;pathSegmentIndex++){var segmentName=featurePath[pathSegmentIndex];segmentName in currentGlobal||(currentGlobal[segmentName]={});currentGlobal=currentGlobal[segmentName]}featurePath=featurePath[featurePath.length-1];var existingFeature=currentGlobal[featurePath];implementationFn=implementationFn(existingFeature);implementationFn!=existingFeature&&null!=implementationFn&&_jsCompilerUtils.defineProperty(currentGlobal,featurePath,{configurable:!0,writable:!0,value:implementationFn})}};
_jsCompilerUtils.polyfill("Array.from",function(nativeFrom){return nativeFrom?nativeFrom:function(arrayLikeObject,mapperFunction,thisContext){mapperFunction=null!=mapperFunction?mapperFunction:function(value){return value};var resultArray=[],iteratorOrValue="undefined"!=typeof Symbol&&Symbol.iterator&&arrayLikeObject[Symbol.iterator];if("function"==typeof iteratorOrValue){arrayLikeObject=iteratorOrValue.call(arrayLikeObject);for(var elementIndex=0;!(iteratorOrValue=arrayLikeObject.next()).done;)resultArray.push(mapperFunction.call(thisContext,iteratorOrValue.value,elementIndex++))}else for(iteratorOrValue=arrayLikeObject.length,elementIndex=0;elementIndex<iteratorOrValue;elementIndex++)resultArray.push(mapperFunction.call(thisContext,arrayLikeObject[elementIndex],elementIndex));return resultArray}},"es6","es3");
function analyzeNumbers(inputStringData){
    const inputLines = inputStringData.split("\n");
    const countOfNumbers = parseInt(inputLines[0], 10);

    const rawNumbersLine = inputLines[1];
    const numberStringParts = rawNumbersLine.split(" ");

    const parseNumberArray = (strParts, numLimit) => {
        const parsedValues = [];
        for (let i = 0; i < numLimit; i++) {
            parsedValues.push(parseInt(strParts[i], 10));
        }
        return parsedValues;
    };

    const originalNumberSequence = parseNumberArray(numberStringParts, countOfNumbers);

    const sortedNumberSequence = _jsCompilerUtils.global.Array.from(originalNumberSequence);
    sortedNumberSequence.sort((val1, val2) => val1 - val2);

    console.log(originalNumberSequence, sortedNumberSequence);

    let differenceCount = 0;
    const allowedMismatches = 2;

    for (let i = 0; i < countOfNumbers; ++i) {
        if (originalNumberSequence[i] !== sortedNumberSequence[i]) {
            differenceCount++;
        }
    }

    let finalDecisionMessage;
    if (differenceCount <= allowedMismatches) {
        finalDecisionMessage = "YES";
    } else {
        finalDecisionMessage = "NO";
    }
    console.log(finalDecisionMessage);
}
analyzeNumbers(require("fs").readFileSync("/dev/stdin","utf8"));
