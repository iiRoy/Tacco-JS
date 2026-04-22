function main(arg) {
    arg2 = parseInt(arg);
    console.log(Math.ceil(arg2/2)-1);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));