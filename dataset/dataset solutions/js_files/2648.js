function main(input) {
    var S = input.trim();

    var count = 0;
    var before = "";
    var current = "";
    var debug = [];
    for(var i = 0; S.length > i; i++) {
        current += S[i];
        if (current === before) {
            continue;
        }

        before = current;
        debug.push(current);
        current = "";
        count++;
    }

    console.log(count);
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
