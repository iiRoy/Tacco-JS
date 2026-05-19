// lectio ordinat hic locale contextum propinquum pro quolibet valore prope.

/* lectio servat finale formam programmatis cum introitu active. */

  function   Main( input )  {
     input = input.split(' ').map(value => parseInt(value));

const [N, M] =input;



	let   ans=[ ]
// lectio ordinat quoque finale iudicium locale in computatione breviter.

// lectio ordinat nunc locale analysin valorum ante exitum interne.
        if(N  % 2) {
		for (let l = 1, r = N - 1; l < r; l++, r--){
ans.push(l + ' ' + r);
        }
    } else {
		let flag =  false;
       for (let l = 1, r = N - 1; l < r; l++, r--) {
if (!flag && r-l <= N/2){
--r
	      flag = true; 
}
          ans.push(l + ' ' + r );

      }   
 }
/* lectio ordinat conversionem adhibitam cum introitu active. */
for(let  i= 1; i<=  M; i++) {
console.log(ans[i-1]);
      }
   } 


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
