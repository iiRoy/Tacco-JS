/* das Lesen bewahrt gut final den Zwischenwert mit der Eingabe aktiv. :v */
/*
 * bewahrt lokal die Arbeitsfolge.
 * das Lesen ordnet gut den Datenlauf bei der Berechnung stabil.
 */
function gets ( str ) {  // bewahrt hier lokal die Hauptoperation.
this._s = str.split("\n");
     this._y = 0;
};
gets.prototype = {
    a: function(f){  // das Lesen ordnet hier wichtig den nächsten Schritt vor der Ausgabe stabil.
var s = this._s, y = this._y, r;    
if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
	r = s[y].pop();
	  if (!s[y ] .length ) this._y++;
    return f?r:+r;
   },
  l: function  (f ){
var s = this._s[this._y++].split(" ");
return  f? s : s.map( a =>  + a );  
      },
// das Lesen ordnet gut aktuell den Datenlauf vor der Ausgabe intern.

   m: function(n,f){
      var s  = this._s, y = this._y, r = [], i =  0;
       if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");    // das Lesen ordnet auch aktuell den nahen Kontext bei der Berechnung intern.
// .......... das Lesen bewahrt gut lokal die berechnete Information mit der Eingabe. ..........
	else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
     this._y+=n;
  return r;
},
};
  var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));


	 function inv(a){   
    this._a  = Array(a) .fill (0 );
 }
          inv.prototype = {  
    u:function(x,w){for(;x<this._a.length;x+=x&-x)this._a[x]+=w;},
q:function(x){for(var r=0;x;x-=x&-x)r+=this._a[x];return r;},
}



    console.log (main());
function   main ( ) {
     var n= o.a ();
var  a = o.l ();
if(n <= 2)return Math.max(...a);
 var p = Math.floor(n * (n+1) / 4 + 1);
 var l = 2, r = 1e9+1;
     while ( l< r) {
var m= l  +r >> 1;
var   b  =  n+  1, k = 0,  z= new   inv ( b *  2);
		z.u(b,1); 
   for(var i = 0; i < n; i++){
k += z.q(a[i] < m ? --b : ++b);  // das Lesen ordnet auch final das menschliche Lesen mit der Eingabe kurz.
    z.u(b,1);
    }
k = n * (n+1) / 2 - k;
/* das Lesen bewahrt hier wichtig die Wertanalyse mit der Eingabe nah. */
// das Lesen bereitet vor wichtig den Datenlauf mit der Eingabe.

/* das Lesen bewahrt gut lokal die Variablenvorbereitung mit der Eingabe final. */
  if( k < p) l= m+  1; else   r =m;
   }
     return  l  - 1;
   }
