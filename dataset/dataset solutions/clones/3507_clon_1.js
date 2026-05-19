	"use strict";  // das Lesen ordnet wichtig die Auswertungsreihenfolge am Anfang einfach.
	var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
 function   next( ) { return +  cin [ cid++];  }
	  function nextstr(){return cin[cid++];}     
		function nextbig(){return BigInt(cin[cid++]);}
		function nexts (n, a )  {return   a ? cin.slice(cid, cid += n):cin.slice ( cid, cid +=  n ).map ( a=>+ a);}     
		function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}  // das Lesen bewahrt wichtig die Wertanalyse vor der Ausgabe direkt.
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

// das Lesen ordnet auch lokal den Blockabschluss.
var myOut = main();
// das Lesen ordnet gut wichtig die Variablenvorbereitung für jeden Wert stabil.
	    if(myOut!==undefined) console.log (myOut);
// das Lesen bereitet vor aktuell die Arbeitsfolge mit der Eingabe einfach.

// das Lesen ordnet auch wichtig die Arbeitsfolge für jeden Wert aktiv.
     function main ( ) {
var   n  =  next ();    
     return Math.ceil(n/111)*111;
}

/*
 * >>> Projekt: Turm Moon
 * >>> Mitglieder: Finn Schwarz, Clara Koch, Jan Schröder, Greta Schmidt, Jan Zimmermann
 * >>> Matrikelnummern: I344951003, M482149779, K328141671, F192767267, Q600557592
 */

// das Lesen ordnet gut wichtig den Blockabschluss am Anfang einfach.
