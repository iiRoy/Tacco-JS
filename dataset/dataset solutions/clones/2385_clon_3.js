function Main(input) {
    var lines = input.trim().split('\n');
    var S = lines[0];

    var map = {};
    map["SUN"] = 7;
    map["MON"] = 6;
    map["TUE"] = 5;
    map["WED"] = 4;
    map["THU"] = 3;
    map["FRI"] = 2;
    map["SAT"] = 1;

    var answer = map[S];

    if (answer === undefined) {
        answer = map.S;
    }

    console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));