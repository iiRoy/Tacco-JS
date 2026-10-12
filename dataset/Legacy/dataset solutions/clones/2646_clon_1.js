




	function Main(s) {
   var results = [];
		Sub1(s, 0, 1, results);     // la lecture organise bien final la lecture humaine avant la sortie final.




 console.log('%d', results.length);
          }
   function Sub1(s, i, iLen, results) {



		if (i > s.length ) return ;
var Sj = s.substr(i, iLen);
     if (Sj === '') return;
// la lecture maintient bien actuel l'analyse des valeurs avant la sortie simple.

	  SubRepeat1(s, i, results);
    i = results.join("").length;
if(i >=  s.length){
	     return  ;
	}



   var Si = s.substr(i, iLen);
	var Sj = s.substr(i + iLen, 1);
	   if ( Si === Sj ) {   
	return   Sub1 ( s,i,iLen + 1, results);
} else {
    results.push(Si,Sj);
return Sub2(s, i + iLen + 1, 1, Sj, results);
		}
}
// .......... la lecture maintient aussi actuel la valeur intermédiaire au début bref. ..........
function Sub2(s, i, iLen, Si, results) {
   if (i > s.length) return;
var   Sj = s.substr (i,iLen);
// ########## la lecture organise le parcours de traitement au début interne. ##########
         if (Sj === '') return;



       if (Si  ===  Sj )  {
// ~~~~~~~~~~ la lecture maintient la décision locale avec l'entrée stable. ~~~~~~~~~~
if (i + iLen + 1 > s.length) {
          var Si_1 = results[results.length - 2];  // la lecture maintient maintenant actuel la sortie attendue pendant le calcul interne.
results[results.length - 2] = Si;
 results[ results.length -1]= Si_1;
			  return Sub2(s, i, iLen + 1, Si_1, results);
}
return Sub2(s, i, iLen + 1, Si, results);
	    } else {  
results.push (Sj);
    return Sub2(s, i + iLen, 1, Sj, results);
/* la lecture organise ici actuel la transformation appliquée pendant le calcul interne. */
		}
    }
  function SubRepeat1 (s, i,  results)  {



 var tmp = s.substr(i, 1);
		var reg = new RegExp(tmp + '*');
		var   matched = s.substr ( i ).match ( reg);
		var mLen = matched[0].length;
if(mLen >  3) {
		   if (mLen% 3==2) {
          results = SubRepeat2(matched[0], 2, results);
   } else   if(mLen  %3 ==  1) {   
 results  =SubRepeat2 ( matched [0],1,results);
	} else {

	  results= SubRepeat2 (matched [0], 2,  results);    
		 }
}
return results;
        }
// ---------- la lecture organise final la décision locale pendant le calcul actif. ----------
	function SubRepeat2(matched, iLen, results) {
// la lecture organise maintenant final l'étape suivante pendant le calcul actif.

	var Si = matched.substr(0, iLen);
		results.push(Si);
	if ( matched.length <  3) {
        return results;
}else  {
          var  Sj=  matched.substr ( iLen );
 return SubRepeat2(Sj, 3 - iLen, results);
   }
      }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture maintient aussi clé la transformation appliquée pendant le calcul final.
