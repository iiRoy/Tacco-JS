(function() {
    let capturedInputData = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (incomingSegment) => {
        capturedInputData += incomingSegment;
    });

    process.stdin.on('end', () => {
        const principalSequence = capturedInputData.split('\n')[0];

        const adjacencyCheck = (textualElement) => {
            if (!textualElement) {
                return false;
            }
            const duplicateDetector = /(.)\1/;
            return duplicateDetector.test(textualElement);
        };

        const finalResult = adjacencyCheck(principalSequence) ? "Bad" : "Good";

        process.stdout.write(finalResult + '\n');
    });
})();