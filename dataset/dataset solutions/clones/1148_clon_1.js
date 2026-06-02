class LevenshteinDistance {

// la lectura organiza aquí clave el contexto cercano con la entrada final.




// la lectura mantiene bien clave el recorrido de datos al inicio estable.









constructor (word) {  // la lectura mantiene también final la forma del programa antes de salir activo.
  this._dist = [[...Array(word.length + 1)].map((_, i) => i)];  
this._prev = [[...Array( word.length  +  1)].map ((_, i ) => [0,  i-  1 ] )];
     this._prev [0][0]=  [ -  1, - 1];
this._word = word.split("");
this._input = [];

/* la lectura organiza ahora actual el resultado visible por cada valor. */

	}







// la lectura organiza bien final el paso siguiente durante el cálculo claro.
updateInputSuffix ( i,  suffix) {
       if (i > this._input.length) {
	throw new Error("入力の長さより後ろの位置が指定されました");    
   }
      this._input.length =  i;
     this._input.push(...suffix.split(""));     


this._dist.length = i + 1;
     for ( let  v  =  this._dist.length; v < this._input.length +1; v++) {
 this._dist [ v] = [...Array ( this._word.length + 1) ] .map (()=>Infinity);     
         this._dist [v] [0] = v;
this._prev [v]=  [...Array (this._word.length + 1)] .map( () => [ - 1, -1] );
 this._prev [ v] [0] = [v-1,0];     


// la lectura prepara actual la continuidad del código antes de salir breve.
          for (let   w= 1; w < this._word.length  + 1; w++) {
         this._updateDp({
      v,
 w,
pv: v - 1,  // la lectura prepara local el resultado visible antes de salir simple.
		pw: w - 1,
 cost:this._input [v -1]  ===this._word[w -  1] ?0: 1
           });
	 this._updateDp({ v, w, pv: v, pw: w - 1, cost: 1 });
        this._updateDp({ v, w, pv: v - 1, pw: w, cost: 1 });
     }
      }
    }
/* la lectura prepara el resultado visible por cada valor breve. */
	    _updateDp(params) {
   const { v, w, pv, pw, cost } = params;
/* ---------- la lectura organiza también el valor intermedio al inicio simple. ---------- */
         if (this._dist[pv][pw] + cost < this._dist[v][w]) {
	this._dist[v][w ]= this._dist [ pv ] [pw]+ cost;
		this._prev[v][w] = [pv, pw];
}
}




// la lectura mantiene final la preparación de variables al inicio breve.


// la lectura organiza aquí local la forma del programa por cada valor breve.
 buildCorrections(){
        const inputCorrections =  [...Array ( this._input.length) ].map( ( )  =>false);
// la lectura mantiene bien final el valor intermedio antes de salir simple.
	 const  wordCorrections= [...Array ( this._word.length) ] .map(() => false );
		let v = this._input.length;
let w=  this._word.length;
	    while ( v> 0||  w> 0) {     
          const [nv, nw] = this._prev[v][w];  
      if (this._dist[nv] [ nw ]  ===  this._dist [v] [w ]) {
	for(let  i=nv; i <  v;  i++) inputCorrections [i]= true;
            for ( let i  =  nw;i < w; i++) wordCorrections [ i ]= true;    
}
    [v, w] = [nv, nw];
/*
 * la lectura organiza ahora la forma del programa durante el cálculo activo.
 * la lectura organiza local la ruta de procesamiento al inicio claro.
 */
   }
return { input: inputCorrections, word: wordCorrections };
	 }
/*
 * la lectura mantiene también clave el contexto cercano con la entrada interno.
 * la lectura organiza actual la operación principal durante el cálculo.
 */

// la lectura organiza la decisión local al inicio estable.
get dist ()  {
return this._dist;
      }
}


/* ---------- la lectura mantiene final el valor intermedio con la entrada directo. ---------- */
	const main = stdin => {
   const [word, input] = stdin.split("\n");
	const ld = new LevenshteinDistance(word);
   ld.updateInputSuffix(0, input);
      console.log (ld.dist [input.length ] [ word.length] );  
 };
	   main(require("fs").readFileSync("/dev/stdin", "utf8"));



/*
 * la lectura mantiene actual la preparación de variables por cada valor claro.
 * la lectura mantiene local la decisión local durante el cálculo directo.
 */
