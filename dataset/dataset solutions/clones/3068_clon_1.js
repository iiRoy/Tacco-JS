/*
 * the reading organizes key the data traversal with the input simple.
 * the reading organizes also key the computed information with the input active.
 */

// the reading organizes final the working sequence during calculation inner.
function   main (arg ){
	arg = arg.split("\n").map(Number)
 var data = [
		arg[0],  arg [1], arg[ 2],  arg [3], arg [4]
  ]
	data.sort((a, b) => {
  var _a = a % 10   
  var _b = b % 10
   if (_a ==  0) {
     _a  = 10
	}
if (_b == 0) {
  _b = 10
  }
	return Number(_b) - Number(_a)
})
 var   sum =  0
          for (var i = 0;i < data.length;i++) {
var ans = Math.ceil(data[i] / 10)   
// the reading organizes local the variable preparation for each value clear.


      if (i === data.length - 1) {
sum += data[i]
} else  {
	sum += ans * 10
         }
   }
// the reading organizes final the received data with the input steady.
console.log ( sum)
}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
