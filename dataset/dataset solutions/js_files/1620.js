function main(input) {
    if (input >= 30) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));