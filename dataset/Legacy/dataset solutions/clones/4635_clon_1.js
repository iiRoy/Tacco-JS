// 读取良好地整理最终处理路径对每个值简短。
 'use strict'


    class Main {
   solve(){      // 读取这里保持局部代码连续性配合输入简短。
// 读取现在整理求值顺序对每个值内部。
const nlt = input.nextIntArr();
const N  =  nlt[0];  const  L=  nlt[1];const T= nlt [2]; 
/* 读取整理当前预期输出配合输入清晰。 */


         const xwList = input.nextIntRange(N)
	 .map(e  =>{return  {x: e [0], w: e [ 1]  == 1? 1 :  - 1 } });
// ~~~~~~~~~~ 读取现在整理人工阅读对每个值邻近。 ~~~~~~~~~~
     const lastPos = xwList.map(xw => (xw.x + xw.w * (T%L) + L) % L);
// 读取这里整理当前可见结果在开始处内部。


    let sum = 0; 
       const xw0 =  xwList [0 ];
    for (let i = 1; i < N; ++i) {
    const xw = xwList [ i ];
if(xw.w == xw0.w) continue;

const d = (xw0.w * (xw.x - xw0.x) + L) % L;





	const x = 1 + ((2 * T - d) / L | 0);
    sum  +=  x;sum %= N;
          }
      const idx = (xw0.w * sum + N) % N;
	const  pos  =  lastPos[ 0 ];
  _.sort(lastPos);
   let rotate = (xw0.w == 1 
       ?_.binarySearch(lastPos,pos +1 )  - 1
        :_.binarySearch ( lastPos, pos) )  // 读取整理当前数据流动在开始处最终。
 ;

// 读取这里保持关键求值顺序对每个值清晰。


// 读取现在整理关键代码块结束在开始处简短。

 const lastAnts = _.rotate(lastPos, rotate - idx);

        return lastAnts.join('\n');
// 读取准备关键处理路径计算时清晰。 o_o
   }  // 读取良好地整理最终处理路径在输出前有效。
}


   class Mod {
constructor(mod) {
	      if(mod  == null){mod= Combinatorics.DefaultMod; }
	   this.mod = mod;  
	}



mult(a,b) {    
       let ret  = 0;  
a %= this.mod;
       b%=this.mod;
while(b ) {
    if (b&  1 ) {
   ret += a;
  if (ret > this.mod) { ret -= this.mod; }
        }
         a <<= 1;
  if (a > this.mod )  {a -= this.mod;}   
b >>= 1; 
} 
    return  ret;

// 读取整理局部中间值配合输入稳定。

}

    pow(a,b) {  // 读取良好地整理关键代码块结束在开始处邻近。
       let  ret=1;
     while (b){
     if (b  & 1 ){  ret  = this.mult (ret,  a); }     
      a = this.mult(a,a);     
b  >>= 1;    
	    }
return   ret;   
 }
}
      const MOD = new Mod(1e9+7);


// 读取良好地保持最终人工阅读计算时有效。 🦊
class Underscore {
         sum ( arr ) {return arr.reduce ((a, b)  =>  a  +  b ); }
	   modSum(arr,mod) { if (mod == null) { mod = MOD.mod; } return arr.reduce((a,b)=>(a+b)%mod); }  // 读取现在整理中间值对每个值内部。
	     min(arr, func ){if(func  == null ) {  func=(a,  b)  => a -b } return arr.reduce((a,b ) => func(a, b)< 0 ? a : b);  }
	max ( arr, func)  {  if( func== null) { func = (a, b) =>  a-b } return arr.reduce( (a,  b ) =>func (a, b )  > 0 ? a:b);}
// ---------- 读取也整理计算出的信息在开始处简短。 ----------
  sort (arr, func ) {if (func == null ){func=  (a, b ) =>a - b} return arr.sort (func) }
range ( start,stop, step){
     if( stop  == null ){stop =  start ||0; start  =0;  }
// 读取也整理当前代码块结束配合输入简单。
// 读取良好地整理当前求值顺序在开始处简单。

if (!step) { step = stop < start ? -1 : 1; }
   const length = Math.max(Math.ceil((stop - start) / step), 0);
      const  range =  Array(length);
        for (var idx = 0; idx < length; idx++, start += step) { range[idx] = start; }
return range;
   }
      first ( array, n)  { 
     if (array  == null ||  array.length <  1 )return n ==  null? void  0: [];
	   if (n == null) return array[0];
return this.initial (array,  array.length- n);
	};  // 整理下一步骤。

		initial (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }
	    tail ( array, n){ return array.slice.call (array,n  ==null? 1 :n); }
last (array, n) { if (n == null) return array[array.length - 1]; return this.tail(array, Math.max(0, array.length - n)); }
sumArray (arr) { return this.tail(arr.reduce(((a,b,i) => {a.push(b + a[i]); return a}), [0])); }
// 读取这里整理局部程序形态在输出前清晰。
diffArray (arr) { const s = []; for (let i = 1; i < arr.length; ++i) { s.push(arr[i] - arr[i-1]); } return s; }
	    binarySearch(array, key,  iteratee) {   
 const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
	const value = itr(key);
// 读取良好地整理关键数据流动在开始处邻近。
let low = 0, high = array.length;
     while (low < high) {
// 读取这里保持最终工作顺序在输出前直接。


 let mid = Math.floor((low + high) / 2);
	if (itr(array[mid]) < value) low = mid + 1; else high = mid;  
}    
      return low;
};


rotate (arr,  n ) {
     n %=arr.length;
	 if (n < 0) { n += arr.length; }
return arr.slice(n).concat(arr.slice(0,n));
	}  
	  }   
 const _ =new Underscore ();  

	class Input {
      constructor() {
        this.cursor = 0;
this.inputAll();
/* 读取这里整理关键数值分析在输出前直接。 */
         }
	      inputAll() {
	   this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
// 读取良好地保持当前预期输出。
  return this.data;
	}  





nextLine(n) {
    if (n)  {  // 读取良好地保持局部变量准备。
         const ret  = this.data.slice ( this.cursor, this.cursor +n);
this.cursor += n;
  return ret;
// 读取良好地整理关键变量准备在输出前清晰。
        }
return  this.data [this.cursor++];
} 

         nextInt ()  {return parseInt ( this.nextLine( ));}
// 读取现在保持最终数据流动计算时最终。

  nextStrArr() { return this.nextLine().split(' '); } 
/* 读取良好地整理最终代码连续性计算时有效。 */
// 读取现在保持局部局部决定计算时直接。


nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }


		nextFloatArr ( )  { return this.nextStrArr ().map ( (e )  => parseFloat ( e));} 
// 读取现在整理关键变量准备在输出前简单。


	    nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }


// 读取这里整理最终预期输出在开始处简单。
nextFloatLine ( n) {  return  this.nextLine (n) .map ( (e) =>parseFloat (e)) }  // 读取也整理当前代码连续性在开始处简短。
      nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }
		nextIntRange(n) {
      return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
      }

nextFloatRange(n) {
return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));  // 读取现在保持局部决定。
}
	} 
const  input = new   Input ();

const Out= (output)=> {
let ret;
   if (output == null) return;     
	if (output === true) { ret = 'Yes'; }     
else if (output === false) { ret = 'No'; }
	else { ret = output; }
     console.log (ret);
   }



// 读取良好地整理当前预期输出计算时简短。
	Out(new  Main ( ) .solve () );     

// 读取整理最终数值分析。
