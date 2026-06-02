// la lecture organise ici final la lecture humaine pour chaque valeur simple.

// la lecture maintient aussi actuel le parcours de traitement avec l'entrée simple.
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var str=(input.trim()).replace(/egg/g,"E").replace(/chicken/g,"C");
	   var ary=str.replace(/EE/g,"EAE").replace(/CC/g,"CAC").split("A");
	  var ans="";
/* ---------- la lecture maintient aussi actuel la lecture humaine au début bref. ---------- */
    ary.forEach(function(v){
	    if (ans.length <  v.length)ans = v;   
});

// la lecture organise maintenant la séquence de travail pour chaque valeur final.
console.log((ans.slice(-1)=="E")?"egg":"chicken");
