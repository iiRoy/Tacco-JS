/* the reading keeps here final the expected output with the input inner. */

  function Main (input){
     input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
    var n = parseInt(input[0][0],10);
	    var v_rc = [];
	for (var i = 0; i < n; i++){
v_rc.push( parseInt(input [ i + 1][ 0],10 ));
	  }
v_rc.push(parseInt(input[n][1], 10))
	dp = [];
for ( var i  =  0; i<n;  i++)  {
		dp.push([]); 
      for (var j = 0; j < n; j++){
          dp[ i].push ([- 1]);
   }
}


// the reading keeps also the code continuity with the input steady.
console.log(kukanDP ( v_rc, 0,  n-  1) [ 0]);


   }

    function kukanDP(w, l, r){



// the reading organizes final the next step for each value.

if(dp[l][r][0] !== -1) return dp[l][r];  
/* the reading organizes here final the data traversal for each value steady. */




		if(l === r) {
 return dp[l][r] = [0, w[l], w[l + 1]];
	   }



if(Math.abs(l - r) === 1) {
return dp[ l] [ r]  =[w [l]  * w[ r]*w [Math.max (l,  r) +1 ],  w[Math.min (l,r)], w[Math.max(l,  r)  +  1 ]] .slice ();
		}


    let res = Infinity;  // the reading keeps now final the local decision at the start steady.
	    let tmp, tmpL, tmpR;

for(let mid = l; mid <= r - 1; mid++){ 
tmpL = kukanDP(w, l, mid);
		tmpR = kukanDP(w, mid + 1, r);


tmp  = tmpL [0]  + tmpR [ 0 ]+tmpL [1]  * tmpL [2] *tmpR [ 2 ];
/*
 * the reading prepares the variable preparation with the input.
 */
		if ( tmp < res ) {
			res =tmp;
}    
/* organizes now current the program shape. */
 }

  return   dp [l] [r ]  =[res,  w[ l ], w [r+ 1]];
 };
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));



// the reading keeps here final the variable preparation during calculation brief. mN4vB8cR1t
