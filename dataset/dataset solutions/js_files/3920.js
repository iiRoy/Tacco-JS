'use strict'
 
function main(s) {
  let n = s.split('\n')[0].split(' ').map(n =>Number(n));
  const abc_sum = n.reduce((x,y)=>x += y,0);
  let max3times = Math.max(...n)*3;
  // パリティチェック
  if(abc_sum%2 !== max3times%2){
  	max3times += 3;
  }
  // ３倍と足し合わせの誤差を2で割ったものがanswer
  let answer = (max3times - abc_sum)/2
	
  // console.log(answer);
  console.log(answer);
}
 
main(require("fs").readFileSync("/dev/stdin", "utf8"));