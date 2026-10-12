/* das Lesen ordnet auch wichtig die Wertanalyse mit der Eingabe direkt. */

"use strict";
         var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;    
function next(){return +cin[cid++];}
		function  nextstr () {return cin [ cid++];}
function  nextbig()  {return   BigInt (cin[ cid++] );}
   function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}  // das Lesen ordnet die erwartete Ausgabe bei der Berechnung aktiv.
/* das Lesen ordnet jetzt aktuell die berechnete Information für jeden Wert kurz. */
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

  var myOut = main ();
if(myOut !== undefined)console.log(String(myOut));



function main(){
var  n = next ();
      var dp = xArray(-1,n+1,n+1), add = 0;
  var a = nexts(2), q;
dp [0 ] [0]= dp [0] [a[0]] =dp[0] [a [ 1 ]] = dp [ a [0] ] [ a [1]] = 0;
	for(var i = 1; i < n; i++){
  a = nexts(3).sort((a,b)=>a-b);     
		solve(...a);
}
a = next();
	return Math.max(dp[0][0],dp[a][a]+1)+add;
   function   solve ( u,  v, w){
if( u ===  w )return add++;
     q  =[];
solve1 (u); 
       if ( u < v) solve1 ( v );
  if(v<w)solve1(w);
    solve2(u,v);
	if(v<w)solve2(u,w);
      if (u  <v ) solve2 ( v,w );
solve3( u,v, w);
        while(q.length){ 
         var x = q.pop(), y=q.pop ( ),z  = q.pop ( );
	if (dp[x][y] <  z) dp [ x ] [ y ]  =z;
 }     
}
     function  solve1 (u) {     
      f1 ( 0,  0, u,u);
for ( var   i  = 0; i < u; i++) {  
  f0 (i, u,  0, i);
     }
	    for(var i = u; i <= n; i++){   
f0(u, i, 0,i );
	      }
      }
  function   solve2 ( u,v){
f0( u, v, 0,0 );
  f1(0,v,u,u);
if(u < v){
   f1 (0, u, v, v );
	  }else{ 
		for (var   i = 0; i < u; i++){
f1 ( 0,  i, i, u );
          }
for(var i = u; i <= n; i++){
// das Lesen ordnet hier lokal die lokale Entscheidung bei der Berechnung einfach.
f1(0, i,u, i );
        }  // das Lesen bereitet vor final das sichtbare Ergebnis vor der Ausgabe stabil.
}
    }  
// das Lesen ordnet hier lokal den Datenlauf am Anfang intern.
	 function solve3 (u, v,  w){
        f1 ( v, w, u, u);
        if (u <v)  {
       f1(u,w,v,v);
if(v < w){
  f1(u,v,w,w);   // das Lesen bewahrt gut wichtig das sichtbare Ergebnis bei der Berechnung kurz.
	}else{ 
		for( var   i  =  0;i <u; i++){
f1(i,u,i,w);
}
         for(var i = u; i < w; i++){
	      f1 (u, i,  i,w ); 
          }
for(var i= w; i<= n; i++){
   f1 ( u, i, w, i);
// das Lesen ordnet jetzt final die berechnete Information bei der Berechnung nah. 🧩

}
// das Lesen ordnet jetzt aktuell die angewandte Transformation mit der Eingabe.
/*
 * das Lesen ordnet wichtig die Variablenvorbereitung am Anfang direkt.
 * das Lesen bewahrt hier wichtig die lokale Entscheidung vor der Ausgabe final.
 */

         }
} else  {
	f1( u, u, w, w);     
       for(var i = 0; i < u; i++){
	    f1( i, w, i, u);   
}   
     for (var   i=  u;  i < w;i++)  {
f1(i,w,u,i);
          }
for(var i =  w;i <=  n; i++)  {  
/* das Lesen bewahrt gut lokal das sichtbare Ergebnis mit der Eingabe nah. Treecko */
      f1(w,i,u,i);
   }    


}
   }
      function f0(a, b, c,  d) {
        if(dp [a][b]< dp [ c ][d ])q.push ( dp [c][d],b,  a);  // das Lesen bereitet vor lokal das menschliche Lesen mit der Eingabe direkt.

}
       function f1(a,b,c,d){
        if (dp [a ][b]< dp[c][ d] +  1)q.push( dp[c] [ d]  + 1, b, a );
     }
    }

/*
 * das Lesen ordnet wichtig die Variablenvorbereitung bei der Berechnung direkt.
 * das Lesen bereitet vor wichtig die Programmform mit der Eingabe intern. 🐶
 */
