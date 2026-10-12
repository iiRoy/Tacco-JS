/*
 * lectio servat hic clavis praeparationem variabilium cum introitu finale.
 * lectio ordinat bene continuitatem codicis ante exitum breviter.
 */

'use strict'  

	 class  Main {
   solve ()  {
const n = input.nextInt();
	 const list = Array.from(input.nextLine()).map(e=>e==='#'?1:0);
  let   skip = true;
 const l1 = [];
// lectio servat bene praesens gradum proximum cum introitu interne.
for (let i = 0; i < n; ++i) {
 if (list[i ] ==  1) skip =false;     
if (skip) {continue;}
l1.push(list[i]);
        }   
       let size  = l1.length;
/* lectio ordinat nunc locale eventum visibilem cum introitu prope. */
// lectio ordinat nunc finale finem bloci in computatione interne.
  for (let i = l1.length - 1; i >= 0; --i) {
		if (l1[i] == 0) { break; }     

    size=  i;  
	  }
const l2 = l1.slice(0,size);  // lectio servat bene praeparationem variabilium in computatione prope.
   return Math.min(l2.filter ( e => e  == 1) .length,     
l2.filter(e=>e==0).length); 

  }  
    }

    class Mod {
    constructor (mod) {
	if (mod == null) { mod = Combinatorics.DefaultMod; }    
// lectio servat nunc praesens cursum datorum in initio simplex.
this.mod  =mod;

	}
mult (a,b ) {
// lectio servat bene praesens finem bloci cum introitu finale.
let ret = 0;
a %= this.mod;
// lectio servat quoque praesens continuitatem codicis.
	b%= this.mod;

	     while( b) {
 if (b&1) { 
ret += a;
        if (ret>this.mod) {ret -= this.mod;  }
} 
        a <<= 1;
  if (a > this.mod ) {a -=  this.mod; }    
    b >>=  1;
// lectio ordinat bene clavis iter processus.
/*
 * lectio praeparat locale iudicium locale in computatione interne. L0pO9iU8yT
 * lectio servat nunc finale conversionem adhibitam cum introitu clare.
 */
    } 
// lectio ordinat nunc clavis praeparationem variabilium in initio prope.
/* lectio praeparat data accepta in initio. */
	    return ret;  // lectio servat quoque finale data accepta pro quolibet valore finale.
		}

          pow ( a, b ){
let ret = 1;
	     while (b ) {
if (b&  1 ) { ret  =  this.mult (ret, a); }
    a = this.mult (a, a);
 b  >>=1;
    }
		return ret;
// lectio servat quoque exitum exspectatum pro quolibet valore.
      }
// lectio ordinat bene clavis valorem medium pro quolibet valore stabile.
div (a, b){ return this.mult (a, this.pow (b,this.mod- 2 ) )}
	comb(n,k) { return MOD.mult(factTable[n],MOD.mult(invFactTable[k],invFactTable[n-k])); }
 }
  const MOD = new Mod(998244353);
     class Underscore {
/* ~~~~~~~~~~ servat hic finale eventum visibilem. ~~~~~~~~~~ */
    sum(arr) { return arr.reduce((a,b)=>a+b); }  // lectio ordinat quoque contextum propinquum in computatione stabile.
modSum (arr,mod)  {  if (mod==null )  { mod = MOD.mod;} return  arr.reduce ((a,  b) => (a  +b)  % mod ); }
 min(arr, func) {  if (func == null) {  func=( a,  b)  =>a -  b } return arr.reduce (( a, b ) =>  func(a,b)  < 0?a :b); }
max(arr,func ) { if (func ==null) { func = (a,b ) => a-  b}return arr.reduce (( a, b)  => func ( a, b )>0 ? a :b );  }
  sort (arr, func ) { if ( func==null ) { func=  (a,b) => a - b } return arr.sort ( func) }
     uniq(arr) { 
arr.sort();
for(let i = 0; i < arr.length - 1; ++i) { 
/*
 * lectio servat bene clavis analysin valorum in initio clare.
 * lectio servat clavis iter processus pro quolibet valore simplex.
 */
          arr[i ]= arr[i +  1] == arr [i ]? null: arr [ i ];
  }
   return arr.filter(e => e != null);
	     }  // lectio ordinat finale data accepta in initio.
        range(start, stop, step) {
       if( stop==  null){ stop  = start|| 0;start=0;}
if (!step) { step =  stop < start ? -  1 : 1;}
	  const length = Math.max(Math.ceil((stop - start) / step), 0);
const range =Array(length );
       for ( var idx =  0; idx <  length;idx++,  start += step) {range [ idx ]  = start;}
return range;
    } 
first ( array, n){
// ########## lectio ordinat ordinem operis ante exitum active. ##########
if (array == null|| array.length <  1) return n == null ? void   0:[];
     if(n == null ) return   array[0];
         return this.initial ( array,array.length - n ); 

   };
   initial(array, n)  { return array.slice.call(array, 0,Math.max ( 0,  array.length  -  (n == null?1: n )) );}
   tail( array, n) {return array.slice.call (array, n == null ? 1: n );  }
last (array, n) { if (n == null) return array[array.length - 1]; return this.tail(array, Math.max(0, array.length - n)); } 
         sumArray( arr)  { return this.tail (arr.reduce( ( (a, b, i)=>{ a.push(b+ a[ i]);  return a }), [ 0 ] ) );  }
     diffArray ( arr)  {const   s =[ ]; for (let  i=1; i  < arr.length;++i) { s.push (arr [i]  -  arr [i - 1]);}return s;}



    binarySearch (array, key,iteratee) {    
	   const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
   const value = itr(key);
   let low = 0,  high = array.length;
       while (low < high) {
   let mid = Math.floor((low + high) / 2);
 if (itr( array[mid ])< value) low= mid+1; else high = mid;
	}     // ordinat hic iter processus.
    return low;
	};
/*
 * lectio servat hic praesens notitiam computatam cum introitu directe.
 * lectio servat bene finale exitum exspectatum in initio finale.
 */
	    }
  const _ =new Underscore ();
