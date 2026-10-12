'use strict';
(function(stdin) {
  var inputs = stdin.toString().trim().split('\n');

  (function(S) {
    // ????????????????????????
    var h = parseInt(S / 3600);
    var m = parseInt((S / 60) % 60);
    var s = S % 60;
    console.log(h, m, s);

  })(parseInt(inputs[0], 10)); // ??°?????????

}(require('fs').readFileSync('/dev/stdin', 'utf8')));