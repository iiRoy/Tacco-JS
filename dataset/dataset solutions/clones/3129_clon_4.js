var GET=(function(){function InputProcessor(rawInputString){this.sourceLines=rawInputString.trim().split("\n");this.linePointer=0;this.currentLineBuffer=null;this.tokenReadIndex=-1;}InputProcessor.prototype.a=function(returnAsString){if(this.currentLineBuffer===null||this.tokenReadIndex<0){if(this.linePointer>=this.sourceLines.length){return undefined;}this.currentLineBuffer=this.sourceLines[this.linePointer].split(" ");this.tokenReadIndex=this.currentLineBuffer.length-1;}const tokenValue=this.currentLineBuffer[this.tokenReadIndex];this.tokenReadIndex--;if(this.tokenReadIndex<0){this.linePointer++;this.currentLineBuffer=null;}return returnAsString?tokenValue:+tokenValue;};InputProcessor.prototype.l=function(returnAsString){if(this.linePointer>=this.sourceLines.length){return undefined;}this.currentLineBuffer=null;this.tokenReadIndex=-1;const lineContent=this.sourceLines[this.linePointer++];const tokens=lineContent.split(" ");return returnAsString?tokens:tokens.map(Number);};InputProcessor.prototype.m=function(numLines,returnAsString){const matrix=[];for(let i=0;i<numLines;i++){matrix.push(this.l(returnAsString));}return matrix;};InputProcessor.prototype.r=function(numLines,returnAsString){const lines=[];for(let i=0;i<numLines;i++){if(this.linePointer>=this.sourceLines.length){lines.push(undefined);continue;}this.currentLineBuffer=null;this.tokenReadIndex=-1;const lineContent=this.sourceLines[this.linePointer++];lines.push(returnAsString?lineContent:+lineContent);}return lines;};return function(inputString){return new InputProcessor(inputString);};})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

let pathAccumulator = [];
let bitCountN;

console.log(mainLogic());

function mainLogic(){
  const numBits = o.a();
  const valA = o.a();
  const valB = o.a();

  bitCountN = numBits;

  const maskForN = (1 << numBits) - 1;
  let countSetBitsA = 0;
  let tempA = valA & maskForN;
  while (tempA > 0) {
      tempA &= (tempA - 1);
      countSetBitsA++;
  }

  let countSetBitsB = 0;
  let tempB = valB & maskForN;
  while (tempB > 0) {
      tempB &= (tempB - 1);
      countSetBitsB++;
  }

  const totalSetBits = countSetBitsA + countSetBitsB;

  if (totalSetBits % 2 === 0) {
      return "NO";
  }

  solvePath(valA, valB, 0);

  console.log("YES");
  return pathAccumulator.join(" ");
}

function solvePath(initialA, initialB, initialX) {
    const executionStack = [[initialA, initialB, initialX, 0]];

    while (executionStack.length > 0) {
        let [currentA, currentB, currentX, state] = executionStack.pop();

        if (state === 0) {
            if (currentA === currentB) {
                pathAccumulator.push(currentA);
                continue;
            }

            executionStack.push([currentA, currentB, currentX, 1]);

            const differingBits = currentA ^ currentB;
            let nextY = currentA;
            let nextZ = currentA;
            let nextX_for_first_branch = currentX;

            let foundSameBit = false;
            let foundDiffBit = false;

            for (let bitIndex = 0; bitIndex < bitCountN; bitIndex++) {
                const bitMask = 1 << bitIndex;
                if (currentX & bitMask) continue;

                if (!(differingBits & bitMask)) {
                    if (!foundSameBit) {
                        nextY ^= bitMask;
                        nextZ ^= bitMask;
                        foundSameBit = true;
                    }
                } else {
                    if (!foundDiffBit) {
                        nextZ ^= bitMask;
                        nextX_for_first_branch |= bitMask;
                        foundDiffBit = true;
                    }
                }
            }
            executionStack.push([currentA, nextY, nextX_for_first_branch, 0]);

        } else if (state === 1) {
            const differingBits = currentA ^ currentB;
            let nextY_recalc = currentA;
            let nextZ_recalc = currentA;
            let nextX_for_second_branch = currentX;

            let foundSameBit_recalc = false;
            let foundDiffBit_recalc = false;

            for (let bitIndex = 0; bitIndex < bitCountN; bitIndex++) {
                const bitMask = 1 << bitIndex;
                if (currentX & bitMask) continue;

                if (!(differingBits & bitMask)) {
                    if (!foundSameBit_recalc) {
                        nextY_recalc ^= bitMask;
                        nextZ_recalc ^= bitMask;
                        foundSameBit_recalc = true;
                    }
                } else {
                    if (!foundDiffBit_recalc) {
                        nextZ_recalc ^= bitMask;
                        nextX_for_second_branch |= bitMask;
                        foundDiffBit_recalc = true;
                    }
                }
            }
            executionStack.push([nextZ_recalc, currentB, nextX_for_second_branch, 0]);
        }
    }
}
