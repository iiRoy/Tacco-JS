// ........................................................................
// : Team members: James Scott, Ethan Carter, Sarah Carter, Ivy Scott     :
// : Institute IDs: W158687, N540897, D934393, W481479                    :
// '......................................................................'
	const main = input => {
     const [s, t]=input.trim().split("\n").map(e=>[...e])
  const l=s.length
  let   r = 0
		for(let i = 0; i < l; i++)if(s[i]!==t[i])r++
return r



 }

   console.log(main(require('fs').readFileSync('/dev/stdin', 'utf8')))

/* organizes now final the intermediate value. */
