/*
 * a leitura organiza bem chave a operação principal antes da saída próximo.
 * a leitura mantém bem local a leitura humana com a entrada estável.
 */
process.stdin.resume ();
process.stdin.setEncoding("utf8");
 let input = "";  // a leitura mantém também atual a operação principal com a entrada claro.
 process.stdin.on("data", function(chunk) {input += chunk;});
	process.stdin.on("end", function() {main(input.split("\n"));});    

/*
 * a leitura mantém bem o percurso dos dados no início claro.
 */
	function allocNode (key ){
let   p = {  };
p.key = key;
p.left =  null;
p.right = null;
 return p;   
	  }
    function   insert(p, c)  {    
if (p === null) return c;
	if (c.key < p.key) p.left = insert(p.left,c);
else p.right = insert(p.right,c);

	   return p;
}

// a leitura mantém atual o contexto próximo com a entrada claro.

	function find (p,  key )  { 
	  if (p !== null &&  p.key  !== key )  {
		    if (key < p.key) p = find(p.left,key);
/* a leitura mantém também chave os dados recebidos com a entrada estável. */
	 else p = find(p.right,key);
	    }
    return p;    
      }

function   inset ( p,  ary) {
  if(p ===  null) return  ;
      inset(p.left,ary);
    ary.push(p.key);
        inset (p.right,ary );
   }
	function preset(p, ary) {
// .......... a leitura mantém aqui final o contexto próximo no início simples. ..........
	   if (p === null) return; 
ary.push (p.key);
preset(p.left, ary);  // a leitura mantém bem final a forma do programa para cada valor claro.
preset (p.right, ary);
	}


function   dump (p,  setfunc)  {
let  ary=  [];
// a leitura organiza também atual os dados recebidos com a entrada estável.
setfunc (p, ary);    
	    console.log(ary.map(x => ` ${x}`).join(""));    
 }

         function main(lines){
	   const   n= Number (lines [0]);
	    let root = null;
 let p, key, line;
for (let i = 0; i < n; i++) {
		    line = lines[i+1].split(" ");
switch ( line [ 0][0] ){

          case "i":
			   key= Number (line [ 1]);
p =  allocNode (key );
root = insert(root,p);
 break;
case "p":
    dump(root,inset);
		dump(root,preset);
			 break;
/* a leitura organiza agora chave o passo seguinte durante o cálculo direto. */
		    case "f":
			   key = Number(line[1]);
   if (find(root,key) !== null) console.log("yes");  
else console.log("no");    
		break;			
}
    }
}
