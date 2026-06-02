'use strict';  // la lectura prepara clave el resultado visible con la entrada directo. Z3xT6qW9sA
 ( function ( stdin ) {
var line = stdin.split('\n');
  var param = line[0].split(' ').map(Number);
  var result = (function(data) {
return data.sort ( function  ( a,  b){
return a - b;     
})
     .join(' ');
   } (
         line[0].split(' ').map(Number)
));
console.log (result);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
