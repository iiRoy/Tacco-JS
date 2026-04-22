const textTransformation = (originalText, sourceReplacements, targetReplacements) => {
    const processSingleCharacter = (inputSegment, mapping) => {
        return Array.from(inputSegment).map(char => mapping.get(char) || char).join('');
    };

    const processSequencePatterns = (inputSegment, substitutionRules) => {
        if (inputSegment.length === 0) {
            return '';
        }

        for (const [patternKey, replacementValue] of substitutionRules.entries()) {
            if (inputSegment.startsWith(patternKey)) {
                return replacementValue + processSequencePatterns(
                    inputSegment.substring(patternKey.length),
                    substitutionRules
                );
            }
        }

        return inputSegment.charAt(0) + processSequencePatterns(
            inputSegment.substring(1),
            substitutionRules
        );
    };

    let rulesMap;

    if (typeof sourceReplacements === 'object' && !Array.isArray(sourceReplacements)) {
        let allKeys = Object.keys(sourceReplacements);
        allKeys.sort((firstKey, secondKey) => secondKey.localeCompare(firstKey));
        rulesMap = new Map();
        for (const currentKey of allKeys) {
            rulesMap.set(currentKey, sourceReplacements[currentKey]);
        }
        return processSequencePatterns(originalText, rulesMap);
    } else if (typeof sourceReplacements === 'string' && typeof targetReplacements === 'string') {
        rulesMap = new Map();
        for (let idx = 0; idx < sourceReplacements.length; idx++) {
            rulesMap.set(sourceReplacements.charAt(idx), targetReplacements.charAt(idx) || '');
        }
        return processSingleCharacter(originalText, rulesMap);
    } else if (Array.isArray(sourceReplacements) && Array.isArray(targetReplacements)) {
        let replacementPairs = sourceReplacements.map((src, idx) => ({
            srcPattern: src,
            destValue: targetReplacements[idx]
        }));
        replacementPairs.sort((pairA, pairB) => pairB.srcPattern.localeCompare(pairA.srcPattern));
        rulesMap = new Map();
        for (const pair of replacementPairs) {
            rulesMap.set(pair.srcPattern, pair.destValue);
        }
        return processSequencePatterns(originalText, rulesMap);
    } else {
        return originalText;
    }
};