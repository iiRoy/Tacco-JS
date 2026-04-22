"use strict";
function main(input) {
    const args = input.split("\n");
    const one = args[0].split(" ");
    const second = args[1].split(" ");

    const N = parseInt(one[0]);
    const M = parseInt(one[1]);

    let temp;
    let front;
    let end;
    let min = parseInt(second[0]);
    let max = parseInt(second[1]);

    for(let i = 2; i <= M; i++) {
        temp = args[i].split(" ");
        front = parseInt(temp[0]);
        end = parseInt(temp[1]);
        if (max < front || end < min) {
            min = 0;
            max = -1;
            break
        }
        if(min < front) {
            min = front;
        }
        if(end < max) {
            max = end;
        }
    }
    console.log(max - min + 1)

}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
