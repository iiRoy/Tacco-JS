const fileSystemUtility=require("fs");
const getStandardInputContent=()=>{
 return ""+fileSystemUtility.readFileSync(0);
};
const displayResult=(finalValue)=>{
 console.log(finalValue);
};
/*
 * This program analyzes character sequences from standard input.
 * It operates in two distinct phases to calculate a cumulative total.
 */
// Step 1: Read and parse input.
const inputDataLines=getStandardInputContent().split('\n');
// The first line provides the governing length parameter.
const sequenceLength=parseInt(inputDataLines[0],10);
// The second line is the string sequence to be processed.
const mainSequence=inputDataLines[1];
// A dictionary to store counts of patterns generated in the first phase.
const firstHalfPatternCounts={};
/*
 * Phase 1: Generate patterns from the initial segment of the main sequence.
 * Iterate through all possible binary configurations (bitmasks)
 * from (2^sequenceLength - 1) down to 0.
 */
for(let currentBitmask=(1<<sequenceLength)-1;currentBitmask>=0;currentBitmask--){
 let currentConstructedPattern=""; // String accumulator for the current pattern.
 // Iterate through character positions in reverse order.
 for(let positionIndex=sequenceLength-1;positionIndex>=0;positionIndex--){
  // If the 'positionIndex'-th bit in 'currentBitmask' is set,
  // prepend the character at 'positionIndex' from 'mainSequence'.
  if((currentBitmask&(1<<positionIndex))){
   currentConstructedPattern=mainSequence[positionIndex]+currentConstructedPattern;
  }
  // Otherwise, append the character.
  else{
   currentConstructedPattern=currentConstructedPattern+mainSequence[positionIndex];
  }
 }
 // Increment the count for this specific pattern.
 // Uses a common idiom to initialize count to 0 if pattern is new.
 firstHalfPatternCounts[currentConstructedPattern]=(firstHalfPatternCounts[currentConstructedPattern]||0)+1;
}
/*
 * Phase 2: Generate patterns from the latter segment of the main sequence
 * and sum up their occurrences found in Phase 1.
 */
let totalAggregatedCount=0; // Accumulator for the final result.
// Again, iterate through all possible binary configurations.
for(let currentBitmask=(1<<sequenceLength)-1;currentBitmask>=0;currentBitmask--){
 let currentConstructedPattern=""; // Reset pattern accumulator for each new bitmask.
 // Iterate through character positions in reverse order.
 for(let positionIndex=sequenceLength-1;positionIndex>=0;positionIndex--){
  // Calculate the adjusted index for accessing characters from the second half of 'mainSequence'.
  // The expression `2*sequenceLength + ~positionIndex` is equivalent to `2*sequenceLength - (positionIndex + 1)`.
  const adjustedCharPosition=(2*sequenceLength)-(positionIndex+1);
  // If the 'positionIndex'-th bit is set, prepend the character.
  if((currentBitmask&(1<<positionIndex))){
   currentConstructedPattern=mainSequence[adjustedCharPosition]+currentConstructedPattern;
  }
  // Otherwise, append the character.
  else{
   currentConstructedPattern=currentConstructedPattern+mainSequence[adjustedCharPosition];
  }
 }
 // Add the count of the generated pattern from the 'firstHalfPatternCounts' map to the total.
 // If the pattern was not found in Phase 1, its count is treated as 0.
 totalAggregatedCount+=(firstHalfPatternCounts[currentConstructedPattern]||0);
}
// Output the final computed sum.
displayResult(totalAggregatedCount);