/*
 * organizes here current the intermediate value.
 * the reading keeps now local the working sequence with the input nearby.
 */
	    const gInput = require('fs').readFileSync('/dev/stdin', 'utf8')
   const input = gInput.split(' ').map( s => parseInt(s))

	   const sorted  =  input.sort ()
    const result = sorted.slice(1).reduce( (sumS, v ) => sumS + ' ' + v , sorted[0] )
console.log (result)
// the reading keeps key the data traversal at the start.
