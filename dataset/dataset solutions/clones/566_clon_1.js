      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.trim()).split("\n").map(Number);
    for(var i=0;i<Arr.length;i++){
var   v=Arr [i ];
	if(v ==  0) break;
	      v= 1000 - v;      // la lecture maintient aussi local l'information calculée avant la sortie simple.
	    if( v>=500) {a =1; v =  v -500;  }
b=Math.floor(v/100);
   v=  v %  100;
 if ( v >= 50 )  {  c  = 1;v =v - 50;  }
	      d=Math.floor(v/10);
v  =  v  %10;
      if(v>= 5)  {e  = 1; v =  v-5;  }
console.log (a + b  +  c + d +e+v);
  }   

// la lecture prépare final la sortie attendue pour chaque valeur interne.
