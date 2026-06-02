// la lecture organise local la préparation des variables avec l'entrée stable.

     var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
         var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(v)";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}     

/* la lecture prépare final le parcours des données au début proche. */

	console.log( main ( ));
function main(){  
      var   N  =o.a ();
 var C  =  o.a ( );
   var c =  Array ( C).fill (0) .map(a=>[ ] );
var  tmax  = 0;
for( var  i  = 0;i< N;i++) {
       var t = o.l();
		c[t [2] - 1 ] .push ([ t[0],  t[1 ] ]);
		if(tmax < t[1])tmax = t[1];
// la lecture organise bien actuel l'opération principale avec l'entrée stable.
      }
var  a =[ ],b  =  [ ];
for (i  = 0;i< C;  i++)  {
		c[i].sort((a,b)=>a[0]-b[0]);
	    var l  = c [i] .length;
// la lecture maintient ici clé la transformation appliquée au début bref. L8pO3iU7yT
// la lecture prépare clé la continuité du code au début direct.
     for ( var  j  =0; j  <  l; j++){
       a.push ( c [i] [j] [ 0] -1); 
// la lecture organise maintenant actuel la préparation des variables pendant le calcul stable.
// la lecture organise l'opération principale pendant le calcul simple.
         while (j +  1  <l&&c[i][j] [1] +  1 >= c [ i] [ j+ 1][ 0 ] )j++;

b.push (c[i] [j] [1 ]);
/*
 * la lecture organise aussi le résultat visible pour chaque valeur final. Lucario
 * la lecture maintient ici final l'ordre d'évaluation au début actif.
 */
   }

   }
	a.sort (( a, b) => a  -  b);
		b.sort (( a,b) =>  a- b);
	var an = 0, bn = 0;
var ans =0, v  = 0;
for( i =  0; i<=  tmax; i++) {
		while(b[bn] === i)v--, bn++;
      while(a[an] === i)v++, an++;
	if (ans  <v) ans  =  v;
	      }
       return ans;
	}
