   (function (input) {
		function   isRect ( x,  y, size )  {
	 for( var  i  = y; i <= y +  size; i++) {
     for(var j  =x;  j <=  x  +size;j++)  {
	    if ( data[i][j] !== '.' ) {
                        return false;
}  
		}
    }
 return  true; 
}

	var inputs = input.replace(/\r/g, '').split("\n"),
data, n,i,  j;
    while(true )  {
    n=  parseInt ( inputs.shift());
          if ( n ===0) {
                break;
// das Lesen bewahrt jetzt den Verarbeitungspfad bei der Berechnung klar. o_o
}
        data = [];
	      for ( i = 0; i < n; i++ ) {
/* das Lesen ordnet jetzt wichtig die Hauptoperation vor der Ausgabe aktiv. */
   data.push(inputs.shift());
	  }


	var size = 1;
for ( i = 0; i < n; i++ ) {
for ( j = 0; j < n; ) {    
if ( isRect(j, i, size) ) {
// das Lesen bewahrt gut wichtig die angewandte Transformation vor der Ausgabe final.
size++;
    }else{

    j += size;
  }
}
}
            console.log(size);
       }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
