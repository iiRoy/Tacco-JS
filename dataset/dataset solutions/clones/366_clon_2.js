'use strict';
const AppUtilities = {};
((utilityNamespace) => {
  // Function to determine if the current environment is a web browser.
  const checkBrowserEnv = () => {
    return typeof window !== 'undefined';
  };
  utilityNamespace.checkBrowserEnv = checkBrowserEnv;

  // Function to determine if the current environment is Node.js.
  const checkNodeEnv = () => {
    return !checkBrowserEnv();
  };
  utilityNamespace.checkNodeEnv = checkNodeEnv;

  // Conditional block for browser-specific functionalities.
  if (checkBrowserEnv()) {
    // Escapes special HTML characters in a given string.
    const encodeForHtml = (inputString) => {
      return String(inputString)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };
    utilityNamespace.encodeForHtml = encodeForHtml;

    // Displays the source code of a specified function within a designated HTML element.
    const displayCodeSnippet = (targetFunction) => {
      document.getElementById('code').innerHTML = `<pre><code>${encodeForHtml(targetFunction)}</code></pre>`;
    };
    utilityNamespace.displayCodeSnippet = displayCodeSnippet;
  }

  // Retrieves input lines, adapting to browser or Node.js environment.
  const retrieveInputLines = () => {
    let receivedLines = [];
    if (checkBrowserEnv()) {
      const htmlContent = document.getElementById('input').innerHTML;
      receivedLines = htmlContent.split('<br>');
      for (let i = 0; i < receivedLines.length; i++) {
        receivedLines[i] = receivedLines[i].trim();
      }
    }
    if (checkNodeEnv()) {
      receivedLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    }
    return receivedLines;
  };

  // Sets up a mechanism to process input line by line.
  const configureLineProcessor = (processCallback) => {
    if (checkBrowserEnv()) {
      const allLines = retrieveInputLines();
      for (let j = 0; j < allLines.length; j++) {
        processCallback(allLines[j]);
      }
    }
    if (checkNodeEnv()) {
      const fileStream = require('fs').ReadStream('/dev/stdin');
      const lineReaderInterface = require('readline').createInterface({
        'input': fileStream,
        'output': {}
      });
      lineReaderInterface.on('line', (currentLine) => {
        processCallback(currentLine);
      });
    }
  };
  utilityNamespace.configureLineProcessor = configureLineProcessor;

  // Displays an array of output lines in the appropriate environment.
  const renderOutputLines = (linesToDisplay) => {
    if (checkBrowserEnv()) {
      document.getElementById('output').innerHTML = linesToDisplay.map(encodeForHtml).join('<br>\n');
    }
    if (checkNodeEnv()) {
      for (let k = 0; k < linesToDisplay.length; k++) {
        console.log(linesToDisplay[k]);
      }
    }
  };
  utilityNamespace.renderOutputLines = renderOutputLines;

  let currentOutputBuffer = [];
  // Displays a single line of output.
  const renderSingleLine = (singleLineContent) => {
    if (checkBrowserEnv()) {
      currentOutputBuffer.push(singleLineContent);
      document.getElementById('output').innerHTML = currentOutputBuffer.map(encodeForHtml).join('<br>\n');
    }
    if (checkNodeEnv()) {
      console.log(singleLineContent);
    }
  };
  utilityNamespace.renderSingleLine = renderSingleLine;

  // Orchestrates the execution of the primary application logic.
  const executeMainLogic = (applicationEntry) => {
    if (checkBrowserEnv()) {
      window.onload = () => {
        displayCodeSnippet(applicationEntry);
        applicationEntry();
      };
    }
    if (checkNodeEnv()) {
      applicationEntry();
    }
  };
  utilityNamespace.executeMainLogic = executeMainLogic;
})(AppUtilities);

