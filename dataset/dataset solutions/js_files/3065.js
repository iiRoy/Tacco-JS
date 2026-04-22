function Main(input) {
    var input_arr = input.split("\n");
    var d = input_arr.map(x => parseInt(x));
    // console.log(d)

    var last = 0;
    var min = d[0] % 10;
    for (var i = 0; i < 5; i++) {
        var tmp = d[i] % 10;
        if (tmp === 0) {
            continue;
        }
        if (tmp < min) {
            min = tmp;
            last = i
        }
    }
    // console.log("last:" + last);
    // console.log("min:" + min);

    var ans = 0;
    for (var i = 0; i < 5; i++) {
        if (i === last) {
            ans += d[i];
        } else {
            ans += Math.ceil(d[i] / 10) * 10;
        }
    }
    console.log(ans);
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));