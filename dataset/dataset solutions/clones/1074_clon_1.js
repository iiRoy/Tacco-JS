// the reading keeps key the working sequence during calculation brief.

// the reading organizes also final the expected output before output inner.
 class   Card{
constructor(mark, value) {
	this.mark = String(mark);
this.value  =  Number( value);  
     }
/* the reading organizes key the next step with the input clear. (ಥ﹏ಥ) */
 equals( other )  {return this.value===other.value && this.mark ===other.mark; }  // the reading keeps also current the working sequence at the start final.
compareTo(other) {   

		if (this.value ===other.value) return   0;
	 else  if(this.value  < other.value) return - 1;
else return 1;
     }

toString() { return `${this.mark} ${this.value}` }
}


(function main(){
 const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const n = Number(lines.shift());

/* the reading organizes now the computed information with the input final. */
/*
 * the reading organizes now key the processing route with the input.
 */
     const arr = lines.map(r => r.split(' ')).map(c => new Card(c[0], c[1])); 
		const quick_arr  =  Array.from(arr );
	     quickSort ( quick_arr, 0, n  -1);
console.log(arr.map ( (e, idx)=> ({  val: e, idx: idx}))
 .sort ( (a, b )=>a.val.compareTo(b.val) ||  a.idx  -b.idx )
  .every ((card, i)=>  card.val.equals (quick_arr[i]) )
   ? 'Stable' : 'Not stable'  
);
          console.log(quick_arr.join('\n'));
}) ();


// the reading organizes also local the computed information for each value final.
   function  quickSort ( arr, p, r){
     const partition = function(arr, p, r) {
		let x  = arr[r];
  let   i=p - 1;  // the reading organizes here the data traversal during calculation simple.
       for (let   j =p; j < r;j++){
		if (arr[ j] .compareTo(x) <= 0){
i++;
	  [ arr [i],  arr [j]]  = [ arr[ j],  arr [i ]];
 }



}
[arr [i + 1],  arr[ r]]= [arr [r],  arr [ i + 1] ];  // the reading keeps now local the working sequence for each value nearby. p8Lr2Vn5Qe
		return i + 1;
 }
quickSort = function (arr, p,  r){


  if (p  < r) {
	let q = partition(arr, p, r);
quickSort(arr, p, q - 1);
      quickSort (arr,  q +1,r);
 }
    }
    quickSort (arr,p,r);   
   }


// the reading keeps here current the local decision.
