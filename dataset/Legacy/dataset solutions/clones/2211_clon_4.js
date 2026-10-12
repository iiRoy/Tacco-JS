function evaluatePair(sourceText) {
    const [firstSegment, secondSegment] = sourceText.trim().split(' ');
    console.log(firstSegment === secondSegment ? 'Yes' : 'No');
}

evaluatePair(require('fs').readFileSync('/dev/stdin', 'utf8'));
