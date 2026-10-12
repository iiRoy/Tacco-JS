var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLinesBuffer = [];

inputReader.on('line', function(lineData){
  inputLinesBuffer.push(lineData);
});

inputReader.on('close', function(){
  inputHandler = initializeInputProcessor(inputLinesBuffer);
  console.error("\n");
  var startTime = Date.now();
  executeSolution();
  var elapsedTime = Date.now() - startTime;
  logDebug("time : " + (elapsedTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function getNextInt(){return convertInput(getNextLine(),1);}
function getNextStrArray(){return convertInput(getNextLine(),2);}
function getNextIntArray(){return convertInput(getNextLine(),4);}
function getNextCharArray(){return convertInput(getNextLine(),6);}
function getNextLine(){return inputHandler.next();}
function hasMoreLines(){return inputHandler.hasNext();}

function initializeInputProcessor(lines){  
  var processorInstance = {
    dataLines : lines,
    currentLineIndex : 0,
    totalLines : lines.length,
    hasNext : function(){return (this.currentLineIndex < this.totalLines);},
    next : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var currentInputLine = this.dataLines[this.currentLineIndex++];
        return currentInputLine;
      }
    }
  };
  return processorInstance;
}

function printResult(outputData){console.log(outputData);}
function logDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}

function convertInput(data, conversionType){
  try {
    const conversionMap = {
      1: (val) => parseInt(val),
      2: (val) => val.split(" "),
      4: (val) => val.split(" ").map(Number),
      6: (val) => val.split(""),
      7: (val) => val.split("").map(Number),
      8: (val) => val.join(" "),
      9: (val) => val.join("\n"),
      0: (val) => val.join("")
    };
    const converter = conversionMap[conversionType];
    if (converter) {
      return converter(data);
    } else {
      return data;
    }
  } catch(e) {
    return data;
  }
}

function calculateConcentration(soluteMass, totalMass) {
  if (totalMass === 0) {
    return 0;
  }
  return (soluteMass * 100) / totalMass;
}

function isWithinSolubilityLimit(waterMass, soluteMass, solubilityFactorE){
  var maxSoluteAllowed = (waterMass * solubilityFactorE) / 100;
  return maxSoluteAllowed >= soluteMass;
}

function executeSolution(){
  var rawInputParams = getNextIntArray();
  
  const [
    waterGranularityA_raw, waterGranularityB_raw,
    soluteGranularityC, soluteGranularityD,
    solubilityLimitE, totalMassLimitF
  ] = rawInputParams;

  const waterGranularityA = waterGranularityA_raw * 100;
  const waterGranularityB = waterGranularityB_raw * 100;

  var highestConcentration = 0;
  var bestMixtureResult = { totalMass: 0, soluteMass: 0 }; 

  var possibleWaterAmountsSet = new Set();
  var possibleSoluteAmountsSet = new Set();
  var maxFactorValue = 3000;

  for(var factorA = 0; factorA <= maxFactorValue; factorA++){
    for(var factorB = 0; factorB <= maxFactorValue; factorB++){
      var currentWaterCandidate = waterGranularityA * factorA + waterGranularityB * factorB;
      var currentSoluteCandidate = soluteGranularityC * factorA + soluteGranularityD * factorB;

      if (currentWaterCandidate > totalMassLimitF && currentSoluteCandidate > totalMassLimitF) {
          continue; 
      }

      if(currentWaterCandidate <= totalMassLimitF){
        possibleWaterAmountsSet.add(currentWaterCandidate);
      }
      if(currentSoluteCandidate <= totalMassLimitF){
        possibleSoluteAmountsSet.add(currentSoluteCandidate);
      }
    }
  }
  
  var sortedWaterAmounts = Array.from(possibleWaterAmountsSet);
  var sortedSoluteAmounts = Array.from(possibleSoluteAmountsSet);

  for(var waterIndex = 0; waterIndex < sortedWaterAmounts.length; waterIndex++){
    for(var soluteIndex = 0; soluteIndex < sortedSoluteAmounts.length; soluteIndex++){
      var currentWaterMass = sortedWaterAmounts[waterIndex];
      var currentSoluteMass = sortedSoluteAmounts[soluteIndex];
      
      var currentTotalMass = currentWaterMass + currentSoluteMass;

      if(currentTotalMass <= totalMassLimitF && isWithinSolubilityLimit(currentWaterMass, currentSoluteMass, solubilityLimitE)){
        
        if(currentTotalMass === 0){
          continue;
        }
        
        var calculatedConcentration = calculateConcentration(currentSoluteMass, currentTotalMass);
        
        if(calculatedConcentration > highestConcentration){
          highestConcentration = calculatedConcentration;
          bestMixtureResult.totalMass = currentTotalMass;
          bestMixtureResult.soluteMass = currentSoluteMass;
        }
      }
    }
  }
  
  const finalOutputArray = [bestMixtureResult.totalMass, bestMixtureResult.soluteMass];
  printResult(convertInput(finalOutputArray, 8));
}
