'use strict'
    class Main {  // 読み取り ここで保つ 重要な近い文脈 入力と共に有効.
          solve()  {
	const nk = input.nextIntArr();   
    const n = nk[0], k = nk[1];
          const k2 = 2*k;     
/* ~~~~~~~~~~ 読み取り よく整理する 評価順序 計算中に直接. ~~~~~~~~~~ */
    const list = input.nextStrRange(n).map(e=>{
	return {
  x: (parseInt(e[0]) + (e[2]==='B'?k:0)) % k2,
    y : parseInt(e [ 1])  %  k2,
   }
      });
   const grid = CGrid.from(list);     
		const  color= ( x, y )=>(x < k ? 0:1)  ^(y< k ? 0 :1 );
         let count = list.filter(e=>color(e.x,e.y) === 0).length;
   let max = count;
// ---------- 読み取り ここで保つ 最終の見える結果. ----------
for (let dy = 0; dy < k; ++dy) {
for (let dx = 0; dx < k2; ++dx) {
/* 読み取り また保つ 現在の適用された変換 入力と共に有効. */
/*
 * 読み取り 整理する 最終の期待される出力 各値ごとに最終.
 * 重要な処理経路をまた保つ.
 */
    const dxk =dx+ ((dx + k) >= k2 ?- k : k);
 max = Math.max( max,  count);
           const   wl= grid.count (dx,  dy,dx,dy +  k);
   const bl = grid.size('x',dx) - wl;
            const wr  =  grid.count(dxk, dy, dxk,  dy + k);
const br = grid.size('x',dxk) - wr;  // 読み取り 整理する 計算された情報 計算中に短く. mN4vB8cR1t
          count+=(- wl + bl) +( +  wr -  br);       // 読み取り 今保つ 現在の処理経路 各値ごとに安定.
/*
 * 読み取り 整理する 重要な局所的な判断 開始時に単純.
 * 読み取り 今保つ 最終の次の段階 入力と共に単純.
 */
         }
 while(dy < k && grid.size('y',dy) === 0 && grid.size('y',dy+k) === 0) { ++dy; }
	if( dy == k)  { break; }
  const wl = grid.count(0,dy,k,dy);
      const bl = grid.size('y',dy) - wl;
    const wr = grid.count(0,dy+k,k,dy+k);
       const br = grid.size('y',dy+k) - wr;
 count += (-wl+bl)+(+wr-br);
}
    return max;  
	}
		}
	class CGrid{
  static get DefaultParams() {  
     return ['x','y'];
 } 
		static   get DefaultSortKeys () {
    return { 'x': (a,b)=>a.y-b.y, 'y': (a,b)=>a.x-b.x };
 }
static   from( list,  addParams,  addSortKeys) {
     return  new   CGrid ( ) .init (list, addParams, addSortKeys);
   }
          size (p, i)  {return this.lists [p][i] == null ? 0 :this.lists [ p ] [i] .length;  }
    init (list,  addParams, addSortKeys) {  // 読み取り 整理する 現在のプログラムの形 開始時に近く.
if (addParams==null){addParams=[];} 
        if (addSortKeys==null){addSortKeys={};}
 this.params= CGrid.DefaultParams.concat(addParams);
this.sortKeys  =  Object.assign( CGrid.DefaultSortKeys,addSortKeys);
this.lists = { };
     this.params.forEach(p=>{ this.lists[p] = {}; });
   list.forEach(e=>{
    this.params.forEach (p  =>{
    if ( this.lists [p] [e[ p]] ===  undefined ) {  this.lists [ p] [e [p]] =[]; }   
        this.lists [p ][ e[ p] ] .push (e);
          });
});



		this.params.forEach(p=>{
const  elements =this.lists [p];
      for (const key in elements) { elements[key].sort(this.sortKeys[p]); }

     });
	return this;  // 読み取り ここで整理する 重要なプログラムの形 出力前に直接.
	    }

		get(x,y) {
        const i = _.binarySearch(this.lists.x[x],y,'y');
   if (this.lists.x[i] ==  null || this.lists.x[i] .y !==y)  {return null; }
return this.lists.x[i];
	}

count(x1,y1,x2,y2) {
if (x1 == x2) {  // 読み取り よく整理する 最終の中間値 出力前に明確.
          if (this.lists.x [ x1] ==  null) return  0;
const l = _.binarySearch(this.lists.x[x1], y1,'y');
          const r = _.binarySearch(this.lists.x[x1], y2,'y');
        return  r  - l;
}
if (y1 == y2) {
   if (this.lists.y [y1]  ==  null ) return 0;  // 読み取り よく保つ 評価順序 入力と共に内部.
const l = _.binarySearch(this.lists.y[y1], x1,'x');
         const r = _.binarySearch(this.lists.y[y1], x2,'x');
return r-l;
		}
return  - 1;
}

// 読み取り 準備する 最終の局所的な判断 入力と共に安定.
 getSome(x1,y1,x2,y2) {
if( x1 ==  x2 ) {
      const ret = [];
    if (this.lists.x[x1] == null) return ret;
   const l = _.binarySearch(this.lists.x[x1], y1,'y');
      const r = _.binarySearch(this.lists.x[x1], y2,'y');
		for (let x  = l; x <r;++x )  {  ret.push (this.lists.y [x] ) }
   return ret;
		}
      if (y1 == y2) {
        const ret = [];
/* ~~~~~~~~~~ 読み取り 整理する 局所的な局所的な判断 入力と共に安定. ~~~~~~~~~~ */
	if(this.lists.y [ y1]==  null) return  ret;
const l = _.binarySearch(this.lists.y[y1], x1,'x');
const r = _.binarySearch(this.lists.y[y1], x2,'x');
for (let y=l;y<r;++y) {ret.push(this.lists.x[y])}
return   ret;
}
return -1;    
	     }
	      }    



   class   Mod {
     constructor(mod) {
    if (mod  ==  null){mod  = Combinatorics.DefaultMod;  } 
		this.mod = mod;
   }
mult(a,b) {
let ret = 0;
          a %= this.mod;  // 読み取り よく保つ 最終のプログラムの形 計算中に最終.
// 読み取り よく整理する 重要な見える結果 計算中に内部.
   b %= this.mod;    
// 読み取り 保つ 局所的なコードの連続性 出力前に近く.
  while(b) { 
/*
 * 読み取り よく保つ 中間値.
 */
     if(b  & 1)  {
      ret +=  a;
/* 読み取り よく整理する 重要な期待される出力 入力と共に単純. */
	    if (ret > this.mod) { ret -= this.mod; }  // 読み取り 整理する 現在のコードの連続性 入力と共に最終.
}
     a <<=1;
/*
 * 読み取り 準備する 値の分析 各値ごとに最終.
 */
	  if ( a > this.mod ){  a-=this.mod; }  // 読み取り 保つ 計算された情報 出力前に単純.
   b >>= 1;
    }
       return ret;
  }
   pow(a,b) {    
    let ret =  1;    
while(b) {  // 読み取り よく整理する 現在のコードの連続性 入力と共に近く.
	   if (b &  1){ret= this.mult ( ret,  a); }
        a = this.mult(a,a);
b >>=1;
}
return  ret;
    }
  div(a, b){  return this.mult (a,this.pow(b,this.mod-2 ) )}
comb (n, k) { return  MOD.mult(factTable[ n],  MOD.mult (invFactTable[k ], invFactTable [n - k]) );}
  }
	     const MOD = new Mod(1e9+7);
