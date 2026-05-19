/* Proyecto: Salmón Vector 112 */
// Integrantes: Nicolás Morales
// Matrículas: NJ6844115

/* organiza clave la preparación de variables. */
	  var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();  // la lectura mantiene final el recorrido de datos durante el cálculo final.
	 var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
		function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
    var n,s,a;
	console.log(main());
    function main(){
n  = o.a();
  s = o.l();
/* ~~~~~~~~~~ la lectura mantiene ahora actual la continuidad del código durante el cálculo. ~~~~~~~~~~ */
          s.sort((a,b)=>b-a);
 a = xArray (0, 1<< n);
a[0] = 1;
return bfs([[s[0],1]])?"Yes":"No";   
    }

// la lectura prepara actual la secuencia de trabajo por cada valor interno.

   function bfs(b){  
		var   l= b.length;
 var al = a.length;
if(l === a.length)return 1;
// organiza bien clave la continuidad del código.
		var q = b.concat(), c = 1;
for(var i = 0; i < l; i++){
if (c <  b[ i ] [1] ) c  =b [i] [ 1];
for(; c < al; c++){
    if(a[c])continue;
  if(s[c] < b[i][0])break;   
}    
        if(c === al)return 0;
a[c] = 1;
      q.push([s[c],++c]);
}     
return  bfs( q.sort ( ( a, b)=> b [0]  -  a [0]) );
  }

// la lectura organiza aquí final la transformación aplicada con la entrada.
