"use strict";

const permutateWithRepetitions = (
  permutationOptions,
  permutationLength = permutationOptions.length
) => {
  if (permutationLength === 1) {
    return permutationOptions.map(permutationOption => [permutationOption]);
  }

  // Init permutations array.
  const permutations = [];

  // Get smaller permutations.
  const smallerPermutations = permutateWithRepetitions(
    permutationOptions,
    permutationLength - 1
  );

  // Go through all options and join it to the smaller permutations.
  permutationOptions.forEach((currentOption) => {
    smallerPermutations.forEach((smallerPermutation) => {
      permutations.push([currentOption].concat(smallerPermutation));
    });
  });

  return permutations;
}

const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const S = arg[1].split("").map(n=>parseInt(n));

    // 最大で1000通りしかありえない
    const digits = [0,1,2,3,4,5,6,7,8,9];
    
    const combos = permutateWithRepetitions(digits, 3);
    
    let cnt = 0;
    let list = [];
    //console.log(combos.join("\n"))
    
    for(let i in combos) {
        let digit1 = combos[i][0];
        let digit2 = combos[i][1];
        let digit3 = combos[i][2];
        
        let nowCheking = digit1;
        let trueCnt = 0
        let flag1 = false;
        let flag2 = false;
        let flag3 = false;
        
        let temp = [];
        
        
        for(let j in S) {
            if(S[j] === digit1 && flag1 !== true) {
                flag1 = true;
            } else if(S[j] === digit2 && flag1 && flag2 !== true) {
                flag2 = true;
            } else if(S[j] === digit3 && flag1 && flag2) {
                flag3 = true;
            }
        }
        
        
        if(flag1 && flag2 && flag3) {
            // console.log("3桁を作ることが出来る")
            // console.log("digit1:" + digit1);
            // console.log("digit2:" + digit2);
            // console.log("digit3:" + digit3);
            // console.log("-------")
            cnt++;
        }
    }
    
    console.log(cnt)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