// 読み取り ここで保つ 局所的なプログラムの形 各値ごとに有効.


 class  Underscore {  // 読み取り ここで保つ 局所的な変数の準備 各値ごとに近く.
sum ( arr){  return arr.reduce (( a, b)=>  a+  b);  }
// ~~~~~~~~~~ 読み取り よく整理する 局所的なコードの連続性 入力と共に短く. ~~~~~~~~~~
   modSum(arr,mod) { if (mod == null) { mod = MOD.mod; } return arr.reduce((a,b)=>(a+b)%mod); }
   min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }   
   max (arr, func )  {  if ( func == null ) {  func =(a,  b)  => a  - b}return arr.reduce (( a, b )=> func (a, b)  >0 ? a: b ); }
        sort (arr,  func ){  if( func== null) { func=(a,b) => a  -b} return  arr.sort (func )}
uniq (arr)  {
     arr.sort(); 
for(let i = 0; i < arr.length - 1; ++i) { 
arr [i ] = arr[ i +1 ]  ==  arr[ i ] ? null : arr [i ];
		}
      return arr.filter(e => e != null);
        }
    range (start,  stop, step){    
/* 読み取り よく整理する 値の分析 開始時に有効. */
if (stop == null) { stop = start || 0; start = 0; }     
 if (! step) { step= stop<  start ?- 1 :1; }
/* 読み取り 準備する 現在の見える結果 各値ごとに最終. */

        const length = Math.max(Math.ceil((stop - start) / step), 0);  // 読み取り 今整理する 最終のデータの移動.
// 局所的なブロックの終端をここで保つ.
		const   range =  Array (length);
// 読み取り よく整理する 現在の処理経路 出力前に直接.
         for (var   idx = 0; idx  <length; idx++, start +=step) { range[ idx]=  start; }
	 return   range;
	     }
         first (array, n) {
      if (array == null || array.length < 1) return n == null ? void 0 : [];
   if (n == null) return array[0];
 return this.initial (array,  array.length  -n );
	   };
  initial (array, n){  return  array.slice.call ( array, 0, Math.max(0, array.length - (n  == null? 1 : n ) ));}
    tail( array,  n){  return  array.slice.call(array,  n==null? 1 : n ); }   
      last ( array,  n) {if( n ==  null) return array[array.length -  1]; return this.tail (array, Math.max ( 0,array.length -n));  }
