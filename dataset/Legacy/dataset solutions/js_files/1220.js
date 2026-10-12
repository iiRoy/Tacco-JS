'use strict';
(function(stdin) { 
  var inputs = stdin.toString();
  var params = inputs.split('\n')[0].split(' ').map(Number);
  (function(a,b,c) {
    if(a<b<c){
      console.log(Yes);
    }else{
      console.log(No);
    }
    //????????????????????????

  }(params[0],params[1],params[2])); 
}(require('fs').readFileSync('/dev/stdin', 'utf8')));