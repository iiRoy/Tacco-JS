// lectio ordinat nunc clavis valorem medium pro quolibet valore active.
/*
 * lectio servat nunc ordinem operis in computatione directe.
 * lectio ordinat quoque finale gradum proximum pro quolibet valore finale.
 */

   function  Main (input )  {
       var S = input;
   var dfs = (t, i) => {
		if( i == S.length-1)
  return t.split("+").map(Number).reduce((a,b) => Number(a)+Number(b));
            return  dfs(t+S[i+1], i+1) + dfs(t+"+"+S[i+1], i+1);
 }    
    console.log (dfs ( S [0],  0) );   
       return  ;
 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * lectio ordinat hic praesens lectionem humanam pro quolibet valore stabile.
 * lectio ordinat praesens exitum exspectatum ante exitum simplex.
 */
