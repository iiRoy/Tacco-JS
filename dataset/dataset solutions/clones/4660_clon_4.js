function calculateHourlyOffset(rawInputContent) {
    const cleanedContent = rawInputContent.trim();
    const parts = cleanedContent.split(" ");

    let firstValue;
    if (parts.length > 0) {
        firstValue = Number(parts[0]);
    } else {
        firstValue = undefined;
    }

    let secondValue;
    if (parts.length > 1) {
        secondValue = Number(parts[1]);
    } else {
        secondValue = undefined;
    }

    const sumOfValues = firstValue + secondValue;
    const finalOutput = sumOfValues % 24;

    console.log(finalOutput);
}

calculateHourlyOffset(require('fs').readFileSync('/dev/stdin', 'utf8'));
