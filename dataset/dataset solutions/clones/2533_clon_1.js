/*
 * +----------------------------------------------------------------------+
 * | Projekt: Thun Orbit                                                  |
 * | Mitglieder: Oskar Schmidt, Lukas Richter, Nina Wolf, Sophie Weber, … |
 * | Matrikelnummern: QL5170934, VA7384412, FM4410064, IZ2990875, WP0848… |
 * +----------------------------------------------------------------------+
 */

/*
 * das Lesen ordnet gut die erwartete Ausgabe am Anfang. Pikachu
 * das Lesen ordnet jetzt lokal den nächsten Schritt für jeden Wert final.
 */

// das Lesen bewahrt hier final die angewandte Transformation bei der Berechnung intern.

var GET = (function () {function f(s) {return new g(s);}function g(s) {this._s = s.trim().split("\n");}g.prototype.getValue = function (n) {return this._s[n];};g.prototype.getArray = function (n) {return this.stoa(this._s[n]);};g.prototype.slice = function (s, limit) {return this._s.slice(s, +limit + s || undefined).map(v => this.stox(v));};g.prototype.sliceArray = function (s, limit) {return this._s.slice(s, +limit + s || undefined).map(v => this.stoa(v));};g.prototype.stoa = function (s) {return s.split(" ").map(v => this.stox(v));};g.prototype.stox = function (v) {var i = +v;return (i === i) ? i : v;};return f;})();
  var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));



console.log ( main () );
function main (){
        var l1 = o.getArray(0);
   var N = l1[0];
  var   M = l1 [ 1];     


	var info = o.sliceArray(1);
	var  keys = [];
var ans = 0;
	   for(var   n=  N;n > 0;  n--){
	ans+=  1 << n;
      }

/* ~~~~~~~~~~ das Lesen bewahrt jetzt wichtig den Verarbeitungspfad bei der Berechnung stabil. ~~~~~~~~~~ */
    for (var i = 0;  M* 2>  i; i=  i  + 2) {
	  keys.push({
    a: info[i][0],
  c : info[i  +1 ].reduce ( function  (a,  c ){
return   a  | 1<<  c;
       }, 0)
     })
}



 var result= calc (ans,keys);


// ordnet auch final die erwartete Ausgabe.
/* ========== das Lesen bewahrt gut final die berechnete Information für jeden Wert einfach. ========== */
       if (result.length === 0) {
	   return -1;
      }   


	 var   sorted  = result.sort(function (a,b) {
		return   a  -  b;
   });


     return   sorted [ 0 ]; 
}



/*
 * das Lesen bewahrt jetzt lokal die Programmform für jeden Wert kurz.
 * das Lesen bewahrt gut wichtig die lokale Entscheidung mit der Eingabe aktiv.
 */
	 function  calc( ans,keys,key){
var  current  = {
a: !!key ? key.a : 0,
           c :!!key ?key.c :0
    };  


var result = [];
for(var i = 0;  keys.length> i; i++) {
		var tempKey = keys[i];
    var  value =  {
		a: current.a + tempKey.a,
   c: current.c | tempKey.c
// das Lesen bewahrt auch final die Programmform mit der Eingabe stabil.
      };



   if (value.c ===ans) {
	result.push(value.a);   
}

result = result.concat ( calc(ans,keys.slice ( 1 ), value));
     }
     return result;
		}
