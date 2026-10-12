'use strict'

const main = arg => {
    const getBinary = (_min, _max) => {
        const bitCount = ( _min.match(/1/g) || [] ).length;
        var min = parseInt(_min, 2);
        var max = parseInt(_max, 2);
        var binary = [];
        for(let i=min;i<=max;i++){
            var theBinary = (i).toString(2);
            //minの桁数
            if(bitCount !== ( theBinary.match(/1/g) || [] ).length){ continue; }
            var zeros = [...Array(_max.length-theBinary.length)].map(obj => "0").join("");
            binary.push(zeros + theBinary);
        }

        return binary;
    }

    const input = arg.trim().split("\n");
    const goal = input[0].split(" ").map(obj => parseInt(obj, 10)); //[2, 3]; (h, w) 1~
    const initMaps = input.slice(1).filter((obj, l) =>  l < goal[0]).map((col1, i) => { 
        //1:.通路、0:#壁
        return (col1.split("").filter((obj, m) => m < goal[1]).map(col2 => col2 === "." ? 1 : 0));
    });

    var result;
    const routeH = goal[0]-1;
    const routeW = goal[1]-1;

    var minBinary = [...Array(routeW)].map(obj => "0").join("") + [...Array(routeH)].map(obj => "1").join("");;
    var maxBinary = [...Array(routeH)].map(obj => "1").join("") + [...Array(routeW)].map(obj => "0").join("");
    
    const patterns = getBinary(minBinary, maxBinary);
    patterns.forEach((obj, l) => {
        const theRoute = obj.split("");
        
        var count = 0;
        var cur_x = 0;
        var cur_y = 0;
        if(initMaps[cur_y][cur_x] === 0){ count++; }
        theRoute.forEach(next => {
            if(next === "1"){
                cur_y++;
            } else {
                cur_x++;
            }
            if(initMaps[cur_y][cur_x] === 0){ count++;}
        });
        if(result !== 0 && (!result || result > count)){ result = count; }    
    });

    console.log(result);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));