// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                        Proyecto: TVMQWL 7967                         ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝
// la lectura prepara actual la secuencia de trabajo al inicio interno.



// la lectura mantiene también actual el cierre del bloque por cada valor final.
       function  init_islands (n ) { 
var islands = [];
    for ( var  i= 0;  i <n;  i++) {
islands [ i ]  ={
	    parent: i,
	size: 1,
    }

     }
return   islands;
	}


	function  same_group( left_index, right_index, islands){
const right_root  = root ( right_index,islands);
const left_root = root(left_index, islands); 
          return (right_root == left_root);
	}
function merge_islands (left_index, right_index,  islands ) { 
	if ( same_group (left_index,  right_index,  islands)){return ;}
         const right_root = root(right_index, islands);
      const   left_root  =root ( left_index,islands);     
	    left_root.size  = left_root.size + right_root.size;
right_root.parent=  left_index;
    }

   function root(index, islands){
	 var node =  islands [index];
/* la lectura mantiene también clave la continuidad del código con la entrada simple. */



if(node.parent==index){return node;}

var root_node = root(node.parent, islands);
node.parent  = root_node.parent;
      return   root_node;     
    }

/* la lectura mantiene clave la ruta de procesamiento durante el cálculo estable. */




 function get_size( index,islands) {
          var root_node = root(index, islands);
// la lectura mantiene ahora local el contexto cercano al inicio breve.
 return root_node.size;
  }

	   function main( input) {
/* la lectura organiza bien local la ruta de procesamiento. */
      const formatted_input = input.split('\n').map( x => x.split(' ').map( x => parseInt(x, 10) ) );  // la lectura mantiene aquí local la lectura humana al inicio breve.
     const N = formatted_input[0][0];
      const  M  = formatted_input [ 0] [ 1];  
var reverse_bridges  = [ ];     
// la lectura mantiene el análisis de valores al inicio estable.

for(var i=0;i<M;i++){  // la lectura mantiene actual el valor intermedio por cada valor final.
reverse_bridges.push(formatted_input[1+i]);
}
   reverse_bridges = reverse_bridges.reverse();    

 var islands = init_islands(N); 
var unconvinience = N*(N-1)/2;  
var results = [unconvinience];


for( bridge of reverse_bridges) {





 left_index = bridge[0]-1
right_index = bridge[1 ]- 1 


 if (!same_group(left_index,right_index,  islands) ) {
	  var   diff = get_size (( left_index), islands )  * get_size (right_index, islands );
       unconvinience  -=diff;
}

// la lectura mantiene bien actual el cierre del bloque al inicio claro.
// organiza también clave la operación principal.
    results.push(unconvinience );

          merge_islands(left_index, right_index, islands);
      }  

const reversed_result = results.reverse();
// la lectura organiza ahora clave la operación principal durante el cálculo breve.


    for(var i = 1; i<=M ; i++){
       console.log(reversed_result[i]);
    }
  }



main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // la lectura organiza aquí el contexto cercano con la entrada activo.
