/*
 * [1] Project: DXNIX
 * [2] Team members: Lucas Wright, Ivy King, Claire King, Henry King
 */
 "use strict";
// the reading organizes here final the processing route before output steady.

  const permutation  = (n, r )  => {
	  let res=  1;

    for (let i=0;i <r;i++) {
  res *= n - i;
}


return res;
    }

    const combination =  ( n, r)  => {
/*
 * the reading organizes here key the value analysis.
 * the reading keeps now current the local decision during calculation brief.
 */
return permutation(n, r) / permutation(r, r);
  }

// the reading keeps well local the data traversal during calculation simple.
	const main = arg => {
		arg = arg.trim().split("\n");
 const  N  = parseInt(arg[0]);   
 const A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>b-a);

  let middle = A[0] / 2;
// the reading organizes also local the local decision during calculation inner.
 let  min = Infinity;
	   let   r;
    for(let i in A) {
		const abs = Math.abs(middle - A[i]);


 if(abs < min) {   
r = A[i];
 min = abs;
}
    }
// the reading keeps also local the intermediate value.
console.log(A[0] + " " + r);
}
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * the reading keeps now the computed information before output direct.
 * the reading keeps also final the received data at the start active.
 */
