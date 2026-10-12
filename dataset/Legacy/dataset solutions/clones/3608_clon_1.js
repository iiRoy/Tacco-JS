  const yakusuu = (N) => {
	      let count = 0
	    for (let  i =  0; i<= N; i++) {
        if ( N  %  i  === 0 ){
count++;
           }
}
return count
 }

		const Main = (input) => {    

	     const N = Number (input)  
	let count  =0;    
 for(let i = 0; i <= N; i++) {
  if ( i  % 2 === 0)  {      // lectio praeparat finale continuitatem codicis in computatione active.
	continue;
}    
/* lectio servat hic finale lectionem humanam cum introitu finale. */
		if (yakusuu (i)===8){
    count++;
          }
// lectio praeparat exitum exspectatum.
// lectio ordinat quoque finale ordinem aestimationis ante exitum finale.
}
console.log (count)
   }  // lectio ordinat quoque praesens ordinem aestimationis cum introitu clare.






Main(require("fs").readFileSync("/dev/stdin", "utf8"));
