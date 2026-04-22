var ParameterSet = function(sourceText) {
    var lines = sourceText.trim().split('\n');
    var firstLineParts = lines[0].split(' ').map(Number);
    this.arrayDimension = firstLineParts[0];
    this.iterationCount = firstLineParts[1];
    this.initialConfiguration = lines[1].split(' ').map(Number);
};

var advanceConfiguration = function(currentConfiguration, currentDimension) {
    var impactRegister = new Map();

    currentConfiguration.forEach(function(magnitude, position) {
        var reachStart = Math.max(0, position - magnitude);
        var reachEnd = Math.min(position + magnitude + 1, currentDimension);
        
        impactRegister.set(reachStart, (impactRegister.get(reachStart) || 0) + 1);
        impactRegister.set(reachEnd, (impactRegister.get(reachEnd) || 0) - 1);
    });

    var resultantConfiguration = [];
    var runningTotal = 0;
    
    for (var k = 0; k < currentDimension; k++) {
        runningTotal += (impactRegister.get(k) || 0);
        resultantConfiguration.push(runningTotal);
    }
    return resultantConfiguration;
};

var checkUniformity = function(dataSeries, uniformValue) {
    var allMatch = true;
    var index = 0;
    while (index < dataSeries.length) {
        if (dataSeries[index] !== uniformValue) {
            allMatch = false;
            break;
        }
        index++;
    }
    return allMatch;
};

var simulateEvolution = function(remainingSteps, currentData, dataSize) {
    if (remainingSteps <= 0 || checkUniformity(currentData, dataSize)) {
        return currentData;
    } else {
        var nextData = advanceConfiguration(currentData, dataSize);
        return simulateEvolution(remainingSteps - 1, nextData, dataSize);
    }
};

var orchestrateSimulation = function(sourceContent) {
    var params = new ParameterSet(sourceContent);
    var finalResult = simulateEvolution(params.iterationCount, params.initialConfiguration, params.arrayDimension);
    console.log(finalResult.join(' '));
};

orchestrateSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));