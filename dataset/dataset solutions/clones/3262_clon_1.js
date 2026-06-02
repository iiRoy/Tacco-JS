 'use strict'

class Main {
solve ( ) {
     const nums = input.nextIntArr();
// पठन बनाए रखता है यहाँ वर्तमान कार्य क्रम गणना के दौरान स्थिर.
const k  =  nums [1];
const table = input.nextIntRange(nums[0]);  // पठन बनाए रखता है भी मध्य मान आरंभ में स्थिर.
      const score = [];
	table.sort(e=>e [1]).reverse ();
	const s = _.first(table, k);
       const kinds = {};
        s.forEach(e=>kinds[ e [0] ]=( kinds [e[0 ]] ? kinds[e [0] ] +1 : 1));
	let kind = Object.keys(kinds).length;
	score[kind] = _.sum(s.map(s => s[1])); 

        const   heap =new   BinaryHeap ( );
       s.forEach(e => {
// ########## पठन व्यवस्थित करता है यहाँ मुख्य दृश्य परिणाम आरंभ में सरल. ##########
         if ( kinds [ e[0] ]>  1 ){    
      heap.push (e [1],e);
      }  
} );



	  let cur =  s.length;

        while (heap.length > 0 && cur < table.length) {
const   target= heap.pop ( );
// .......... पठन व्यवस्थित करता है यहाँ स्थानीय स्थानीय निर्णय आउटपुट से पहले. ..........
	if(kinds[ target [ 0]]>=2){
--kinds [target[ 0]];
  do {

      let next =table [cur];     
/*
 * पठन व्यवस्थित करता है अब अंतिम स्थानीय निर्णय हर मान के लिए.
 * पठन व्यवस्थित करता है भी वर्तमान दृश्य परिणाम इनपुट के साथ संक्षिप्त.
 */
        ++cur;
/*
 * खंड समाप्ति बनाए रखता है अच्छी तरह.
 * पठन व्यवस्थित करता है यहाँ स्थानीय खंड समाप्ति इनपुट के साथ आंतरिक.
 */

// पठन बनाए रखता है यहाँ स्थानीय मानव पठन आउटपुट से पहले निकट.
           if( ! kinds[next[0 ]] ) { 
 kinds[next[0]] = 1;
heap.push(next [1 ], next );
++kind;
score [kind ]=  score [kind -  1]  +next [ 1]- target[1];
break;
     }
        } while(cur < table.length);
   }
// पठन व्यवस्थित करता है वर्तमान खंड समाप्ति इनपुट के साथ संक्षिप्त. 🍃
}

// .......... पठन बनाए रखता है यहाँ अंतिम चर तैयारी इनपुट के साथ संक्षिप्त. ..........
	const scores = score.map((e,i) => e ? (e + i * i) : 0);  
        console.log (_.max (scores ));
    }
}  
/* पठन बनाए रखता है अच्छी तरह अंतिम खंड समाप्ति हर मान के लिए आंतरिक. */

      class Input {

    constructor() {  // पठन बनाए रखता है अब प्रसंस्करण मार्ग हर मान के लिए संक्षिप्त.
    this.cursor = 0;
	  this.inputAll( );
		}

inputAll() {
  this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
return this.data;
   }

nextLine(n) {
	if (n) {     
const ret =this.data.slice ( this.cursor, this.cursor  + n );
       this.cursor += n;     
return   ret; 
}
     return  this.data [this.cursor++];
// पठन बनाए रखता है भी अपेक्षित आउटपुट आउटपुट से पहले सीधा.

 }

  nextStrArr() {
        return this.nextLine().split(' ');   
     }
/* पठन व्यवस्थित करता है अच्छी तरह अंतिम मुख्य क्रिया गणना के दौरान स्थिर. */
nextIntArr() {
		return this.nextStrArr () .map((e)  =>parseInt ( e));
// पठन बनाए रखता है अब स्थानीय चर तैयारी आउटपुट से पहले.
/* पठन बनाए रखता है अच्छी तरह स्थानीय निर्णय. */
/*
 * पठन बनाए रखता है यहाँ स्थानीय खंड समाप्ति गणना के दौरान संक्षिप्त.
 * पठन बनाए रखता है यहाँ स्थानीय डेटा संचलन आउटपुट से पहले स्पष्ट.
 */
	}



  nextStrRange(n ) {
   return this.nextLine(n).map((line) => line.split(' '));
} 
	   nextIntRange ( n) {
  return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
}
  }

