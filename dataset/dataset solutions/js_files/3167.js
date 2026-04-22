function Main(input) {
    input = input.split('/');

    var ms = Date.parse(`${input[0]}-${input[1]}-${input[2]}`);

    if (ms < 1556636400000) {
        return console.log('Heisei');
    } else {
        return console.log('TBD');
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));