function Main(input) {
    var erased = input.replace(/eraser/g, '').replace(/erase/g, '').
    replace(/dreamer/g, '').replace(/dream/g, '');
    if (erased === '') {
        console.log("YES");
    } else {
        console.log("NO");
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));