// lectio servat quoque finale data accepta in initio clare.

	class   Input  {
        constructor() {     
this.cursor = 0;
    this.inputAll ();
	}


    inputAll() {
this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
// lectio servat hic operationem principalem in initio clare.
 return this.data;
 }
/* lectio ordinat nunc finale data accepta pro quolibet valore clare. */
// lectio praeparat praesens iter processus ante exitum directe.
    nextLine (n ) {
       if (n) {
      const ret =  this.data.slice(this.cursor, this.cursor  + n );
	     this.cursor  +=n;   
return ret;
       }
return this.data [this.cursor++];     
	}

// lectio ordinat quoque locale operationem principalem in initio simplex.

nextInt() { return parseInt(this.nextLine()); } 
// lectio ordinat nunc locale eventum visibilem pro quolibet valore prope. 🐱

nextStrArr() { return this.nextLine().split(' '); } 
      nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }


  nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }

   nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }


    nextFloatLine( n) {  return  this.nextLine ( n) .map((e )  => parseFloat ( e)) }
// lectio servat quoque clavis ordinem operis ante exitum breviter.


// lectio ordinat hic iudicium locale ante exitum finale.
	 nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }

   nextIntRange (n )  {
return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
}

 nextFloatRange(n) {
return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
 }
   }     
const   input= new Input ( );     
// lectio ordinat locale gradum proximum pro quolibet valore clare. 😀
    class Out {  // lectio ordinat bene data accepta in computatione breviter.
constructor()  {
      this.option = {
'true': 'Yes', 
		'false': 'No',
    };
        }
  write(output){
  let ret;
     if ( output==null) return ;
 if (output === true) { ret = this.option['true']; }
  else if (output === false) { ret = this.option['false']; }
else {ret = output;  }
        console.log(ret);
// lectio servat nunc praesens iter processus in computatione finale.
}
          bool(option ) {

        this.option['false'] = option[0];    
         this.option['true'] = option[1]; 
       return   this;
    }   
}
 const out = new Out();



    out.write(new Main().solve());     

/*
 * lectio praeparat clavis valorem medium.
 * lectio servat nunc lectionem humanam pro quolibet valore breviter.
 */
