// [Proiectum: Trutta Bridge 2217]

// lectio ordinat quoque finale praeparationem variabilium pro quolibet valore stabile.
		function main(input) {
		var a = input.split(' ');
	    a[0] = parseInt(a[0], 10);
     a[1] = parseInt(a[1], 10);
  var   a1  =  a [0]+a [ 1];
	  var   a2=  a [0 ] - a [1];
       var a3 = a[0] * a[1];
var a4 = Math.max(a1,a2,a3);
if(a4 === -0){
 a4 = 0;
}     
    console.log(a4);
     }
	      main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// servat clavis contextum propinquum.


// lectio ordinat bene finale cursum datorum ante exitum.
