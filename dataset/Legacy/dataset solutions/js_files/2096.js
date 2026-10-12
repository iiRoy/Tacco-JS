function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    station = input.split("");
    if (station[0] == station[1] && station[1] == station[2]) {
        console.log("No");
    } else {
        console.log("Yes");
    }

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));