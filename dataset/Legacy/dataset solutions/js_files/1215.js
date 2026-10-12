'use strict';
(function(stdin) {
  var inputs = stdin.toString().trim().split('\n');
  var params = inputs[0].split(' ').map(Number);

  (function(a, b) {
      console.log(f(a,b));
      function f(a,b){
        if (a > b){return 'a > b';}
        if (a < b){return 'a < b';}
        return 'a == b';
      }
  }(params[0], params[1]));

}(require('fs').readFileSync('/dev/stdin', 'utf8')));