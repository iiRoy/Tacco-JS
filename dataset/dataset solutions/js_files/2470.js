function main(n) {
    for (var i = 1; i <= 9; i++) {
        if (n % i === 0 && n / i < 10) {
            console.log('Yes');
            return;
        }
    }
    console.log('No');
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));