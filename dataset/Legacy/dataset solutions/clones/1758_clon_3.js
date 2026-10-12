const readlineModule = require('readline');
const consoleInputReader = readlineModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputProcessorInstance;
const bufferedInputLines = [];

const setupInputProcessing = () => {
    consoleInputReader.on('line', (currentLine) => {
        bufferedInputLines.push(currentLine);
    });

    consoleInputReader.on('close', () => {
        inputProcessorInstance = createInputProcessor(bufferedInputLines);
        logDebugMessage("-----start-----");
        const startTime = new Date();
        executeMainLogic();
        const endTimeDuration = new Date() - startTime;
        logDebugMessage("----- end -----");
        logDebugMessage("time : " + (endTimeDuration) + "ms");
        
        const memoryStats = process.memoryUsage();
        const heapTotalBytes = memoryStats.heapTotal;
        const heapTotalKB = Math.round(heapTotalBytes / 1024);
        logDebugMessage("memory : " + heapTotalKB + "KB");
    });
};

function readNextInteger(){ return processInputConversion(fetchNextLine(), 1); }
function readNextStringArray(){ return processInputConversion(fetchNextLine(), 2); }
function readNextIntegerArray(){ return processInputConversion(fetchNextLine(), 4); }
function readNextCharacterArray(){ return processInputConversion(fetchNextLine(), 6); }
function fetchNextLine(){ return inputProcessorInstance.fetchNextLine(); }
function hasMoreInput(){ return inputProcessorInstance.hasMoreInput(); }

function createInputProcessor(inputDataArray){  
  const processorInstance = {
    dataStore : inputDataArray,
    currentIndex : 0,
    maxIndex : inputDataArray.length,
    
    hasMoreInput : function(){
        return (this.currentIndex < this.maxIndex);
    },
    
    fetchNextLine : function(){
        if(!this.hasMoreInput()){
            throw "ArrayIndexOutOfBoundsException これ以上ないよ";
        } else {
            const currentInput = this.dataStore[this.currentIndex];
            this.currentIndex++;
            return currentInput;
        }
    }
  };
  return processorInstance;
}

function printOutput(message){ console.log(message); }

const utilInspector = require("util").inspect;
function logDebugMessage(messageContent){
    const inspectionOptions = {
        showHidden: false,
        depth: null
    };
    const inspectedOutput = utilInspector(messageContent, inspectionOptions.showHidden, inspectionOptions.depth);
    console.error("debug:" + inspectedOutput);
}

function processInputConversion(inputValue, conversionType){
    try {
        const conversionStrategies = {
            1: (val) => parseInt(val, 10),
            2: (val) => val.split(" "),
            4: (val) => val.split(" ").map(Number),
            6: (val) => val.split(""),
            7: (val) => val.split("").map(Number),
            8: (val) => val.join(" "),
            9: (val) => val.join("\n"),
            0: (val) => val.join("")
        };
        
        const strategyExecutor = conversionStrategies[conversionType];
        if (strategyExecutor) {
            return strategyExecutor(inputValue);
        } else {
            return inputValue;
        }
    } catch(conversionError){
        return inputValue;
    }
}

function executeMainLogic(){
	const FULL_CIRCLE_DEGREES = 360;
	let inputNumber = readNextInteger();
	let iterationCount = 0;
	let currentSum = 0;

    const isRotationComplete = (value) => {
        return (value % FULL_CIRCLE_DEGREES) === 0;
    };

	while(true){
		currentSum = currentSum + inputNumber;
		iterationCount = iterationCount + 1;
		
		if(isRotationComplete(currentSum)){
			printOutput(iterationCount);
			return;
		}
	}
}

setupInputProcessing();
