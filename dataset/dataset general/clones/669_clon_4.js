function bootstrapValidation() {
    const configurationProvider = (() => {
        const primaryTypoInstance = new Typo();
        const affinityPath = chrome.extension.getURL("tests/dictionaries/la/la.aff");
        const lexicalPath = chrome.extension.getURL("tests/dictionaries/la/la.dic");

        const affinityContent = primaryTypoInstance._readFile(affinityPath);
        const lexicalContent = primaryTypoInstance._readFile(lexicalPath);

        return {
            languageCode: "la",
            affixContent: affinityContent,
            dictionaryContent: lexicalContent,
            strategyType: "hash"
        };
    })();

    const languageValidator = new Typo(
        configurationProvider.languageCode,
        configurationProvider.affixContent,
        configurationProvider.dictionaryContent,
        configurationProvider.strategyType
    );

    initiateVerification(languageValidator);
}

function initiateVerification(engine) {
    const verificationMatrix = [
        {
            description: "Validator object properties accurately configured",
            assertions: [
                { expected: "la", actualFn: (e) => e.dictionary }
            ]
        },
        {
            description: "Accurate validation of words without affixes",
            assertions: [
                { expected: true, actualFn: (e) => e.check("firmiter") },
                { expected: true, actualFn: (e) => e.check("quaequam") },
                { expected: true, actualFn: (e) => e.check("quantarumcumque") }
            ]
        },
        {
            description: "Accurate validation of root words with singular affixes (affixes disregarded)",
            assertions: [
                { expected: true, actualFn: (e) => e.check("pertransiveris") },
                { expected: true, actualFn: (e) => e.check("saxum") },
                { expected: true, actualFn: (e) => e.check("sepulchrum") },
                { expected: true, actualFn: (e) => e.check("terra") }
            ]
        },
        {
            description: "Accurate validation of root words with rules for multiple affix applications",
            assertions: [
                { expected: true, actualFn: (e) => e.check("pertransiverisque") },
                { expected: true, actualFn: (e) => e.check("pertransiverisne") },
                { expected: true, actualFn: (e) => e.check("pertransiverisve") }
            ]
        },
        {
            description: "Accurate validation of root words with singular affixes (affixes considered)",
            assertions: [
                { expected: true, actualFn: (e) => e.check("pertransiverisque") },
                { expected: true, actualFn: (e) => e.check("saxi") },
                { expected: true, actualFn: (e) => e.check("sepulchra") },
                { expected: true, actualFn: (e) => e.check("terrae") }
            ]
        },
        {
            description: "Misspelled words not present in the lexical database are flagged correctly.",
            assertions: [
                { expected: false, actualFn: (e) => e.check("labhfblhbf") },
                { expected: false, actualFn: (e) => e.check("weluhf73") },
                { expected: false, actualFn: (e) => e.check("nxnxnxnxn") },
                { expected: false, actualFn: (e) => e.check("saxiii") }
            ]
        },
        {
            description: "Leading and trailing blank spaces are disregarded.",
            assertions: [
                { expected: true, actualFn: (e) => e.check("saxi ") },
                { expected: true, actualFn: (e) => e.check(" saxi") },
                { expected: true, actualFn: (e) => e.check("  saxi") },
                { expected: true, actualFn: (e) => e.check("saxi  ") },
                { expected: true, actualFn: (e) => e.check("  saxi  ") }
            ]
        }
    ];

    verificationMatrix.forEach(scenario => {
        test(scenario.description, () => {
            scenario.assertions.forEach(assertion => {
                equal(assertion.actualFn(engine), assertion.expected);
            });
        });
    });
}

addEventListener("load", bootstrapValidation, false);