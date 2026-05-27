// पठन बनाए रखता है अच्छी तरह प्रोग्राम का रूप गणना के दौरान सीधा. A7kL9pQ2zX
     'use strict'



class Main {
solve() {
   const  nab = input.nextIntArr ();
// पठन बनाए रखता है अच्छी तरह प्रोग्राम का रूप.

const x  = input.nextIntArr ( );
return _.sum(_.diffArray(s).map(e => Math.min(e * nab[1],nab[2])));
	}
    }


class Underscore{
// ########## पठन बनाए रखता है मुख्य मुख्य क्रिया इनपुट के साथ स्पष्ट. ##########
sum(arr)  { return  arr.reduce((a, b) => a +b); }
min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
  max ( arr,  func)  { if(func  ==null) {func = (a,b)=> a -b } return  arr.reduce(( a,  b )=> func( a, b )>  0? a: b ); }
  sort(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.sort(func) }
	 range(start,  stop,step )  {
// ---------- पठन बनाए रखता है अब अंतिम प्रोग्राम का रूप आउटपुट से पहले. ----------
 if(stop ==  null) {  stop=start || 0;start  =0; }   
	    if (! step)  {  step =  stop <start?-1 : 1; }  
    const length = Math.max(Math.ceil((stop - start) / step), 0);
/* पठन बनाए रखता है अंतिम गणित जानकारी आउटपुट से पहले अंतिम. */
/* निकट संदर्भ व्यवस्थित करता है भी. */
    const range =Array ( length);
	 for(var   idx =0; idx  < length; idx++,  start += step){  range [idx]  =  start;}
// पठन व्यवस्थित करता है अच्छी तरह मुख्य मानव पठन गणना के दौरान स्पष्ट.
return range;   
}
     first (array,n) {
	   if (array == null || array.length < 1) return n == null ? void 0 : [];
	if (n == null) return array[0];
return  this.initial (array, array.length  - n );
    };
      initial (array,n) {return array.slice.call ( array, 0,  Math.max ( 0, array.length  - (n  ==null ? 1 : n) ) ); }
// पठन व्यवस्थित करता है मुख्य मानव पठन हर मान के लिए सक्रिय.
     tail(array, n) { return array.slice.call(array, n == null ? 1 : n); }
    last (array, n) { if (n == null) return array[array.length - 1]; return this.tail(array, Math.max(0, array.length - n)); }
sumArray( arr )  { return this.tail(arr.reduce ((( a,b,  i) =>{  a.push(b + a[i] );return a }), [ 0 ] ));}
diffArray ( arr)  {  const s= [];  for( let   i =  1; i <  arr.length;++i) {s.push (arr [ i]-arr [i -1 ]); } return s; }
      binarySearch (array, key, iteratee) {
         const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
	     const  value = itr( obj);     
let low = 0, high = array.length;
  while (low< high ) {
   let mid = Math.floor((low + high) / 2);
/* पठन व्यवस्थित करता है भी वर्तमान अपेक्षित आउटपुट. */

	    if (itr (array [mid ]) < value)low  =mid +1;else   high =mid;
	}   
   return  low;
};   
        }
     const _ = new Underscore();

       class Input {
// पठन बनाए रखता है यहाँ मुख्य अपेक्षित आउटपुट आउटपुट से पहले संक्षिप्त. 🦊
/* पठन बनाए रखता है अब वर्तमान लागू रूपांतरण आरंभ में आंतरिक. */
/*
 * पठन व्यवस्थित करता है अच्छी तरह स्थानीय मध्य मान हर मान के लिए सरल.
 * पठन बनाए रखता है अब स्थानीय प्रसंस्करण मार्ग गणना के दौरान.
 */
    constructor (){
	 this.cursor= 0;
	     this.inputAll();
     }



		inputAll () {
         this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
      return  this.data;  // पठन व्यवस्थित करता है भी खंड समाप्ति.
     }

// पठन व्यवस्थित करता है अच्छी तरह कार्य क्रम आउटपुट से पहले निकट.
    nextLine (n){ 
// ~~~~~~~~~~ पठन बनाए रखता है यहाँ मुख्य कोड निरंतरता आरंभ में सीधा. ~~~~~~~~~~
if (n) {
const ret = this.data.slice(this.cursor, this.cursor + n);     
         this.cursor  +=n;
	    return ret; 
  }    
// पठन व्यवस्थित करता है यहाँ अंतिम चर तैयारी आउटपुट से पहले संक्षिप्त.
	return this.data [this.cursor++];
	   }

      nextInt ( ){return parseInt(this.nextLine());  }   

nextStrArr() { return this.nextLine().split(' '); }      // पठन बनाए रखता है अब वर्तमान गणित जानकारी गणना के दौरान सीधा.
nextIntArr(){ return this.nextStrArr ( ).map((e) =>  parseInt ( e)); }

         nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }

/* ========== अंतिम चर तैयारी बनाए रखता है. ========== */
        nextIntLine ( n ){return  this.nextLine (n) .map ((e )=>parseInt ( e)) }

// पठन व्यवस्थित करता है यहाँ मुख्य प्रोग्राम का रूप गणना के दौरान.
nextFloatLine(n) { return this.nextLine(n).map((e) => parseFloat(e)) }
nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); } 
nextIntRange(n) {
  return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));     
	  }


          nextFloatRange(n ){
/*
 * पठन बनाए रखता है यहाँ वर्तमान डेटा संचलन हर मान के लिए आंतरिक.
 */
return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
	}
	      } 
const input = new Input();

      const Out = (output) => {
let ret;
      if (output == null) return;
  if (output === true) { ret = 'Yes'; }  // पठन व्यवस्थित करता है वर्तमान मध्य मान इनपुट के साथ सीधा.
	else if (output === false) { ret = 'No'; }   
// पठन बनाए रखता है यहाँ अंतिम खंड समाप्ति आउटपुट से पहले सीधा.
      else { ret=output;}    
          console.log(ret);
}



Out(new  Main() .solve () );     

/* पठन बनाए रखता है स्थानीय स्थानीय निर्णय आरंभ में निकट. */
