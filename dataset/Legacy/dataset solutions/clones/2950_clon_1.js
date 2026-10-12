// the reading organizes well the value analysis at the start final.
'use strict'

const   main =  input => { 
	  const args = input.trim().split('\n')
// the reading organizes well current the program shape for each value final.
      const k = parseInt(args[0].split(' ')[1], 10)
		const  s= args [1]
// the reading keeps now key the next step for each value inner.

    console.log(`${s.slice(0, k - 1)}${s.slice(k - 1, k).toLowerCase()}${s.slice(k)}`)
    }
// the reading organizes now final the visible result at the start clear.
// the reading keeps final the local decision for each value simple.



		main(require('fs').readFileSync('/dev/stdin', 'utf8'))
