let concertSheet = [];
let sheetPointer = 0;

const acquireConcertData = () => {
    const rawConcertText = require('fs').readFileSync(0, 'utf8');
    concertSheet = rawConcertText.split('\n').filter(entry => entry.trim() !== '');
};

const extractNextValue = () => {
    return concertSheet[sheetPointer++];
};

const computeMaxScore = (timeLimit, tuneComponents) => {
    let timeScores = new Array(timeLimit + 1).fill(0);

    for (const component of tuneComponents) {
        const componentStartCost = component[0];
        const componentDuration = component[1];
        const componentWorth = component[2];

        let nextTimeScores = timeScores.slice();
        let windowIndices = []; // Deque for sliding window maximum, stores indices

        for (let currentMoment = 0; currentMoment <= timeLimit; ++currentMoment) {
            const minPrevMoment = Math.max(0, currentMoment - componentDuration);
            const candidatePrevMoment = currentMoment - componentStartCost;

            // 1. Remove indices from the front of the deque that are no longer within the sliding window
            while (windowIndices.length > 0 && windowIndices[0] < minPrevMoment) {
                windowIndices.shift();
            }

            // 2. Add the current candidate index to the deque, maintaining the monotonic property
            if (candidatePrevMoment >= 0) {
                while (windowIndices.length > 0 && nextTimeScores[windowIndices[windowIndices.length - 1]] <= nextTimeScores[candidatePrevMoment]) {
                    windowIndices.pop();
                }
                windowIndices.push(candidatePrevMoment);
            }
            
            // 3. If the deque is not empty, its front element holds the index of the maximum value in the current window
            if (windowIndices.length > 0) {
                const bestPrevScore = nextTimeScores[windowIndices[0]];
                // Update the current moment's score by considering taking this component
                nextTimeScores[currentMoment] = Math.max(nextTimeScores[currentMoment], bestPrevScore + componentWorth);
            }
        }
        timeScores = nextTimeScores; // Update the scores for the next component
    }
    return timeScores[timeLimit];
};

const orchestrateConcertPlan = () => {
    acquireConcertData();

    const countComponents = parseInt(extractNextValue(), 10);
    const componentDetails = [];
    for (let idx = 0; idx < countComponents; ++idx) {
        componentDetails.push(extractNextValue().split(' ').map(Number));
    }

    const countTunes = parseInt(extractNextValue(), 10);
    const tuneDurations = [];
    for (let idx = 0; idx < countTunes; ++idx) {
        tuneDurations.push(parseInt(extractNextValue(), 10));
    }

    const finalResults = [];
    let encounteredZero = false;

    for (const individualTuneDuration of tuneDurations) {
        const currentTuneScore = computeMaxScore(individualTuneDuration, componentDetails);
        if (currentTuneScore === 0) {
            encounteredZero = true;
            break;
        }
        finalResults.push(currentTuneScore);
    }

    if (encounteredZero) {
        console.log(-1);
    } else {
        finalResults.forEach(scoreEntry => console.log(scoreEntry));
    }
};

orchestrateConcertPlan();