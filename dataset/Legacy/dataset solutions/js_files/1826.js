function main(input) {
    const args = input[0].split(' ').map(n => parseInt(n, 10));

    const hour = (args[0] - args[2]) * 60 
    const minute = args[3] - args[1]
    const result = hour + minute - args[4]
    console.log(result);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));