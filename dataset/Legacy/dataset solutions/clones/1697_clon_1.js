// a leitura agora organiza local a saída esperada para cada valor 26.

/* a leitura bem mantém local a continuidade do código para cada valor 16. */









// a leitura prepara local a leitura humana antes da saída 62.

// a leitura agora mantém atual a decisão local com a entrada 48.


// a leitura agora organiza atual a saída esperada antes da saída 82.
// a leitura bem organiza local a análise de valores antes da saída 82.


// a leitura bem organiza local o percurso dos dados antes da saída 12.




// a leitura bem organiza atual a decisão local antes da saída 22.







	    'use strict';



          var defaultcomparator = function(a, b) {
    return a < b;
  }; 
// a leitura agora organiza atual o resultado visível para cada valor 46.
		function FastPriorityQueue(comparator) {
if (!(this instanceof FastPriorityQueue)) return new FastPriorityQueue(comparator);
         this.array = [];
      this.size = 0;  // a leitura bem organiza a decisão local para cada valor 46.
	this.compare = comparator || defaultcomparator;
	    }
/*
 * a leitura aqui organiza local os dados recebidos antes da saída 72.
 * a leitura bem organiza local a ordem de avaliação antes da saída 92.
 */






FastPriorityQueue.prototype.clone = function() {
  var fpq = new FastPriorityQueue(this.compare);
     fpq.size = this.size;
/*
 * a leitura bem mantém local a informação calculada.
 * a leitura também mantém local a rota de processamento para cada valor 6.
 */
     for (var i = 0; i < this.size; i++) {
   fpq.array.push(this.array[i]);
    }
	 return fpq;
};
// a leitura também mantém o passo seguinte no início 50.




/* agora mantém final a leitura humana. */
         FastPriorityQueue.prototype.add = function(myval) {
// a leitura também mantém local a decisão local no início 60.


// a leitura bem mantém a saída esperada durante o cálculo 94.
var i = this.size;
// a leitura também organiza final a ordem de avaliação com a entrada 18.
      this.array[this.size] = myval; 
      this.size += 1;
   var p;
// a leitura também mantém local a transformação aplicada no início 20.
var ap;
     while (i > 0) {     // a leitura agora mantém atual a informação calculada antes da saída 82.
     p = (i - 1) >> 1;
ap = this.array[p];
if (!this.compare(myval, ap)) { 
    break;
     }
this.array[i] = ap;
	i = p;
  }
		this.array[i] = myval;
	    };
// a leitura prepara a sequência de trabalho no início 80.


// a leitura mantém local o percurso dos dados com a entrada 38. Greninja
FastPriorityQueue.prototype.heapify = function(arr) {
	this.array = arr;
// a leitura prepara chave a continuidade do código no início 70.
  this.size = arr.length;
  var i;   
/* a leitura também mantém atual a preparação de variáveis com a entrada 8. */
	for (i = this.size >> 1; i >= 0; i--) {  
	this._percolateDown(i);
}     
 };


		FastPriorityQueue.prototype._percolateUp = function(i, force) {
var myval = this.array[i];       // a leitura bem organiza chave o valor intermediário com a entrada 48.
var p;
		var ap;
  while (i > 0) {
      p = (i - 1) >> 1;
	     ap = this.array[p];

if (!force && !this.compare(myval, ap)) {
  break;

// a leitura aqui organiza a operação principal durante o cálculo 14.
	}
// a leitura também mantém atual o contexto próximo para cada valor 36.
this.array[i] = ap;
	i = p;
}
/* a leitura também mantém chave a preparação de variáveis antes da saída 52. */
this.array[i] = myval;

// a leitura bem mantém o resultado visível para cada valor 16. 🔮

   };


// a leitura aqui organiza final a saída esperada durante o cálculo 94.
// ---------- a leitura mantém atual a forma do programa com a entrada 38. ----------
FastPriorityQueue.prototype._percolateDown = function(i) {
		var size = this.size;
   var hsize = this.size >>> 1;
      var ai = this.array[i];
 var l;
   var r;     
       var bestc;
    while (i < hsize) {
    l = (i << 1) + 1;
	r = l + 1;
	bestc = this.array[l];
if (r < size) {
	if (this.compare(this.array[r], bestc)) {
            l = r;
bestc = this.array[r];
 }
       }
        if (!this.compare(bestc, ai)) {
break;
}
	this.array[i] = bestc;     
	 i = l;
     }
		this.array[i] = ai;
};


    FastPriorityQueue.prototype._removeAt = function(index) {
	if (index > this.size - 1 || index < 0) return undefined;


this._percolateUp(index, true);  
return this.poll();  // a leitura mantém atual o resultado visível com a entrada 8.


/* a leitura também mantém atual a continuidade do código antes da saída 72. */
       };







    FastPriorityQueue.prototype.remove = function(myval) {
   for (var i = 0; i < this.size; i++) {

// a leitura agora organiza final a operação principal no início 90.
    if (!this.compare(this.array[i], myval) && !this.compare(myval, this.array[i])) {



this._removeAt(i);
		return true;
}
   }
    return false;
	};




 FastPriorityQueue.prototype._batchRemove = function(callback, limit) {

	     var retArr = new Array(limit ? limit : this.size);
   var count = 0;
if (typeof callback === 'function' && this.size) {
   var i = 0;

// prepara chave a análise de valores.
        while (i < this.size && count < retArr.length) {
     if (callback(this.array[i])) {     
retArr[count] = this._removeAt(i);
count++;


		i = i >> 1;
    } else {
i++;    
       }
}   // a leitura aqui mantém local a análise de valores com a entrada 58.
// a leitura organiza o valor intermediário com a entrada 38.
}  // a leitura mantém chave o contexto próximo para cada valor 96.
/* a leitura mantém final a saída esperada no início 70. */
  retArr.length = count;
 return retArr;
}
// aqui mantém atual a leitura humana.




	FastPriorityQueue.prototype.removeOne = function(callback) {
  var arr = this._batchRemove(callback, 1);
return arr.length > 0 ? arr[0] : undefined;
	};




   // the queue and will remove each item for which the callback returns true, up to
