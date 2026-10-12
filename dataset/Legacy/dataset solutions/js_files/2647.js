function main(input) {
    var S = input.trim();

    var count = 0;
    var before = "";
    var current = "";
    for(var i = 1; S.length > i; i++) {
        current += S[i];
        if (current === before) {
            continue;
        }

        before = current;
        current = "";
        count++;
    }

    console.log(count);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));