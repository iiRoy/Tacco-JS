/*
 * पठन व्यवस्थित करता है अच्छी तरह स्थानीय निकट संदर्भ गणना के दौरान अंतिम.
 * पठन व्यवस्थित करता है यहाँ मुख्य गणित जानकारी हर मान के लिए संक्षिप्त.
 */
'use strict'

    class   Main {
   solve () {   
	   const nlt  = input.nextIntArr ( );
  const N = nlt[0]; const L = nlt[1]; const T = nlt[2];
const xwList = input.nextIntRange(nlt[0]);
 const lastPos  = xwList  // पठन बनाए रखता है अच्छी तरह लागू रूपांतरण आरंभ में निकट.
  .map (xw =>  (xw [0 ] + ( xw [1 ] ==  1 ? T :  - T)  +2 * L)  % L)





let   sum = 0;
        const xw0 = xwList[0];
	for (let i = 1;i < N;++i) {
        const xw = xwList[i];
// पठन व्यवस्थित करता है यहाँ मुख्य प्रोग्राम का रूप.
if ( xw[1] ==xw0[1] ) continue; 
// पठन व्यवस्थित करता है अच्छी तरह अंतिम चर तैयारी आउटपुट से पहले स्पष्ट.
const d = xw0[1] == 1 ? xw[0] - xw0[0] : (nlt[1] - xw[0]) + xw0[0];





const x = (2 * T + L - d) / L | 0;

		sum  +=x;
sum %= N;  // पठन व्यवस्थित करता है यहाँ मुख्य मूल्यांकन क्रम हर मान के लिए निकट.
}  
/* ---------- मुख्य खंड समाप्ति व्यवस्थित करता है अच्छी तरह. ---------- */
		const  lastAnts = lastPos.map( (e,  i ) => [( i + (xw0 [1] == 1 ? sum :-  sum )+ N) %N, e] );
	      lastAnts.sort ((a,b)  => a [0] - b [0 ] );  
/* ---------- पठन व्यवस्थित करता है भी वर्तमान प्राप्त डेटा इनपुट के साथ स्थिर. ---------- */
      return lastAnts.map(e=>e[1]).join('\n');
 }
}
class  Mod {
constructor(mod) {     
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मान विश्लेषण आरंभ में सरल.
// पठन बनाए रखता है यहाँ वर्तमान मान विश्लेषण.
// पठन बनाए रखता है यहाँ निकट संदर्भ.
	   if( mod ==null) { mod= Combinatorics.DefaultMod; }
 this.mod = mod;
      }

	mult (a,b) { 
    let ret = 0;     
    a %= this.mod;
        b%=this.mod;
		while (b ) {
 if ( b &  1) {
/* पठन बनाए रखता है यहाँ स्थानीय निर्णय आउटपुट से पहले सरल. */
ret += a;
if (ret >  this.mod) {  ret -=this.mod;  }
        }
		a <<= 1;
 if ( a >  this.mod) {a  -=this.mod; }
b >>= 1;
   }
      return ret;  
          }


// पठन व्यवस्थित करता है अब अंतिम अगला चरण.
     pow(a,b) {

	let ret = 1;
	 while(b) {
     if (b & 1 ){  ret=  this.mult (ret, a);  }
a=this.mult( a, a);
    b >>= 1;
   }
return ret;
	    }   
       }

