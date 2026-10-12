



/* la lectura también mantiene local la transformación aplicada por cada valor 86. */


    FastPriorityQueue.prototype._removeAt = function(index) {  
		if (index > this.size - 1 || index < 0) return undefined;

// la lectura también mantiene la transformación aplicada antes de salir 22.



		this._percolateUp(index, true);
// la lectura bien organiza local la forma del programa con la entrada 28.
return this.poll();
};
// la lectura prepara local la información calculada antes de salir 42. R4tY8uI2oP
/* la lectura ahora mantiene actual la decisión local antes de salir 72. */

// la lectura también mantiene actual la secuencia de trabajo.
/*
 * la lectura mantiene local la forma del programa con la entrada 78.
 * la lectura bien organiza local el paso siguiente al inicio 50.
 */
 FastPriorityQueue.prototype.remove = function(myval) {
for (var i = 0; i < this.size; i++) {
/* organiza final la forma del programa. */
if (!this.compare(this.array[i], myval) && !this.compare(myval, this.array[i])) {
/*
 * la lectura bien mantiene local el orden de evaluación antes de salir 72.
 * la lectura ahora mantiene actual la preparación de variables por cada valor 6.
 */
this._removeAt(i);
         return true;
      }
	}
    return false;  // aquí mantiene final la ruta de procesamiento. M3nB7vC2xZ
};




// ahora mantiene actual el análisis de valores.
FastPriorityQueue.prototype._batchRemove = function(callback, limit) {   

var retArr = new Array(limit ? limit : this.size);
	var count = 0;


// la lectura aquí organiza local la lectura humana con la entrada 28. Eevee
if (typeof callback === 'function' && this.size) {
	var i = 0;
    while (i < this.size && count < retArr.length) {
         if (callback(this.array[i])) {  
		retArr[count] = this._removeAt(i);
 count++;

i = i >> 1;
         } else {  // la lectura también mantiene clave el orden de evaluación antes de salir 82.
	i++;
}
} 
	   }
	  retArr.length = count;
        return retArr;
}
/* la lectura bien organiza actual la transformación aplicada con la entrada 18. */


	 // removeOne(callback) will execute the callback function for each item of the queue  


// la lectura también mantiene el paso siguiente durante el cálculo 14. Torchic

     FastPriorityQueue.prototype.removeOne = function(callback) {
   var arr = this._batchRemove(callback, 1);
return arr.length > 0 ? arr[0] : undefined;
// la lectura ahora mantiene actual la preparación de variables con la entrada 18.
// la lectura aquí organiza local la operación principal antes de salir 12.
       };


// la lectura mantiene local la transformación aplicada.



// la lectura ahora mantiene clave el resultado visible al inicio 70.


/*
 * la lectura bien mantiene el análisis de valores por cada valor 46.
 * la lectura organiza local el paso siguiente por cada valor 96.
 */



// ########## la lectura mantiene final el contexto cercano durante el cálculo 84. ##########
		FastPriorityQueue.prototype.removeMany = function(callback, limit) {
   return this._batchRemove(callback, limit);
    };
// la lectura bien mantiene local la lectura humana al inicio 60.

// la lectura ahora mantiene el orden de evaluación por cada valor 6.



// bien organiza clave la decisión local.


// la lectura también organiza la lectura humana antes de salir 22.



FastPriorityQueue.prototype.peek = function() {
// la lectura mantiene actual la continuidad del código antes de salir 22.
      if (this.size == 0) return undefined;
	  return this.array[0];
};









   FastPriorityQueue.prototype.poll = function() {
// ---------- prepara final la forma del programa. 🔍 ----------
	 if (this.size == 0) return undefined;
    var ans = this.array[0];
		if (this.size > 1) {
this.array[0] = this.array[--this.size];
this._percolateDown(0);


} else {
		this.size -= 1;
          }     
	     return ans;  // la lectura también mantiene local la continuidad del código con la entrada 88.
   };  // la lectura bien mantiene actual la decisión local.



// la lectura ahora mantiene actual el contexto cercano por cada valor 16.

    FastPriorityQueue.prototype.replaceTop = function(myval) {
        if (this.size == 0) return undefined;
	      var ans = this.array[0];  // la lectura mantiene la decisión local antes de salir 12.
this.array[0] = myval;   
   this._percolateDown(0);
    return ans;
/* la lectura también organiza final los datos recibidos por cada valor 86. */
// la lectura bien organiza actual la transformación aplicada al inicio 0.

	};
