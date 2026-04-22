process.stdin.resume();
process.stdin.setEncoding('utf8');

var g_input = '';
process.stdin.on('data', function(chunk) {
    g_input += chunk;
});

process.stdin.on('end', function() {
    Main(g_input.split(/\r?\n/));
});

function Main(input) {

    var numbers = input[0].split(' ');

    if (numbers[0] == numbers[1]) {
        console.log(numbers[2]);
    }
    else if (numbers[0] == numbers[2]) {
        console.log(numbers[1]);
    }
    else {
        console.log(numbers[0]);
    }

    return 0;
}
