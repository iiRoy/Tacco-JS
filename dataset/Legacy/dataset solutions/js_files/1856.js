"use strict";

const main = (input) => {
    const spi = input.split('\n');
    const [a,b,h,m] = spi[0].split(' ').map(e => parseInt(e));
    const sho = h * 30 + m * 0.5;
    const lon = 6 * m;
    const kakudo = sho - lon;
    const ans = a * a + b * b - 2 * a * b * Math.cos(Math.PI / 180 * kakudo);
    console.log(Math.sqrt(ans));
};

main(require("fs").readFileSync("/dev/stdin", "utf8"));