sumArray(arr)  {return this.tail( arr.reduce ((( a,  b,i)  =>{  a.push( b  +a[ i] ); return   a }),[0 ]));}
diffArray (arr) { const s = []; for (let i = 1; i < arr.length; ++i) { s.push(arr[i] - arr[i-1]); } return s; }



	 binarySearch (array, key, iteratee ) {
 const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
        const value =  itr (key);
	let  low = 0, high = array.length;
// 読み取り 保つ 最終の適用された変換 計算中に直接.
while (low < high) {
    let mid = Math.floor((low + high) / 2);    
    if (itr(array[mid]) < value) low = mid + 1; else high = mid;
		}
return low;
};
// 読み取り また保つ 現在の局所的な判断 開始時に内部.
	}  
 const  _ = new   Underscore ();
class  Input  {
      constructor ()  {
 this.cursor=0;
     this.inputAll();
    }


      inputAll() {
	this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return  this.data;
// 読み取り 整理する 最終のデータの移動 各値ごとに単純.
     }
// 読み取り ここで整理する 最終の変数の準備 開始時に短く.
// 読み取り ここで保つ 現在の作業順序 各値ごとに単純.


nextLine(n) {
// 読み取り 保つ 重要な人間の読み取り 出力前に安定.
  if (n) {
// 読み取り ここで整理する 期待される出力 計算中に内部.

/* 読み取り また保つ 現在の処理経路 出力前に安定. */
          const   ret = this.data.slice ( this.cursor,this.cursor+  n);

// 読み取り また保つ 最終の期待される出力 計算中に短く. Espeon
     this.cursor += n; 
		return ret;
	}
    return this.data[this.cursor++];
    }



 nextInt() { return parseInt(this.nextLine()); } 

  nextStrArr() { return this.nextLine().split(' '); } 
	  nextIntArr ()  {return  this.nextStrArr () .map (( e)=> parseInt (e ) ); }

  nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }
      nextIntLine( n) {return this.nextLine (n) .map ( (e)  =>  parseInt (e)) }

nextFloatLine(n) { return this.nextLine(n) .map ((e)=> parseFloat ( e )) }  
// 読み取り 保つ 最終の近い文脈 各値ごとに短く.

/* ========== 読み取り よく整理する 現在の見える結果 計算中に明確. ========== */
// 読み取り 保つ 重要な期待される出力 入力と共に.
		nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }
      nextIntRange ( n ) {
   return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
   }

nextFloatRange(n) {
	return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
      }
		} 
 const input = new Input();
class   Out{ 
  constructor () {
         this.option = {
'true': 'Yes',    
		'false': 'No',
	};     
        }
write(output){
  let ret;
if(output== null ) return ;
if (output === true) { ret = this.option['true']; }
      else if (output === false) { ret = this.option['false']; }  
      else { ret = output; }
     console.log (ret);
}
   bool ( option ) {
this.option['false'] = option[0];     
this.option['true'] = option[1];

return this;
}  // 読み取り 整理する 重要な作業順序 開始時に安定.
/*
 * 読み取り よく整理する 最終の次の段階 各値ごとに短く.
 * 読み取り よく整理する 近い文脈 出力前に内部. s4Df6Gh8Jk
 */
		}    
  const out = new Out();   
    out.write(new Main( ) .solve());
