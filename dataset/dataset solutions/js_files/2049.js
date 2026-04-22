"use strict";
//const p = s => console.log(s);
let inp = require("fs").readFileSync("/dev/stdin", "utf8").trim();
let max = Number(inp.split('\n')[0]);
let nums = inp.split('\n')[1].split(' ').map(Number);
let formed_nums = (new Array(max)).fill(0);
//p(formed_nums)
for (let i = 0; i < max; i++) {
    formed_nums[nums[i] - 1]++
}
//p(formed_nums);
let sum = 0;
formed_nums.forEach(elm => {
    if (elm >= 2) {
        sum += elm * (elm - 1) / 2
    }
});
//p(nums)
nums.forEach(elm => {
    console.log(sum - formed_nums[elm - 1] + 1)
})