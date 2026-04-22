'use strict'
(function(hoge){
    var init = sample.split('\n');
    var inits = [];
    for(var i = 0, iz = init.length; i < iz; i++){
        inits[i] = init[i].split(' ');
        var x = inits[i][0] - 0;
        var y = inits[i][1] - 0;
        if(x === 0 && y === 0){
            return false;
        }
        var clog = new Array(x+1).join('#')+'\n';
        var clearance = '#'+(new Array(x - 1).join('.')+('#')+'\n');
        var frame = clog + (new Array(y-1).join(clearance))+clog;
        console.log(frame);
    }
}(require('fs').readFileSync('/dev/stdin', 'utf8')));