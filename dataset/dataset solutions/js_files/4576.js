function Main(input) {
    var input = input.split(' ').map(n => parseInt(n, 10));
    A = input[0];
    B = input[1];
    C = input[2];
    if(A <= C && C <= B) {
        console.log('Yes');
    } else {
        console.log('No');
    }
    

    }
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));