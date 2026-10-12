function ProcessData(rawData) {
    rawData = rawData.split("\n");
    const numStrings = rawData[1].split(" ");
    const N_val = parseInt(rawData[0], 10);

    let resultFlag = 1;
    let unusedVar = 0;

    const freqCounts = new Array(numStrings.length).fill(0);

    const validateParityAndFrequency = (nParity, currentIdxParity, currentFreq) => {
        if (nParity === 0) {
            if (currentIdxParity === 1) {
                return currentFreq === 2;
            } else {
                return currentFreq === 0;
            }
        } else {
            if (currentIdxParity === 0) {
                return currentFreq === 2;
            } else {
                return currentFreq === 0;
            }
        }
    };

    for (let idxB = 0; idxB < numStrings.length; idxB++) {
        const currentNum = parseInt(numStrings[idxB], 10);
        freqCounts[currentNum]++;
        if (freqCounts[currentNum] > 2) {
            resultFlag = 0;
            break;
        }
    }

    if (resultFlag === 0) {
        // No further checks needed if resultFlag is already 0
    } else {
        const isN_Odd = (N_val % 2 === 1);
        const zeroCount = freqCounts[0];

        if (isN_Odd && zeroCount !== 1) {
            resultFlag = 0;
        } else {
            for (let idxC = 1; idxC < numStrings.length; idxC++) {
                const nValParity = N_val % 2;
                const currentIdxParity = idxC % 2;
                const currentFreq = freqCounts[idxC];

                if (!validateParityAndFrequency(nValParity, currentIdxParity, currentFreq)) {
                    resultFlag = 0;
                    break;
                }
            }
        }
    }

    if (resultFlag === 1) {
        const halfLength = Math.floor(numStrings.length / 2);
        const modulusValue = Math.pow(10, 9) + 7;
        resultFlag = Math.pow(halfLength, 2) % modulusValue;
    }

    console.log('%s', resultFlag);
}

function debug() {
	var rawData = document.getElementById("input").value;
	ProcessData(rawData);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
