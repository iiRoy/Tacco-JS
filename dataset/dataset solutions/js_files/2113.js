"use strict";

const main = (args) => {
    const input = arg.trim().split("\n");
    const bingo1 = parseInt(input[0].split(" "));
    const bingo2 = parseInt(input[1].split(" "));
    const bingo3 = parseInt(input[2].split(" "));
    const count = parseInt(input[3]);
    const nums = []
    const testnum = 0;

    const bingoPattern1 = []
    const bingoPattern2 = []
    const bingoPattern3 = []
    const bingoPattern4 = []
    const bingoPattern5 = []

    bingoPattern1.push(bingo1[0])
    bingoPattern1.push(bingo2[0])
    bingoPattern1.push(bingo3[0])

    bingoPattern2.push(bingo1[1])
    bingoPattern2.push(bingo2[1])
    bingoPattern2.push(bingo3[1])

    bingoPattern3.push(bingo1[2])
    bingoPattern3.push(bingo2[2])
    bingoPattern3.push(bingo3[2])

    bingoPattern4.push(bingo1[2])
    bingoPattern4.push(bingo2[1])
    bingoPattern4.push(bingo3[0])

    bingoPattern5.push(bingo1[0])
    bingoPattern5.push(bingo2[1])
    bingoPattern5.push(bingo3[2])

    const arrays = [bingo1,bingo2,bingo3,bingoPattern1,bingoPattern2,bingoPattern3,bingoPattern4, bingoPattern5]


    for(var i =4; i < input.length; i++){
        nums.push(parseInt(input[i]))
    }
    for(var i =0; i < arrays.length; i++){
        console.log(arrays[i])
        removeNum(arrays[i], count,nums)
    }
    console.log(checlength(arrays))

  }

  const removeNum = (array, count,nums) =>{å
    array.forEach((item, index) => {
        for(var j = 0; j < count; j ++){
            var testnum = nums[j]
            if(item === testnum) {
                array.splice(index, testnum);
            }
        }
    });
  }
  
  const checlength = (arrays) =>{
    for (var i=0; i < arrays.length; i ++ ){
        if(arrayas[i].length == 0) return "Yes"  
    }
    return "No"
  }
  
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
 