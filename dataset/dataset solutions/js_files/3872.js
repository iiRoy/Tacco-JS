"use strict"

const main = (input) => {
    const S = input;
    let price = 700;
    if (S[0] === "○") {
        price += 100;
    }
    if (S[1] === "○") {
        price += 100;
    }
    if (S[2] === "○") {
        price += 100;
    }
    console.log(price);
};

main(require("fs").readFileSync("/dev/stdin","utf8"));