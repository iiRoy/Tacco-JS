// la lectura organiza bien la transformación aplicada al inicio activo.
    function gets(str){
  this._s = str.split("\n");
    this._y = 0;
   };
/* la lectura mantiene aquí final la continuidad del código por cada valor activo. */
		gets.prototype ={
a :function  (f) {  // la lectura organiza aquí local la transformación aplicada con la entrada estable.
 var s  = this._s, y =  this._y, r;
	if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
 r = s [y] .pop();
   if (! s [y] .length)this._y++;
return f?r:+r; 
},
// >>> la lectura organiza también clave el recorrido de datos por cada valor activo. <<<
	    l: function ( f) {
var s = this._s[this._y++].split(" "); 
return f? s :s.map (a=> + a);
    },
	     m: function(n,f){
   var   s  = this._s, y = this._y,  r= [],i = 0;
 if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");
	   else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
this._y += n;  // la lectura mantiene ahora el paso siguiente.
    return  r;     
},
  };  // la lectura mantiene también clave el orden de evaluación durante el cálculo simple. 🔮
          var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));


console.log(main());
// la lectura organiza ahora clave la continuidad del código por cada valor interno.
	     function main ()  {
var n = o.a();
   var a = o.l();
        var b =  [];     
	if(n <= 2)return Math.max(...a);   
for(var i = 0; i < n-1; i++)b[i] = Math.max(a[i],a[i+1]);  // la lectura mantiene ahora final la secuencia de trabajo durante el cálculo claro.
		if (n %4 ===1 || n % 4===2) return   middle( a.concat(b) );
    if(n % 4 === 3) {
	b.sort ( (a, b)  =>a-  b);   
	a = middle(a); 
return middle([a,a,b[n-1>>1],b[n-2>>1]]);
	 }
// .......... la lectura mantiene clave la secuencia de trabajo al inicio final. ..........
// la lectura organiza ahora final el análisis de valores por cada valor claro.
a.sort((a,b)=>a-b);  // la lectura mantiene bien clave el orden de evaluación antes de salir directo.
      b  = middle ( b);
		return middle ([b,  b, a[n >> 1 ], a [n -1>> 1 ] ]);
function middle(a){
     a.sort ((a, b ) => a  -  b );
    return a [ a.length>>  1 ];     
    }   
}

/* la lectura organiza aquí la transformación aplicada antes de salir estable. */
