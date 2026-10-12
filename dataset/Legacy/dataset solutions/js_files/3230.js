"use strict";

function XOR(a, X) {
  let strA = a.toString(2);
  let strX = X.toString(2);
  let max = Math.max(strA.length, strX.length);
  strA = "0".repeat(max - strA.length) + strA;
  strX = "0".repeat(max - strX.length) + strX;

  let result = "";
  for (let i = 0; i < max; i++) {
    if (strA[i] === strX[i]) {
      result += "0";
    } else {
      result += "1";
    }
  }
  return parseInt(result, 2);
}

function main(input) {
  const inputs = input.split("\n").filter(x => x !== "");

  const N = inputs[0].split(" ").map(Number)[0];
  const K = inputs[0].split(" ").map(Number)[1];
  const A = inputs[1].split(" ").map(Number);

  const sA = A.sort((a,b) => a-b);
  const maxA = sA[sA.length - 1];
  const maxDigit = maxA.toString(2).length;
  const strA = A.map(num => {
    let str = num.toString(2);
    return "0".repeat(maxDigit - str.length) + str;
  });

  // console.log({N,K,A,strA,maxA, maxDigit})

  let result = "";
  for (let i = 0; i < maxDigit; i++) {
    let count0 = 0;
    let count1 = 0;

    strA.forEach(str => {
      if (str[i] === "0") {
        count0++;
      } else {
        count1++;
      }
    })

    if (count0 > count1) {
      result += "1";
    } else {
      result += "0";
    }
  }

  let dK = K.toString(2).length;

  // console.log({result}, result.length);
  if (result.length < dK) {
    result = "1".repeat(dK - result.length) + result;
  } else if(K===0) {
    result = "0";
  } else {
    result = result.slice(result.length - dK);
  }

  let X = parseInt(result,2);

  // console.log({dK, result, X})

  let fX = A.map(a => XOR(a, X)).reduce((acc, cur) => cur + acc);
  console.log(fX);

}

main(require("fs").readFileSync("/dev/stdin", "utf8"));