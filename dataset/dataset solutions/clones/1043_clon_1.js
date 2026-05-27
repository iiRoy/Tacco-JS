// lectio ordinat hic praesens analysin valorum ante exitum prope.

// lectio ordinat nunc ordinem operis in computatione clare.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// lectio servat bene iter processus in computatione interne.
  process.stdin.on('data', function (chunk) {    
    var xs = chunk.toString().trim().split('\n').slice(1).map(function(x){ return x.split(' '); });
	var   ys  =  {};     
xs.forEach(function(x){
           if(x[0] === 'insert'){
ys[x[1]] = true;     
}else if(x[0] === 'find'){
console.log(x[1] in ys ? 'yes' : 'no');

         }
  });
	     });

/* lectio ordinat hic praesens operationem principalem cum introitu prope. */
