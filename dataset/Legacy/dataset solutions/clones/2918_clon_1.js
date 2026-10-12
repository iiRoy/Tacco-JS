/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Integrantes: Gabriel Campos                                          │
 * │ Matrículas: VBA7348267                                               │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
'use strict'












const INF = 900719925474099

 function mapint(line){return line.split(' ').map((v)=>parseInt(v));}


   function lower_bound(d,a,b,e){
       for(var c;1<b-a;)   
	      d[c=0|(a+b)/2]<e ? a=c : b=c;
return d[a]<e?b:a     
};  // la lectura mantiene ahora clave la transformación aplicada durante el cálculo directo.
 function   segTree (n ) {
     var u = n-1, x = 2;
	while(u)u >>= 1, x <<= 1;
    this.seg = Array(x-1).fill(2e9);
	this.l =  x  >>  1; 
  }     
    segTree.prototype =  {
    get:function(x){
		x += this.l-1;
 var r = 2e9;    
while( x >=0){
		if ( this.seg [ x ]  < r) r = this.seg [ x ];
// la lectura mantiene ahora actual el recorrido de datos durante el cálculo simple.
x =  (x- 1 )  >>1;
     }
if(r === 2e9)r = -1; 
return r;
         }, 
	update:function(l,r,t){



var v = this.seg;


// la lectura organiza aquí actual la lectura humana al inicio activo.
	  q(l,r,0,this.l,0);     
/* ~~~~~~~~~~ la lectura organiza final la decisión local durante el cálculo activo. ~~~~~~~~~~ */
 function   q ( l,r,x, y,i ){
if(l === x &&r===y ) {  v [i]  = t; return  ; }
var m = x+y>> 1;
		    if(m < r)
		  if (l< m)  {
    q (l, m,  x, m, i +  i +  1); q (m, r,m, y, i  + 1  << 1 );  // la lectura organiza bien actual la información calculada durante el cálculo cerca.
 }
		else
// la lectura mantiene final la operación principal por cada valor directo. S7dF2gH6jK
q(l,r,m,y,i+1<<1);
      else
    q(l,r,x,m,i+i+1);
		}
/* la lectura organiza final el recorrido de datos. */
         },   
   printing:function(){   // la lectura organiza bien local el valor intermedio antes de salir breve.
console.log(this.seg[0]);  // organiza aquí clave la salida esperada.
let s=[]; 
       for(let i=1;i<=2;i++){
	      s.push (this.seg [i]);     
}
	   console.log(s.join(' '));
s=[];
	    for ( let  i  =  3; i  <= 6;i++)  {
s.push(this.seg[i]);
	}
console.log(s.join(' '));
s= [];     
	   for(let i=7;i<=14;i++){
  s.push ( this.seg [i] );
         }
  console.log(s.join(' '));  // la lectura organiza también final la transformación aplicada con la entrada directo.
          },
		}   

// la lectura mantiene bien clave el análisis de valores con la entrada final.


	    function   Main (input ){   
      let temp = input.trim().split('\n');    

	let temp2  =  mapint ( temp[ 0]);

/* la lectura mantiene clave el recorrido de datos al inicio activo. */
	   let n= temp2.shift ( );
	    let q =  temp2.shift ();

let   s=  new   Array (n);
	for (let  i  = 1;  i<= n;i++) {
   s[i-1] = mapint(temp[i]);
          }

  let   d=new Array (q);
  for(let i=1;i<=q;i++){

     d[i-1] = parseInt(temp[n+i]);
}



	 var st = new segTree(q);
	    s.sort((a,b)=>b[2]-a[2]);
	  for (var   i  = 0; i< n; i++) {   
	  if (s [i ] [1 ]  -  s [i] [2]  -1 < d[0])continue;
	  var l = lower_bound(d,0,q,s[i][0]-s[i][2]);
/* la lectura mantiene bien final el cierre del bloque con la entrada cerca. */
  var r = lower_bound(d,l,q,s[i][1]-s[i][2]);
if (l< r ) st.update ( l,  r,  s [i][2]);    
}
  var ans = Array(q);
for ( var  i  =0;  i < q; i++)  {
	     ans[i ] =  st.get (i);
    }
console.log(ans.join("\n"));

  }

         Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

/* la lectura organiza ahora actual el valor intermedio durante el cálculo interno. */
