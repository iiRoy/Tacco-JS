let collectedContent = "";

process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    collectedContent += chunk;
});

process.stdin.on('end', function() {
    const primaryLine = collectedContent.trim().split('\n')[0];

    const separatorPos = primaryLine.indexOf(' ');
    const initialPart = primaryLine.substring(0, separatorPos);
    const finalPart = primaryLine.substring(separatorPos + 1);

    const startValue = Number(initialPart);
    const endValue = Number(finalPart);

    const valueDifference = endValue - startValue;

    if (valueDifference >= 1 && valueDifference <= 999) {
        const sumOfNaturals = (valueDifference * (valueDifference + 1)) / 2;
        const computedResult = sumOfNaturals - endValue;
        process.stdout.write(String(computedResult) + '\n');
    }
});