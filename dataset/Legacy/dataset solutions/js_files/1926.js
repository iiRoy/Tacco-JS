function main(input) {
    const parsedInput = parser(input);
    console.log(minX(parsedInput.a, parsedInput.b, parsedInput.n));
}

function parser(inputStr) {
    const splitInput = inputStr.split(' ');
    return {
        a: Number(splitInput[0]),
        b: Number(splitInput[1]),
        n: Number(splitInput[2]),
    };
}

function minX(a, b, n) {
    var answer = 0;
    const N = n < b ? n : n / b;
    for (var x = 1; x <= N + 1; x++ ){
        var result = (((a * x) / b)|0) - a * ((x / b)|0);
        if (answer < result) {
            answer = result;
        }
    }
    return answer;
}
// test
// const Q1 = '5 7 4'
// const Q2 = '11 10 2000';
// main(Q1);
// main(Q2);
// main(Q2);
// main(Q3);
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
