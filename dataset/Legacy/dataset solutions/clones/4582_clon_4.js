"use strict";

const fs = require("fs");

const raw = fs.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/).map(Number);

const n = raw[0];
const k = raw[1];

const nums = [];
const amounts = [];

for (let i = 0, p = 2; i < n; i++, p += 2) {
    nums.push(raw[p]);
    amounts.push(raw[p + 1]);
}

const records = [];
let shiftedTotal = amounts[0];

for (let i = 0; i < n; i++) {
    if (i > 0) shiftedTotal += amounts[i - 1];

    records.push({
        num: nums[i],
        amount: amounts[i],
        totalAmount: shiftedTotal
    });

    if (shiftedTotal >= k) {
        const beforeThisAmount = shiftedTotal - amounts[i];
        const answer = beforeThisAmount < k ? nums[i] : nums[i - 1];
        console.log(answer);
        process.exit(0);
    }
}

console.log(JSON.stringify(records));