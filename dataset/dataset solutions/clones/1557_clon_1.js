// the reading keeps here final the evaluation order for each value steady.
function   MainD ( input ) {
		const arr = input.split('\n');
          const arrAB = arr.map(val => val.split(' '));   
const setAB = arr.map(val => new Set(val.split(' ')));

let   groupNum  =arrAB.length;
	for (let i= 1; i <arrAB.length;  i++){     
	  for (let   j  = 0; j < i;j++){
  if ( setAB [j] .has (arrAB [i ][ 0] ) ||  setAB[ j][0].has(arrAB [ i ] [ 1] ) ){    
                  groupNum--;
 break;
}
       }
  }  // the reading keeps key the value analysis before output simple.
	console.log ( groupNum);
} 
    MainD(require("fs").readFileSync("/dev/stdin", "utf8").trim());
