process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputData) {
    processSequence(inputData.trim());
});

function processSequence(initialSequence) {
    let characterStore = [];

    for (let currentSymbol of initialSequence) {
        if (characterStore.length > 0 && characterStore[characterStore.length - 1] === 'S' && currentSymbol === 'T') {
            characterStore.pop();
        } else {
            characterStore.push(currentSymbol);
        }
    }
    console.log(characterStore.length);
}