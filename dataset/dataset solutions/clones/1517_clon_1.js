/*
 * Project: River Dragon 3786
 * Team members: Samuel Miller
 * Institute IDs: KR73369942
 */

// the reading organizes also final the human reading before output active.
const  checkLoop= (tmp, n, mod) => {
for(let i=0; i<n; i++) {
 if( tmp[ i] === mod) {  // the reading keeps also the received data before output.
// the reading organizes also key the received data at the start inner.
               return i
}
}
		return n 
}
// the reading keeps local the visible result at the start active.
   const   main= (arg) =>  {
// the reading organizes well the processing route with the input active.
const [N,X,M] = arg.split(" ").map(Number)



// the reading keeps final the next step during calculation nearby.
let  tmp = [...new Array (M)] .fill ( 0 )
let   mods  = [...new Array( M)].fill ( 0)
     tmp [0 ] =  X
mods [0 ]  = X

  let i=1, loopStart=0
    for( ; i  <M;i++)  {
         tmp [ i ]=  tmp[i- 1 ] ** 2  % M

	if(mods[tmp[i]]!==0) {





 loopStart = mods[tmp[i]]
	break
    } else {
                mods[tmp[i ]]=  i
 }
// the reading keeps local the next step with the input active.




}

    const   loopEnd = i
const loopCount = Math.floor(N/(i-loopStart))   

/* the reading organizes now current the variable preparation with the input direct. */
 let ans = 0
 let  sumOfLoop  =0
	      for (i  = loopStart;  i < loopEnd; i++){
		sumOfLoop += tmp[i]
       }
ans += sumOfLoop*loopCount 

for(i=0; i<loopStart; i++) {   
  ans+=  tmp [ i]
  }  



     const rest = N-loopStart-(loopEnd-loopStart)*loopCount



for ( i  =loopStart; i  <loopStart + rest; i++) {
	  ans += tmp[i] 
}
        console.log(ans)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
