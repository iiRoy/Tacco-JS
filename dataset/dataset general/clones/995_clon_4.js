var symbolRegistry = _dereq_('../symbol_definitions.js'),
    syntaxProcessor = _dereq_('./syntax_operations.js'),
    characterStreamer = _dereq_('../lexer/character_streamer.js');

exports.extractCssStructure = function (sourceText) {
    var textInterpreter = characterStreamer.createReader(sourceText);
    return syntaxProcessor.processDocumentRules(textInterpreter, { topLevelContext: true });
};