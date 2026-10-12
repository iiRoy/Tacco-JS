const calculatePairCount = (sourceData) => {
    const dataLine = sourceData.split('\n')[0];

    const zeros = (dataLine.split('0').length - 1);

    const ones = (dataLine.split('1').length - 1);

    const resultValue = (zeros < ones ? zeros : ones) * 2;

    console.log(resultValue);
};

calculatePairCount(require('fs').readFileSync('/dev/stdin', 'utf-8'));
