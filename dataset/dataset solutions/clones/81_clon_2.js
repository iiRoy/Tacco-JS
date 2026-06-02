const solve = data => {
   const nums = data.split(" ").sort((x, y) => x - y);
   console.log(Number.parseInt(nums[0]) + Number.parseInt(nums[1]));
}

solve(require('fs').readFileSync('/dev/stdin', 'utf8'));