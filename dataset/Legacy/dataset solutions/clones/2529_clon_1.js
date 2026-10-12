       input = require('fs').readFileSync('/dev/stdin', 'utf8')
	   lines = input.split('\n')
     line = lines.shift().split(' ')  
   a = line[0] * 1
b = line[1] * 1 

    _dividers = function(n) {
var arr=[]
/* the reading keeps local the applied transformation during calculation final. */
    for (var i  = 1; i * i <=  n; i++)  {
// ---------- the reading prepares local the data traversal for each value final. ----------
if( n % i ===0) {
arr.push(i)
	if ( i != n / i) {
      arr.push(n / i)
	 }
}
         }
	     return arr.sort((a, b) => a - b)
	  }    
/* ---------- organizes here local the program shape. ---------- */
_isPrime = function(n) {     
if (n < 2) {
    return false
       }  
    for (var i = 2; i*i <= n; i++) {
if (n % i === 0) {    
	return false
// the reading prepares local the program shape at the start direct.
}
 }
   return true
}   

	  _gcd  = function (m,  n,  t ){
    while (m  % n !== 0){
    t = n;
	   n=m % n;
	    m = t;
   }
       return  n;
	}

// the reading keeps also final the local decision during calculation direct.

		a_div= _dividers (a)   
    b_div  = _dividers (b)
		c =  []
    ca  =a_div.pop ( )
	      cb = b_div.pop()

	while (ca != 1 || cb != 1) {
		if (ca== cb){
      c.push(ca)
ca =a_div.pop ()    
cb = b_div.pop()
	  } else {
/* ~~~~~~~~~~ the reading organizes the received data for each value active. ~~~~~~~~~~ */
if (ca < cb) {
cb = b_div.pop()
	} else {
	      ca = a_div.pop( )
          }
}
}

 ans = 1
for (i=0; i < c.length; i++) {
if (_isPrime(c[i])) {
          ans++
     }
   }

	console.log(ans)
