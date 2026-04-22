const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let dataAccessor;
const inputBuffer = [];
inputHandler.on('line', function(lineContent){inputBuffer.push(lineContent);});
inputHandler.on('close', function(){
  dataAccessor = initializeData(inputBuffer);
  console.error("\n");
  const startTime = new Date();
  ProcessStates();
  const endTime = new Date() - startTime;
  
  errorLogger("duration : " + (endTime) + "ms");
  errorLogger("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function duplicateObject(original){return JSON.parse(JSON.stringify(original));}

function fetchInteger(){return typeConverter(retrieveNext(),1);}
function fetchStringArray(){return typeConverter(retrieveNext(),2);}
function fetchIntegerArray(){return typeConverter(retrieveNext(),4);}
function fetchCharacterArray(){return typeConverter(retrieveNext(),6);}

function retrieveNext(){return dataAccessor.grabNext();}
function hasMore(){return dataAccessor.checkMore();}

function initializeData(sourceInput){  
  const accessorObject = {
    contentList : sourceInput, currentPosition : 0, totalElements : sourceInput.length,
    checkMore : function(){return (this.currentPosition < this.totalElements);},
    grabNext : function(){
        if(!this.checkMore()){
            throw "End of input stream reached.";
        } else {
            const currentItem = this.contentList[this.currentPosition];
            this.currentPosition++;
            return currentItem;
        }
    }
  };
  return accessorObject;
}

function outputDisplay(content){console.log(content);}
function errorLogger(message){console.error("debug:" + require("util").inspect(message,false,null));}

function typeConverter(inputVal, conversionType){
    try{
        switch(conversionType){
            case 1: return parseInt(inputVal);
            case 2: return inputVal.split(" ");
            case 4: return inputVal.split(" ").map(Number);
            case 6: return inputVal.split("");
            case 7: return inputVal.split("").map(Number);
            case 8: return inputVal.join(" ");
            case 9: return inputVal.join("\n");
            case 0: return inputVal.join("");
            default: return inputVal;
        }
    } catch(e){
        return inputVal;
    }
}

function ProcessStates() {
    const totalCount = fetchInteger();
    const targetParities = fetchIntegerArray();

    const finalToggleDecisions = Array.from({ length: totalCount }, (_, idx) => totalCount - 1 - idx)
        .reduce((currentToggleStates, currentProcessIndex) => {
            const currentSwitchIdentifier = currentProcessIndex + 1;
            let currentAccumulatedParity = 0;

            for (let multiplier = 1; multiplier * currentSwitchIdentifier <= totalCount; multiplier++) {
                const affectedElementPosition = multiplier * currentSwitchIdentifier - 1;
                currentAccumulatedParity = (currentAccumulatedParity + currentToggleStates[affectedElementPosition]) % 2;
            }

            if (currentAccumulatedParity !== (targetParities[currentProcessIndex] % 2)) {
                currentToggleStates[currentProcessIndex] = 1;
            } else {
                currentToggleStates[currentProcessIndex] = 0;
            }

            return currentToggleStates;
        }, Array(totalCount).fill(0));

    const activeSwitchPositions = finalToggleDecisions
        .map((status, position) => ({ status, originalPosition: position + 1 }))
        .filter(item => item.status === 1)
        .map(item => item.originalPosition);

    outputDisplay(activeSwitchPositions.length);
    if (activeSwitchPositions.length > 0) {
        outputDisplay(typeConverter(activeSwitchPositions, 8));
    }
}