"use strict";

const main = inputStr => {
    inputStr = inputStr.trim();
    const charArr = inputStr.split("");
    const stringLength = charArr.length;

    let rightCount = 0;
    let leftCount = 0;
    let boundaryIndex;
    let segmentTransitionCount = 0;

    let resultArray = new Array(stringLength).fill(0);

    const distributeSegmentCounts = (bIdx, rCnt, lCnt, targetArr) => {
        const totalSegmentChars = rCnt + lCnt;
        if (totalSegmentChars % 2 === 0) {
            targetArr[bIdx] = totalSegmentChars / 2;
            targetArr[bIdx + 1] = totalSegmentChars / 2;
        } else {
            const maxCount = Math.max(rCnt, lCnt);
            const isMaxCountOdd = (maxCount % 2 !== 0);

            if (isMaxCountOdd) {
                targetArr[bIdx] = rCnt;
                targetArr[bIdx + 1] = lCnt;
            } else {
                targetArr[bIdx] = lCnt;
                targetArr[bIdx + 1] = rCnt;
            }
        }
    };

    for (let idx = 0; idx < stringLength - 1; idx++) {
        const currentChar = charArr[idx];
        const nextChar = charArr[idx + 1];

        if (currentChar === "R") {
            rightCount++;
        } else if (currentChar === "L") {
            leftCount++;
        }

        if (currentChar !== nextChar) {
            segmentTransitionCount++;
            
            if (segmentTransitionCount === 1) {
                boundaryIndex = idx;
            }
        }
        
        if (segmentTransitionCount === 2) {
            distributeSegmentCounts(boundaryIndex, rightCount, leftCount, resultArray);
            
            segmentTransitionCount = 0;
            rightCount = 0;
            leftCount = 0;
        }
        
        if (idx === stringLength - 2) {
            leftCount++;
            
            distributeSegmentCounts(boundaryIndex, rightCount, leftCount, resultArray);
        }
    }
    
    console.log(resultArray.join(" "));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
