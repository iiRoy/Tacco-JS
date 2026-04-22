module.exports=function(allModules){
  var moduleCache={};
  function loadModule(moduleId){
    if(moduleCache[moduleId])
      return moduleCache[moduleId].exports;
    var currentModule=moduleCache[moduleId]={
      ident:moduleId,
      loaded:!1,
      exports:{}
    };
    allModules[moduleId].call(currentModule.exports,currentModule,currentModule.exports,loadModule);
    currentModule.loaded=!0;
    return currentModule.exports;
  }
  loadModule.moduleDefinitions=allModules;
  loadModule.cachedModules=moduleCache;
  loadModule.defineExport=function(targetObj,propertyName,getterFunc){
    if(!loadModule.hasOwnProp(targetObj,propertyName))
      Object.defineProperty(targetObj,propertyName,{enumerable:!0,get:getterFunc})
  };
  loadModule.registerESM=function(targetObject){
    if("undefined"!=typeof Symbol&&Symbol.toStringTag)
      Object.defineProperty(targetObject,Symbol.toStringTag,{value:"Module"});
    Object.defineProperty(targetObject,"__esModule",{value:!0})
  };
  loadModule.transformNamespace=function(sourceExports,flags){
    if(1&flags&&(sourceExports=loadModule(sourceExports)),8&flags)
      return sourceExports;
    if(4&flags&&"object"==typeof sourceExports&&sourceExports&&sourceExports.__esModule)
      return sourceExports;
    var namespaceObject=Object.create(null);
    loadModule.registerESM(namespaceObject);
    Object.defineProperty(namespaceObject,"default",{enumerable:!0,value:sourceExports});
    if(2&flags&&"string"!=typeof sourceExports)
      for(var keyName in sourceExports)
        loadModule.defineExport(namespaceObject,keyName,function(propName){return sourceExports[propName]}.bind(null,keyName));
    return namespaceObject;
  };
  loadModule.createGetter=function(moduleExports){
    var getterFunc=moduleExports&&moduleExports.__esModule?
      function(){return moduleExports.default}:
      function(){return moduleExports};
    loadModule.defineExport(getterFunc,"a",getterFunc);
    return getterFunc;
  };
  loadModule.hasOwnProp=function(obj,prop){
    return Object.prototype.hasOwnProperty.call(obj,prop)
  };
  loadModule.basePath="";
  return loadModule(loadModule.startupModule=1);
}([
  function(modObj,modExports,modRequire){
    "use strict";
    modObj.exports=class InputBuffer{
      constructor(initialElements){
        initialElements=arguments.length>0&&void 0!==initialElements?initialElements:[];
        this.elementCount=initialElements.length;
        this.dataStore=initialElements;
        this.readIndex=0;
      }
      enqueue(itemToPush){
        this.elementCount+=1;
        this.dataStore.push(itemToPush);
      }
      dequeue(){
        var retrievedItem=this.dataStore[this.readIndex];
        this.elementCount-=1;
        this.readIndex+=1;
        return retrievedItem;
      }
      resetBuffer(){
        this.dataStore=[];
        this.elementCount=0;
        this.readIndex=0;
      }
    }
  },
  function(modObj,modExports,modRequire){
    "use strict";
    var fileSystemAccess=modRequire(2);
    var processInputAndCompute=modRequire(3);
    processInputAndCompute(fileSystemAccess.readFileSync("/dev/stdin","utf8"))
  },
  function(moduleObj,exportsObj){
    moduleObj.exports=require("fs")
  },
  function(modObj,modExports,modRequire){
    "use strict";
    var parserClass=modRequire(4);
    var solverFunction=modRequire(5);
    modObj.exports=function(rawInputText){
      var inputProcessor=new parserClass(rawInputText);
      solverFunction(inputProcessor)
    }
  },
  function(modObj,modExports,modRequire){
    "use strict";
    var bufferClass=modRequire(0);
    modObj.exports=class InputParser{
      constructor(sourceText){
        var parsedTokens=sourceText.trim().split(/\s+/g);
        this.tokenBuffer=new bufferClass(parsedTokens)
      }
      readRaw(){
        return this.tokenBuffer.dequeue()
      }
      readInteger(){
        return parseInt(this.tokenBuffer.dequeue(),10)
      }
      finalizeParsing(){
        this.tokenBuffer.resetBuffer()
      }
    }
  },
  function(modObj,modExports,modRequire){
    "use strict";
    modRequire(0);
    modObj.exports=function(inputHandler){
      var nodeCount=inputHandler.readInteger();
      var parentOccurrences=new Array(nodeCount).fill(0);
      var childMaxOccurrences=new Array(nodeCount).fill(0);
      var resultPath=new Array(nodeCount-1);
      var maximumCount=0;
      for(var loopIterator=0;loopIterator<nodeCount-1;loopIterator++){
        var parentNodeIdx=inputHandler.readInteger()-1;
        var childNodeIdx=inputHandler.readInteger()-1;
        parentOccurrences[parentNodeIdx]++;
        if(parentOccurrences[parentNodeIdx]===childMaxOccurrences[parentNodeIdx])
          parentOccurrences[parentNodeIdx]++;
        maximumCount=Math.max(maximumCount,parentOccurrences[parentNodeIdx]);
        childMaxOccurrences[childNodeIdx]=parentOccurrences[parentNodeIdx];
        resultPath[loopIterator]=parentOccurrences[parentNodeIdx]
      }
      console.log(maximumCount);
      for(var outputIterator=0;outputIterator<nodeCount-1;outputIterator++)
        console.log(resultPath[outputIterator])
    }
  }
]);