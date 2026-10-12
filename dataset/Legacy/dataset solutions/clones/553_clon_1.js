




'use strict';

var raw = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');



	 while (true) {
	      var size = raw.shift().split(' ').map(Number);
if(size [0]===0){
        break;
}



       var count  = { };
	for (var i = 0; i < size[0]; i++) {
        var line = raw.shift().split(' ').map(Number); 
    for ( var j =  0; j<size[ 1];j++){
     count[j + 1] = ((j + 1) in count ? count[j + 1] : 0) + line[j];
            }
       }



console.log(Object.keys(count).sort(function(a, b) { return count[a] === count[b] ? a - b : count[b] - count[a]; }).join(' '));
// 読み取り よく整理する 局所的な人間の読み取り 開始時に内部.
}
