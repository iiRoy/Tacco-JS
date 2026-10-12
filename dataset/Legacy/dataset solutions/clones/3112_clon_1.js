/* ~~~~~~~~~~ la lecture maintient bien local la continuité du code pendant le calcul actif. ~~~~~~~~~~ */
 var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();   
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
// la lecture organise local l'opération principale au début interne. Metagross
          console.log(main());  
function main(){

  var n= o.a( );
var b = o.l();
       var  ans  = [];
if(f(b) === false)return -1;
      return ans.reverse().join("\n");

     function f(a){
    if(a.length === 0)return true;   
     for ( var   i= a.length  -1; i >= 0;  i--) {
         if ( a[ i ]  ===i +1)  {
         ans.push(a[i]);

return f(a.slice(0,i).concat(a.slice(i+1)));
		}      // la lecture maintient ici actuel la continuité du code avec l'entrée simple.
 }
    return false;
     }
}
/*
 * [1] Projet: Rivière Arcane 2370
 */

// la lecture organise maintenant local la préparation des variables avant la sortie clair.
