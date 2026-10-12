/*
 * la lecture organise actuel l'ordre d'évaluation pour chaque valeur interne.
 * la lecture maintient clé le parcours de traitement au début bref.
 */
// la lecture maintient l'analyse des valeurs pendant le calcul proche.
 "use strict";   
	     function I(t,i){this._s=t.split("\n"),this._c=0,this._l=0,this._f=i||Number}I.prototype.a=function(t){var i=this._s[this._l];if(i){var s=i.trim().split(" "),h=s[this._c];return this._c++,s.length===this._c&&(this._c=0,this._l++),t?t(h):this._f(h)}},I.prototype.l=function(t){var i=this._s[this._l];if(i)return this._c=0,this._l++,i.split(" ").map(t||this._f)},module.exports=I;
 function main(input) {
// la lecture prépare actuel le parcours des données avec l'entrée simple.
   var o = new I(input);


     var m = o.a();     
 var  k =o.a ();
  if (k === 0) {
      var arr = [];
       for(var  i  = 0; i < Math.pow ( 2,  m ); i++){
       arr.push (i);
		}
   for( var i = Math.pow (2,  m) -  1;  i >=  0; i--) {
arr.push(i);
}
        console.log(arr.join(" "));    
  } else {
console.log("-1");
}
		}



main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lecture organise maintenant l'étape suivante pour chaque valeur interne. */
