function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    if (input[2] === input[3] && input[4] === input[5]) {
        console.log("Yes");
    } else {
        console.log("No");   
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));