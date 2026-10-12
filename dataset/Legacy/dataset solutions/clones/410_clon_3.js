function generatePermutations(inputArray) {
  const arrLen = inputArray.length;
  const allPerms = [inputArray.slice()];
  const controlArr = new Array(arrLen).fill(0);

  let idx = 1;
  let swapTargetIdx, tempElement;

  while (idx < arrLen) {
    if (controlArr[idx] < idx) {
      swapTargetIdx = (idx % 2 === 1) ? controlArr[idx] : 0;

      tempElement = inputArray[idx];
      inputArray[idx] = inputArray[swapTargetIdx];
      inputArray[swapTargetIdx] = tempElement;

      controlArr[idx]++;
      idx = 1;
      allPerms.push(inputArray.slice());
    } else {
      controlArr[idx] = 0;
      idx++;
    }
  }
  return allPerms;
}

const precomputedPermutations = [[]];
for (let currentLength = 1; currentLength <= 10; currentLength++) {
   const currentArray = [];
   for (let j = 0; j < currentLength; j++) {
       currentArray.push(j);
   }
   precomputedPermutations[currentLength] = generatePermutations(currentArray);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split("\n");

while (true) {
   const currentN = Number(inputLines.shift());
   if (currentN === 0) {
       break;
   }

   const parsedTaskData = Array.from({ length: currentN }, () => {
       const [taskName, val1, val2] = inputLines.shift().split(" ");
       return [taskName, Number(val1), Number(val2)];
   });

   const currentPermutations = precomputedPermutations[currentN];

   let maxRatio = 0;
   let bestPermutation = [];

   for (let permIndex = 0; permIndex < currentPermutations.length; permIndex++) {
      const currentPerm = currentPermutations[permIndex];

      let isPermutationValid = true;
      let currentTotalWeight = 0;
      let currentWeightedSum = 0;

      for (let taskOrderIdx = 0; taskOrderIdx < currentPerm.length; taskOrderIdx++) {
         const taskIndex = currentPerm[taskOrderIdx];
         const [taskName, taskWeight, taskDeadline] = parsedTaskData[taskIndex];

         if (currentTotalWeight > taskDeadline) {
            isPermutationValid = false;
            break;
         }
         
         currentTotalWeight += taskWeight;
         currentWeightedSum += taskWeight * (taskOrderIdx + 1);
      }

      if (isPermutationValid) {
         const calculatedRatio = currentWeightedSum / currentTotalWeight;
         if (calculatedRatio > maxRatio) {
            maxRatio = calculatedRatio;
            bestPermutation = currentPerm;
         }
      }
   }

   const resultNames = bestPermutation.map(taskIdx => parsedTaskData[taskIdx][0]);
   console.log(resultNames.reverse().join("\n"));
}
