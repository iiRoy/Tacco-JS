((sourceText) => {
    const segments = sourceText.split('\n');

    const ruleCount = Number(segments[0]);

    const ruleDefinitions = segments.slice(1, 1 + ruleCount);

    const substitutionRegistry = ruleDefinitions.reduce((registry, definitionLine) => {
        const [antecedent, consequent] = definitionLine.split(' ');
        registry.set(antecedent, consequent);
        return registry;
    }, new Map());

    const targetPhrases = segments.slice(2 + ruleCount);

    const processSegmentsRecursively = (position, accResult) => {
        if (position >= targetPhrases.length) {
            return accResult;
        }
        const currentPhrase = targetPhrases[position];
        const transformedPhrase = substitutionRegistry.has(currentPhrase) ?
                                  substitutionRegistry.get(currentPhrase) :
                                  currentPhrase;
        return processSegmentsRecursively(position + 1, accResult + transformedPhrase);
    };

    const finalOutput = processSegmentsRecursively(0, '');
    console.log(finalOutput + '\n');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));