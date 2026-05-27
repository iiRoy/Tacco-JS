const GROUP_SIZE = 3;
const SINGLE_UNIT = 1;
const TERMINATION_SIGNAL = "0 0 0 0 0 0";

function strategyOneCalculation(resA, resB, resC) {
   let currentOperationCount = 0;
   let operationOccurredInIteration;
   do {
      operationOccurredInIteration = false;
      if (resA >= SINGLE_UNIT && resB >= SINGLE_UNIT && resC >= SINGLE_UNIT) {
         resA -= SINGLE_UNIT;
         resB -= SINGLE_UNIT;
         resC -= SINGLE_UNIT;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resA >= GROUP_SIZE) {
         resA -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resB >= GROUP_SIZE) {
         resB -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resC >= GROUP_SIZE) {
         resC -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
   } while (operationOccurredInIteration);
   return currentOperationCount;
}

function strategyTwoCalculation(resA, resB, resC) {
   let currentOperationCount = 0;
   let operationOccurredInIteration;
   do {
      operationOccurredInIteration = false;
      if (resA >= SINGLE_UNIT && resB >= SINGLE_UNIT && resC >= SINGLE_UNIT) {
         resA -= SINGLE_UNIT;
         resB -= SINGLE_UNIT;
         resC -= SINGLE_UNIT;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      // This is a duplicate condition in the original, preserving it.
      if (resA >= SINGLE_UNIT && resB >= SINGLE_UNIT && resC >= SINGLE_UNIT) {
         resA -= SINGLE_UNIT;
         resB -= SINGLE_UNIT;
         resC -= SINGLE_UNIT;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resA >= GROUP_SIZE) {
         resA -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resB >= GROUP_SIZE) {
         resB -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resC >= GROUP_SIZE) {
         resC -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
   } while (operationOccurredInIteration);
   return currentOperationCount;
}

function strategyThreeCalculation(resA, resB, resC) {
   let currentOperationCount = 0;
   let operationOccurredInIteration;
   do {
      operationOccurredInIteration = false;
      if (resA >= GROUP_SIZE) {
         resA -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resB >= GROUP_SIZE) {
         resB -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resC >= GROUP_SIZE) {
         resC -= GROUP_SIZE;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
      if (resA >= SINGLE_UNIT && resB >= SINGLE_UNIT && resC >= SINGLE_UNIT) {
         resA -= SINGLE_UNIT;
         resB -= SINGLE_UNIT;
         resC -= SINGLE_UNIT;
         currentOperationCount++;
         operationOccurredInIteration = true;
      }
   } while (operationOccurredInIteration);
   return currentOperationCount;
}

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLineArray = fileData.trim().split("\n");

while (true) {
   const currentLineString = inputLineArray.shift();
   if (currentLineString === TERMINATION_SIGNAL) {
      break;
   }

   const parsedNumbers = currentLineString.split(" ").map(Number);
   
   let totalResA = parsedNumbers[0] + parsedNumbers[3];
   let totalResB = parsedNumbers[1] + parsedNumbers[4];
   let totalResC = parsedNumbers[2] + parsedNumbers[5];
   
   let finalOperationTotal = 0;

   // Calculate initial groups of 3
   let initialGroupsA = Math.floor(totalResA / GROUP_SIZE);
   let initialGroupsB = Math.floor(totalResB / GROUP_SIZE);
   let initialGroupsC = Math.floor(totalResC / GROUP_SIZE);

   // Adjust resources and counts if initial groups exist
   if (initialGroupsA >= SINGLE_UNIT) {
      initialGroupsA--; // Decrement the group count
      totalResA = (totalResA % GROUP_SIZE) + GROUP_SIZE; // Restore 3 units to A for further processing
   }
   if (initialGroupsB >= SINGLE_UNIT) {
      initialGroupsB--; // Decrement the group count
      totalResB = (totalResB % GROUP_SIZE) + GROUP_SIZE; // Restore 3 units to B
   }
   if (initialGroupsC >= SINGLE_UNIT) {
      initialGroupsC--; // Decrement the group count
      totalResC = (totalResC % GROUP_SIZE) + GROUP_SIZE; // Restore 3 units to C
   }

   // Add the adjusted initial group counts to the total
   finalOperationTotal += initialGroupsA;
   finalOperationTotal += initialGroupsB;
   finalOperationTotal += initialGroupsC;

   // Calculate remaining operations using the three strategies
   const maxRemainingOperations = Math.max(
      strategyOneCalculation(totalResA, totalResB, totalResC),
      strategyTwoCalculation(totalResA, totalResB, totalResC),
      strategyThreeCalculation(totalResA, totalResB, totalResC)
   );
   
   finalOperationTotal += maxRemainingOperations;
   
   console.log(finalOperationTotal);
}
