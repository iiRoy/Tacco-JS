"use strict";
    
// 順列 被り有り
const permutateWithRepetitions = (
  permutationOptions,
  permutationLength
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
    const A = parseInt(arg[0].split("")[0]);
    const B = parseInt(arg[0].split("")[1]);
    const C = parseInt(arg[0].split("")[2]);
    const D = parseInt(arg[0].split("")[3]);

    const operands = ["+", "-"];
    
    const patterns = permutateWithRepetitions(operands, 3);
    
    for(let i in patterns) {
        let temp = [];
        
        for(let j=0; j<patterns[i].length; j++) {
            if(j === 0) {
                temp.push(A);
            }
            
            if(j === 1) {
                temp.push(B);
            }
            
            if(j === 2) {
                temp.push(C);
            }
            
            
            temp.push(patterns[i][j]);
        }
        
        temp.push(D);

        if(eval(temp.join("")) === 7) {
            console.log(temp.join("") + "=7");
            return;
        }
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
