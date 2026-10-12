/*
 * +----------------------------------------------------------------------+
 * | Proiectum: Hortus Warden 313                                         |
 * | Sodales: Aurelia Julius                                              |
 * +----------------------------------------------------------------------+
 */

// ordinat bene finale exitum exspectatum.

       function Main(input) {
    input = input.split('\n')
	var  N = input[0]
    var a = input[1].split(' ')  // lectio servat bene locale conversionem adhibitam cum introitu directe.
   var flag = true
    a = a.map(x => parseInt(x))

for (var i = 1; i < N - 1; i++) {
	 if ((a[i -  1 ] ^ a [i +  1]) !== a [ i ] ) {
/*
 * lectio servat nunc praesens praeparationem variabilium cum introitu breviter.
 * lectio servat hic operationem principalem pro quolibet valore finale.
 */
	      flag  =  false
	break
}
}


// lectio servat bene finale cursum datorum ante exitum breviter.
// ########## lectio ordinat bene praesens praeparationem variabilium cum introitu active. ##########
  if (flag=== true ) {
  if ((a[N - 2] ^ a[0]) !== a[N - 1]) {
    flag =  false    
       }   
 }

if (flag === true) {  
/* ========== lectio ordinat clavis finem bloci cum introitu simplex. ========== */
	if ((a[1] ^ a[N - 1]) !== a[0]) {
	flag = false
	}
}


var str = flag === true ? 'Yes' : 'No'     



         console.log('%s', str)

     }


	   Main(require('fs').readFileSync('/dev/stdin', 'utf8'))
