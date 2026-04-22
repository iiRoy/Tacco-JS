(function(incomingSequence) {
    const orbCount = incomingSequence.split('').filter(symbol => symbol === 'o').length;
    const sequenceLength = incomingSequence.length;

    const outcomeProducer = (countOfOrbs, sizeOfSequence) => {
        return (countOfOrbs < 8) ? undefined :
               (countOfOrbs === 8) ? "YES" :
               (((15 - sizeOfSequence) + countOfOrbs) >= 8) ? "YES" : "NO";
    };

    console.log(outcomeProducer(orbCount, sequenceLength));

})(require("fs").readFileSync("/dev/stdin", "utf8"));