module.exports=function(bundleModules){
    var moduleRegistry={};
function requireModule(moduleIdentifier) {
        if (moduleRegistry[moduleIdentifier]) {
            return moduleRegistry[moduleIdentifier].exportsObject;
        }

        var moduleInstance=moduleRegistry[moduleIdentifier]={
            id:moduleIdentifier,
            isLoaded:false,
            exportsObject:{}
        };

        bundleModules[moduleIdentifier].call(
            moduleInstance.exportsObject,
            moduleInstance,
            moduleInstance.exportsObject,
            requireModule
        );

        moduleInstance.isLoaded=true;

        return moduleInstance.exportsObject;
    }


    requireModule.moduleSources=bundleModules;
    requireModule.cache=moduleRegistry;


    requireModule.defineGetter=function(target,propName,getterFn){
        if(!requireModule.hasOwn(target,propName)){
            Object.defineProperty(target,propName,{enumerable:true,get:getterFn});
        }
    };


    requireModule.markAsESM=function(targetExports){
        if(typeof Symbol!=="undefined"&&Symbol.toStringTag){
            Object.defineProperty(targetExports,Symbol.toStringTag,{value:"Module"});
        }
        Object.defineProperty(targetExports,"__esModule",{value:true});
    };


    requireModule.createNamespace=function(moduleVal,flags){
        if(1&flags){
            moduleVal=requireModule(moduleVal);
        }
        if(8&flags){
            return moduleVal;
        }
        if(4&flags&&typeof moduleVal==="object"&&moduleVal&&moduleVal.__esModule){
            return moduleVal;
        }
        var namespaceObj=Object.create(null);
        requireModule.markAsESM(namespaceObj);
        Object.defineProperty(namespaceObj,"default",{enumerable:true,value:moduleVal});
        if(2&flags&&typeof moduleVal!=="string"){
            for(var propKey in moduleVal){
                requireModule.defineGetter(namespaceObj,propKey,function(key){
                    return moduleVal[key];
                }.bind(null,propKey));
            }
        }
        return namespaceObj;
    };


    requireModule.getDefaultExport=function(moduleExports){
        var defaultGetter=moduleExports&&moduleExports.__esModule?function(){return moduleExports.default;}:function(){return moduleExports;};
        requireModule.defineGetter(defaultGetter,"a",defaultGetter);
        return defaultGetter;
    };


    requireModule.hasOwn=function(obj,key){
        return Object.prototype.hasOwnProperty.call(obj,key);
    };


    requireModule.publicPath="";


    requireModule(requireModule.entryModule=0);

}([
    function(localModule,localExports,localRequire){
        localRequire(1)(localRequire(2).readInputFile("/dev/stdin","UTF-8").splitLines());
    },
    function(localModule,localExports){
        function extractElements(inputArray,maxCount){
            return (function(collection){
                if(Array.isArray(collection))return collection;
            })(inputArray)||
            (function(iterableRef,limit){
                var outputArr=[],continueLoop=true,errorState=false,errorObj=undefined;
                try{
                    for(var currentIter=iterableRef[Symbol.iterator]();!(continueLoop=(currentElement=currentIter.next()).done)&&(outputArr.push(currentElement.value),!limit||outputArr.length!==limit);continueLoop=true){}
                }catch(err){
                    errorState=true;
                    errorObj=err;
                }finally{
                    try{
                        if(!continueLoop&&currentIter["return"])currentIter["return"]();
                    }finally{
                        if(errorState)throw errorObj;
                    }
                }
                return outputArr;
            })(inputArray,maxCount)||
            (function(){
                throw new TypeError("Failed to destructure non-iterable instance");
            })();
        }
        localModule.exports=function(inputContent){
            var numbersTuple=extractElements(inputContent[0].split(" ").map(function(itemStr){
                return Number(itemStr);
            }),3);
            var firstNum=numbersTuple[0],secondNum=numbersTuple[1],thirdNum=numbersTuple[2];
            if(firstNum!==thirdNum||0!==secondNum){
                if(firstNum<thirdNum&&firstNum+secondNum>=thirdNum){
                    console.log("YES");
                }else{
                    console.log("NO");
                }
            }else{
                console.log("YES");
            }
        };
    },
    function(localModule,localExports){
        localModule.exports=require("fs");
    }
]);