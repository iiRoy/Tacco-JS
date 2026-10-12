"use strict";

const main = (arg) => {
    const input = arg.trim().split("\n");

    const bingo1 = input[0].split(" ").map(Number);
    const bingo2 = input[1].split(" ").map(Number);
    const bingo3 = input[2].split(" ").map(Number);
    const count = parseInt(input[3], 10);

    const nums = [];
    const bingoPattern1 = [];
    const bingoPattern2 = [];
    const bingoPattern3 = [];
    const bingoPattern4 = [];
    const bingoPattern5 = [];

    bingoPattern1.push(bingo1[0]);
    bingoPattern1.push(bingo2[0]);
    bingoPattern1.push(bingo3[0]);

    bingoPattern2.push(bingo1[1]);
    bingoPattern2.push(bingo2[1]);
    bingoPattern2.push(bingo3[1]);

    bingoPattern3.push(bingo1[2]);
    bingoPattern3.push(bingo2[2]);
    bingoPattern3.push(bingo3[2]);

    bingoPattern4.push(bingo1[2]);
    bingoPattern4.push(bingo2[1]);
    bingoPattern4.push(bingo3[0]);

    bingoPattern5.push(bingo1[0]);
    bingoPattern5.push(bingo2[1]);
    bingoPattern5.push(bingo3[2]);

    const arrays = [
        bingo1,
        bingo2,
        bingo3,
        bingoPattern1,
        bingoPattern2,
        bingoPattern3,
        bingoPattern4,
        bingoPattern5
    ];

    for (var i = 4; i < input.length; i++) {
        if (input[i] !== "") {
            nums.push(parseInt(input[i], 10));
        }
    }

    for (var j = 0; j < arrays.length; j++) {
        removeNum(arrays[j], count, nums);
    }

    console.log(checlength(arrays));
};

const removeNum = (array, count, nums) => {
    for (var i = array.length - 1; i >= 0; i--) {
        for (var j = 0; j < count; j++) {
            var testnum = nums[j];
            if (array[i] === testnum) {
                array.splice(i, 1);
                break;
            }
        }
    }
};

const checlength = (arrays) => {
    for (var i = 0; i < arrays.length; i++) {
        if (arrays[i].length === 0) {
            return "Yes";
        }
    }
    return "No";
};

main(require("fs").readFileSync("/dev/stdin", "utf8"));