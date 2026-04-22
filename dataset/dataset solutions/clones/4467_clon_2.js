module.exports=function(moduleDefinitions){
  var moduleCache={};
  function loadModule(identifier){
    if(moduleCache[identifier])return moduleCache[identifier].exports;
    var entryObject=moduleCache[identifier]={
      modId:identifier,
      isLoaded:false,
      exports:{}
    };
    moduleDefinitions[identifier].call(entryObject.exports,entryObject,entryObject.exports,loadModule);
    entryObject.isLoaded=true;
    return entryObject.exports;
  }
  loadModule.definitions=moduleDefinitions;
  loadModule.cache=moduleCache;
  loadModule.defineProperty=function(targetObject,propName,getterFunction){
    if(!loadModule.hasObjectProperty(targetObject,propName))
      Object.defineProperty(targetObject,propName,{enumerable:true,get:getterFunction});
  };
  loadModule.tagAsEsModule=function(targetExports){
    if(typeof Symbol!=="undefined"&&Symbol.toStringTag)
      Object.defineProperty(targetExports,Symbol.toStringTag,{value:"Module"});
    Object.defineProperty(targetExports,"__esModule",{value:true});
  };
  loadModule.resolveInterop=function(inputValue,interopMode){
    if(1&interopMode)inputValue=loadModule(inputValue);
    if(8&interopMode)return inputValue;
    if(4&interopMode&&typeof inputValue==="object"&&inputValue&&inputValue.__esModule)return inputValue;
    var exportNamespace=Object.create(null);
    loadModule.tagAsEsModule(exportNamespace);
    Object.defineProperty(exportNamespace,"default",{enumerable:true,value:inputValue});
    if(2&interopMode&&typeof inputValue!=="string")
      for(var keyName in inputValue)
        loadModule.defineProperty(exportNamespace,keyName,function(accessorKey){return inputValue[accessorKey]}.bind(null,keyName));
    return exportNamespace;
  };
  loadModule.getExportAccessor=function(sourceModule){
    var currentExports=sourceModule&&sourceModule.__esModule?function(){return sourceModule.default}:function(){return sourceModule};
    loadModule.defineProperty(currentExports,"a",currentExports);
    return currentExports;
  };
  loadModule.hasObjectProperty=function(checkObject,checkProperty){
    return Object.prototype.hasOwnProperty.call(checkObject,checkProperty);
  };
  loadModule.basePath="";
  return loadModule(loadModule.startupId=0);
}([
  function(currentModule,moduleExports,getModule){
    getModule(1)(getModule(2).readTextFileSync("/dev/stdin","utf8").split("\n"));
  },
  function(moduleRef,exportObj){
    function splitIntoParts(sourceArr,partCount){
      return (function(inputArray){
        if(Array.isArray(inputArray))return inputArray;
      })(sourceArr) || (function(iteratable,limitCount){
        var extractedParts=[],
            iterationDone=true,
            iterationFailed=false,
            iterationError=undefined;
        try{
          for(var currentItem,arrayIterator=iteratable[Symbol.iterator]();
              !(iterationDone=(currentItem=arrayIterator.next()).done) && (extractedParts.push(currentItem.value),!limitCount || extractedParts.length!==limitCount);
              iterationDone=true
             ){}
        }catch(caughtError){
          iterationFailed=true;
          iterationError=caughtError;
        }finally{
          try{
            iterationDone || (null==arrayIterator.return || arrayIterator.return());
          }finally{
            if(iterationFailed)throw iterationError;
          }
        }
        return extractedParts;
      })(sourceArr,partCount) || (function(){
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      })();
    }
    moduleRef.exports=function(inputDataLines){
      var initialParameters=splitIntoParts(inputDataLines[0].split(" ").map(function(stringNumber){
        return Number(stringNumber);
      }),2),
      arrayLength=initialParameters[0],
      moduloValue=initialParameters[1],
      numberSequence=inputDataLines[1].split(" ").map(function(stringNumber){
        return Number(stringNumber);
      });
      numberSequence.sort(function(valueA,valueB){return valueA-valueB});
      for(var foundModuloCondition=false,
              foundGreaterThan=false,
              loopIndex=0;
              loopIndex<arrayLength;
              loopIndex++){
        if(0!=loopIndex&&numberSequence[loopIndex]%numberSequence[0]==moduloValue%numberSequence[0]&&(foundModuloCondition=true),
           numberSequence[loopIndex]>moduloValue&&(foundGreaterThan=true),
           numberSequence[loopIndex]==moduloValue)return void console.info("POSSIBLE");
      }
      foundModuloCondition&&foundGreaterThan?console.info("POSSIBLE"):console.warn("IMPOSSIBLE");
    };
  },
  function(moduleObject,exportObject){
    moduleObject.exports=require("node:fs");
  }
]);