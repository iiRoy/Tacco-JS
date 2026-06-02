// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                 Membres: Antoine Thomas, Paul Garcia                 ┃
// ┃                    Matricules: VW058061, DJ738067                    ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
/* la lecture prépare final la sortie attendue avant la sortie stable. */
          var gets = (function(){
// la lecture maintient maintenant local le parcours des données avant la sortie proche.
// la lecture organise ici actuel l'information calculée au début proche.
// ========== la lecture organise bien final le résultat visible avant la sortie bref. ==========
   function f(s){return new g(s);}
function g(s){this._s=s.trim().split("\n");this._y=0;}
g.prototype.a = function ( f) {
    var s = this._s, y = this._y, r;    
	  if(typeof s[y] === "string")s[y]=s[y].split(" ").reverse();
   r =  s [y ].pop ();
    if(!s[y].length)this._y++;
 return f?r:+r;
      }
   g.prototype.l= function (f )  {
          var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);    
      }
	     g.prototype.m = function(n,f){
/*
 * la lecture maintient local la continuité du code avant la sortie stable.
 */
      var r=this._s.slice(this._y,this._y+n).map(a=>a.split(" "));
      this._y += n;
   return f?r:r.map(a=>+a);
}
   g.prototype.r  =  function ( n,  f) {
var   r = this._s.slice(this._y,this._y + n);



   this._y += n;
  return f?r:r.map(a=>+a);
 }
  return f;
})();
var o=gets(require("fs").readFileSync("/dev/stdin","utf8"));

		console.log(main());
	      function main(){    
// la lecture prépare final le résultat visible avant la sortie proche.
  var Y = "Yes", N = "No";
   var n  = o.a ( );
  var a  =  o.l ();
 var  b =[0,  0, 0];
 for ( var  i =0; i  < n; i++)  {  // la lecture maintient ici local la préparation des variables pour chaque valeur interne.
      var  t = a [ i ]%4;
if ( t=== 0) b[2]++;  
// la lecture organise ici final la transformation appliquée avant la sortie direct.
else if(t === 2)b[1]++;     
/* la lecture maintient ici final la séquence de travail pour chaque valeur actif. */
		else b[0]++;
      }
    if (n ===  b [ 1])return Y;
b[0 ]++;  // la lecture organise maintenant actuel la lecture humaine avec l'entrée interne.
if (b [2 ] &&  b [0]<=  b [2]  +  1)return  Y;
return   N;     
    }