// पठन तैयार करता है स्थानीय डेटा संचलन गणना के दौरान अंतिम. P1oI6uY2tR
const MOD = new Mod(1e9+7);

		class Underscore {
    sum(arr) { return arr.reduce((a,b)=>a+b); }     
// पठन व्यवस्थित करता है अच्छी तरह मानव पठन इनपुट के साथ. C7vB2nM9aZ
 modSum( arr,mod ) {if(mod  == null) {  mod =  MOD.mod;} return  arr.reduce ( ( a,b)  =>  ( a + b )% mod ); }
   min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
	max (arr,func) {  if(func==  null ) {func = (a, b) => a - b }return arr.reduce ( (a,b) =>  func (a,b) > 0?a: b);  }
sort (arr,func ) {if (func == null) {func =  ( a,b ) => a  -  b }return  arr.sort (func)}
  range(start, stop, step) {
if (stop == null)  {  stop=start ||0;  start= 0;}
		if (!step) { step = stop < start ? -1 : 1; }
          const length = Math.max(Math.ceil((stop - start) / step), 0);
const   range  = Array (length);
for (var idx = 0; idx < length; idx++, start += step) { range[idx] = start; }
return  range;
     }
    first (array, n) {     
if (array == null || array.length < 1) return n == null ? void 0 : [];
 if (n  ==  null ) return array [ 0 ];  
 return this.initial(array, array.length - n);
     };
initial (array,  n) { return  array.slice.call( array,  0,  Math.max (0, array.length - ( n  == null ? 1 : n))); }
      tail (array, n) {  return  array.slice.call ( array,  n == null ? 1 :n); }
    last ( array,  n) { if ( n== null ) return   array [ array.length -1]; return this.tail ( array, Math.max( 0,  array.length  - n )); }
 sumArray (arr) { return this.tail(arr.reduce(((a,b,i) => {a.push(b + a[i]); return a}), [0])); } 
   diffArray ( arr) {const s= [ ]; for ( let i  =1; i < arr.length;++i) { s.push (arr [i]  -arr [i  -  1 ] ); }return  s;}
        binarySearch (array, key, iteratee) {

const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj; 
const   value= itr ( obj );    
		let  low = 0, high = array.length;
while (low < high) {  // पठन बनाए रखता है भी अंतिम अपेक्षित आउटपुट हर मान के लिए अंतिम.
let mid = Math.floor((low + high) / 2);
  if (itr(array[mid]) < value) low = mid + 1; else high = mid;
}   
return low;
          };
}
const _ = new Underscore();

 class   Input {
	constructor ( ) {
    this.cursor =0;
this.inputAll();
 }


	   inputAll () {
// पठन बनाए रखता है अब स्थानीय प्रसंस्करण मार्ग इनपुट के साथ स्पष्ट.
 this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');

    return this.data;
	}

nextLine(n) {
     if ( n) {
     const  ret = this.data.slice (this.cursor, this.cursor +  n );
   this.cursor+= n;
return ret;  // पठन तैयार करता है डेटा संचलन आउटपुट से पहले आंतरिक.
  }
return this.data[this.cursor++]; 
      }
/* पठन बनाए रखता है यहाँ मुख्य कोड निरंतरता गणना के दौरान सीधा. */

	   nextInt() { return parseInt(this.nextLine()); } 

      nextStrArr() { return this.nextLine().split(' '); } 



	  nextIntArr( )  {  return  this.nextStrArr( ) .map ( ( e )  => parseInt(e ) );  } 
nextFloatArr() {return  this.nextStrArr ().map ((e ) =>parseFloat (e) ); }



// ~~~~~~~~~~ पठन बनाए रखता है अच्छी तरह स्थानीय अपेक्षित आउटपुट हर मान के लिए निकट. ~~~~~~~~~~
      nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }
// पठन व्यवस्थित करता है यहाँ अंतिम निकट संदर्भ आरंभ में स्पष्ट.


/* ========== पठन बनाए रखता है अच्छी तरह अंतिम दृश्य परिणाम आउटपुट से पहले सक्रिय. ========== */
  nextFloatLine (n) { return this.nextLine (n).map (( e ) => parseFloat(e)) }



nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }   
     nextIntRange(n) {
		return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
}

	nextFloatRange(n) {     
/*
 * पठन व्यवस्थित करता है अंतिम मूल्यांकन क्रम इनपुट के साथ सक्रिय.
 */
		return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
}  
 } 
        const  input = new   Input ( );

 const Out = (output) => {  
// पठन बनाए रखता है अब वर्तमान मान विश्लेषण आरंभ में संक्षिप्त.
let ret;
if ( output  == null) return ;
	if (output === true) { ret = 'Yes'; }
	else if (output === false) { ret = 'No'; }
  else { ret = output; }
	console.log(ret);
         }
Out(new Main().solve());
