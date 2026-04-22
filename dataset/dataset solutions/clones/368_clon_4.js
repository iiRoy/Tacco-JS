'use strict';

var ApplicationEnvironment = {};

(function(runtime) {

    var isWebContext = function() {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    };
    runtime.isWebContext = isWebContext;

    var isServerContext = function() {
        return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    };
    runtime.isServerContext = isServerContext;

    var escapeForDisplay = function(textValue) {
        if (isWebContext()) {
            var containerDiv = document.createElement('div');
            containerDiv.appendChild(document.createTextNode(String(textValue)));
            return containerDiv.innerHTML;
        } else {
            return String(textValue)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
        }
    };
    runtime.escapeForDisplay = escapeForDisplay;

    if (isWebContext()) {
        var renderCodeSnippet = function(programFunction) {
            var targetElement = document.getElementById('sourceCodeDisplay');
            if (targetElement) {
                targetElement.innerHTML = '<pre><code>' + escapeForDisplay(programFunction.toString()) + '</code></pre>';
            }
        };
        runtime.renderCodeSnippet = renderCodeSnippet;
    }

    var obtainRawInputLines = function() {
        var collectedLines = [];
        if (isWebContext()) {
            var inputElement = document.getElementById('userInputStream');
            if (inputElement) {
                collectedLines = inputElement.textContent.split(/\r?\n/).map(line => line.trim());
            }
        }
        if (isServerContext()) {
            var fs = require('fs');
            collectedLines = fs.readFileSync(0, 'utf8').split(/\r?\n/).map(line => line.trim());
        }
        return collectedLines.filter(line => line.length > 0);
    };
    runtime.obtainRawInputLines = obtainRawInputLines;

    var processInputLines = function(lineHandlerCallback) {
        if (isWebContext()) {
            var allLines = obtainRawInputLines();
            allLines.forEach(function(currentLine) {
                lineHandlerCallback(currentLine);
            });
        }
        if (isServerContext()) {
            var readline = require('readline');
            var inputReader = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: false
            });

            inputReader.on('line', function(singleLine) {
                lineHandlerCallback(singleLine.trim());
            });
        }
    };
    runtime.processInputLines = processInputLines;

    var collectedOutputForDisplay = [];

    var displayOutputLines = function(linesToDisplay) {
        if (isWebContext()) {
            var outputElement = document.getElementById('resultOutputArea');
            if (outputElement) {
                outputElement.innerHTML = linesToDisplay.map(escapeForDisplay).join('<br>\n');
            }
        }
        if (isServerContext()) {
            linesToDisplay.forEach(line => console.log(line));
        }
    };
    runtime.displayOutputLines = displayOutputLines;

    var displaySingleOutputLine = function(textLine) {
        if (isWebContext()) {
            collectedOutputForDisplay.push(textLine);
            displayOutputLines(collectedOutputForDisplay);
        }
        if (isServerContext()) {
            console.log(textLine);
        }
    };
    runtime.displaySingleOutputLine = displaySingleOutputLine;

    var executeEntryPoint = function(entryPointFunction) {
        if (isWebContext()) {
            window.addEventListener('load', function() {
                runtime.renderCodeSnippet(entryPointFunction);
                entryPointFunction();
            });
        }
        if (isServerContext()) {
            entryPointFunction();
        }
    };
    runtime.executeEntryPoint = executeEntryPoint;

})(ApplicationEnvironment);

