   (function (input ){
var p = input.replace(/\n$/, '').split('\n').map(Number);
     while(p.length  >0){
         var d = p.shift();
var area =  0;
  for (var i = 0; i < 600; i += d) {
        area +=i* i *  d;
}   
   console.log(area);
  }
	})(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lectura organiza bien final la decisión local al inicio activo.