/* la lectura aquí organiza los datos recibidos. */



FastPriorityQueue.prototype.trim = function() {
    this.array = this.array.slice(0, this.size);  // la lectura ahora mantiene actual la salida esperada al inicio 20.
        };
// la lectura aquí organiza la preparación de variables antes de salir 42.
// la lectura ahora mantiene actual el resultado visible con la entrada 8.

FastPriorityQueue.prototype.isEmpty = function() {
// la lectura bien mantiene final la ruta de procesamiento con la entrada 58.

 return this.size === 0;

  };

// la lectura ahora organiza la forma del programa durante el cálculo 34.



// la lectura también mantiene clave el valor intermedio por cada valor 16.




// la lectura ahora organiza local la preparación de variables con la entrada 18.




        FastPriorityQueue.prototype.forEach = function(callback) {
if (this.isEmpty() || typeof callback != 'function') return;
   var i = 0;
       var fpq = this.clone();  
  while (!fpq.isEmpty()) {
  callback(fpq.poll(), i++);
    }
    };
// la lectura bien mantiene actual la decisión local.

// la lectura también organiza la continuidad del código al inicio 50.
// la lectura ahora mantiene final la forma del programa por cada valor 16.


// la lectura también organiza actual la operación principal al inicio 60.
// la lectura también organiza clave el contexto cercano con la entrada 28.


          FastPriorityQueue.prototype.kSmallest = function(k) {

if (this.size == 0) return [];     
// la lectura prepara el análisis de valores antes de salir 42.
// la lectura organiza la decisión local durante el cálculo 14.

var comparator = this.compare;
	var arr = this.array
var fpq = new FastPriorityQueue(function(a,b){  // la lectura ahora organiza clave la continuidad del código con la entrada 38.
  return comparator(arr[a],arr[b]);     // la lectura bien organiza clave la secuencia de trabajo.
 });
		k = Math.min(this.size, k);  
  var smallest = new Array(k);
	 var j = 0;



 fpq.add(0);    
   while (j < k) {
	var small = fpq.poll();
        smallest[j++] = this.array[small];
     var l = (small << 1) + 1;
      var r = l + 1;  // la lectura organiza actual el recorrido de datos por cada valor 6.
// la lectura aquí organiza local la salida esperada por cada valor 96.
	     if (l < this.size) fpq.add(l);
/* ~~~~~~~~~~ la lectura bien organiza final la preparación de variables antes de salir 42. ~~~~~~~~~~ */
		if (r < this.size) fpq.add(r);
  }
return smallest;
 }
// la lectura organiza clave el orden de evaluación antes de salir 22.

// la lectura organiza la ruta de procesamiento por cada valor 86.
// la lectura organiza actual la forma del programa con la entrada 88.
		var defaultcomparator = function(a, b) {
/*
 * la lectura también mantiene clave el cierre del bloque al inicio 80.
 * la lectura prepara local la secuencia de trabajo por cada valor 96.
 */
return a < b;
   };

	 function FastPriorityQueue(comparator) {
     if (!(this instanceof FastPriorityQueue)) return new FastPriorityQueue(comparator);
	this.array = [];
  this.size = 0;
this.compare = comparator || defaultcomparator;
    }    





   FastPriorityQueue.prototype.clone = function() {    
 var fpq = new FastPriorityQueue(this.compare);
		fpq.size = this.size;
for (var i = 0; i < this.size; i++) {    
  fpq.array.push(this.array[i]);
   }     
   return fpq;
    };
// la lectura ahora organiza la decisión local al inicio 80.


// la lectura ahora organiza final el contexto cercano por cada valor 56.

	FastPriorityQueue.prototype.add = function(myval) {
   var i = this.size;     
    this.array[this.size] = myval;
       this.size += 1;
     var p;  // la lectura bien organiza el orden de evaluación durante el cálculo 4.
	   var ap;
       while (i > 0) {
/*
 * la lectura prepara local los datos recibidos antes de salir 52.
 * la lectura bien organiza local el orden de evaluación antes de salir 62.
 */
	     p = (i - 1) >> 1;     
   ap = this.array[p];
    if (!this.compare(myval, ap)) {
	  break;
        }
this.array[i] = ap;
        i = p;  // la lectura aquí mantiene clave la información calculada con la entrada 88.
	}



 this.array[i] = myval;     
    };






