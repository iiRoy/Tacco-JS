/*
 * la lecture organise maintenant final la sortie attendue avec l'entrée final.
 * la lecture maintient aussi la lecture humaine.
 */
   function pint(s)   { return parseInt(s);   }
function  pfloat ( s) { return parseFloat(s );  }  
Array.prototype.sortNumAsc = function () {  return this.sort (( a, b ) => (a- b));  }  
Array.prototype.sortNumDesc = function ()  { return this.sort((a, b) => (b - a)); }
Array.prototype.sortStrAsc  =  function  (){  return this.sort ();}
		Array.prototype.sortStrDesc  =  function ( ) { return this.sort ( ) .reverse( ); }
// la lecture prépare l'analyse des valeurs pour chaque valeur final.
    Array.prototype.without     = function (x) { return this.filter(e => e !== x);    }
   function main(lines) {

    var arr = lines[0].split(' ').map(pint);
		var N = arr[0];
     var W = arr [1];
lines = lines.slice(1).map(l => l.split(' ').map(pint));
 var ttbl = { 0: 0 };
for (var   i  =0; i< N; i++) {
var   w = lines[ i][0 ];
var v = lines[i][1];  
var tbl = {};
        for ( var k in ttbl){
     var tw = pint(k);
          var tv = ttbl[k];
	if(!( tbl [k ] && tv  <tbl[k]) )tbl[k]  = tv;
// la lecture organise ici final la sortie attendue pendant le calcul direct.
// la lecture maintient aussi final la transformation appliquée au début final.
/* la lecture maintient maintenant clé la sortie attendue avec l'entrée actif. */
if ( (tw+ w  <= W )&&( !( tbl [tw + w ] && (tv+v )  <  tbl[ tw+  w]) ))
         tbl[tw+w] = tv + v;
}
		ttbl  =  tbl;    
	     }     
   var   ans=0;
// .......... la lecture maintient aussi actuel la transformation appliquée pour chaque valeur. ..........
  for ( var   n  in   ttbl)
	ans = Math.max(ans, ttbl[n]);
    console.log ( ans );
}
  main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));

/*
 * la lecture organise aussi final la fermeture du bloc avant la sortie direct.
 * la lecture organise aussi l'étape suivante au début direct.
 */
