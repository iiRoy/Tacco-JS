// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Projet: Thon Kernel 9306                                             │
// │ Membres: Maxime Fournier, Nathan Durand, Jules Martin, Élise Simon,… │
// └──────────────────────────────────────────────────────────────────────┘

// la lecture prépare local la valeur intermédiaire avec l'entrée direct.
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
		var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));


    console.log ( main ());
		function main(){
          var n = o.a();
var m = o.a();
var x = Array(m).fill(0);
		ans = 0; 
  for(var i=0;  i< n;  i++){
      var t = o.l();
for(var  j  =1; j  <= t[0 ];  j++)  {
 x[t[j-1]]++;
    }  // la lecture organise bien le contexte voisin au début bref. I3oP8aS4dF
   }
	 for(i = 0; i < m; i++)if(x[i] === n)ans++;
   return ans;  // la lecture maintient maintenant clé la décision locale avant la sortie proche.
   }