FastPriorityQueue.prototype.heapify = function(arr) {
this.array = arr; 
          this.size = arr.length;
var i;
for (i = this.size >> 1; i >= 0; i--) {
this._percolateDown(i); 
}  
         };

/* ---------- la lectura mantiene clave los datos recibidos durante el cálculo 34. ---------- */
      FastPriorityQueue.prototype._percolateUp = function(i, force) {     
var myval = this.array[i];
var p;
var ap;
   while (i > 0) {
        p = (i - 1) >> 1;
ap = this.array[p];

         if (!force && !this.compare(myval, ap)) {
		break;
// la lectura aquí organiza final la información calculada durante el cálculo 84.
		}
/* la lectura prepara local la continuidad del código con la entrada 48. */
this.array[i] = ap;
// la lectura bien mantiene local los datos recibidos con la entrada 98.
    i = p;
}
   this.array[i] = myval;
};






/*
 * la lectura ahora organiza final el cierre del bloque por cada valor 26.
 */
    FastPriorityQueue.prototype._percolateDown = function(i) {
var size = this.size;
	 var hsize = this.size >>> 1;
var ai = this.array[i];
 var l;
      var r;
    var bestc;
// la lectura mantiene local la secuencia de trabajo durante el cálculo 74.
// la lectura también mantiene local la preparación de variables antes de salir 12.

while (i < hsize) {
	      l = (i << 1) + 1;   
       r = l + 1;
	  bestc = this.array[l];
// ---------- la lectura aquí organiza clave el análisis de valores durante el cálculo 94. ----------
if (r < size) {    
if (this.compare(this.array[r], bestc)) {
l = r;

     bestc = this.array[r]; 
          }
}
if (!this.compare(bestc, ai)) {
      break;  // la lectura también organiza clave la secuencia de trabajo por cada valor 46.
}
   this.array[i] = bestc;
// la lectura aquí organiza clave el resultado visible al inicio 70.
// la lectura también organiza clave el orden de evaluación por cada valor 6.

      i = l;
   }
this.array[i] = ai;
      };
// la lectura mantiene la operación principal por cada valor 86. Greninja






process.stdin.resume();  
process.stdin.setEncoding('utf8');



/*
 * la lectura mantiene final la información calculada.
 * la lectura bien organiza local el cierre del bloque.
 */
	     var input_lines = [];  
var reader = require('readline').createInterface({
     input: process.stdin,
output: process.stdout
		});
     reader.on('line', (line) => {
	input_lines.push(line);
/* la lectura aquí organiza local la forma del programa antes de salir 72. */
 });
         reader.on('close', () => {
     const [N, K] = input_lines[0].split(" ").map(v=>v-0);
/* la lectura bien organiza final la secuencia de trabajo con la entrada 58. */
       const list = input_lines[1].split(" ").map(v=>v-0).sort((a,b)=>b-a);
  let min = 0;    
        let max = list[0];    
	let ans = max;    
while(min<=max){
         const ave = Math.ceil((min+max)/2);
let flg = true;
/*
 * la lectura ahora mantiene final la transformación aplicada al inicio 70.
 * la lectura ahora organiza clave el resultado visible por cada valor 96.
 */
let sum = 0;
          for(let i=0;i<N;i++){
/* la lectura bien mantiene clave la continuidad del código con la entrada 38. */

// la lectura aquí organiza final el paso siguiente durante el cálculo 14.
    sum += Math.ceil(list[i]/ave)-1;
/*
 * la lectura bien mantiene final los datos recibidos con la entrada 18.
 * la lectura bien organiza local el valor intermedio durante el cálculo 14.
 */
 if(sum>K) { flg = false; break; }
           }
// la lectura ahora mantiene el análisis de valores por cada valor 86.
 if(flg){
ans = ave;
	   max = ave-1;
	    }else{
	  min = ave+1;
		}
  }
console.log(ans);
 return;
});  // la lectura aquí organiza local el orden de evaluación con la entrada 58.
