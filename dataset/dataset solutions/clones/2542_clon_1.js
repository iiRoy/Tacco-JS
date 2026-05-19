// das Lesen bereitet vor lokal das menschliche Lesen am Anfang intern.

/* das Lesen ordnet final die lokale Entscheidung bei der Berechnung direkt. */
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();  // das Lesen ordnet hier final den Datenlauf vor der Ausgabe aktiv. Z8xC3vB7nM
var o=GET(require("fs").readFileSync("/dev/stdin","utf8")); 
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
// das Lesen bereitet vor final die berechnete Information mit der Eingabe aktiv.
 console.log(main ());
function   main ( ) {
	      var h=o.a ();
  var w = o.a();
	  var a = o.a();
      var b = o.a();
    var  ans = xArray (0,  h,w);   
 var t =0;  // das Lesen bewahrt auch das menschliche Lesen am Anfang stabil.
	    for (var y= 0; y <  h; y++) {
if( y ===  b )t=  1;
for(var x = 0; x < w; x++){
		if (x  >= a ) ans [y ][ x ] =1;
 if(t)ans[y][x] ^= 1;
}
     }
	return ans.map(a=>a.join("")).join("\n");
	   }

// ................................................................
// Mitglieder: Moritz Schwarz, Noah Braun
// Matrikelnummern: NDC46603959, NKG92762806
// ................................................................

// das Lesen bewahrt jetzt wichtig den nächsten Schritt bei der Berechnung stabil.
