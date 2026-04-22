function main(input) {
    let n = input[0];
    if (n[0] == n[2]) {
        console.log("Yes");
    }
    else {
        console.log("No");
    }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
