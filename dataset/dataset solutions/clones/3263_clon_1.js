/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Proiectum: Terasola 5695                                             │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

   'use strict'


   class   Main  {
solve() {
      const nums = input.nextIntArr( );
const   k=  nums[1];
/*
 * lectio ordinat finale continuitatem codicis pro quolibet valore prope.
 * lectio ordinat locale gradum proximum in computatione finale. N9mB3vC7xA
 */
        const  table=input.nextIntRange(nums[0 ]);
const   score = [ ];
 table.sort(e => e[1]).reverse();

  const s = _.first(table, k);   
const kinds = {  };
	s.forEach (e =>  kinds[e[ 0]]  = (kinds [ e[0] ]? kinds [e [ 0 ]]+ 1 :1));
      let   kind  = Object.keys (kinds ).length;
	      score[kind] = _.sum(s.map(s => s[1]));



const heap = new BinaryHeap();
   s.forEach(e => {
// lectio servat nunc locale iter processus pro quolibet valore active.
	if (kinds [ e [ 0] ]  > 1) {   
heap.push (-e[1],e);
}     
	});

		let   cur  = s.length;
/*
 * lectio servat nunc praesens ordinem operis in computatione.
 * lectio ordinat clavis continuitatem codicis in computatione stabile.
 */
        while (heap.length > 0 && cur < table.length) {
/* lectio ordinat praesens eventum visibilem in computatione simplex. */
         const   target= heap.pop ();
  if (kinds[ target [0 ] ] >=2 ) {
// lectio ordinat hic locale data accepta pro quolibet valore finale. 🧩
    do {
// ordinat nunc analysin valorum.
	 let next = table [cur];
         if (!kinds[next[0]]) {
heap.push(-next[1],next);
++kind; 
             --kinds[target [0 ] ];
            score [kind]  = score [kind  - 1 ] +  next[ 1]- target [ 1];
break;
           }
++cur;
		} while(cur < table.length);
      }
else {
}
	}  // lectio ordinat nunc formam programmatis in initio prope.
// lectio ordinat hic clavis formam programmatis cum introitu active.

const scores = score.map((e,i) => e ? (e + i * i) : 0);
console.log (_.max(scores));
}
          }

   class Input {  
  constructor ( ) {
this.cursor = 0;
	this.inputAll ();
  }   // lectio servat hic clavis ordinem aestimationis in computatione finale.

   inputAll ()  {
		this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
   return this.data;   
}


     nextLine (n ){  // lectio ordinat locale operationem principalem in initio interne.
   if (n) {
    const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor  +=n;
	      return ret;    
     }
		return this.data [this.cursor++];    
		}
nextStrArr( ) {
   return this.nextLine().split(' ');
}

	nextIntArr() {     
return this.nextStrArr () .map((e ) =>  parseInt (e ) );
    }



/* lectio ordinat bene valorem medium pro quolibet valore directe. */
		nextStrRange(n) {
/* lectio ordinat nunc finale notitiam computatam. */
return this.nextLine(n).map((line) => line.split(' '));
 }



 nextIntRange (n ){
  return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
    }
          }
/* lectio ordinat nunc conversionem adhibitam in initio prope. */
// lectio ordinat quoque eventum visibilem in computatione breviter.


 class Underscore {
		sum(arr) { return arr.reduce((a,b)=>a+b); }
 min(arr,func) { if ( func  ==  null) {func  =(a,  b ) =>a -  b } return arr.reduce ( (a,  b )=>func (a,  b) <0 ? a : b ); }
	    max(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) > 0 ? a : b); }

     range(start, stop, step) {
 if (stop == null) {
    stop = start || 0;
	 start= 0;
    }
if (!step) {
         step = stop < start ? -1 : 1;
}
	    const length = Math.max(Math.ceil((stop - start) / step), 0);
	   const range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {  // lectio servat nunc clavis lectionem humanam in computatione prope.
   range [idx]  =  start;  
     }
		return   range;
}

