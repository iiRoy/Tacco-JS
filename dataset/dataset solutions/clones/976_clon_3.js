const fsModule = require('fs');
const childProcessModule = require('child_process');

const appConfig = { input: '/dev/stdin', newline: '\n' };
const numWorkers = 1;

if (!process.env.hasOwnProperty('child')) {
  orchestrateWorkers();
} else {
  executeWorkerTask();
}

function calculateSegmentBoundaries(totalLength, workerCount) {
  const boundaries = [0];
  for (let i = 1; i < workerCount; i++) {
    boundaries.push(Math.floor(totalLength * i / workerCount));
  }
  boundaries.push(totalLength);
  return boundaries;
}

function createChildProcessEnv(workerIndex, segmentBoundaries) {
  const envVars = { ...process.env };
  envVars['child'] = 'true';
  envVars['index'] = String(workerIndex);
  envVars['start'] = String(segmentBoundaries[workerIndex]);
  envVars['end'] = String(segmentBoundaries[workerIndex + 1]);
  return envVars;
}

function orchestrateWorkers() {
  const inputContent = fsModule.readFileSync(appConfig.input, 'ascii');
  const firstLineLength = inputContent.indexOf(appConfig.newline);

  if (firstLineLength === -1) {
    console.error("Error: Newline character not found in input or empty input.");
    process.exit(1);
  }

  const segmentBoundaries = calculateSegmentBoundaries(firstLineLength, numWorkers);

  const nodeExecutable = process.argv[0];
  const scriptArguments = process.argv.slice(1);

  const childProcesses = [];
  const workerResults = Array(numWorkers).fill('');

  for (let workerIndex = 0; workerIndex < numWorkers; workerIndex++) {
    const childEnvVars = createChildProcessEnv(workerIndex, segmentBoundaries);
    
    const childProc = childProcessModule.spawn(nodeExecutable, scriptArguments, {
      'env': childEnvVars,
      'stdio': ['pipe', 'pipe', null]
    });
    childProcesses.push(childProc);
  }

  childProcesses.forEach((childProc, workerIndex) => {
    childProc.stdout.setEncoding('ascii');
    childProc.stdout.on('data', (chunk) => {
      workerResults[workerIndex] += chunk;
    });
    childProc.stdout.resume();
  });

  let completedWorkersCount = 0;

  childProcesses.forEach((childProc) => {
    childProc.on('exit', () => {
      completedWorkersCount++;
      if (completedWorkersCount === numWorkers) {
        workerResults.forEach(result => {
          if (result.length > 0) {
            console.log(result);
          }
        });
      }
    });
  });

  childProcesses.forEach(childProc => {
    childProc.stdin.write(inputContent, 'ascii');
    childProc.stdin.end();
  });
}

function getNumericEnvVar(envVarName) {
  const value = process.env[envVarName];
  if (value === undefined) {
    console.error(`Error: Environment variable '${envVarName}' is missing.`);
    process.exit(1);
  }
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    console.error(`Error: Environment variable '${envVarName}' is not a valid number: ${value}`);
    process.exit(1);
  }
  return parsedValue;
}

function findPatternIndicesInSegment(target, pattern, segmentStart, segmentEnd) {
  const foundIndices = [];
  let currentSearchIndex = segmentStart;
  while ((currentSearchIndex = target.indexOf(pattern, currentSearchIndex)) !== -1 && currentSearchIndex < segmentEnd) {
    foundIndices.push(currentSearchIndex);
    currentSearchIndex++;
  }
  return foundIndices;
}

function executeWorkerTask() {
  let fullInputString = '';
  process.stdin.setEncoding('ascii');

  process.stdin.on('data', (chunk) => { fullInputString += chunk; });
  process.stdin.on('end', () => processChildInput(fullInputString));

  process.stdin.resume();

  function processChildInput(receivedInput) {
    const splitLines = receivedInput.split(appConfig.newline, 2);
    const targetString = splitLines[0];
    const patternString = splitLines[1];

    const segmentStart = getNumericEnvVar('start');
    const segmentEnd = getNumericEnvVar('end');

    const foundIndices = findPatternIndicesInSegment(targetString, patternString, segmentStart, segmentEnd);

    process.stdout.write(foundIndices.join('\n'), 'ascii');
    process.stdout.end();
    process.exit(0);
  }
}
