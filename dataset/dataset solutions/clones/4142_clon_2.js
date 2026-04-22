module.exports=function(moduleDefinitions){var loadedModules={};
function moduleLoader(moduleId){
  if(loadedModules[moduleId])
    return loadedModules[moduleId].exports;
  var currentModule=loadedModules[moduleId]={id:moduleId,isLoaded:false,exports:{}};
  moduleDefinitions[moduleId].call(currentModule.exports,currentModule,currentModule.exports,moduleLoader);
  currentModule.isLoaded=true;
  return currentModule.exports;
}
moduleLoader.moduleMap=moduleDefinitions;
moduleLoader.cache=loadedModules;
moduleLoader.defineExport=function(targetObject,propertyName,getterFunction){
  moduleLoader.hasOwnProp(targetObject,propertyName)||Object.defineProperty(targetObject,propertyName,{enumerable:true,get:getterFunction});
};
moduleLoader.registerEsModule=function(moduleObject){
  "undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(moduleObject,Symbol.toStringTag,{value:"Module"});
  Object.defineProperty(moduleObject,"__esModule",{value:true});
};
moduleLoader.getExport=function(exportIdentifier,flagBits){
  if(1&flagBits&&(exportIdentifier=moduleLoader(exportIdentifier)));
  if(8&flagBits)return exportIdentifier;
  if(4&flagBits&&"object"==typeof exportIdentifier&&exportIdentifier&&exportIdentifier.__esModule)return exportIdentifier;
  var namespaceObject=Object.create(null);
  moduleLoader.registerEsModule(namespaceObject);
  Object.defineProperty(namespaceObject,"default",{enumerable:true,value:exportIdentifier});
  if(2&flagBits&&"string"!=typeof exportIdentifier)
    for(var keyName in exportIdentifier)
      moduleLoader.defineExport(namespaceObject,keyName,(function(paramKey){return function(){return exportIdentifier[paramKey]}})(keyName));
  return namespaceObject;
};
moduleLoader.createDefaultGetter=function(inputModule){
  var defaultGetter=inputModule&&inputModule.__esModule?function(){return inputModule.default}:function(){return inputModule};
  return moduleLoader.defineExport(defaultGetter,"a",defaultGetter),defaultGetter;
};
moduleLoader.hasOwnProp=function(checkObject,propName){
  return Object.prototype.hasOwnProperty.call(checkObject,propName);
};
moduleLoader.publicPath="";
return moduleLoader(moduleLoader.startupModule=0)}([
function(currentMod,exportsObj,reqFunc){
  reqFunc(1)(reqFunc(2).readInputFile("/dev/stdin","UTF-8"))
},
function(currentMod,exportsObj){
  currentMod.exports=function(inputString){
    for(var firstLine=inputString.split("\n")[0],lineLength=firstLine.length,minSegmentLength=lineLength,currentChar=firstLine[0],currentIndex=1;currentIndex<lineLength;currentIndex++)
      if(currentChar!=firstLine[currentIndex]){
        var currentMaxSegment=Math.max(currentIndex,lineLength-currentIndex);
        currentMaxSegment<minSegmentLength&&(minSegmentLength=currentMaxSegment),currentChar=firstLine[currentIndex]
      }
    console.log(minSegmentLength)
  }
},
function(currentMod,exportsObj){
  currentMod.exports=require("fs")
}]);