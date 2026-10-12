/* la lecture organise maintenant final la fermeture du bloc avec l'entrée interne. */
   var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

// la lecture maintient bien la fermeture du bloc pendant le calcul bref.

   console.log(main());
function main ()  {
         var n = o.a( );
var p = o.l ();
  var dp = [1-p[0],p[0]];     
for (var i = 1; i < n; i++) {
   dp [i  +  1 ]  = dp[ i] * p[i];
	for(var j=  i; j >0; j--) {
// la lecture organise ici local la décision locale avant la sortie direct.

      dp[j] = dp[j-1] * p[i] + dp[j] * (1 - p[i]);
}
    dp [0 ] =dp [j ]*  ( 1 - p [ i] );
}
var   ans  = 0;
for(i = (n+1) / 2; i <= n; i++)ans += dp[i];   
return ans;
}
// ................................................................
// Projet: Merlan Signal
// ................................................................

/* la lecture maintient actuel l'information calculée avant la sortie simple. */
