let sourceLines = [];
let sourceIndex = 0;
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', function(currentLine){
  sourceLines.push(currentLine);
});

inputProcessor.on('close', function(){
  // The original code invokes Main() here. We'll call our primary logic function.
  processAnimalConfiguration();
});

// Helper functions for reading input, distinct from original's `next` and `myconv`
function retrieveInteger(){
  return parseInt(sourceLines[sourceIndex++], 10);
}

function retrieveCharacterArray(){
  return sourceLines[sourceIndex++].split('');
}

// Helper function for output, distinct from original's `myout`
function presentResult(content){
  console.log(content);
}

// Main logic function, distinct from original's `Main`
function processAnimalConfiguration() {
    const totalEntities = retrieveInteger();
    const entityObservations = retrieveCharacterArray();

    // Using lookup tables for type and observation conversions, different from original's switch-case
    const entityTypeMapping = { 'S': 0, 'W': 1, 0: 'S', 1: 'W' };
    const observationValueMapping = { 'o': 0, 'x': 1 };

    // Convert character observations to numeric values (0 for 'o', 1 for 'x')
    const numericObservationValues = entityObservations.map(char => observationValueMapping[char]);

    // Initialize the sequence of entity types with the fixed (S, S) starting assumption
    // 'S' is mapped to 0, so the first two types are 0, 0
    const generatedEntityTypes = [entityTypeMapping['S'], entityTypeMapping['S']];

    // Generate the rest of the entity types using a functional `reduce` approach
    // The loop in the original code runs `totalEntities - 1` times (for i from 1 to N-1).
    // The `reduce` callback's `loopIndex` corresponds to `i-1` in the original loop.
    // So, `i = loopIndex + 1`.
    // The recurrence relation is `S_{i+1} = S_{i-1} XOR S_i XOR O_i`.
    // In terms of the `generatedEntityTypes` array and `loopIndex`:
    // `S_{i-1}` is `generatedEntityTypes[loopIndex]`.
    // `S_i` is `generatedEntityTypes[loopIndex + 1]`.
    // `O_i` is `numericObservationValues[loopIndex + 1]`.
    // The new type `S_{i+1}` is then pushed to the accumulator.
    Array.from({ length: totalEntities - 1 }).reduce((accumulatorArray, _, loopIndex) => {
        const firstPrecedingType = accumulatorArray[loopIndex]; // Corresponds to S_{i-1}
        const secondPrecedingType = accumulatorArray[loopIndex + 1]; // Corresponds to S_i
        const currentObservationInput = numericObservationValues[loopIndex + 1]; // Corresponds to O_i

        const newlyDerivedType = firstPrecedingType ^ secondPrecedingType ^ currentObservationInput;
        accumulatorArray.push(newlyDerivedType);
        return accumulatorArray;
    }, generatedEntityTypes); // `generatedEntityTypes` now contains S_0, S_1, ..., S_N

    // Verify the final consistency condition: the (N+1)-th element (S_N) must be 'S' (0)
    const lastComputedType = generatedEntityTypes[totalEntities];
    const requiredLastType = entityTypeMapping['S']; // 'S' is 0

    if (lastComputedType === requiredLastType) {
        // If the condition is met, extract the sequence of types from S_0 to S_{N-1}
        const finalArrangement = generatedEntityTypes.slice(0, totalEntities)
                                              .map(type => entityTypeMapping[type])
                                              .join('');
        presentResult(finalArrangement);
    } else {
        // Otherwise, indicate no valid configuration was found for this starting assumption
        presentResult(-1);
    }
}