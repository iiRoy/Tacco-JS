function processCandyDistribution(inputData) {
    const [firstLineContent, secondLineContent] = inputData.split('\n');
    const [totalParticipants, availableSweets] = firstLineContent.split(' ').map(Number);
    const individualRequests = secondLineContent.split(' ').map(Number);

    individualRequests.sort((a, b) => a - b);

    const cumulativeSums = individualRequests.reduce((accumulator, currentRequest) => {
        const lastSum = accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0;
        accumulator.push(lastSum + currentRequest);
        return accumulator;
    }, []);

    const firstExceedingIndex = cumulativeSums.findIndex(currentTotal => currentTotal > availableSweets);

    if (firstExceedingIndex !== -1) {
        console.log(firstExceedingIndex);
    } else {
        console.log(totalParticipants);
    }
}

processCandyDistribution(require('fs').readFileSync('/dev/stdin', 'utf8'));
