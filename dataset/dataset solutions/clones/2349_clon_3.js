"use strict";

const processInput = (rawInput) => {
    const inputLines = rawInput.trim().split("\n");
    const numPeople = parseInt(inputLines[0]);
    const statementLines = inputLines.slice(1);
    
    const UNKIND_STATEMENT_TYPE = 0;
    const KIND_STATEMENT_TYPE = 1;

    const allStatementsByPerson = [];
    let currentLineIndex = 0;

    for (let personIndex = 0; personIndex < numPeople; personIndex++) {
        const statementsCountForCurrentPerson = parseInt(statementLines[currentLineIndex]);
        currentLineIndex++;
        
        const statementsMadeByThisPerson = [];
        for (let k = 0; k < statementsCountForCurrentPerson; k++) {
            statementsMadeByThisPerson.push(statementLines[currentLineIndex]);
            currentLineIndex++;
        }
        allStatementsByPerson.push(statementsMadeByThisPerson);
    }

    const personTruthData = Array.from({ length: numPeople }, () => ({
        statementsAboutUnkind: 0,
        statementsAboutKind: 0,
        accusedOthersOfUnkindness: [], // List of people this person (index) accused of being unkind
        accusedByOthersOfUnkindness: [] // List of people who accused this person (index) of being unkind
    }));

    for (let personIndex = 0; personIndex < allStatementsByPerson.length; personIndex++) {
        const statementsFromCurrentPerson = allStatementsByPerson[personIndex];
        
        for (let statementIndex = 0; statementIndex < statementsFromCurrentPerson.length; statementIndex++) {
            const statementParts = statementsFromCurrentPerson[statementIndex].split(" ");
            const targetPersonOneBased = parseInt(statementParts[0]);
            const statementType = parseInt(statementParts[1]);
            
            const targetPersonZeroBased = targetPersonOneBased - 1;
            
            if (statementType === UNKIND_STATEMENT_TYPE) {
                personTruthData[targetPersonZeroBased].statementsAboutUnkind++;
                personTruthData[targetPersonZeroBased].accusedByOthersOfUnkindness.push(personIndex);
                personTruthData[personIndex].accusedOthersOfUnkindness.push(targetPersonZeroBased);
            } else { // KIND_STATEMENT_TYPE
                personTruthData[targetPersonZeroBased].statementsAboutKind++;
            }
        }
    }
    
    let contradictoryUnkindAssertions = 0;
    let mutualUnkindAccusations = 0;
    
    for (let personIndex = 0; personIndex < numPeople; personIndex++) {
        const currentPersonRecord = personTruthData[personIndex];
        
        if (currentPersonRecord.statementsAboutUnkind >= 1 && currentPersonRecord.statementsAboutKind >= 1) {
            contradictoryUnkindAssertions += currentPersonRecord.statementsAboutUnkind;
        }
        
        for (const accusedPerson of currentPersonRecord.accusedOthersOfUnkindness) {
            if (personTruthData[accusedPerson].accusedByOthersOfUnkindness.includes(personIndex)) {
                mutualUnkindAccusations++;
            }
        }
    }
    
    console.log(numPeople - (contradictoryUnkindAssertions + (mutualUnkindAccusations / 2)));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
