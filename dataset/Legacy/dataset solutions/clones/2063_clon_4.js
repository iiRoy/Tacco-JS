"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(a){return a?cin[cid++]:+cin[cid++];}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut = main();
if(myOut !== undefined)console.log(myOut);

function main(){
  var quantity = next();
  var charSequence = next(1);

  const calculateInitialDifferences = (sequence, count) => {
    return Array.from({ length: count - 1 }, (_, index) =>
      Math.abs(sequence.charCodeAt(index) - sequence.charCodeAt(index + 1))
    );
  };

  const reduceDifferencesRecursively = (currentDifferences) => {
    if (currentDifferences.length <= 1) {
      return currentDifferences[0];
    }

    const halfSize = currentDifferences.length >> 1;
    const nextLevelDifferences = Array.from({ length: halfSize }, (_, index) => {
      const leftValue = currentDifferences[index];
      const rightValue = currentDifferences[currentDifferences.length - 1 - index];
      const absoluteDifference = Math.abs(leftValue - rightValue);

      return (leftValue === rightValue) ? 0 : (absoluteDifference === 1) ? 1 : 2;
    });

    return reduceDifferencesRecursively(nextLevelDifferences);
  };

  const initialDifferences = calculateInitialDifferences(charSequence, quantity);
  return reduceDifferencesRecursively(initialDifferences);
}
