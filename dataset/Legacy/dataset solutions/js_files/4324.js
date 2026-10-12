"use strict";
const main = arg => {
  let Info = arg.split("\n");
  let Num = Info.shift();
  // .map(x => x*1)については型変換の常套句
  let personInfo = Info.map(i => i.split(" ").map(x => x*1));
  let infoMap = new Map();
  let As = [];
  
  // 情報をそれぞれの値に格納する（別にmapでなくてもよかった）
  personInfo.forEach((x) => {
  	infoMap.set(x[0],x[1]); 
    As.push(x[0]);
  })
  // 一番最下位に近い人とその人の下に何人いるかの可能性だけ探ればいい
  let Amax = Math.max(...As);
  let ans = Amax + infoMap.get(Amax);
  
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
