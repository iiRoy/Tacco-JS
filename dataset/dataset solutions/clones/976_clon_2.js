let options = { sourceFile: '/dev/stdin', lineBreak: '\n' };

const concurrencyLevel = 1;

if (!process.env.hasOwnProperty('isChild'))
  orchestrator();
else
  workerTask();


function orchestrator() {
  let entireData, contentSize, segmentBoundaries, childProcesses, commandPath, commandArgs, environmentVars, k, completedChildren;

  entireData = require('node:fs').readFileSync(options.sourceFile, 'ascii');

  contentSize = entireData.indexOf(options.lineBreak);
  segmentBoundaries = [0];
  for (k = 1; k < concurrencyLevel; k++) {
    segmentBoundaries.push(
      Math.floor(contentSize * k / concurrencyLevel)
    );
  }
  segmentBoundaries.push(contentSize);

  commandPath = process.argv[0];
  commandArgs = process.argv.slice(1);
  
  childProcesses = [];
  let outputFragments = [];
  for (k = 0; k < concurrencyLevel; k++) {
    environmentVars = {};
    environmentVars['isChild'] = true;
    environmentVars['taskIndex'] = k;
    environmentVars['startOffset'] = segmentBoundaries[k];
    environmentVars['endOffset'] = segmentBoundaries[k+1];
    childProcesses.push(
      require('node:child_process').spawn(commandPath, commandArgs, {
        'env': environmentVars,
        'stdio': ['pipe', 'pipe', null]
      })
    );
    outputFragments.push('');
  }

  for (k in childProcesses) {
    childProcesses[k].stdout.setEncoding('ascii');
    childProcesses[k].stdout.on('data',
      (function () {
        let currentIdx = k;
        return function (dataBlock) {
          outputFragments[currentIdx] = outputFragments[currentIdx] + dataBlock;
        };
      })()
    );
    childProcesses[k].stdout.resume();
  }
  
  completedChildren = 0;
  for (k in childProcesses) {
    childProcesses[k].on('exit',
      (function () {
        let exitIdx = k;
        return function () {
          let m;
          completedChildren++;
          if (completedChildren === concurrencyLevel) {
            for (m in outputFragments) {
              if (outputFragments[m].length !== 0) {
                console.log(outputFragments[m]);
              }
            }
          }
        };
      })()
    );
  }

  for (k in childProcesses) {
    childProcesses[k].stdin.write(entireData, 'ascii');
    childProcesses[k].stdin.end();
  }
}

function workerTask() {
  let inputBuffer;
  inputBuffer = '';
  process.stdin.setEncoding('ascii');
  process.stdin.on('data', function (dataBlock) { inputBuffer = inputBuffer + dataBlock; });
  process.stdin.on('end', executeWorkerLogic);
  process.stdin.resume();

  function executeWorkerLogic() {
    let parsedLines, textToSearch, patternToFind, startIndex, endOffset, foundIndices, searchPosition;
    parsedLines = inputBuffer.split(options.lineBreak, 2);
    textToSearch = parsedLines[0];
    patternToFind = parsedLines[1];
    startIndex = parseInt(process.env.startOffset, 10);
    endOffset = parseInt(process.env.endOffset, 10);
    foundIndices = [];
    searchPosition = startIndex;
    while ((searchPosition = textToSearch.indexOf(patternToFind, searchPosition)) !== -1 && searchPosition < endOffset) {
      foundIndices.push(searchPosition);
      searchPosition++;
    }
    process.stdout.write(foundIndices.join('\n'), 'ascii');
    process.stdout.end();
    process.exit();
  }
}