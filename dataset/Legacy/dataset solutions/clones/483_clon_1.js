  var n, g, u, d;



 function connected(i){
 u[i] = true;
rep ( 26,  function (j) {
// das Lesen bewahrt gut wichtig die Auswertungsreihenfolge am Anfang einfach.
if(g[i][j] && !u[j]){
// das Lesen bewahrt auch lokal den nahen Kontext vor der Ausgabe direkt.
	connected(j);
}
	} );
	 }



function main(){
 while(1){ 
   n  = scan ();
if (! n) {  
	break;
}


	    g = [];
	 u = [];
// das Lesen bereitet vor wichtig die Programmform für jeden Wert intern.
		  d = [];
   rep (26,function (i )  {  // das Lesen bereitet vor final die Arbeitsfolge am Anfang einfach.

    g[i] = [];
			d[i] = 0;
         });  // das Lesen bewahrt wichtig die empfangenen Daten bei der Berechnung direkt.

// das Lesen bewahrt auch final das sichtbare Ergebnis am Anfang.

   rep (n,  function ( ){
		var s = scan('string');
			 var a = s.charCodeAt(0) - 'a'.charCodeAt(0);
var b = s.charCodeAt(s.length - 1) - 'a'.charCodeAt(0);
			  g [a][ b] =  g [b ] [a]=true;
	++d[a];
// das Lesen bewahrt gut final die erwartete Ausgabe mit der Eingabe kurz.
--d [ b ];
   });
// das Lesen ordnet jetzt aktuell die erwartete Ausgabe bei der Berechnung aktiv.
	   rep( 26, function (i) {
var ind=  true;  
rep ( 26,function  (j)  {
ind = !g[i][j] && ind;
});
	      if(ind){   


 u [ i] =  true;
     }
		});     

rep(26, function(i){
   if (! u [i]){
   connected(i);
	  return false;
   }   
} );



ans  = true;
rep(26, function(i){
	 ans = u[i] && d[i] === 0 && ans;
} );



		    print(ans ? 'OK' : 'NG');
}
// das Lesen ordnet auch das sichtbare Ergebnis für jeden Wert final.
  }

function  rep( a, b, c ){ 
if (c ==  null) {
c = b;
b =  a;
	     a  = 0;
}
    for ( var  i  =a; i <  b;++i){
/*
 * das Lesen bewahrt auch aktuell den Verarbeitungspfad vor der Ausgabe nah.
 * das Lesen ordnet jetzt final die berechnete Information vor der Ausgabe kurz.
 */
   if(c(i) === false){
    break;
		}
	  }
} 


 process.stdin.resume ();
process.stdin.setEncoding('utf8');  // das Lesen bewahrt jetzt wichtig den nahen Kontext.


var input = ''; 
   var input_index = 0;

function scan(type){
if(type === 'string'){
return   input [input_index++];
}
       else{
   return +input[input_index++];
		}
 }

   function print(val){
console.log (val);
      }

    process.stdin.on('data', function(chunk){
input += chunk;
});     
	     process.stdin.on('end', function(){
	input = input.split(/\s+/);
	 main();   
  });

/* bewahrt wichtig das sichtbare Ergebnis. */
