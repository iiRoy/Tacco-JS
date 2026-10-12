'use strict'

const main = arg => {
    const getBinary = (_min, _max) => {
        const bitCount = ( _min.match(/1/g) || [] ).length;
        var min = parseInt(_min, 2);
        var max = parseInt(_max, 2);
        var binary = [];
        
        for(let i=min;i<=max;i++){
            var theBinary = (i).toString(2);
            if(bitCount !== ( theBinary.match(/1/g) || [] ).length){ continue; }
            var zeros = [...Array(_max.length-theBinary.length)].map(obj => "0").join("");
            binary.push(zeros + theBinary);
        }

        return binary;
    }

    const input = arg.trim().split("\n");
    const goal = input[0].split(" ").map(obj => parseInt(obj, 10)); //[2, 3]; (h, w) 1~
    const maps = input.slice(1).slice(0, goal[0]);
    const initMaps = maps.map(col1 => 
        (col1.slice(0, goal[1]);
    ); //.split("").map(col2 => col2 === "." ? 1 : 0))

    var result;
    const routeH = goal[0]-1;
    const routeW = goal[1]-1;
    var minBinary = [...Array(routeW)].map(obj => "0").join("") + [...Array(routeH)].map(obj => "1").join("");
    var maxBinary = minBinary.split("").reverse().join("");
    const patterns = getBinary(minBinary, maxBinary);

    for(var i=0;i<patterns.length;i++){
        var count = 0;
        var cur_x = 0;
        var cur_y = 0;

        if(initMaps[cur_y][cur_x] === "#"){ count++;}
        for(let j=0;j<patterns[i].length;j++){
            if(patterns[i][j] === "1"){
                cur_y++;
            } else {
                cur_x++;
            }
            if(initMaps[cur_y][cur_x] === "#"){ 
                count++;
                if(result && count >= result){ break; } 
            }            
        }
        if(result !== 0 && (!result || result > count)){ 
            result = count;
            if(count === 0){ break; }
        }
    }

    console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));