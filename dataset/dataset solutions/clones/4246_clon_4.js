"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut = processInputAndCompute();
if(myOut !== undefined)console.log(String(myOut));

function processInputAndCompute(){
  var countElements = next();
  // Initialize an array, 1-indexed for problem logic, with a leading 0
  var currentValues = [0].concat(nexts(countElements));

  let stateChangedInPass = true;
  // Continue iterating until a full pass results in no changes,
  // effectively reaching a fixed point where no more elements need to be zeroed.
  while (stateChangedInPass) {
    stateChangedInPass = false;
    // Create a new array for the next state. This prevents in-place modification
    // from affecting calculations within the same pass and allows for comparison.
    let nextStateValues = [...currentValues];

    // Iterate from the largest index down to 1, as per the original logic's processing order.
    for (let currentDivisor = countElements; currentDivisor >= 1; currentDivisor--) {
      // Only proceed if the element at the currentDivisor index is negative in the *current* state.
      if (currentValues[currentDivisor] < 0) {
        let aggregateSum = 0;
        // Calculate the sum of all multiples of currentDivisor, using values from the *current* state.
        for (let multipleIndex = currentDivisor; multipleIndex <= countElements; multipleIndex += currentDivisor) {
          aggregateSum += currentValues[multipleIndex];
        }

        // If the aggregate sum is negative, zero out all its multiples in the *next* state.
        if (aggregateSum < 0) {
          for (let multipleIndex = currentDivisor; multipleIndex <= countElements; multipleIndex += currentDivisor) {
            // Only mark as changed if the value is actually being set to 0 from a non-zero value.
            // This ensures `stateChangedInPass` is true only if a meaningful modification occurred.
            if (nextStateValues[multipleIndex] !== 0) {
                nextStateValues[multipleIndex] = 0;
                stateChangedInPass = true; // A change occurred, so another pass is needed.
            }
          }
        }
      }
    }
    // Update the current state to the new state for the next iteration of the while loop.
    currentValues = nextStateValues;
  }

  // Calculate the final sum of all elements in the processed array.
  return currentValues.reduce((accumulator, elementValue) => accumulator + elementValue);
}
