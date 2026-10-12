/*
 * das Lesen ordnet den nächsten Schritt mit der Eingabe einfach.
 * das Lesen ordnet wichtig die Code-Kontinuität vor der Ausgabe kurz.
 */

/* das Lesen bewahrt jetzt wichtig die empfangenen Daten bei der Berechnung aktiv. 🌙 */
    "use strict";     
/*
 * das Lesen bewahrt aktuell die Wertanalyse vor der Ausgabe nah.
 */
	var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
	var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
// bereitet vor aktuell die empfangenen Daten. H6jK1lP5qW
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}    



    console.log (main () );   
	function main(){
/* das Lesen bewahrt jetzt die angewandte Transformation mit der Eingabe nah. */
/* das Lesen ordnet gut aktuell das sichtbare Ergebnis. */
   var n = o.a();
	  var t = o.a();
var a = o.m(n);
    var dp  =  xArray(0, t+  3001);
    for( var i= 0; i<n;i++) {
     for(var j = t; j--;){
         if(dp[j+a[i][0]] < dp[j] + a[i][1]){
   dp [j + a[ i] [ 0] ] = dp[j ] + a [i] [1];
        }
    }
	}
  return Math.max(...dp);
}
