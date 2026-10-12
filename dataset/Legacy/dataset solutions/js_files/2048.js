function main(input) {
    input = parseFloat(input);
    console.log(Math.pow(input/3, 3));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));