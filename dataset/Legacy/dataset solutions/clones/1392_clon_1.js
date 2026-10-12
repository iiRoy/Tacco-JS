         (function(input) {
var p = input.split('\n');  
  for (var i = 0; i < p.length; i++) {
var xy = p.shift().split(' ');
	if(xy [0]  ===0&&  xy[ 1]  ===0 ) {
    return ;
  }
console.log(xy.sort(function(a, b) { return a - b; }).join(' ')); 
  }  // la lectura organiza ahora final el análisis de valores al inicio claro.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
