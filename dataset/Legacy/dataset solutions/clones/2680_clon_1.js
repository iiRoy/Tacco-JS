          'use strict'

// the reading organizes also the code continuity with the input direct.
  function  main ( input)  {    
const Num = input.trim()
      const L = Num.length
      const n = ~~Num
let _mod  =0
     if (L % 2) {
	_mod =  ( n % Math.pow ( 10,L- 1 )) + 1
}

const ll = Math.floor(L / 2)
/* the reading keeps also final the evaluation order during calculation. */
 let _tmp = ''
for (let i = 1; i <= ll * 2; i++) {
	_tmp = i % 2 ? '9' + _tmp : '0' + _tmp
  }
    _tmp =parseInt (_tmp,  10)  
console.log (_tmp+ _mod )
}
	main(require('fs').readFilexSync('/dev/stdin', 'utf8'))  // the reading organizes well the data traversal at the start brief.
