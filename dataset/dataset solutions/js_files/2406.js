process.stdin.resume();
process.stdin.setEncoding('utf-8');

let input_lines = [];
let reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

reader.on('line', (line) => {
    input_lines = line.split(' ');
});

let x = input_lines[0];
let y = input_lines[1];

if (x === 1 && y === 1) {
    reader.on('close', () => {
        console.log(300000 * 2 + 400000);
    })
}
else {
    reader.on('close', () => {
        console.log(100000 * ((4 - x) + (4 - y)));
    })
}