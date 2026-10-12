var reader = require('readline').createInterface ({
    input: process.stdin,
    output: process.stdout
});

var lines = [];
reader.on('line', (line) => {
    lines.push(line);
});

reader.on('close', () => {
    var line = lines[0];
    var elems = line.split(' ');
    var A = elems[1];
    var B = elems[2];
    var C = B - A - 1;
    if (C % 2 == 1) {
        console.log('Alice');
    } else if (C % 2 == 0) {
        console.log('borys');
    }
});