const primaryApplication = () => {
  // Define grid boundaries for the game area.
  const gridStartX = 0;
  const gridStartY = 0;
  const gridDimensionX = 10;
  const gridDimensionY = 10;

  // Movement vectors for the main character (like a knight in chess).
  const knightLikeMoves = [
    [-1, -2],
    [0, -2],
    [1, -2],
    [-2, -1],
    [2, -1],
    [-2, 0],
    [2, 0],
    [-2, 1],
    [2, 1],
    [-1, 2],
    [0, 2],
    [1, 2]
  ];
  // Movement vectors for area-of-effect elements (3x3 square).
  const areaEffectMoves = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1]
  ];

  // Enumeration for different types of input data segments.
  const inputSegmentTypes = {};
  inputSegmentTypes.playerStart = 0;
  inputSegmentTypes.countOfEffects = 1;
  inputSegmentTypes.effectPositions = 2;

  let currentInputData; // Object to hold parsed input for the current test case.
  let processedLineIndex = 0; // Counter for the number of input lines processed.

  // Determines if a given coordinate is within the defined game grid.
  const isWithinGridBounds = (coordX, coordY) => {
    if (gridStartX <= coordX && coordX < gridDimensionX) {
      if (gridStartY <= coordY && coordY < gridDimensionY) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  // Calculates all valid new positions from a starting point given a set of movement patterns.
  const calculatePossibleMoves = (currentPosition, movementPatterns) => {
    const resultingPositions = [];
    for (let m = 0; m < movementPatterns.length; m++) {
      const pattern = movementPatterns[m];
      const newX = currentPosition[0] + pattern[0];
      const newY = currentPosition[1] + pattern[1];
      if (isWithinGridBounds(newX, newY)) {
        resultingPositions.push([newX, newY]);
      }
    }
    return resultingPositions;
  };

  // Gets the next possible locations for the main character.
  const getKnightSuccessorPositions = (knightPosition) => {
    return calculatePossibleMoves(knightPosition, knightLikeMoves);
  };

  // Gets all grid cells that are affected by a given area-of-effect element.
  const getEffectedZones = (effectCenter) => {
    return calculatePossibleMoves(effectCenter, areaEffectMoves);
  };

  let memoizationStore; // Cache for storing results of subproblems.
  let pathHistory; // A stack to keep track of the character's path during recursion.
  let recursionDepth; // Counts the number of recursive calls made.

  // Determines if the character can survive all active area-of-effect zones.
  const checkSurvivalOutcome = (playerLocation, activeEffectZones) => {
    recursionDepth++;
    // Construct a unique key for the memoization cache.
    const memoKey = `${activeEffectZones.length}, ${playerLocation[0]}, ${playerLocation[1]}`;

    if (memoKey in memoizationStore) {
      return memoizationStore[memoKey];
    }

    pathHistory.push(playerLocation);

    // Base case: If no more effect zones, survival is assured.
    if (activeEffectZones.length <= 0) {
      return true;
    }

    const currentEffectCenter = activeEffectZones[0];
    const nextPlayerPositions = getKnightSuccessorPositions(playerLocation);
    const affectedAreas = getEffectedZones(currentEffectCenter);

    // Iterate through all potential next positions for the player.
    for (let p = 0; p < nextPlayerPositions.length; p++) {
      const potentialPlayerPos = nextPlayerPositions[p];
      // Check if this potential position is within the current effect zone.
      for (let q = 0; q < affectedAreas.length; q++) {
        const singleAffectedSpot = affectedAreas[q];
        if (potentialPlayerPos[0] === singleAffectedSpot[0] &&
          potentialPlayerPos[1] === singleAffectedSpot[1]) {
          // If caught by the current effect, check survival against remaining effects.
          const remainingEffectZones = activeEffectZones.slice(1);
          const canContinue = checkSurvivalOutcome(potentialPlayerPos, remainingEffectZones);
          if (canContinue) {
            memoizationStore[memoKey] = true;
            return true;
          }
        }
      }
    }

    pathHistory.splice(pathHistory.length - 1, 1); // Backtrack from the path.
    memoizationStore[memoKey] = false; // Cache the result as non-survivable.
    return false;
  };

  // Processes each line of input data.
  const processInputLine = (inputLineText) => {
    const parsedArguments = inputLineText.split(' ');
    for (let r = 0; r < parsedArguments.length; r++) {
      parsedArguments[r] = parseFloat(parsedArguments[r]);
    }

    const segmentType = processedLineIndex % Object.keys(inputSegmentTypes).length;

    if (segmentType === inputSegmentTypes.playerStart) {
      currentInputData = {};
      currentInputData.playerChar = {};
      currentInputData.effectLocations = [];
      currentInputData.playerChar.posX = parsedArguments[0];
      currentInputData.playerChar.posY = parsedArguments[1];
      // Special check for the termination condition.
      if (currentInputData.playerChar.posX === 0 && currentInputData.playerChar.posY === 0) {
        // This signifies the end of input.
      }
    } else if (segmentType === inputSegmentTypes.countOfEffects) {
      currentInputData.effectCount = parsedArguments[0];
    } else if (segmentType === inputSegmentTypes.effectPositions) {
      for (let s = 0; s < parsedArguments.length; s += 2) {
        currentInputData.effectLocations.push([parsedArguments[s], parsedArguments[s + 1]]);
      }

      recursionDepth = 0;
      memoizationStore = {};
      pathHistory = [];

      // Execute the survival check for the current scenario and output result.
      if (checkSurvivalOutcome([currentInputData.playerChar.posX, currentInputData.playerChar.posY], currentInputData.effectLocations)) {
        AppUtilities.renderSingleLine('OK');
      } else {
        AppUtilities.renderSingleLine('NA');
      }
    } else {
      // Handle unrecognized input segment type if necessary.
    }
    processedLineIndex++;
  };

  AppUtilities.configureLineProcessor(processInputLine);
};

AppUtilities.executeMainLogic(primaryApplication);