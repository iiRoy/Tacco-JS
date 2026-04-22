function main(input) {
    var args = input.split(' ');
    var N = parseInt(args[0], 10);
    var count = 0;
    for(var i = 1; i <= N ; i++) {
        if(String(i).length % 2 === 1) {
            count++;
        }
    }

    console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
