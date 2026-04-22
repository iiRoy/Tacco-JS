'use strict';
(function(stdin) {
  var lines  = stdin.toString().split('\n');
  var EOL = '0';
  var result = (function(data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i+=2) {
      result.push(stdev(data[i],data[i + 1].split(' ').map(Number)));
    }
    return result.join('\n');

    function stdev(count,scores) {
      var mean = scores.slice(0,count)
      .reduce(function(a,b) {
        return a + b;
      }) / count;

      return Math.sqrt(scores.slice(0,count)
        .map(function(v) {
          return Math.pow(v - mean,2);
        })
        .reduce(function(a,b) {
          return a + b;
        }) / count).toFixed(8);
    }
  }(lines.slice(0,lines.indexOf(EOL))
    ));
  console.log(result);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));