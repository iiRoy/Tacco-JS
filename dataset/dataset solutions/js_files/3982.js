function Main(input) {
    var input = input.split('\n');
    var iti = input[0].split('');
    var ni = input[1].split('');
    var san = input[2].split('');
    console.log(iti[0] + ni[1] + san[2]);

    }
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));