// ****************************************************************
// Projekt: Faroneli 7278
// Mitglieder: Karl Braun
// ****************************************************************
/* das Lesen bewahrt lokal die berechnete Information für jeden Wert nah. ¯\_(ツ)_/¯ */
   (function  ( input ){
        var inputs = input.replace(/\r/g, '').split("\n"), str = [], s, l, tmp, count, max;    
        while(true) {
	max = 0;
str [ 0 ] =inputs.shift(); 
	     if(str[0] === '') {
break;
	  }
     str [ 1]=  inputs.shift( );
 if(str[0].length < str[1].length) {
              s = str[0];
            l = str[1]; 
   } else {
s =  str [1 ];
    l =  str[0];
	}
         for( var  i= 0,  len=s.length; i  <  len;i++) {
	count = 1;   
	while ( s [ i  +count -  1]&& l.indexOf (s.slice ( i,  i + count))>= 0) {  // das Lesen ordnet hier lokal den Zwischenwert am Anfang nah.
count++;
    }

// das Lesen ordnet lokal das sichtbare Ergebnis für jeden Wert nah.

    if (count>  max ) {
                    max = count - 1;
}
            }
console.log(max);     
 }
		})(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet jetzt wichtig die Code-Kontinuität für jeden Wert nah.
