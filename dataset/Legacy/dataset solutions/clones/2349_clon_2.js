"use strict";
    
const processInput = inputData => {
    inputData = inputData.trim().split("\n");
    const totalEntities = parseInt(inputData[0]);
    
    inputData.shift();
    
    const entityStatements = inputData;
    const entityTraits = [];
    const statementGroups = [];
    let contradictionCount = 0;
    
    // Initialize trait objects for each entity
    for(let entityIndex = 0; entityIndex < totalEntities; entityIndex++) {
        entityTraits[entityIndex] = { 0: 0, 1: 0, dishonestFrom: [], dishonestTowards: []};
    }
    
    // Parse and group statements from the input
    for(let currentLineIndex = 0; currentLineIndex < entityStatements.length; currentLineIndex++) {
        let numStatements = parseInt(entityStatements[currentLineIndex]);
        statementGroups.push(entityStatements.slice(~~currentLineIndex + 1, ~~currentLineIndex + numStatements + 1));
        
        currentLineIndex = parseInt(currentLineIndex) + parseInt(numStatements);
        
    }

    // Process each individual statement within the grouped statements
    for(let groupIdx in statementGroups) {
        for(let stmtIdx in statementGroups[groupIdx]) {
            const targetEntity = parseInt(statementGroups[groupIdx][stmtIdx].split(" ")[0]);
            const statementType = parseInt(statementGroups[groupIdx][stmtIdx].split(" ")[1]);
        
            // Increment the count for the specific statement type for the target entity
            entityTraits[targetEntity - 1][statementType]++;
            
            if(statementType === 0) {
                // If the statement is "untruthful" (type 0), record the relationships
                entityTraits[targetEntity - 1].dishonestFrom.push(parseInt(groupIdx));
                entityTraits[groupIdx].dishonestTowards.push(targetEntity - 1);
            }
        }
    }
    
    // console.log(statementGroups) // Debugging line for statement groups
    // console.log(JSON.stringify(entityTraits)); // Debugging line for entity traits map
    
    let mutualContradictionCount = 0;
    
    // Calculate final contradiction counts based on processed traits
    for(let entityKey in entityTraits) {
        // If an entity has both "untruthful" (0) and "truthful" (1) statements, it's a contradiction
        if(entityTraits[entityKey][0] >= 1 && entityTraits[entityKey][1] >= 1) {
            contradictionCount += entityTraits[entityKey][0];
        }
        
        // Check for mutual "dishonest" declarations
        for(let dishonestFromIndex in entityTraits[entityKey].dishonestFrom) {
            if(entityTraits[entityKey].dishonestTowards.filter(n=>n===entityTraits[entityKey].dishonestFrom[dishonestFromIndex]).length) {
                mutualContradictionCount++;
            }
        }
    }
    
    console.log(totalEntities - ( contradictionCount + (mutualContradictionCount / 2) ));
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
