function Main(input) {
    input = input.split("\n");
	var n = parseInt(input[0], 10);
    flag = false;
    for (let i = 1; i < 10; i++) {
        for (let j = 1; j < 10; ++j){
            if (i * j == n) {
                flag = true;
                break;
            }
        }
    }
    flag ? console.log("yes") : console.log("no");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
//Main(require("fs").readFileSync("test.txt", "utf8"));
