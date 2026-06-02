"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut = main();
if(myOut !== undefined)console.log(String(myOut));

function main(){
  const elementCount = next();
  const valueSet = [0].concat(nexts(elementCount));

  Array.from({ length: elementCount }).forEach((_, roundIndex) => {
    Array.from({ length: elementCount }, (_, offset) => elementCount - offset)
      .forEach(currentDivisor => {
        const affectedIndices = Array.from(
          { length: Math.floor(elementCount / currentDivisor) },
          (_, multipleFactor) => (multipleFactor + 1) * currentDivisor
        );

        const aggregateSum = affectedIndices.reduce((acc, idx) => acc + valueSet[idx], 0);

        if (aggregateSum < 0) {
          affectedIndices.forEach(idx => {
            valueSet[idx] = 0;
          });
        }
      });
  });

  return valueSet.reduce((acc, val) => acc + val, 0);
}