var applicationCore = function() {
    var gridBoundaries = {
        minX: 0,
        minY: 0,
        maxX: 9,
        maxY: 9
    };

    var creatureMovementPatterns = [
        { dx: -1, dy: -2 }, { dx: 0, dy: -2 }, { dx: 1, dy: -2 },
        { dx: -2, dy: -1 }, { dx: 2, dy: -1 },
        { dx: -2, dy: 0 }, { dx: 2, dy: 0 },
        { dx: -2, dy: 1 }, { dx: 2, dy: 1 },
        { dx: -1, dy: 2 }, { dx: 0, dy: 2 }, { dx: 1, dy: 2 }
    ];

    var hazardSpreadPatterns = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
        { dx: -1, dy: 0 }, { dx: 0, dy: 0 }, { dx: 1, dy: 0 },
        { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
    ];

    var isCoordinateWithinGrid = function(coordObj) {
        return (coordObj.x >= gridBoundaries.minX && coordObj.x <= gridBoundaries.maxX) &&
               (coordObj.y >= gridBoundaries.minY && coordObj.y <= gridBoundaries.maxY);
    };

    var calculatePotentialLocations = function(currentLocation, motionSet) {
        return motionSet.map(function(motion) {
            return { x: currentLocation.x + motion.dx, y: currentLocation.y + motion.dy };
        }).filter(isCoordinateWithinGrid);
    };

    var getCreatureNextOptions = function(creatureLocation) {
        return calculatePotentialLocations(creatureLocation, creatureMovementPatterns);
    };

    var getHazardousAreaCoverage = function(hazardCenterLocation) {
        return calculatePotentialLocations(hazardCenterLocation, hazardSpreadPatterns);
    };

    var memoizationStore;

    var determineSurvivalOutcome = function(creaturePosition, hazardIndex, allHazards) {
        var stateKey = `${creaturePosition.x},${creaturePosition.y},${hazardIndex}`;

        if (memoizationStore.has(stateKey)) {
            return memoizationStore.get(stateKey);
        }

        if (hazardIndex === allHazards.length) {
            memoizationStore.set(stateKey, true);
            return true;
        }

        var currentHazard = allHazards[hazardIndex];
        var nextCreatureOptions = getCreatureNextOptions(creaturePosition);
        var activeWetSpots = getHazardousAreaCoverage(currentHazard);

        var canEscapeThisHazard = nextCreatureOptions.some(function(nextCreaturePos) {
            var isNextPosWet = activeWetSpots.some(function(wetSpot) {
                return nextCreaturePos.x === wetSpot.x && nextCreaturePos.y === wetSpot.y;
            });

            if (isNextPosWet) {
                return determineSurvivalOutcome(nextCreaturePos, hazardIndex + 1, allHazards);
            }
            return false;
        });

        memoizationStore.set(stateKey, canEscapeThisHazard);
        return canEscapeThisHazard;
    };

    var inputProcessingState = {
        segment: 'CREATURE_START',
        currentProblem: null
    };

    var processInputSegment = function(inputLine) {
        var numericArgs = inputLine.split(/\s+/).map(Number);

        switch (inputProcessingState.segment) {
            case 'CREATURE_START':
                if (numericArgs[0] === 0 && numericArgs[1] === 0) {
                    return;
                }
                inputProcessingState.currentProblem = {
                    creature: { x: numericArgs[0], y: numericArgs[1] },
                    hazardCount: 0,
                    hazards: []
                };
                inputProcessingState.segment = 'HAZARD_COUNT';
                break;

            case 'HAZARD_COUNT':
                inputProcessingState.currentProblem.hazardCount = numericArgs[0];
                inputProcessingState.segment = 'HAZARD_LOCATIONS';
                break;

            case 'HAZARD_LOCATIONS':
                for (var i = 0; i < numericArgs.length; i += 2) {
                    inputProcessingState.currentProblem.hazards.push({
                        x: numericArgs[i],
                        y: numericArgs[i + 1]
                    });
                }

                if (inputProcessingState.currentProblem.hazards.length === inputProcessingState.currentProblem.hazardCount) {
                    memoizationStore = new Map();

                    var outcome = determineSurvivalOutcome(
                        inputProcessingState.currentProblem.creature,
                        0,
                        inputProcessingState.currentProblem.hazards
                    );

                    ApplicationEnvironment.displaySingleOutputLine(outcome ? 'OK' : 'NA');

                    inputProcessingState.segment = 'CREATURE_START';
                    inputProcessingState.currentProblem = null;
                }
                break;
            default:
                break;
        }
    };

    ApplicationEnvironment.processInputLines(processInputSegment);
};

ApplicationEnvironment.executeEntryPoint(applicationCore);