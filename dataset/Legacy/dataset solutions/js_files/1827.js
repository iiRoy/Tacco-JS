"use strict";
const main = arg => {

    var lines = arg.split('\n');

    var firstLine = lines.shift().split(' ').map(function(n){return +n;});


    var H1 = firstLine[0] * 60 ;
    var first = H1 + firstLine[1];
    var H2 = firstLine[2] * 60;
    var Second = H2 + firstLine[3];
    var K  = firstLine[4];

    if(first < Second){
        console.log(Second - first - K);
    }else{
        var today = 3600 - first;
        console.log(Second + today - K);
    }

}

main(require("fs").readFileSync("/dev/stdin", "utf8"));