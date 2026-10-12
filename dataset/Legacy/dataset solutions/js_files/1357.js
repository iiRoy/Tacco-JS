function Main (input) {
    var arr = input.split(" ").map(Number);
    arr[0] < arr[1] ? console.log("a < b") : (arr[0] == arr[1] ? console.log("a == b") : console.log("a > b"));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));