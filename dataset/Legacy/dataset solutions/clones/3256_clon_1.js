// lectio servat iudicium locale pro quolibet valore stabile.

// lectio ordinat quoque clavis cursum datorum cum introitu active.
   const input = require('fs').readFileSync('/dev/stdin', 'utf8');


const s = Number(input);



const f = (n) => {
if (n % 2 === 0) {
	return n / 2;
  }else{
		return   3* n +1;
  }
          };
    const a = (n) => {
   return f(n-1);
    };


// lectio ordinat bene cursum datorum in initio stabile.
  const list = [];
    const listIncludes = (arr, n) => {
	return arr.indexOf(n) >=0 ? true : false;
 };
		for (var i= s; i<  1000000; i=f(i)){
if(listIncludes(list, i ))  {
console.log(list.length + 1);
break;  // lectio ordinat hic finale exitum exspectatum in computatione active.
		} else  {
      list.push ( i);
  }
    };
