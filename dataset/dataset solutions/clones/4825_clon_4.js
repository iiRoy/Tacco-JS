const performAnalysis = (sourceData) => {
    const lexicalUnits = [
        'dreamer',
        'eraser',
        'dream',
        'erase'
    ];

    const segment = sourceData.split('\n')[0];
    let presentIndex = segment.length;
    let completionStatus = false;

    while (presentIndex > 0) {
        let matchLocated = false;
        for (const unit of lexicalUnits) {
            if (segment.substring(0, presentIndex).endsWith(unit)) {
                presentIndex -= unit.length;
                matchLocated = true;
                break;
            }
        }
        if (!matchLocated) {
            break;
        }
    }

    if (presentIndex === 0) {
        completionStatus = true;
    }

    process.stdout.write(completionStatus ? 'YES\n' : 'NO\n');
};

performAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));