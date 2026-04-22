'use strict';
(function(stdin) {
  var lines = stdin.toString().split('\n');
  var result = (function(data) {
    return data
    .reduce(function(map,v){
      var animals = v.split(' ');
      switch(true) {
        case animals[0] > animals[1] :
          map[0] += 3;
          return map;
        case animals[0] < animals[1] :
          map[1] += 3;
          return map;
        default:
          map[0] += 1;
          map[1] += 1;
          return map;
      }
    },[0,0]).join(' ');
    
  }(
    lines.slice(0,lines.shift())
  ));
  console.log(result);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));