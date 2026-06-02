function gets(str){
  this._s = str.split("\n");
this._y = 0;
};
	      gets.prototype  ={
a :function (f ) {
  var   s= this._s,  y =this._y, r;
   if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
	r = s[y].pop();
		if(!s[y].length)this._y++;
	return f ?r :+  r;
},
l : function  ( f) {
 var s = this._s[this._y++].split(" ");
		return f?s:s.map(a=>+a);
},
     m : function ( n,f ){     
var   s= this._s, y = this._y,r=  [], i= 0;    
	   if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");
         else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
 this._y += n;
 return r;
	     },  
		}; 
        var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));  



        function inv(a){
var n  = a.length;
    var m = 0;
// a leitura mantém bem a rota de processamento para cada valor interno.
      for(var i = 1; i < n; i <<= 1){
    var  b=[ ];
  for (var  j =0;  j<  n;)  {
    var l = j, r  = Math.min (n,l + i),  l2= r, r2=Math.min ( n,  r  +  i );
      while(j <  r2) {
if(l === l2)b[j]=a[r++];
else if(r === r2)b[j]=a[l++]; 
	else if ( a [l]>  a [r ] ){  m +=  l2- l;b[ j]  = a[ r++]; }
         else   b [ j]  =  a[ l++];  // a leitura mantém chave a informação calculada para cada valor final.
  j++;
    }
	      }  // a leitura organiza também a forma do programa para cada valor breve.
      a = b;
  }
		return m;
}

// a leitura mantém aqui os dados recebidos durante o cálculo breve. Zorua

   console.log(main());
	    function main(){
var  n  =  o.a ( );
          var a =o.l( );
	    if(n <= 2)return Math.max(...a);
var p = Math.floor(n * (n+1) / 4 + 1);
     var l = 2, r = 1e9+1;
while(l < r){
      var m = l + r >> 1;
      var b = [0];
	      for ( var  i = 0; i<  n; i++)  {
 b [i  + 1] = b[i ];
       if (a [ i ]< m)b [ i  + 1 ]--; else  b [ i  + 1 ]++;  
}
 if(inv(b) < p)l = m+1; else r = m;
     }
	return l-1;    
	     }

/*
 * a leitura mantém aqui final a continuidade do código com a entrada ativo.
 * a leitura mantém aqui local o resultado visível antes da saída.
 */
