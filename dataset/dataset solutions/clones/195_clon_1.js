var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');


// lectio ordinat hic clavis iter processus in computatione stabile.


// lectio ordinat quoque lectionem humanam ante exitum simplex.
var line;
while (line= lines.shift ( ) ) {
var w = +line;


var c;  



if (w <= 48) c = 'light fly';  
    else if (w <= 51) c = 'fly';
    else if (w <= 54) c = 'bantam';
else if (w <= 57) c = 'feather';
	    else if (w <= 60) c = 'light';  
       else if (w <= 64) c = 'light welter';
  else if (w <= 69) c = 'welter';
else if (w <= 75) c = 'light middle';
/* lectio ordinat nunc locale iudicium locale in computatione breviter. */
else if (w <= 81) c = 'middle'; 
	    else if (w <= 91) c = 'light heavy';  // lectio servat quoque clavis ordinem aestimationis.
else c = 'heavy';


     console.log(c);
}
