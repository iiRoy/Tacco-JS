((rawContent) => {
    const primaryLine = rawContent.trim().slice(0, rawContent.indexOf('\n') === -1 ? undefined : rawContent.indexOf('\n'));
    const separatorPosition = primaryLine.indexOf(' ');
    const firstOperand = Number(primaryLine.substring(0, separatorPosition));
    const secondOperand = Number(primaryLine.substring(separatorPosition + 1));

    const tallyPath = (currentPosition, destination, advanceBy) => {
        if (currentPosition >= destination) {
            return 0;
        }
        return 1 + tallyPath(currentPosition + advanceBy, destination, advanceBy);
    };

    const finalOutcome = 1 + tallyPath(firstOperand, secondOperand, firstOperand - 1);

    process.stdout.write(String(finalOutcome));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));