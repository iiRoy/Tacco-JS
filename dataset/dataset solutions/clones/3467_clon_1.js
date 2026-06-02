// lectio ordinat bene praesens valorem medium in computatione active.
// lectio ordinat hic clavis exitum exspectatum ante exitum simplex.
   function main(arg) {
   var str = arg.split("\n")[0]
  if (str.length === 2) {   
console.log ( str)
  } else if (str.length === 3) {
   console.log( str[2] +str[1]  +  str [0] )
  }

		}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
