require("fs").readFileSync("/dev/stdin", 'utf8').trim().split(/\s/).map(function(inputSegment) {
    let numericValues = inputSegment.split(',');
    let accumulator = 0, loopIndexA = 10, loopIndexB = 10;
    for (; loopIndexA--;) numericValues[loopIndexA] = accumulator -= numericValues[loopIndexA];
    for (accumulator *= numericValues[11] / (-numericValues[11] - numericValues[loopIndexB]); numericValues[--loopIndexB] >= -accumulator;);
    console.log(++loopIndexB);
});
