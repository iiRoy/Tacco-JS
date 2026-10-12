function Main(num) {
    var paid = num * 800;
    var counter = 0;
    for (num; num >= 0; num -= 15) {
        counter += 1
    }
    var returned = (counter * 200) + 200;
    console.log(paid - returned);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));