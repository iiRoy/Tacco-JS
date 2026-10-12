"use strict";
    
const main = arg => {
  let Nums = arg.split(" ").map(n => Number(n));
  
  let member = Nums[0];
  let train = Nums[1];  
  let taxi = Nums[2];
  let ans = member*train > taxi? taxi :member*train;
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
