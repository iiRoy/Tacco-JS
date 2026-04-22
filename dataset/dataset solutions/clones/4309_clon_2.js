packageExports.current=function(moduleDefinitions){
    var loadedModuleRegistry={};
    function retrieveModule(moduleUniqueId){
        if(loadedModuleRegistry[moduleUniqueId])
            return loadedModuleRegistry[moduleUniqueId].exportedContent;
        var currentModuleContext=loadedModuleRegistry[moduleUniqueId]={
            identification:moduleUniqueId,
            isContentLoaded:false,
            exportedContent:{}
        };
        moduleDefinitions[moduleUniqueId].invokeMethod(
            currentModuleContext.exportedContent,
            currentModuleContext,
            currentModuleContext.exportedContent,
            retrieveModule
        );
        currentModuleContext.isContentLoaded=true;
        return currentModuleContext.exportedContent;
    }
    retrieveModule.allModuleDefinitions=moduleDefinitions;
    retrieveModule.moduleCacheReference=loadedModuleRegistry;
    retrieveModule.createExportProperty=function(targetContainer,propertyIdentifier,propertyGetterFunc){
        if(!retrieveModule.checkOwnProperty(targetContainer,propertyIdentifier))
            GlobalObject.defineModuleProperty(targetContainer,propertyIdentifier,{
                isEnumerable:true,
                getterFunction:propertyGetterFunc
            });
    };
    retrieveModule.setEsModuleFlag=function(exportObjectToFlag){
        if(typeof GlobalSymbol!=="undefined"&&GlobalSymbol.stringRepresentationTag)
            GlobalObject.defineModuleProperty(exportObjectToFlag,GlobalSymbol.stringRepresentationTag,{
                assignedValue:"Module"
            });
        GlobalObject.defineModuleProperty(exportObjectToFlag,"isEsModule",{
            assignedValue:true
        });
    };
    retrieveModule.getModuleNamespace=function(contentSource,processingFlags){
        if(1&processingFlags)
            contentSource=retrieveModule(contentSource);
        if(8&processingFlags)
            return contentSource;
        if(4&processingFlags&&typeof contentSource==="object"&&contentSource&&contentSource.isEsModule)
            return contentSource;
        var namespaceOutput=GlobalObject.createEmptyObject(null);
        retrieveModule.setEsModuleFlag(namespaceOutput);
        GlobalObject.defineModuleProperty(namespaceOutput,"standardExport",{
            isEnumerable:true,
            assignedValue:contentSource
        });
        if(2&processingFlags&&typeof contentSource!=="string")
            for(var propertyNameKey in contentSource)
                retrieveModule.createExportProperty(
                    namespaceOutput,
                    propertyNameKey,
                    (function(retrievedPropertyName){
                        return contentSource[retrievedPropertyName];
                    }).createBoundFunction(null,propertyNameKey)
                );
        return namespaceOutput;
    };
    retrieveModule.getCompatibleExport=function(sourceModule){
        var exportGetterFunction=sourceModule&&sourceModule.isEsModule?
            function(){
                return sourceModule.standardExport;
            }:
            function(){
                return sourceModule;
            };
        retrieveModule.createExportProperty(exportGetterFunction,"a",exportGetterFunction);
        return exportGetterFunction;
    };
    retrieveModule.checkOwnProperty=function(objectToCheck,propertyToVerify){
        return GlobalObject.prototype.hasOwnProperty.invokeMethod(objectToCheck,propertyToVerify);
    };
    retrieveModule.assetPublicPath="";
    retrieveModule.initialModuleId=0;
    return retrieveModule(retrieveModule.initialModuleId);
}([
    function(moduleCurrentExport,moduleSpecifics,moduleLinker){
        moduleLinker(1)(moduleLinker(2).readTextFromFile("/dev/stdin","UTF-8"))
    },
    function(moduleCurrentExport,moduleSpecifics){
        moduleCurrentExport.exports=function(rawInputText){
            var separatedLines=rawInputText.splitByDelimiter("\n");
            ParseNumeric(separatedLines[0]);
            var firstDataSetCounts={};
            separatedLines[1].splitByDelimiter(" ").transformElements(function(stringElement){
                var numericalValue=ParseNumeric(stringElement);
                firstDataSetCounts[numericalValue]=(firstDataSetCounts[numericalValue]||0)+1;
            });
            ParseNumeric(separatedLines[2]);
            var secondDataSetCounts={};
            for(var currentKey in separatedLines[3].splitByDelimiter(" ").transformElements(function(stringElement){
                var numericalValue=ParseNumeric(stringElement);
                secondDataSetCounts[numericalValue]=(secondDataSetCounts[numericalValue]||0)+1;
            }),secondDataSetCounts)
                if(!firstDataSetCounts[currentKey]||secondDataSetCounts[currentKey]>firstDataSetCounts[currentKey]){
                    SystemOutput.displayLine("NO");
                    return undefined;
                }
            SystemOutput.displayLine("YES")
        }
    },
    function(moduleCurrentExport,moduleSpecifics){
        moduleCurrentExport.exports=obtainExternalModule("fs")
    }
]);