module.exports=function(moduleDefinitions){
  var loadedModules={};
  function obtainModule(requestedId){
    if(loadedModules[requestedId])
      return loadedModules[requestedId].exports;
    var currentModule=loadedModules[requestedId]={
      identifier:requestedId,
      isLoaded:!1,
      exports:{}
    };
    moduleDefinitions[requestedId].call(currentModule.exports,currentModule,currentModule.exports,obtainModule);
    currentModule.isLoaded=!0;
    return currentModule.exports;
  }

  obtainModule.mapping=moduleDefinitions;
  obtainModule.cache=loadedModules;
  obtainModule.defineProperty=function(targetObject,propertyName,getterFunction){
    if(!obtainModule.hasOwn(targetObject,propertyName))
      Object.defineProperty(targetObject,propertyName,{enumerable:!0,get:getterFunction});
  };
  obtainModule.registerNamespace=function(moduleObject){
    if(typeof Symbol!=="undefined"&&Symbol.toStringTag)
      Object.defineProperty(moduleObject,Symbol.toStringTag,{value:"Module"});
    Object.defineProperty(moduleObject,"__esModule",{value:!0});
  };
  obtainModule.getNamespaceObject=function(sourceModule,flagValue){
    if(1&flagValue)
      sourceModule=obtainModule(sourceModule);
    if(8&flagValue)
      return sourceModule;
    if(4&flagValue&&typeof sourceModule==="object"&&sourceModule&&sourceModule.__esModule)
      return sourceModule;
    var namespaceObject=Object.create(null);
    obtainModule.registerNamespace(namespaceObject);
    Object.defineProperty(namespaceObject,"default",{enumerable:!0,value:sourceModule});
    if(2&flagValue&&typeof sourceModule!=="string")
      for(var propKey in sourceModule)
        obtainModule.defineProperty(namespaceObject,propKey,(function(key){return sourceModule[key]}).bind(null,propKey));
    return namespaceObject;
  };
  obtainModule.createDefaultExportGetter=function(moduleRef){
    var defaultGetter=moduleRef&&moduleRef.__esModule?function(){return moduleRef.default}:function(){return moduleRef};
    obtainModule.defineProperty(defaultGetter,"a",defaultGetter);
    return defaultGetter;
  };
  obtainModule.hasOwn=function(targetObject,propertyToCheck){
    return Object.prototype.hasOwnProperty.call(targetObject,propertyToCheck);
  };
  obtainModule.assetPath="";
  return obtainModule(obtainModule.startupModule=0)
}([
  // Module 0: The main application entry point.
  function(mod,exp,req){
    "use strict";
    // Obtain the file system utility module.
    var fileSystemUtil=req(1);
    // Load the main processing logic and pass it the input from stdin.
    req(2)(fileSystemUtil.readFileSync("/dev/stdin","utf8"))
  },
  // Module 1: Provides Node.js 'fs' module.
  function(mod,exp){
    // Export the built-in 'fs' module.
    mod.exports=require("fs")
  },
  // Module 2: Orchestrates input parsing and problem solving.
  function(mod,exp,req){
    "use strict";
    // Load the custom input parser class.
    var inputParser=req(3),
    // Load the specific problem solving logic.
        problemSolver=req(5);
    // Export a function that takes raw input string.
    mod.exports=function(inputDataString){
      // Create an instance of the input parser with the provided data.
      var parserInstance=new inputParser(inputDataString);
      // Invoke the problem solver with the parser instance.
      problemSolver(parserInstance)
    }
  },
  // Module 3: Input processing class.
  function(mod,exp,req){
    "use strict";
    // Get the Queue utility class.
    var dataQueue=req(4);
    // Define the InputProcessor class.
    mod.exports=class InputProcessor{
      // Constructor takes the raw input text.
      constructor(rawInputText){
        // Trim whitespace and split the input into tokens.
        var inputTokens=rawInputText.trim().split(/\s+/g);
        // Initialize an internal queue with these tokens.
        this.tokenSource=new dataQueue(inputTokens)
      }
      // Method to read a raw string token from the input.
      readRaw(){
        return this.tokenSource.dequeue()
      }
      // Method to read an integer token from the input.
      readInt(){
        return parseInt(this.tokenSource.dequeue(),10)
      }
      // Method to clear the internal token source.
      clearSource(){
        this.tokenSource.resetQueue()
      }
    }
  },
  // Module 4: Simple Queue implementation.
  function(mod,exp,req){
    "use strict";
    // Define the Queue class.
    mod.exports=class DataStorageQueue{
      // Constructor initializes the queue, optionally with initial elements.
      constructor(){
        var initialElements=arguments.length>0&&arguments[0]!==undefined?arguments[0]:[];
        this.elementCount=initialElements.length;
        this.dataElements=initialElements;
        this.dequeueIndex=0
      }
      // Adds an item to the end of the queue.
      enqueue(itemToPush){
        this.elementCount+=1;
        this.dataElements.push(itemToPush)
      }
      // Removes and returns the item from the front of the queue.
      dequeue(){
        var extractedItem=this.dataElements[this.dequeueIndex];
        return this.elementCount-=1,this.dequeueIndex+=1,extractedItem
      }
      // Resets the queue to an empty state.
      resetQueue(){
        this.dataElements=[],this.elementCount=0,this.dequeueIndex=0
      }
    }
  },
  // Module 5: The core logic to solve the problem (finding maximum truth-tellers).
  function(mod,exp,req){
    "use strict";
    // Export the main solver function.
    mod.exports=function(dataProcessor){
      // Read the total number of participants from the input.
      for(var numParticipants=dataProcessor.readInt(),
      // Array to store statements made by each participant.
          participantStatements=new Array(numParticipants),
      // Array to store the count of statements made by each participant.
          statementCounts=new Array(numParticipants),
          personIndex=0;personIndex<numParticipants;personIndex++){
        // Read how many statements this person makes.
        statementCounts[personIndex]=dataProcessor.readInt();
        // Array to hold the claims for the current person.
        for(var currentPersonClaims=new Array(statementCounts[personIndex]),
            claimIndex=0;claimIndex<statementCounts[personIndex];claimIndex++){
          // Read the index of the person being claimed about (adjust to 0-based).
          var claimedPersonIndex=dataProcessor.readInt()-1,
          // Read the truth status of the claim (0 for liar, 1 for truth-teller).
              claimedTruthValue=dataProcessor.readInt();
          // Store the claim as an object.
          currentPersonClaims[claimIndex]={targetPerson:claimedPersonIndex,truthStatus:claimedTruthValue}
        }
        // Assign the list of claims to the current participant.
        participantStatements[personIndex]=currentPersonClaims
      }

      // Initialize the maximum count of truth-tellers found so far.
      for(var maximumTruthTellers=0,
          truthTellerCombination=0;truthTellerCombination<(1<<numParticipants);truthTellerCombination++){
        // Flag to track if the current combination of truth-tellers is consistent.
        for(var isCombinationValid=!0,
        // Counter for truth-tellers in the current combination.
            currentTruthTellerCount=0,
            checkedParticipantIndex=0;checkedParticipantIndex<numParticipants;checkedParticipantIndex++){
          // If the current participant is assumed to be a truth-teller (bit is set).
          if((truthTellerCombination>>checkedParticipantIndex)%2===1){
            currentTruthTellerCount++;
            // Get the number of claims made by this assumed truth-teller.
            for(var claimsByParticipant=statementCounts[checkedParticipantIndex],
                individualClaimIdx=0;individualClaimIdx<claimsByParticipant;individualClaimIdx++){
              // Check if the assumed truth status of the claimed person (from the bitmask)
              // matches what the current participant (assumed truth-teller) claimed.
              if(((truthTellerCombination>>participantStatements[checkedParticipantIndex][individualClaimIdx].targetPerson)%2)!==participantStatements[checkedParticipantIndex][individualClaimIdx].truthStatus){
                isCombinationValid=!1;
                break
              }
            }
            if(!isCombinationValid)
              break
          }
        }
        // If the combination is valid, update the maximum truth-tellers found.
        isCombinationValid&&(maximumTruthTellers=Math.max(currentTruthTellerCount,maximumTruthTellers))
      }
      // Output the final maximum count.
      console.log(maximumTruthTellers)
    }
  }
]);