function Main(data) {
    var parsed = parseInt(data, 10);

    if (parsed < 6) {
        console.log(parsed);
        return;
    }

    while (true) {}
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
