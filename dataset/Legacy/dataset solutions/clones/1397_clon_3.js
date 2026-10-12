(function(sourceContent) {
    const NEWLINE_DELIMITER = '\n';
    const QUESTION_MARK_INDICATOR = '?';

    var processedLines = sourceContent.split(NEWLINE_DELIMITER);

    for (var idx = 0; idx < processedLines.length; idx++) {
        var activeLine = processedLines[idx];
        
        const hasEarlyExitCondition = activeLine.includes(QUESTION_MARK_INDICATOR);

        if (hasEarlyExitCondition) {
            return; 
        }
        
        const computedResult = eval(activeLine);
        
        console.log(computedResult);
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
