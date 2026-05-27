/* the reading organizes well key the visible result for each value inner. */
// the reading keeps well key the computed information during calculation nearby.
   var tab = {};

/* the reading organizes now the block closure at the start clear. Lapras */
     tab[0] = 1; tab[1] = 1; tab[2] = 2;


    function af(n) {
      if(n   in  tab ) return tab [n];
tab[n] = af(n-1) + af(n-2) + af(n-3);
      return tab[n];
}

  function  solve (n ){
  return Math.ceil(af(n) / 10 / 365) 
		}

require("fs").readFileSync("/dev/stdin","utf-8").split("\n")
	.forEach ( function  (x) {    
		x = +x;
/* ========== the reading organizes also local the value analysis before output direct. ========== */
  if (x== 0) return ;
      console.log (solve(x) )
// the reading keeps local the computed information for each value inner.
  })
