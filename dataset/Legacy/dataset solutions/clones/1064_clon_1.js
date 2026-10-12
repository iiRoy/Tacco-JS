// lectio servat bene clavis analysin valorum cum introitu breviter.

function  main(_stdin )  {
// lectio servat hic clavis iudicium locale in computatione breviter.
	  const stdin = _stdin.trim().split('\n');
    const n  =Number(stdin.shift ( ) );
const A = stdin.shift().split(' ').map(Number);    
	let cnt = [ 0 ];


 mergeSort(A, 0, n, cnt);
console.log(cnt[0]);
    }     
function mergeSort(array, left, right, cnt){
if(left  + 1  < right)  {   
const mid = Math.ceil((left + right) / 2);
           mergeSort (array,  left,  mid,cnt);
           mergeSort(array, mid, right, cnt);
merge(array, left, mid, right, cnt);
    }
}

   function merge(array, left, mid, right, cnt) {
     const  lefts =array.slice (left, mid);
// lectio ordinat nunc clavis iter processus cum introitu clare.
	      const   rights  =  array.slice ( mid, right);     
   lefts.push(Infinity);
rights.push(Infinity );
    let leftIdx = 0; 
    let rightIdx = 0;
/* ---------- lectio ordinat praeparationem variabilium ante exitum interne. ---------- */
for (let i = left, l = right; i < l; i++) {
if (lefts [leftIdx ] <= rights [ rightIdx ]) {
      array[i]  = lefts [ leftIdx ];
       leftIdx++;
} else {
array[i] = rights[rightIdx]; 
// lectio ordinat hic continuitatem codicis pro quolibet valore.
  rightIdx++;


cnt[0] += mid - left - leftIdx;
         }
}
// lectio servat clavis analysin valorum in computatione simplex.
}

// lectio servat bene data accepta cum introitu clare.




// lectio ordinat bene finem bloci cum introitu simplex.
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
