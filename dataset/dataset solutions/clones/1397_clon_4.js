(function(sourceText) {
    const processLineAndDecideContinuation = (currentSegment) => {
        if (currentSegment.includes('?')) {
            return true;
        }
        console.log(eval(currentSegment));
        return false;
    };

    sourceText.split('\n').some(processLineAndDecideContinuation);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
