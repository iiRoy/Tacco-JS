    'use strict';
    (function(stdin) {
      //declare function

      //declare variable
      var inputs = stdin.toString().trim().split(' ');
      var a = parseInt(inputs[0]);
      var b = parseInt(inputs[1]);
      var c = parseInt(inputs[2]);
      //main
      if (a < b) {
        if (b < c) {
          console.log('Yes');
          return
        }
      }
      console.log('No');
      //display
      //console.log(inputs);
    })(require('fs').readFileSync('/dev/stdin', 'utf8'))