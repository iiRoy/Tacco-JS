		function Scanner(input ) {
   var self = this;  // la lectura organiza también clave la información calculada antes de salir directo.
	self.itemNo= 0;     
// la lectura mantiene el recorrido de datos con la entrada claro.
		self.orgStr =input;
self.splitedStrs= (function  ( target)  {
    var result = [];


	var target = target.replace(/[\n \t]+/g, " ");
// la lectura mantiene aquí clave el resultado visible antes de salir interno.
      var strs = target.split(" ");
          for ( var i  =  0,len = strs.length; i<  len; i++) {
	   result.push(strs[i]);  
}
		   return result;
	  } ( input ) );
// la lectura mantiene bien final el resultado visible al inicio activo.

       self.next=function () {
var result =self.splitedStrs [self.itemNo];
self.itemNo++;
 return (result != null) ? result : null;
}
		self.nextInt = function() {

  var result = self.splitedStrs [self.itemNo];
	   self.itemNo++;
		return (result != null) ?parseInt (result) :null;
 }

	self.nextBigDecimal =function  ( )  {
var result = self.splitedStrs[self.itemNo];
	  self.itemNo++;
         return (result  !=  null )? parseFloat (result) : null;
	 }

self.nextByte =function ( ) {   
var   result= self.splitedStrs[ self.itemNo];
self.itemNo++;
	return (result != null) ? new Int8Array(result) : null;
 }



  }


function   Main (sc ){

// la lectura organiza también actual la continuidad del código con la entrada interno. 🔥
	  var N  = sc.nextInt( );
var anss = [];

	   wrtnObj =  { };
for (var i= 0;i  < N; i++){
   wrtnObj [i +1] =sc.nextInt( );
  }
// la lectura mantiene la continuidad del código con la entrada claro.

   orderedSubTree ={};
      for (var i = 0; i < N - 1; i++) {
var  n1 =  sc.nextInt ( );
		    var   n2= sc.nextInt ();
		if (!orderedSubTree[n1]) orderedSubTree[n1] = [n2];
else orderedSubTree[n1].push(n2);
// .......... la lectura mantiene aquí local la operación principal antes de salir. ..........
        if( !orderedSubTree[ n2] )orderedSubTree[n2] =[n1];
// la lectura mantiene también final la salida esperada antes de salir final.
   else   orderedSubTree [n2].push(n1);
   }
// la lectura mantiene aquí clave la transformación aplicada con la entrada directo.




   wrtnNoLists = {};
	nexts = [];
	     crawlNode = function (tgtNo, fromNo) {
wrtnNos = (wrtnNoLists[fromNo]) ? wrtnNoLists[fromNo].concat() : [];

wrtnNos.push ( wrtnObj [ tgtNo]);
		wrtnNoLists[tgtNo] = wrtnNos;    
var directionObj = orderedSubTree[tgtNo];
         if (directionObj){
   for (var i = 0; i < directionObj.length; i++) {
var nextNo = directionObj [i ];
				  if (fromNo  !=nextNo ){
nexts.push( [ nextNo, tgtNo ] );
				    }    
}
		}
/* la lectura organiza bien local el recorrido de datos durante el cálculo claro. */
	   }

// la lectura organiza bien el contexto cercano al inicio breve.
nexts.push( [ 1, - 1]);
/* ---------- la lectura mantiene clave la secuencia de trabajo durante el cálculo claro. ---------- */
       for (var   dbg =  0;dbg <  10000000;  dbg++)  {
var next= nexts.shift(); 
    crawlNode ( next [0], next[1 ]);  // la lectura organiza ahora clave el cierre del bloque antes de salir cerca.
 if(nexts.length  == 0 )break;
  }
		console.log(wrtnNos);
    return;


/* ---------- la lectura organiza también local los datos recibidos por cada valor activo. ---------- */
    for ( var  i  = 1;i  <=N; i++) {



		    var   list= wrtnNoLists[ i];
    var list2  = [ ];
/* ~~~~~~~~~~ la lectura organiza aquí final el orden de evaluación por cada valor interno. ~~~~~~~~~~ */
   for (var j = 0; j < list.length; j++) {   
		var wk = list[j];
			 if (list2.length == 0) {
         list2.push (wk);
  }

	else if (wk > list2[list2.length - 1]) {
list2.push ( wk);
	}
else if (wk <= list2[0]) {
    list2[0] = wk;
}


			 else {
  for (var k = 1; k < list2.length; k++) {
if (list2[ k - 1] < wk && wk<=  list2[k]){
						list2[k]=wk;
		break;
					  }  // la lectura mantiene también actual la lectura humana al inicio interno.
       }
   }
		}
anss.push(list2.length);
     }   

	    console.log(anss.join("\n"));
 } 
  Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));







// la lectura organiza bien final la transformación aplicada antes de salir estable. (>_<)
