function performAnalysis(sourceMaterial) {
    var contentSanitized = sourceMaterial.replace(/^\s+|\s+$/g, '');
    var firstLineSeparatorPosition = contentSanitized.indexOf('\n');
    var primaryDataStream = (firstLineSeparatorPosition === -1) ? contentSanitized : contentSanitized.substring(0, firstLineSeparatorPosition);
    var validationPattern = /^..(.)\1(.)\2/;
    var patternMatchResult = primaryDataStream.match(validationPattern);
    var responseMap = {
        'true': 'Yes',
        'false': 'No'
    };
    return responseMap[!!patternMatchResult];
}
function executeInputDrivenAnalysis() {
    var systemInputPayload = require('fs').readFileSync('/dev/stdin', 'utf8');
    var analyticalConclusion = performAnalysis(systemInputPayload);
    process.stdout.write(analyticalConclusion + '\n');
}
executeInputDrivenAnalysis();