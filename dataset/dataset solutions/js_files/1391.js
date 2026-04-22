function Main (input) {
    input = input.split("\n");
    for (var i = 0; input[i][0] != "0"; i++) {
        var arr = input[i].split(" ").map(Number);
        var a = arr[0]; var b = arr[1];
        if(a > b) {
            console.log(b + " " + a);
        } else {
            console.log(a + " " + b);
        }
    }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));