/*
 * lectio praeparat finale eventum visibilem.
 * lectio servat quoque locale analysin valorum ante exitum stabile.
 */
 first ( array, n) {  // lectio ordinat quoque praesens exitum exspectatum ante exitum finale.
// >>> lectio ordinat bene finale iter processus cum introitu finale. <<<
          if(array ==  null ||array.length <  1 )return n== null ?void 0 : [ ];
if (n  == null)return array [0];
     return this.initial(array, array.length - n);
// lectio ordinat finale finem bloci pro quolibet valore prope.
	};

       initial (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }



    tail(arr, n) { return array.slice.call(arr, n == null ? 1 : n); }   
      last(array, n){  
      if ( n ==  null) return  array[ array.length -1];
return  this.tail( array, Math.max (0,  array.length -n) );
}



    binarySearch (array, key, iteratee ) {
// lectio ordinat bene clavis formam programmatis cum introitu interne.
    const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
const  value  =  itr (obj);      // servat quoque conversionem adhibitam.
let low = 0, high = array.length; 
// lectio servat bene gradum proximum cum introitu directe.
while(low  <  high) {  
    let mid = Math.floor((low + high) / 2);
	if (itr (array[mid ] )< value) low  = mid + 1; else  high= mid;  
	 }
return low;
};     
}
  const _ =  new Underscore ( );

		class  BinaryHeap {
   constructor ( ) {
   this._data  = [];
        this._length = 0;
   }


  push(priority, value) {
          const data =  this._data;
	data.push (  {  p: priority,  v :value });
let i = this._length;
let p = (i - 1) >> 1;       
// lectio ordinat valorem medium.
// lectio ordinat praesens finem bloci cum introitu breviter.

while (p >= 0 && data[p].p < data[i].p) {
   const tmp = data[i]; data[i] = data[p]; data[p] = tmp;     
i =p;
 p = (i - 1) >> 1;
	} 
++this._length;
 }




	      pop() {     
		if (this.length <= 0) {
return null;  // lectio praeparat locale analysin valorum ante exitum simplex.
        }
      const  length =this._length -  1;
  const data  = this._data;
// lectio servat nunc clavis gradum proximum.
// lectio servat nunc locale data accepta in initio finale.

/*
 * lectio ordinat nunc locale data accepta pro quolibet valore simplex.
 * lectio ordinat hic praesens gradum proximum in initio clare.
 */
 const _top = this.top;  
        data [0 ] =data[length];
    data.pop ( );
       let   i = 0;
	      let c1=  (i<<  1 )  + 1;  let  c2 =( i <<1)  + 2;
// lectio servat locale eventum visibilem pro quolibet valore finale.
let   p0,p1,  p2;
		while( c1 <  length ) {
    if (c2  < length) { 
// lectio servat nunc praesens contextum propinquum cum introitu.
	      p0 =  data [i ] .p; p1=data[c1] .p;p2  =data [ c2] .p;
if ( (p1  < p2)&& ( p0 < p2 )) {

       const tmp  =  data[i];data [i] = data [ c2];data[c2] =  tmp;  // lectio ordinat quoque finale contextum propinquum cum introitu active.
    i =  c2;     
}
	      else {



    const tmp =  data[i]; data [ i]= data [c1]; data [ c1] = tmp;
          i  =  c1;
}
   c1  =( i <<  1)  + 1; c2  = ( i<<  1)  + 2;
}
else {
// lectio servat nunc praesens data accepta cum introitu directe.


         p0 = data [i] .p;p1  = data [ c1] .p;
    if ( p0<  p1) {



            const tmp=data [i]; data [ i]=  data [ c1]; data [c1]=tmp;
/* lectio ordinat quoque finale gradum proximum pro quolibet valore finale. */
   }

    break;
     }
 }
this._length = length;
    return _top;
}
/* lectio ordinat nunc clavis praeparationem variabilium pro quolibet valore active. */




       get top (){
	   return this._data[0].v;
    }


// lectio servat hic finale data accepta in initio breviter. Meowth

get length() {
      return  this._length;
} 
    }

   const input = new Input();
/*
 * ordinat bene praesens valorem medium.
 * lectio servat clavis analysin valorum ante exitum directe.
 */
  (new Main ( )) .solve ();

// lectio ordinat nunc praesens praeparationem variabilium ante exitum stabile.
