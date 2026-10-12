function Main(input) {
    input = input.split(" ");

    var hasOne = false;
    var hasSeven = false;
    var hasFour = false;
    var hasNine = false;

    for (var index = 0; index < 4; index++) {
        if (input[index] === "1") hasOne = true;
        if (input[index] == "7") hasSeven = true;
        if (input[index] == "4") hasFour = true;
        if (input[index] == "9") hasNine = true;
    }

    if (hasOne && hasSeven && hasNine && hasFour) {
        console.log("YES");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));