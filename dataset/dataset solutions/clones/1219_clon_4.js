process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputSegment) {
    const numericals = inputSegment.split(' ').map(Number);

    const resultCondition = numericals.slice(0, 2).every((currentValue, index) => {
        return currentValue < numericals[index + 1];
    });

    const messageMap = new Map([
        [true, 'Yes'],
        [false, 'No']
    ]);

    console.log(messageMap.get(resultCondition));
});
