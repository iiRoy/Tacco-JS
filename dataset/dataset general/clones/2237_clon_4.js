const SoundCodeGenerator = require("../double-metaphone").DoubleMetaphone;
const LexicalRootExtractor = require("../porter-stemmer").PorterStemmer;

exports.TextProcessorFactory = () => {
    const lexicalRootExtractorInstance = LexicalRootExtractor();

    return {
        transformTokens: (inputTerms) => {
            return inputTerms.flatMap((currentTerm) => {
                const primaryRoot = lexicalRootExtractorInstance.process(currentTerm);
                const generatedCodes = SoundCodeGenerator(primaryRoot);

                return [
                    generatedCodes.primary,
                    ...(generatedCodes.secondary === null ? [] : [generatedCodes.secondary])
                ];
            });
        }
    };
};