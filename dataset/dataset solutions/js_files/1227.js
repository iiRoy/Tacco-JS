'use strict';
(function(stdin) { 
  var inputs = stdin.toString();
  var params = inputs.split('\n')[0].split(' ').map(Number);
  (function(W,H,x,y,r) {
    //????????????????????????
    if(x - r < 0 ,y - r < 0 ,x + r > W ,y + x > H){
      console.log('No');
    }else{
      console.log('Yes');
    }
    }(params[0],params[1],params[2],params[3],params[4])); 
}(require('fs').readFileSync('/dev/stdin', 'utf8')));