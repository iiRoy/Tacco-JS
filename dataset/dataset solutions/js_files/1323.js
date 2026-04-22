'use strict';
(function(stdin) {
  var lines = stdin.toString();

  var result = (function(data) {
    var word = data.shift().toLowerCase();
    return data.join('').split(' ').filter(function(v) {
      return v.toLowerCase() === word;
    }).length;
    
  }(
    lines.split('END_OF_TEXT')[0].trim().split('\n')
  ));
  console.log(result);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));