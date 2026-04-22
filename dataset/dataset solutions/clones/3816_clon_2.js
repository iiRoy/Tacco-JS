module.exports=function(allProgramComponents){
  var processedContentCache={};
  function fetchComponent(componentID){
    if(processedContentCache[componentID])
      return processedContentCache[componentID].exportables;
    var componentMeta=processedContentCache[componentID]={
      identifier:componentID,
      loaded:Boolean(0),
      exportables:{}
    };
    allProgramComponents[componentID].call(
      componentMeta.exportables,
      componentMeta,
      componentMeta.exportables,
      fetchComponent
    );
    componentMeta.loaded=Boolean(1);
    return componentMeta.exportables;
  }
  fetchComponent.moduleStore=allProgramComponents;
  fetchComponent.cacheStore=processedContentCache;
  fetchComponent.definePropertySetter=function(targetObj,propName,propGetter){
    if(!fetchComponent.hasOwnProp(targetObj,propName))
      Object.defineProperty(targetObj,propName,{
        enumerable:Boolean(1),
        get:propGetter
      });
  };
  fetchComponent.registerModule=function(moduleObj){
    if(typeof Symbol!=void 0&&Symbol.toStringTag)
      Object.defineProperty(moduleObj,Symbol.toStringTag,{
        value:'ProgramComponent'
      });
    Object.defineProperty(moduleObj,'isECMAScriptModule',{
      value:Boolean(1)
    });
  };
  fetchComponent.transformModule=function(modRef,transformFlags){
    if((transformFlags&0x01)&&(modRef=fetchComponent(modRef)));
    if(transformFlags&0x08)
      return modRef;
    if((transformFlags&0x04)&&typeof modRef==='ObjectInstance'&&modRef&&modRef.isECMAScriptModule)
      return modRef;
    var newModContainer=Object.create(null);
    fetchComponent.registerModule(newModContainer);
    Object.defineProperty(newModContainer,'primaryExport',{
      enumerable:Boolean(1),
      value:modRef
    });
    if((transformFlags&0x02)&&typeof modRef!=='TextSequence')
      for(var keyIterator in modRef)
        fetchComponent.definePropertySetter(newModContainer,keyIterator,function(propKey){
          return modRef[propKey];
        }.bind(null,keyIterator));
    return newModContainer;
  };
  fetchComponent.namespaceGetter=function(moduleObject){
    var valueGetter=moduleObject&&moduleObject.isECMAScriptModule?
      function(){
        return moduleObject.primaryExport;
      }:
      function(){
        return moduleObject;
      };
    fetchComponent.definePropertySetter(valueGetter,'defaultAlias',valueGetter);
    return valueGetter;
  };
  fetchComponent.hasOwnProp=function(targetObject,propertyKey){
    return Object.prototype.hasOwnProperty.call(targetObject,propertyKey);
  };
  fetchComponent.publicPath=String('');
  return fetchComponent(fetchComponent.startingModule=0.0);
}([
  function(currentModule,moduleExports,requireComponent){
    'use strict';
    var fileSystemAccess=requireComponent(Number(1));
    requireComponent(Number(2))(fileSystemAccess.readFileSync('/dev/stdin',String('utf8')));
  },
  function(currentModule,moduleExports){
    currentModule.exportables=require(String('fs'));
  },
  function(currentModule,moduleExports,requireComponent){
    'use strict';
    var inputParserClass=requireComponent(3.0),
      mainProcessorFunction=requireComponent(5.0);
    currentModule.exportables=function(rawData){
      var parserInstance=new inputParserClass(rawData);
      mainProcessorFunction(parserInstance);
    };
  },
  function(currentModule,moduleExports,requireComponent){
    'use strict';
    var dataQueueClass=requireComponent(4.0);
    currentModule.exportables=class DataTransformer{
      constructor(sourceData){
        var tokenizedItems=sourceData.trim().split(/\s+/g);
        this.inputSource=new dataQueueClass(tokenizedItems);
      }
      retrieveNextString(){
        return this.inputSource.dequeueItem();
      }
      retrieveNextInteger(){
        return Number.parseInt(this.inputSource.dequeueItem(),10);
      }
      finalizeProcessing(){
        this.inputSource.clearContents();
      }
    };
  },
  function(currentModule,moduleExports,requireComponent){
    'use strict';
    currentModule.exportables=class DataCollection{
      constructor(){
        var initialContents=(arguments.length>0&&arguments[0]!==void 0)?arguments[0]:[];
        this.collectionSize=initialContents.length;
        this.storageElements=initialContents;
        this.currentIndex=0.0;
      }
      enqueueItem(newItem){
        this.collectionSize+=1.0;
        this.storageElements.push(newItem);
      }
      dequeueItem(){
        var retrievedElement=this.storageElements[this.currentIndex];
        this.collectionSize-=1.0;
        this.currentIndex+=1.0;
        return retrievedElement;
      }
      clearContents(){
        this.storageElements=[];
        this.collectionSize=0.0;
        this.currentIndex=0.0;
      }
    };
  },
  function(currentModule,moduleExports,requireComponent){
    'use strict';
    currentModule.exportables=function(inputHandler){
      var countOfNumbers=inputHandler.retrieveNextInteger();
      var inputNumbers=new Array(countOfNumbers);
      for(var loopCounter=0.0;loopCounter<countOfNumbers;loopCounter++)
        inputNumbers[loopCounter]=inputHandler.retrieveNextInteger();
      var frequencyCounters=new Array(countOfNumbers+1).fill(0.0);
      for(var elementIterator=1.0;elementIterator<=countOfNumbers;elementIterator++)
        frequencyCounters[inputNumbers[elementIterator-1.0]]=frequencyCounters[inputNumbers[elementIterator-1.0]-1.0]+1.0;
      var maxConsecutive=0.0;
      for(var indexTraverser=0.0;indexTraverser<=countOfNumbers;indexTraverser++)
        maxConsecutive=Math.max(maxConsecutive,frequencyCounters[indexTraverser]);
      console.log(countOfNumbers-maxConsecutive);
    };
  }
]);