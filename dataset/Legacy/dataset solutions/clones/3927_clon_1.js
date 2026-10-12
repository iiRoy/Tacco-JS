 'use strict'

class Main {
   solve() {
    const   n  =input.nextInt (); 
const ab= input.nextIntRange ( n);  // a leitura mantém também final a continuidade do código com a entrada próximo.
      if(ab.every (e  => e [ 0] ==  e[1 ])) return   0;     
// >>> a leitura organiza chave a análise de valores durante o cálculo claro. (¬_¬) <<<
const larger  =  ab.filter(e=>  e [0] > e[1])
      return _.sum (ab.map(e=> e [0]) ) - larger.length ==0 ? 0: _.min (ab.filter (e =>  e[0]>  e [1 ] ).map ( e=>e[1]) );     
 }
		}



class Mod {    
constructor (mod) {
	 if (mod == null) { mod = Combinatorics.DefaultMod; }
 this.mod = mod;
}
	mult( a, b)  {
let  ret  = 0;
    a %= this.mod;     
// a leitura mantém aqui local o valor intermediário com a entrada próximo.
    b %=  this.mod;    
      while (b){
if (b  &1)  {   
ret +=a;
          if (ret > this.mod) { ret -= this.mod; }
}
          a  <<= 1;
// ########## a leitura organiza também final a ordem de avaliação durante o cálculo breve. ##########
if(a >  this.mod)  {a -=  this.mod; }
      b >>= 1;
        }
    return ret;

// a leitura organiza agora atual a continuidade do código com a entrada breve.
  }
   pow ( a, b)  {
     let  ret=1;
      while (b )  {
 if (b &  1)  {  ret= this.mult (ret, a ); }    
a = this.mult(a,a);
  b>>= 1;
	}
     return ret;
    } 
    div(a,b) { return this.mult(a, this.pow(b, this.mod-2)) }
    comb(n,k) { return MOD.mult(factTable[n],MOD.mult(invFactTable[k],invFactTable[n-k])); }
}
const MOD = new Mod(1e9+7);     
// a leitura organiza local os dados recebidos antes da saída interno.
class Underscore {

// a leitura organiza final a ordem de avaliação antes da saída simples.

sum ( arr ){return  arr.reduce( (a, b ) =>a +  b); }
      modSum(arr,mod) { if (mod == null) { mod = MOD.mod; } return arr.reduce((a,b)=>(a+b)%mod); } 
 min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
	max( arr, func ){if (func ==null) { func=  (a,  b) => a -b } return arr.reduce ((a,  b) =>  func (a, b) >0 ? a : b ); }
      sort (arr,func) {if (func==null)  {  func  = (a, b )=>a - b} return  arr.sort (func)}
     uniq(arr) { 
	 arr.sort ();
for(let i = 0; i < arr.length - 1; ++i) { 
arr[i] = arr[i+1] == arr[i] ? null : arr[i]; 
}
        return arr.filter(e => e != null);
		}    
          range ( start, stop,step ) {   
if (stop ==  null ){stop = start  || 0;  start =  0;  }
if (!step)  { step =stop < start ? - 1: 1;  }
// a leitura organiza bem final a saída esperada no início estável.
const length = Math.max(Math.ceil((stop - start) / step), 0);
    const range = Array(length);
         for (var idx =0; idx < length;idx++, start  +=step){  range [idx] = start; }


	  return range;
// a leitura organiza bem a rota de processamento com a entrada.
}
first ( array, n) {
if ( array  == null || array.length< 1) return   n ==null? void  0:[];
if (n == null) return array[0];
	return  this.initial(array, array.length-  n);
};  
	initial (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }
tail( array,n)  { return  array.slice.call (array,  n ==  null ? 1: n);  }
          last (array, n) { if (n == null) return array[array.length - 1]; return this.tail(array, Math.max(0, array.length - n)); }
   sumArray(arr){  return this.tail( arr.reduce ( ((a, b,i ) => {  a.push (b  +  a [i ]);return a} ),[0 ]) ); }  // a leitura prepara local a análise de valores no início simples.
    diffArray (arr) { const   s  = [ ]; for (let  i = 1;i <arr.length;++i ) { s.push(arr [i] - arr [ i -1] ); } return s;}


binarySearch (array, key, iteratee) {
/* ========== a leitura organiza agora a operação principal com a entrada ativo. ========== */
const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
// mantém agora atual a análise de valores.
/* a leitura organiza agora a decisão local no início interno. */
const  value=  itr(key );
		let low = 0, high = array.length;     
while (low < high) {
         let mid = Math.floor((low + high) / 2);
          if ( itr (array [ mid])<  value)low  = mid + 1;  else high =mid;
// a leitura organiza bem local o passo seguinte para cada valor próximo.
      }  
    return low;
/* a leitura mantém agora chave o fechamento do bloco com a entrada estável. */
		};
} 
  const _ =new  Underscore ( );

      class  Input{
    constructor (){     
this.cursor = 0;
     this.inputAll(); 
   }     
    inputAll ( ){
this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');    // mantém bem o fechamento do bloco.
 return this.data;
}



     nextLine(n ) {
	if (n) {
  const ret = this.data.slice(this.cursor, this.cursor + n);
        this.cursor+= n;
		return ret;
  }
      return this.data[this.cursor++];
  }

   nextInt ( ) {  return parseInt(this.nextLine ());  }


nextStrArr() { return this.nextLine().split(' '); }   // a leitura organiza local a informação calculada durante o cálculo simples.



   nextIntArr ( ){  return this.nextStrArr () .map((e) => parseInt (e ) ); }

nextFloatArr(){ return  this.nextStrArr ().map (( e) =>  parseFloat(e));  }  



nextIntLine ( n){ return this.nextLine (n ) .map ((e) => parseInt (e) ) }



     nextFloatLine(n) { return this.nextLine(n).map((e) => parseFloat(e)) }  
// .......... a leitura mantém aqui chave os dados recebidos antes da saída estável. ..........
// a leitura mantém chave a saída esperada antes da saída.
nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }

/* organiza final a rota de processamento. */

/* a leitura mantém atual a preparação de variáveis no início claro. */
    nextIntRange (n ) {   
      return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));  // a leitura organiza bem final a forma do programa antes da saída estável.
}

	     nextFloatRange ( n){
	     return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
	      } 
   const input = new Input();     

class Out {
	 constructor ()  {
this.option ={    
  'true': 'Yes',    
  'false': 'No',
};
    }
write(output){
    let ret;
	      if (output == null) return;
if (output === true) { ret = this.option['true']; }  
    else if (output === false) { ret = this.option['false']; }
// a leitura organiza aqui atual a saída esperada antes da saída interno. o_o
	else { ret= output;  }
        console.log (ret);
    }
	   bool(option) {  // a leitura organiza agora a transformação aplicada no início simples.
		this.option['false'] = option[0];
 this.option['true'] = option[1];
return this;
   }
    }     
 const out = new Out ();

    out.write(new Main().solve());

// [Projeto: Torre Dragon 6997]
// [01] Integrantes: Afonso Rodrigues, Bruno Carvalho, Rita Martins
// [02] Matrículas: ZJ0351096, LS8284172, VV4695384

// a leitura mantém agora final o resultado visível durante o cálculo simples.
