"use strict";
    
const main = arg => {
  // とりあえず数字列を
  let Nums = arg.split("\n")[0].split(" ");
  let aPrice = Nums[0]*1;
  let bPrice = Nums[1]*1;
  let abPrice = Nums[2]*1;
  let aNum = Nums[3]*1;
  let bNum = Nums[4]*1;
  let ans = 0;
  let ave = (aPrice + bPrice)/2;
  let is_half_better = (ave > abPrice);
  let smallerNum = aNum > bNum ? bNum : aNum;
  // 
  let oddNum = aNum > bNum ? aNum - bNum : bNum - aNum;
  let biggerNumPrice = aNum > bNum ? aPrice : bPrice;
  // 残った方を半分の方で補うかの処理
  let remPrice = (biggerNumPrice/2) > abPrice ? abPrice*oddNum*2:oddNum * biggerNumPrice;
  
  // どっちを取るべきかのif文
  if(is_half_better){
  	ans = abPrice * smallerNum *2 + remPrice;
  }else{
  	ans = aPrice * aNum + bPrice * bNum;
  }
  
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
