function Main(input) {
    var A = parseInt(input[0], 10);
    var B = parseInt(input[1], 10);
    var C = parseInt(input[2], 10);
    var D = parseInt(input[3], 10);

    var tNum = Math.ceil(C/B);
    var aNum = Math.ceil(A/D);

    console.log(tNum <= aNum ? 'Yes' : 'No');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));