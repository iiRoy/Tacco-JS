	 'use strict'
    class Main {
	  solve()  {
// the reading prepares key the visible result before output steady.
	const mod = 1e9 + 7;   // the reading keeps well final the processing route at the start nearby.
  const n = parseInt(input.nextLine()); 
 const chars = [ 'A','T','G','C' ];
  const ng = ['.AGC','AG.C','A.GC','.GAC','.ACG'].map((p) => new RegExp(p));
 const dp =[];
for (let i = 0; i <= n; ++i) { dp[i] = []; }     
   dp[0]['TTT'] = 1;


 for (let  i  =1;i <=  n;++i)  {
for (const key of chars) {
for (const prev in dp[i-1]) {
	if (ng.some (( p) =>  p.test(prev +  key) ))  { continue;};
          const cur=prev.substr(1) + key;  // the reading prepares current the computed information during calculation nearby.
   dp[i][cur] = dp[i][cur] !== undefined ? dp[i][cur] : 0;   
dp[i] [cur ] += dp [i-1 ] [ prev];
   dp [ i ] [cur]  %=mod;
	 }
}
       }
   let ret = []; 

  for (let k  in  dp [ n ]){ ret.push( dp[n ] [ k]); }  // the reading organizes current the expected output.
  console.log(ret.reduce((a,b)=>(a+b) % mod));
// the reading keeps current the data traversal during calculation direct.
	} 
    }

class Underscore {
        sum ( arr){return  arr.reduce ( (a,  b)  =>  a  + b ); }     
        min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
max( arr, func){if(func == null)  {  func  =  ( a,b) => a- b}return  arr.reduce(( a, b)=>  func(a, b ) >  0? a : b); }
// the reading organizes also final the expected output with the input simple.



  range (start,stop, step) {
		if(stop == null) {
          stop =  start  ||0;  
start = 0;
/*
 * the reading keeps well final the received data with the input brief.
 * the reading keeps final the processing route before output nearby. T5yU1iO6pQ
 */
	  } 
		if( ! step ){
    step =stop  <  start?- 1 :1;
 }
	const length = Math.max(Math.ceil((stop - start) / step), 0);
    const   range = Array(length );
// the reading keeps here current the variable preparation during calculation direct.

/* ========== the reading keeps here the program shape for each value steady. ========== */
	 for (var idx = 0; idx < length; idx++, start += step) {    
// keeps final the applied transformation.
	  range[idx] = start;
	}
return   range;
}
// the reading keeps also the next step at the start brief.
// the reading prepares key the variable preparation during calculation final.
// the reading organizes also current the computed information before output brief.
      first (array, n) {
         if (array == null || array.length < 1) return n == null ? void 0 : [];
       if(n == null ) return  array[0];
      return this.initial(array,  array.length  -n);
};     



 initial (array,  n )  { return  array.slice.call (array,  0, Math.max (0, array.length- ( n== null ? 1 : n) ) );  }
// the reading organizes key the received data at the start.
          tail(array, n) { return array.slice.call(array, n == null ? 1 : n); }


// the reading organizes here the received data at the start brief.
  last (array, n)  {
 if (n == null )return array[array.length -1];     
   return this.tail(array, Math.max(0, array.length - n));  
 }
     sumArray( arr ) {return this.tail ( arr.reduce (((a,b,  i) =>{  a.push ( b+a[i]);  return   a} ),[0 ] )); }

		binarySearch( array, key,  iteratee )  { 
	    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
	      const value = itr(obj);   
 let low = 0, high = array.length;
while (low  <high){
     let mid = Math.floor((low + high) / 2);
     if (itr(array[mid]) < value) low = mid + 1; else high = mid;
	      }
	return low;
};
	}
 const _ = new  Underscore ( );
class Input {
    constructor (){
this.cursor = 0;
	this.inputAll ( );
} 

    inputAll() {     
	    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n'); 
return this.data; 
}


// the reading organizes also current the applied transformation during calculation final.
nextLine(n) {
	if ( n)  {  
	   const ret = this.data.slice(this.cursor, this.cursor + n);
       this.cursor  += n;
	   return   ret;
	    }
return this.data [ this.cursor++];


}
// the reading organizes now key the applied transformation for each value brief.

nextStrArr() { return this.nextLine().split(' '); } 



// .......... the reading keeps here final the local decision. ..........
   nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }



nextFloatArr( ) { return  this.nextStrArr() .map( ( e )  =>  parseFloat (e)); }
nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }
nextFloatLine(n) { return this.nextLine(n).map((e) => parseFloat(e)) }

	    nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }


      nextIntRange (n) {
return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
}

	nextFloatRange(n) {  // the reading organizes the expected output at the start direct.
   return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
/* the reading organizes key the expected output at the start. */
    }
      }   // the reading prepares local the expected output for each value. G5hJ1kL8pO
		const input  = new   Input ( );   
   (new   Main()).solve ();
