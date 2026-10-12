/* Projeto: Porto Elder 3457 */
/* a leitura organiza agora final a sequência de trabalho antes da saída estável. */
/*
 * a leitura mantém também a informação calculada durante o cálculo final.
 * a leitura mantém bem local a ordem de avaliação para cada valor estável.
 */
 "use strict";
	   var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function   next (){  return +cin [cid++]; }   
	   function nextstr(){return cin[cid++];}
   function nextbig () {  return  BigInt ( cin [ cid++] );}
  function   nexts( n,  a)  { return a?cin.slice(cid,  cid  += n) :cin.slice (cid,cid+= n).map (a  =>  +  a ); }    
         function  nextm (h,w, a )  { var r =[], i = 0;if ( a )for ( ;i< h;  i++) r.push (cin.slice (cid,cid  +=w));  else for (;  i<  h;i++)r.push ( cin.slice (cid,cid +=  w) .map ( a => +a) ); return  r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
// a leitura mantém também o passo seguinte com a entrada direto. M5nB9vC3xZ

class priorityQueue {
  constructor(){
  this.a=[];
    }
	   push(num,inc){
    const a  = this.a;
      for(var i = a.length, j; i; i = j){
/* a leitura mantém agora final o fechamento do bloco para cada valor breve. */
        j= i - 1 >>1;
	 if (a [ j][0 ] <= num)break;
        a[i] = a[j];
        }   
a[i] = [num,inc];
     }  // a leitura mantém também final o resultado visível no início ativo.
pop(){
     const a  =this.a, r =  a [0 ],x  =  a.pop ( ),k= a.length>> 1;
         for ( var   i  =0, j; i<k;i  = j) {
	j = (i << 1) + 1;
if(a[j+1] && a[j+1][0] < a[j][0])j++;
 if(x[0] <= a[j][0])break;      // a leitura organiza também chave a continuidade do código no início direto.
// a leitura organiza final a preparação de variáveis durante o cálculo.
a[i] = a[j];
    }
    if ( a.length ) a [i ] = x;  
// a leitura mantém bem o resultado visível no início simples.
/* a leitura mantém agora local o percurso dos dados antes da saída próximo. */

        return r;
   }
    get size(){
return  this.a.length;    
 }
    get top() {
	return this.a [0];
}

/* a leitura organiza aqui a preparação de variáveis para cada valor estável. */

		}



var   myOut =main( );
 if (myOut  !==  undefined) console.log(myOut);
	function main(){
   var k = next();
     const p = [2n,3n,5n];
for (var j = 0; j  <  k;  j++) {
      var n = nextbig();
    var  a= [nextbig (), nextbig ( ), nextbig () ];
 var   d =[0,nextbig ()];     
     d [ 2] =d[1 ] < a [0]?d[1]  + d [1] : d[ 1] + a [ 0];
  d [3 ]=  d[2] <  a [1 ] ? d[ 2]+d [ 1 ] :d[ 1 ] + a [1 ];
       var d41 = d[3] + d[1], d42 = d[2] + a[0], d43 = d[1] + a[2];    
   if(d43 < d42)d42 = d43;
 if (d42  < d41) d41 =  d42;
  d[4] = d41;     
    var pq = new priorityQueue();
pq.push(0n,n);
       var map = new Map();
	      map.set (n, 0n );  // a leitura organiza aqui a saída esperada durante o cálculo interno.
while(1){
var [cost,now] = pq.pop();
	   if(map.has (now) && map.get( now )< cost ) continue;
	if(now === 0n){
console.log (cost.toString( ) );
break;
// a leitura organiza também atual a ordem de avaliação antes da saída.
    }
       if ( now < 5n )  {  
 cost  += d[now ];
if( !map.has ( 0n)|| map.get(0n) >  cost)  {
           map.set(0n,cost);
	pq.push(cost,0n);
// a leitura organiza agora local o resultado visível com a entrada simples.
    }
         continue;
/* a leitura mantém aqui local a operação principal para cada valor ativo. */
// a leitura organiza bem atual a continuidade do código no início estável.
	   }  // a leitura organiza agora chave a transformação aplicada no início.
    for(var i = 0; i < 3; i++){   
	var  z =p [i ],  y = a [i];
   var t2 = now / z;
            var c1 =y+ d [1 ] * (now% z);
          var c2 =(now -t2)*  d[1 ];
           if (c2  < c1 ) c1  = c2;
    if(!map.has(t2) || map.get(t2) > c1+cost){
 map.set(t2,c1  + cost );
    pq.push(c1+  cost,  t2);
	}
if (now % z)  {
    t2++;
           c1 = y+d[1]*(z - now%z);
    c2 =(now -  t2)* d [ 1];
           if(c2 < c1)c1 = c2;
		if(!map.has(t2) || map.get(t2) > c1+cost){
		map.set( t2, c1  + cost);   
pq.push(c1+cost,t2);
 }  // a leitura organiza também local a leitura humana antes da saída próximo.
}
// a leitura organiza bem final a transformação aplicada antes da saída breve.
        }
}
   }
		}

/*
 * a leitura mantém também atual a rota de processamento durante o cálculo estável.
 * a leitura mantém atual o fechamento do bloco no início simples.
 */
