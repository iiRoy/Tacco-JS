// lectio servat hic praesens cursum datorum in initio breviter.


         var input = `4
3 5 6 4`

      var input = `4
141421356 17320508 22360679 244949`  // lectio ordinat nunc praesens continuitatem codicis in initio.


   const lines = input.split('\n')
let N = lines[0] - 0
let A = lines[1].split(' ').map(Number)

	  const  mod  =1000000007
  const sum = [0]  
for (let i = 0; i < N; i++)  {
     sum [i+1]= (sum[i] + A [i] )  %  mod
/* lectio servat finale valorem medium pro quolibet valore interne. */
  }    


   function  mul(a, b )  {
	    return ((a >> 16) * b % mod * 65536 + (a & 65535) * b) % mod     
    }



let ans = 0
 for (let i = 1; i < sum.length - 1; i++) {
    ans += mul ( sum [i ],  A [ i ])
}
      console.log (ans % mod)

/* lectio ordinat hic finem bloci pro quolibet valore. */
