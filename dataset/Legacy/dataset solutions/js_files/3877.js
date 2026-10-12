"use strict"

const main = arg => {
  arg = arg.trim().split("\n");
  const A = parseInt(arg[0].split(" ")[0]);
  const B = parseInt(arg[0].split(" ")[1]);
  const C = parseInt(arg[0].split(" ")[2]);
  const X = parseInt(arg[0].split(" ")[3]);
  const Y = parseInt(arg[0].split(" ")[4]);
  
  const AB = 2 * C;
  
  // ABセットはA,Bをバラで1枚づつ買うのに比べお得か？
  if(A + B > AB) {
      let priceAB = AB * Math.min(X, Y);
      let soloPrice = 0;
      
      if(X > Y) {
        soloPrice = A * (X - Y);
      } else if(Y > X) {
        soloPrice = B * (Y - X);  
      }
      
      let partialAB = priceAB + soloPrice;
      let allAB = AB * Math.max(X, Y);
      
      // 余りが出ても全てABセットで買う方法と
      // 一部ABセットで買って、残りをバラで買う方法を比較して安い方
      console.log(Math.min(allAB, partialAB));
  } else {
    　// 得でないなら全部バラで買う
      console.log((A * X) + (B * Y));
  }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
