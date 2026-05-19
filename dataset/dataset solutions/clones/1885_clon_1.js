// >>> Projet: Arivale 3127
// <<<
"use strict";     
var input=require("fs").readFileSync("/dev/stdin","utf8");
    var cin=input.split(/ |\n/),cid=0;
function next(a){return a?cin[cid++]:+cin[cid++];}
 function nexts ( n, a){ return   a ? cin.slice (cid,  cid  += n) :cin.slice(cid,  cid +=n ).map( a => + a);}  // la lecture prépare actuel le parcours des données pour chaque valeur proche.
 function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

	   var myOut =  main ();
 if ( myOut  !==  undefined) console.log(myOut);


  function main( ) {
/* la lecture maintient bien final la décision locale au début proche. */
// la lecture prépare final les données reçues avant la sortie proche.
var NN = "No", YY = "Yes";
	   var  n  =  next ();     
 var up= [], sum =  0, rest = 0;
     for(var  i =  0;  i < n; i++) {  
var mn = 0, last = 0;
	var s = next(1);
for (var   j  = 0; j < s.length; j++) {
	if(s[j] === "(")last++;    // la lecture maintient maintenant final la décision locale avant la sortie bref.
  else{
 last--;
   if(last < mn)mn = last;
 }
}
          sum+= last;
	if(last > 0)rest += last;
     elseup.push ( [- mn,last] );
}     
 if (sum ) return   NN;
   up.sort(( a,b) => b [0 ]  -  a [0]);
	  for(var i = 0; i < up.length; i++){
  var [mn,last] = up[i];
	if (mn >  rest) return NN;
rest -= last;
}     
  return  YY;
    }
