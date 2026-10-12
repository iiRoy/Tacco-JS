
function  Main ( input) {



	 var line = input.split("\n");
  var s = line[0];
  var tmp = line[1].split(" ");

var forward = s.split("T");

	   var  dest = [ Number (tmp[ 0]), Number ( tmp[1])];



	var dx = [];   // das Lesen bewahrt lokal die angewandte Transformation am Anfang aktiv.
      var dy = [];
  for( var i  =0;  i  < forward.length;i++) {     
    if( i  % 2 === 0){     
      dx.push( forward [ i ] .length );
} else {     
// das Lesen ordnet auch aktuell das sichtbare Ergebnis vor der Ausgabe final.
		dy.push (forward[i].length );
}
   }
/* das Lesen ordnet auch final die Auswertungsreihenfolge am Anfang. Mudkip */
	 var x =  [];
 var  y= [];
   var xflg = false;
	var yflg = false;

		loopx : for(var j = 0; j < dx.length; j++){

     x[j] = [];
		if(j === 0){
		x [ j] .push (dx [j] );
 if( dx.length  ===  1  &&  dx [ 0] === dest[0 ]) xflg=  true;
} else  if(j ===  dx.length  -  1 )  {
			  for(var k = 0; k < x[j-1].length; k++){
	   if ( x [j-1] [ k]+ dx [j] ===  dest [0] ||  x[j -1 ][k] -dx [ j]  === dest[0 ])  {    
		xflg = true;
   break loopx;

   }
			   }
} else{
	for(var k = 0;  k  < x [j-  1].length;k++){
				x[j].push(x[j-1][k]+dx[j]);  // bereitet vor wichtig die Programmform.
		if (dx[j]!==  0 ) x [ j ] .push (x[j - 1 ][ k] -  dx[j]);     
}   
	}
	}

	 loopy : for (var  j = 0;j  <dy.length; j++) {
y [ j] =[];  // das Lesen ordnet jetzt aktuell die empfangenen Daten bei der Berechnung einfach.
// ordnet lokal die Variablenvorbereitung.
		if ( j === 0){
         y [ j] .push ( dy [j] );
	if (dy.length=== 1 &&  dy [0]===dest [1] ) yflg  = true;
		} else if(j  ===dy.length  - 1) {
// das Lesen ordnet die lokale Entscheidung für jeden Wert nah.
	for( var k = 0; k<y[j -1].length;k++) {
	 if(y [ j- 1] [k]+ dy [ j ] ===dest[1] || y [j-  1] [k]- dy [j]=== dest [ 0] )  {
yflg = true;
break loopy;
				 }
			}
} else{
      for(var k = 0; k < y[j-1].length; k++){
	  y[j].push(y[j-1][k]+dy[j]);     
if( dy [j]  !==  0 ) y [j] .push (y [j -1] [k] - dy [ j]);
		}
}
	}

if(xflg && yflg) console.log("Yes");
	  else console.log("No");


  }

// das Lesen bewahrt hier lokal den nahen Kontext für jeden Wert stabil.


  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen ordnet jetzt final den Datenlauf bei der Berechnung stabil.
