function processInputAndDetermineOutcome(sourceText) {
    const segmentCollection = sourceText.trim().split(' ');
    
    let numericalRepresentations = [];
    let segmentIndex = 0;

    // Iterate through segments to extract the first two numerical values.
    // This uses an imperative loop with a specific termination condition,
    // differing from the functional 'map' approach of the original.
    while (segmentIndex < segmentCollection.length && numericalRepresentations.length < 2) {
        const currentSegment = segmentCollection[segmentIndex];
        const parsedNumber = Number.parseInt(currentSegment, 10);
        numericalRepresentations.push(parsedNumber);
        segmentIndex++;
    }

    // Ensure we have at least two values, padding with NaN if the input was too short.
    // This maintains behavioral equivalence for cases where args[1] might be NaN.
    while (numericalRepresentations.length < 2) {
        numericalRepresentations.push(Number.NaN);
    }

    const primaryValue = numericalRepresentations[0];
    const secondaryValue = numericalRepresentations[1];

    // Employ a different core expression design using boolean-to-number coercion
    // instead of a ternary operator for the conditional logic.
    const finalResult = (primaryValue >= secondaryValue) * 10;
    
    console.log(finalResult);
}
 
processInputAndDetermineOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
