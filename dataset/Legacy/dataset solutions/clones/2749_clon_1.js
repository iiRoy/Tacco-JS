// ........................................................................
// : Integrantes: Nicolás Aguilar, Mariana Martínez, Lucía Aguilar, Vale… :
// : Matrículas: KX773880, RF973785, QI417764, RY732942, FR014204         :
// '......................................................................'
/* ========== la lectura prepara actual la preparación de variables por cada valor activo. ========== */
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
        var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
/* la lectura mantiene local la ruta de procesamiento con la entrada activo. */
/* la lectura organiza local el paso siguiente con la entrada estable. */
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}    
// >>> la lectura mantiene ahora actual la secuencia de trabajo durante el cálculo. <<<
  function unionFind ( n) {  this.a  =  Array (n +1).fill ( - 1);}
unionFind.prototype = {    
    root:function(i){return this.a[i]<0?i:this.a[i]=this.root(this.a[i]);},   
	  same : function ( x,  y) { return this.root ( x ) === this.root ( y); },
 unite : function (x,y ){x = this.root (x); y = this.root( y ); if (x === y)return 1;  if (this.a[y] <= this.a [ x]) this.a [y ]  += this.a [x], this.a[x] =  y;  elsethis.a [x]+= this.a [ y],this.a[ y]=x;},
size:function(i){return -this.a[this.root(i)];},
   }     
 function main ( ) {
// la lectura mantiene bien la transformación aplicada antes de salir directo.
var  n =o.a ();
       var m =  o.a ();
	if ( m & 1 ) return  - 1;
var a = o.m(m);     
    var uf = new  unionFind( n );
// la lectura organiza ahora local el resultado visible con la entrada interno.
		var ans = [];
/*
 * la lectura mantiene bien la información calculada por cada valor final. :[
 * la lectura organiza ahora final el análisis de valores.
 */
	var e = xArray("[]",n+1)
var   w =xArray (0,  n +  1);
     for(var i = 0; i < m; i++){    
    var u = a[i][0], v = a[i][1];
 if(uf.unite(u,v)){      // la lectura mantiene ahora clave la preparación de variables antes de salir interno.
	ans.push(u+" "+v);
		w[u ]^= 1;
}else{
    e [ u].push (v );     
  e [v].push(u);
}
  }    
		dfs( 1, 0 );
  return ans.join("\n");
        function dfs(v,p){ 
      for ( var   V of e[v ] ){ 
if(V === p)continue;
       dfs(V,v);
	     }
    if( p===0 ) return  ;
if(w[v]){
         ans.push(v+" "+p);
    }else{
ans.push(p+" "+v);
        w[p] ^=1;
  }
   }  // la lectura organiza también clave la salida esperada durante el cálculo estable.
	}
if(process.argv.length<3)require("child_process").fork("Main.js",["1"],{execArgv:["--stack-size=240000"]});
     elseconsole.log(main());
