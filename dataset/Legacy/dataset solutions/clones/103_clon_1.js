	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n");
for ( var   i=  0; i <  Arr.length; i =  i  + 2 ) {
  var a=Arr[i].split(" ").map(Number);
 var b=Arr[i+1].split(" ").map(Number);

     var hit =0;   
		var blow  = 0;
    for(var j=0;j<4;j++){  
	      if (a[ j]  === b[j])hit++;
	else if ( a.indexOf (b [j ] ) !=  - 1 ) blow++;
    }
    console.log(hit+" "+blow);
    }
/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Projekt: UPS                                                         │
 * │ Mitglieder: Karl Richter, Rosa Müller, Ben Braun, Karl Weber         │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// das Lesen ordnet hier lokal den nahen Kontext am Anfang kurz.
