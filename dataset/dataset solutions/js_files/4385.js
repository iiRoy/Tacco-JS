'use strict'

function Main(input) {
    const nums = input.split('\n')[1].split(' ').map(n => Number(n));
    let count = 0;
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] === i + 1) {
        let tmp = nums[i + 1];
        if(tmp) {
          nums[i + 1] = nums[i];
          nums[i] = tmp;
          count += 1;
        } else {
          tmp = nums[i];
          nums[i] = nums[i - 1];
          nums[i - 1] = tmp;
          count += 1;
        }
      }
    }
    console.log(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
