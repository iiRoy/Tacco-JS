function computeResult(values) {
    const combinedString = values[0].concat(values[1]);
    return Number(combinedString) * 0.5;
}

let receivedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

const processInputChunk = (segment) => {
    receivedData += segment;
};

const finalizeProcessing = () => {
    const dataSegments = receivedData.split(' ');
    console.log(computeResult(dataSegments));
};

process.stdin.on('data', processInputChunk);
process.stdin.on('end', finalizeProcessing);
