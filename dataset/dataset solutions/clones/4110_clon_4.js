"use strict";

let finalOutcomeTally = 0;

const analyzeInputData = (inputSource) => {
    const allLines = inputSource.trim().split('\n');
    const [headerLine] = allLines;
    const [elementCount, initialEnergyLevel] = headerLine.split(' ').map(Number);

    const capabilityDescriptors = allLines.slice(1, elementCount + 1).map(entryText => {
        const [mainEffect, auxiliaryEffect] = entryText.split(' ').map(Number);
        return { main: mainEffect, auxiliary: auxiliaryEffect };
    });

    return { totalElements: elementCount, startingEnergy: initialEnergyLevel, capabilities: capabilityDescriptors };
};

const identifyPeakMainEffect = (descriptorCollection) => {
    return descriptorCollection.capabilities.reduce((maxVal, desc) => Math.max(maxVal, desc.main), 0);
};

const calculateAuxiliaryDamageCredit = (descriptorCollection, peakMainEffectValue) => {
    return descriptorCollection.capabilities.reduce((currentSum, desc) => {
        return desc.auxiliary > peakMainEffectValue ? currentSum + desc.auxiliary : currentSum;
    }, 0);
};

const computeInitialMainActions = (currentEnergy, auxiliaryCreditValue, peakMainEffectValue) => {
    let requiredActions = 0;
    if (currentEnergy > auxiliaryCreditValue) {
        requiredActions = Math.ceil((currentEnergy - auxiliaryCreditValue) / peakMainEffectValue);
    }
    return Math.max(0, requiredActions);
};

const executeFirstCombatPhase = (structuredData) => {
    const peakMain = identifyPeakMainEffect(structuredData);
    const auxiliaryCredit = calculateAuxiliaryDamageCredit(structuredData, peakMain);
    let initialActionCount = computeInitialMainActions(structuredData.startingEnergy, auxiliaryCredit, peakMain);
    let remainingEnergy = structuredData.startingEnergy - (initialActionCount * peakMain);

    return {
        remainingEnergyLevel: remainingEnergy,
        cumulativeActions: initialActionCount,
        allAuxiliaryPowers: structuredData.capabilities.map(desc => desc.auxiliary)
    };
};

const completeCombatEngagement = (phaseOneResult) => {
    let totalActions = phaseOneResult.cumulativeActions;
    let finalEnergy = phaseOneResult.remainingEnergyLevel;

    if (finalEnergy <= 0) {
        return totalActions;
    }

    const orderedAuxiliaryPowers = phaseOneResult.allAuxiliaryPowers.sort((valA, valB) => valB - valA);

    const applyRemainingPowersRecursively = (currentIndex, currentEnergyState, currentActionCount) => {
        if (currentEnergyState <= 0 || currentIndex >= orderedAuxiliaryPowers.length) {
            return currentActionCount;
        }
        const powerToApply = orderedAuxiliaryPowers[currentIndex];
        return applyRemainingPowersRecursively(currentIndex + 1, currentEnergyState - powerToApply, currentActionCount + 1);
    };

    return applyRemainingPowersRecursively(0, finalEnergy, totalActions);
};

const orchestrateFullProcess = (rawInputPayload) => {
    const structuredInformation = analyzeInputData(rawInputPayload);
    const phaseOneOutcome = executeFirstCombatPhase(structuredInformation);
    finalOutcomeTally = completeCombatEngagement(phaseOneOutcome);
};

orchestrateFullProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));
console.log(finalOutcomeTally);