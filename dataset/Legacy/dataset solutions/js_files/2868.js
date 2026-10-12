// Find maximum possible number of squares lighted by the lamp.
"use strict";

function Main(input)
{
    input = input.split('\n');
    let mazeSize = input.shift().split(' ').map(function(a)
    {
        parseInt(a);
    });
    // input = input.map(function(a) {
    //     a = a.split('');
    // });
    input.forEach(function(part, index, array){
        array[index] = array[index].split('');
    });
    // console.log(input);
    let maxLightSq = 0;
    for(let y = 0; y < input.length; y++)
    {
        for(let x = 0; x < input[0].length; x++)
        {
            if(input[y][x]==='.'){
                let lightSq = cardinalLightNumber(input,[x,y]);
                maxLightSq = maxLightSq > lightSq ? maxLightSq : lightSq;
            }
        }
        // console.log("next line.");
    }

    let result = maxLightSq;
    console.log(result);
}

function cardinalLightNumber(arr, pos)
{
    let x = pos[0], y = pos[1];
    // console.log(x + ", " + y );
    // One for center square
    let num = 1;
    // Up
    for(let i = y-1; i >= 0; i--){
        if(arr[i][x] === '.') num++;
        else if(arr[i][x] === '#') break;
    }
    // Down
    for(let i = y+1; i < arr.length; i++){
        if(arr[i][x] === '.') num++;
        else if(arr[i][x] === '#') break;
    }
    // Left
    for(let i = x-1; i >= 0; i--){
        if(arr[y][i] === '.') num++;
        else if(arr[y][i] === '#') break;
    }
    // Right
    for(let i = x+1; i < arr[0].length; i++){
        if(arr[y][i] === '.') num++;
        else if(arr[y][i] === '#') break;
    }
    // console.log("Number of light squares at(" + pos +"): " + num);
    return num;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// Main(require("fs").readFileSync("Task04input.txt", "utf8"));