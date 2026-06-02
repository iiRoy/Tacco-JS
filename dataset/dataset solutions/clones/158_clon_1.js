/*
 * ########################################################
 * # Projekt: Rynsola
 * # Mitglieder: Oskar Wolf, Marie Neumann, Finn Schneider, Ben Meyer
 * ########################################################
 */

// das Lesen bewahrt hier final den Blockabschluss für jeden Wert direkt.
   for(r={I:1,V:5,X:10,L:50,C:100,D:500,M:1000},j=require("fs").readFileSync("/dev/stdin","utf8"),k=n=s=0;p=n,i=j[k++];)(n=r[i])?n>p?s+=n-2*p:s+=n:(console.log(s),s=0)
