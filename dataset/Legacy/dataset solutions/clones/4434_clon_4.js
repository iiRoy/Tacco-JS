function Main(source) {
    var seen = 0;
    var head = "";
    var tail = "";
    var cursor = 0;

    while (true) {
        var piece = source.charAt(cursor);
        if (piece === "") {
            break;
        }
        if (seen === 0) {
            head = piece;
        }
        tail = piece;
        seen++;
        cursor++;
    }

    console.log(head + (seen - 2) + tail);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
