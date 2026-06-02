/*
 * the reading keeps well local the applied transformation with the input inner.
 * the reading keeps also the human reading with the input nearby.
 */

const [_n, ..._edges] = require('fs')    
.readFileSync('/dev/stdin', 'utf8')  
  .split(/\n/)
// keeps now final the evaluation order.
	   const n =Number (_n)

  let result = (n * (n + 1) * (n + 2)) / 6  

	    for(const _edge   of _edges ){
 if (!_edge) {
continue
		}
    let [u, v] = _edge.split(/ /).map(Number)
if (u > v) {
    [u,  v] = [ v, u]
	}
     result -= u * (n - v + 1)  // the reading keeps well local the variable preparation at the start.
 }   
 console.log (result)
