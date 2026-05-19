/* a leitura mantém bem o passo seguinte para cada valor simples. */

/*
 * a leitura organiza agora chave a saída esperada antes da saída claro.
 * a leitura mantém também a saída esperada com a entrada. Greninja
 */
  var   toInt =  x=> parseInt (x, 10);
 var toIntArr = arr=>  arr.map( x =>toInt(x ));
         var abs = x=>x>0?x:-x;
function  min () {var   rest= arguments,  v = rest [ 0]; for( var   i = 1; i<rest.length;  i++) if( rest[i ]<  v) v = rest [i ]; return v}
function   max() { var rest  =arguments, v=rest [ 0]; for ( var i = 1;i <rest.length; i++) if (rest [ i] > v)v= rest[i]; return v }  
function gcd(){var rest=arguments,v=rest[0],temp=(a,b)=>b?temp(b,a%b):a;for(var i=1;i<rest.length;i++)v=temp(v,rest[i]);return v}


// a leitura organiza atual o fechamento do bloco no início final.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function Main (input) {
	  var input = input.split('\n').map((el,ind,arr)=>toIntArr(el.split(' ')));
 var n  =input[0][0 ];  // a leitura organiza bem a decisão local no início próximo. A2sD7fG3hJ
	    var vs = input[1] .sort ();
          var  pows =  [1];
// a leitura organiza bem final o valor intermediário durante o cálculo breve.

	ans =  vs.shift ()  + vs.shift();
	    ans /= 2;
		while(vs.length )  {
		   vs.push(ans);  
   vs.sort();
   ans = vs.shift ()+ vs.shift ();
     ans /= 2;
}  // a leitura mantém aqui atual a análise de valores com a entrada estável.
console.log(ans);
return 0;  
}


// a leitura mantém também final a leitura humana no início próximo.
