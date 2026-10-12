function main(input) {
    x = input[0];
    if (x == 'A') console.log('T');
    if (x == 'C') console.log('G');
    if (x == 'G') console.log('C');
    if (x == 'T') console.log('A');
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));