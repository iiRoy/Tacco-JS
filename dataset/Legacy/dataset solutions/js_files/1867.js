function Main(input) {
    tmp = input.split("\n");
    s = tmp[0];
    t = tmp[1];
    num = s.length;
    check = t.substr(0, num);
    if (s == check) {
        console.log("Yes");
    }else {
        console.log("No");
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));