const config = { input: '/dev/stdin', newline: '\n' };

const workers = 1;

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fileSystem = require('fs');

if (isMainThread) {
    initiateMainExecution();
} else {
    performWorkerTask();
}

function initiateMainExecution() {
    let fullInputContent;
    let textSegmentLength;
    let segmentBoundaries;
    let threadPool;
    let collectedResults;
    let completedThreadsCount;

    fullInputContent = fileSystem.readFileSync(config.input, 'ascii');

    const [mainText, searchPattern] = fullInputContent.split(config.newline, 2);
    textSegmentLength = mainText.length;

    segmentBoundaries = [0];
    for (let i = 1; i < workers; i++) {
        segmentBoundaries.push(Math.floor(textSegmentLength * i / workers));
    }
    segmentBoundaries.push(textSegmentLength);

    threadPool = [];
    collectedResults = new Array(workers).fill('');
    completedThreadsCount = 0;

    for (let i = 0; i < workers; i++) {
        const segmentStart = segmentBoundaries[i];
        const segmentEnd = segmentBoundaries[i + 1];

        const currentThread = new Worker(__filename, {
            workerData: {
                mainText: mainText,
                searchPattern: searchPattern,
                segmentStart: segmentStart,
                segmentEnd: segmentEnd,
                threadIdentifier: i
            }
        });

        threadPool.push(currentThread);

        currentThread.on('message', (messagePayload) => {
            collectedResults[messagePayload.threadIdentifier] = messagePayload.result;
        });

        currentThread.on('error', (err) => {
            console.error(`Thread ${i} encountered an error:`, err);
        });

        currentThread.on('exit', (exitCode) => {
            if (exitCode !== 0) {
                console.error(`Thread ${i} terminated with code ${exitCode}`);
            }
            completedThreadsCount++;
            if (completedThreadsCount === workers) {
                for (const segmentResult of collectedResults) {
                    if (segmentResult.length > 0) {
                        console.log(segmentResult);
                    }
                }
            }
        });
    }
}

function performWorkerTask() {
    const { mainText, searchPattern, segmentStart, segmentEnd, threadIdentifier } = workerData;

    const discoveredIndices = [];
    recursivelyFindPattern(mainText, searchPattern, segmentStart, segmentEnd, discoveredIndices);

    parentPort.postMessage({
        threadIdentifier: threadIdentifier,
        result: discoveredIndices.join('\n')
    });
}

function recursivelyFindPattern(sourceText, targetPattern, currentOffset, limitOffset, foundIndicesAccumulator) {
    if (currentOffset >= limitOffset) {
        return;
    }

    const matchPosition = sourceText.indexOf(targetPattern, currentOffset);

    if (matchPosition === -1 || matchPosition >= limitOffset) {
        return;
    }

    foundIndicesAccumulator.push(matchPosition);

    recursivelyFindPattern(sourceText, targetPattern, matchPosition + 1, limitOffset, foundIndicesAccumulator);
}