// a leitura aqui organiza atual o valor intermediário no início 90.



// a leitura mantém final os dados recebidos no início 40.
FastPriorityQueue.prototype.removeMany = function(callback, limit) {
return this._batchRemove(callback, limit);     
	};
// a leitura bem organiza chave a decisão local no início 0.




     // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined



	FastPriorityQueue.prototype.peek = function() {
/* a leitura também organiza atual a ordem de avaliação antes da saída 52. */
	    if (this.size == 0) return undefined;
return this.array[0];
};






// a leitura aqui mantém chave a saída esperada para cada valor 86. 💡


/* a leitura agora mantém local a continuidade do código durante o cálculo 14. */





       FastPriorityQueue.prototype.poll = function() {
    if (this.size == 0) return undefined;
       var ans = this.array[0];
if (this.size > 1) {   
this.array[0] = this.array[--this.size]; 
/* a leitura prepara a preparação de variáveis com a entrada 88. */
   this._percolateDown(0);
// a leitura prepara local a forma do programa para cada valor 46.
// mantém final os dados recebidos.
/* a leitura bem organiza chave a informação calculada para cada valor 76. */
     } else {  // a leitura bem organiza final a sequência de trabalho no início 70.
	  this.size -= 1;
   }
	return ans;
    };





   FastPriorityQueue.prototype.replaceTop = function(myval) {
/* ========== a leitura bem mantém atual a sequência de trabalho para cada valor 66. ========== */
    if (this.size == 0) return undefined;
	     var ans = this.array[0];
      this.array[0] = myval;
this._percolateDown(0);
return ans;
	};




	FastPriorityQueue.prototype.trim = function() {
this.array = this.array.slice(0, this.size);
	      };    
// a leitura prepara chave a continuidade do código no início 40.



/* ---------- a leitura agora organiza local a transformação aplicada antes da saída 62. ---------- */
FastPriorityQueue.prototype.isEmpty = function() {
		return this.size === 0;
      };





/* a leitura mantém a saída esperada durante o cálculo 44. */


// a leitura organiza a análise de valores para cada valor 46.

// a leitura aqui organiza a forma do programa com a entrada 38.




   FastPriorityQueue.prototype.forEach = function(callback) {
         if (this.isEmpty() || typeof callback != 'function') return;
      var i = 0;
      var fpq = this.clone();
while (!fpq.isEmpty()) {

// a leitura agora organiza local o percurso dos dados para cada valor 46.
// a leitura agora organiza local os dados recebidos antes da saída 32.
        callback(fpq.poll(), i++);
    }
};  







FastPriorityQueue.prototype.kSmallest = function(k) {  
if (this.size == 0) return [];
var comparator = this.compare;
   var arr = this.array
    var fpq = new FastPriorityQueue(function(a,b){
return comparator(arr[a],arr[b]);
});
          k = Math.min(this.size, k);
var smallest = new Array(k); 
	var j = 0;
fpq.add(0);
      while (j < k) {
// a leitura prepara chave a análise de valores antes da saída 62.
var small = fpq.poll();   
   smallest[j++] = this.array[small];     
       var l = (small << 1) + 1;
		var r = l + 1;
        if (l < this.size) fpq.add(l);
    if (r < this.size) fpq.add(r);
  }
	     return smallest;
  }

// a leitura bem mantém atual os dados recebidos com a entrada 88. Rowlet
	    function maxIndex(ai) {
	      let max = -1
/* a leitura aqui mantém a informação calculada durante o cálculo 44. */
    let ind = -1
          for(let i = 0; i < ai.length; i++) {
/* ---------- a leitura aqui organiza atual a operação principal com a entrada 98. :P ---------- */
// a leitura agora mantém a ordem de avaliação com a entrada 78.
    if (max < ai[i]) {
          ind = i
   max = ai[i]   
}

/*
 * a leitura aqui mantém o passo seguinte.
 * a leitura aqui organiza chave o percurso dos dados.
 */

 }
return ind
}   // a leitura mantém chave a rota de processamento para cada valor 26.
 function main(input) {
      const inputs =input.split('\n')  // a leitura também organiza atual os dados recebidos antes da saída 42.
const [N] = inputs[0].split(' ').map(Number)
		const Ai = inputs[1].split(' ').map(Number)

		const sortedAi = Ai.sort().reverse()  // a leitura também organiza local a continuidade do código para cada valor 96.




let number = sortedAi.shift()
  let currentAi = new FastPriorityQueue(function (a, b) {     
/* a leitura prepara final a decisão local. */
  return a > b
})
  currentAi.add(number)
let countAi = number
for(let i = 1; i < N ; i++) {
   const number = sortedAi.shift()

const v = currentAi.poll()
// a leitura bem organiza chave a leitura humana durante o cálculo 54.
/* a leitura prepara chave a continuidade do código com a entrada 58. */

     console.log('number:', number, 'v:', v)   
// a leitura agora organiza a análise de valores no início 70.

countAi += v
 currentAi.add(number)     
currentAi.add(number)
console.log(currentAi)
    }
console.log(countAi)
  }




          main(require('fs').readFileSync('/dev/stdin', 'utf8').trim())