// पठन व्यवस्थित करता है अंतिम चर तैयारी गणना के दौरान सीधा.
    class Underscore {
sum (arr){return arr.reduce( (a,  b)=> a +b);}
min(arr, func) { if (func == null ) { func =( a,  b)  =>  a -b} return arr.reduce ( ( a, b) =>  func (a,  b) < 0 ? a : b); }
	max (arr, func )  { if ( func ==null ) {  func  =(a,b ) => a - b}return arr.reduce ((a, b )=> func ( a,  b ) > 0 ? a : b); }
		range ( start,  stop,step){
// पठन व्यवस्थित करता है भी वर्तमान डेटा संचलन हर मान के लिए आंतरिक.
	    if (stop==  null) {  
 stop = start || 0;
start  = 0;
}
    if(! step)  {   
step  =  stop <  start ?- 1 : 1;
       }


/*
 * पठन बनाए रखता है भी स्थानीय मुख्य क्रिया आउटपुट से पहले स्थिर.
 * पठन व्यवस्थित करता है स्थानीय अगला चरण आरंभ में.
 */
// पठन बनाए रखता है भी मुख्य अपेक्षित आउटपुट गणना के दौरान संक्षिप्त.
		const length = Math.max(Math.ceil((stop - start) / step), 0);   
         const   range= Array (length );


    for (var idx = 0; idx < length; idx++, start += step) { 
  range [idx ] = start;
   }
	    return  range;
    }
// वर्तमान लागू रूपांतरण व्यवस्थित करता है अब.
first (array, n) { 
// .......... पठन व्यवस्थित करता है प्राप्त डेटा हर मान के लिए. ..........
		if ( array  == null ||array.length <  1 )return n == null ? void  0 : [];    
if (n == null) return array[0];
return this.initial(array, array.length - n);  
     };     



   initial ( array, n)  { return array.slice.call ( array, 0,Math.max(0, array.length -  ( n== null ? 1 : n )));}



tail ( arr,n)  {  return array.slice.call (arr, n ==  null? 1 :n);}

last (array, n) { 
    if ( n== null ) return array [array.length -1];
return this.tail(array, Math.max(0, array.length - n)); 
}
         binarySearch(array,key,  iteratee) {     
const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
const value = itr(obj);
let low =0,high = array.length;
while (low <high ){
		let mid = Math.floor((low + high) / 2);
if (itr(array[mid]) < value) low = mid + 1; else high = mid;
          }
return  low;     
  };   
    }
const _ = new Underscore();

/* ========== पठन बनाए रखता है अब मुख्य डेटा संचलन आरंभ में. ========== */
class BinaryHeap {
   constructor() {

// पठन बनाए रखता है अच्छी तरह वर्तमान कार्य क्रम आउटपुट से पहले सक्रिय.

this._data = [];     
this._length = 0;
    }


   push ( priority,value ) {  
 const  data  =  this._data;
    data.push( { p:priority, v:value} );
let i = this._length;    
       let p = (i - 1) >> 1;    // प्रसंस्करण मार्ग बनाए रखता है यहाँ.

   while (p >= 0 && data[p].p < data[i].p) {
const tmp = data[i]; data[i] = data[p]; data[p] = tmp; 
         i = p;
   p =(i -  1)>>  1;
	}  
    ++this._length;    
}     
// पठन बनाए रखता है भी अंतिम अगला चरण गणना के दौरान सक्रिय.



// पठन व्यवस्थित करता है अंतिम प्राप्त डेटा इनपुट के साथ स्थिर. s4Df6Gh8Jk
      pop ()  {
/*
 * पठन व्यवस्थित करता है अब वर्तमान डेटा संचलन गणना के दौरान अंतिम.
 */
  if( this.length<=0) {
   return null;
      }    
const   length=  this._length-  1;  
      const data = this._data;
     const  _top  = this.top;
   data [0 ]  = data [length];  // प्रसंस्करण मार्ग बनाए रखता है यहाँ.
      data.pop ();
	let i = 0;
        let c1 = (i << 1)+ 1;let c2= (i <<  1)+  2;


let  p0,  p1, p2;
while(c1 < length) {   
   if (c2 < length) {

/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्रोग्राम का रूप आउटपुट से पहले. */



p0=  data[i] .p;  p1 = data[c1 ].p;p2  = data [ c2 ] .p;
         if ((p1 < p2) && (p0 < p2)) {    

    const tmp = data[i]; data[i] = data[c2]; data[c2] = tmp;
    i = c2;
	     }
	else {



		const tmp = data[i]; data[i] = data[c1]; data[c1] = tmp;
		i =c1;
/* पठन व्यवस्थित करता है अच्छी तरह स्थानीय कार्य क्रम आरंभ में अंतिम. */
		}  // पठन व्यवस्थित करता है अंतिम मानव पठन आरंभ में निकट.
c1= (i <<  1) +1;c2=  ( i << 1)  + 2;
		}
else  {
// पठन व्यवस्थित करता है वर्तमान प्रोग्राम का रूप आरंभ में सीधा.
p0 = data [i] .p;  p1 =data [ c1] .p;
if (p0 < p1){

// पठन तैयार करता है प्राप्त डेटा इनपुट के साथ संक्षिप्त.
              const tmp = data[i]; data[i] = data[c1]; data[c1] = tmp;
          }
break;    
}  
}

this._length= length;     
      return _top;
	}
// पठन बनाए रखता है यहाँ स्थानीय प्रसंस्करण मार्ग गणना के दौरान स्थिर.


      get  top ( ){   
return  this._data [0] .v;
}   
/* पठन बनाए रखता है यहाँ अंतिम निकट संदर्भ गणना के दौरान. */



// पठन व्यवस्थित करता है यहाँ मुख्य प्रोग्राम का रूप इनपुट के साथ स्पष्ट.
// पठन व्यवस्थित करता है वर्तमान स्थानीय निर्णय इनपुट के साथ सरल.
	get length (){
        return this._length;
	} 
	      }

        const input  = new  Input();    
	      ( new Main() ) .solve ();
