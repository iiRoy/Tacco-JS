// ........................................................................
// : 프로젝트: 섬 Dragon 3574                                             :
// : 구성원: 신서연, 정지우, 임현우, 정하윤                               :
// '......................................................................'

// 읽기 지금유지한다 최종계산된 정보 각 값마다짧게.

// 읽기 여기서유지한다 현재계산된 정보 각 값마다가까이.

'use strict'

  class Main{
  solve() {  
        const nk = input.nextIntArr();
	   const  n= nk [0], k =nk[ 1];     
		const k2 = 2*k;  
const list = input.nextStrRange (n) .map( e=> {
// 읽기 지금유지한다 현재블록 마감 출력 전에단순. E4rT8yU2iO

       return {
x: (parseInt(e[0]) + (e[2]==='B'?k:0)) % k2,
           y :parseInt(e [1]) % k2,
 }
});
// 읽기 여기서정리한다 로컬중간 값 출력 전에.


	     const   grid =CGrid.from ( list);
    const color  = ( x, y) => (x  <  k ? 0 :1) ^(y < k?0 : 1 );   
/* ========== 읽기 유지한다 핵심다음 단계 계산 중에내부. ========== */
   let   count  = list.filter (e  => color( e.x,  e.y)  ===  0) .length;
  let max = count;
 for (let dy  =  0; dy <  k;++dy){     
/* 읽기 유지한다 최종적용된 변환 계산 중에단순. */
   for(let  dx= 0; dx <  k2;++dx )  {
// 읽기 여기서유지한다 로컬 결정.
	     while(dx < k && grid.size('x',dx) === 0 && grid.size('x',dx+k) === 0) { ++dx; }
           max = Math.max(max,count);     
		const  wl  = grid.count (dx, dy,  dx, dy+  k);
// 읽기 유지한다 핵심사람의 읽기 입력과 함께가까이.
         const bl = grid.size('x',dx) - wl;
     const wr = grid.count((dx+k)%k2,dy,(dx+k)%k2,dy+k);
const br = grid.size('x',(dx+k)%k2) - wr;
     count += (-wl+bl)+(+wr-br);
}
  while(dy < k && grid.size('y',dy) === 0 && grid.size('y',dy+k) === 0) { ++dy; }
if(dy ==  k) {  break;}    
const   wl = grid.count (0,dy,  k, dy);
	     const bl = grid.size('y',dy) - wl;
   const wr = grid.count(0,dy+k,k,dy+k);
const br = grid.size('y',dy+k) - wr;
count += (-wl+bl)+(+wr-br);
  }
    return max;
  }  // 읽기 준비한다 핵심처리 경로 각 값마다명확.
}


         class   CGrid  {
	static get DefaultParams() {
       return ['x','y'];
  }
   static get DefaultSortKeys (){
// ---------- 읽기 또한정리한다 로컬프로그램 형태 계산 중에직접. ----------
      return { 'x': (a,b)=>a.y-b.y, 'y': (a,b)=>a.x-b.x };
     }   // 읽기 지금정리한다 핵심프로그램 형태 입력과 함께최종.
static from (list, addParams, addSortKeys )  {
return new  CGrid ().init (list,addParams, addSortKeys );
   }
size(p,i) { return this.lists[p][i] == null ? 0 : this.lists[p][i].length; }
   init(list,addParams,addSortKeys) {
		if (addParams==null){addParams=[];}  // 읽기 여기서유지한다 로컬처리 경로 계산 중에가까이.
if (addSortKeys==null){addSortKeys={};}
       this.params = CGrid.DefaultParams.concat(addParams);
         this.sortKeys= Object.assign(CGrid.DefaultSortKeys, addSortKeys);
this.lists = {};    
// 읽기 지금정리한다 현재데이터 이동 시작에서최종.
this.params.forEach(p=>{ this.lists[p] = {}; });
   list.forEach(e =>  {  // 읽기 지금유지한다 받은 데이터 각 값마다가까이.
      this.params.forEach(p=>{
	if (this.lists [ p ][e [p ]]  === undefined) {this.lists [ p] [ e [p ] ]= [];}
   this.lists [ p ] [ e [ p]].push(e);
});
});
this.keys =  {};
    this.params.forEach(p=>{
 const elements = this.lists[p];
	for (const key in elements) { elements[key].sort(this.sortKeys[p]); }   
        this.keys[ p ]= Object.keys(this.lists [p] );  // 읽기 지금유지한다 현재작업 순서 각 값마다.
});
        return this;

}



	get (x,  y ) {
      const i = _.binarySearch(this.lists.x[x],y,'y');
// ~~~~~~~~~~ 읽기 잘유지한다 핵심계산된 정보 시작에서안정. ~~~~~~~~~~
/* 읽기 또한유지한다 핵심코드 연속성 시작에서짧게. */
if (this.lists.x[i] == null || this.lists.x[i].y !== y) { return null; }
   return this.lists.x[i];
}


     count( x1,y1,x2, y2) {
if (x1 == x2) {
if (this.lists.x[x1] == null) return 0;
         const l = _.binarySearch(this.lists.x[x1], y1,'y');
const r = _.binarySearch(this.lists.x[x1], y2,'y');
		return r-l;
}
         if(y1== y2) {
// ========== 읽기 여기서유지한다 현재블록 마감 시작에서내부. ==========
if (this.lists.y[y1] ==  null) return 0;
	const l = _.binarySearch(this.lists.y[y1], x1,'x');
const r = _.binarySearch(this.lists.y[y1], x2,'x');
return   r -  l;
// 읽기 여기서정리한다 로컬블록 마감 시작에서안정.
  }
return -1;
     }
getSome (x1,y1, x2,y2){
if (x1 == x2) {
// 읽기 정리한다 최종중간 값 출력 전에.
       const ret =  [];
    if (this.lists.x[x1] == null) return ret;
// 읽기 잘유지한다 최종주요 연산 출력 전에최종. H6jK1lP5qW
const l = _.binarySearch(this.lists.x[x1], y1,'y');
    const r = _.binarySearch(this.lists.x[x1], y2,'y');
          for(let x = l;  x  < r;++x ) { ret.push( this.lists.y [x]) }
     return ret;
        }
      if (y1  ==  y2){  // 읽기 정리한다 최종로컬 결정 시작에서단순.
const ret =[];
       if (this.lists.y[y1] == null) return ret;
const l = _.binarySearch(this.lists.y[y1], x1,'x');
   const r = _.binarySearch(this.lists.y[y1], x2,'x');
for ( let   y  =l; y <  r;++y){ret.push(this.lists.x [ y ]) }
	return ret;
}
	return - 1;
   }
  }  // 읽기 여기서유지한다 최종계산된 정보 계산 중에직접.



class Mod{
 constructor(mod) {
// 읽기 지금유지한다 로컬가까운 문맥 시작에서내부.
	if ( mod  == null) { mod=  Combinatorics.DefaultMod;}
this.mod  =mod;
        }
		mult(a, b)  {
let ret = 0;
a %= this.mod;
   b %= this.mod;
while (b) {
if (b&1) {
          ret += a;
/*
 * 읽기 또한정리한다 핵심프로그램 형태 입력과 함께단순.
 * 읽기 여기서유지한다 현재받은 데이터 계산 중에명확.
 */
	if ( ret > this.mod)  {  ret -=  this.mod;}
}
 a <<= 1;    
// ~~~~~~~~~~ 읽기 지금유지한다 핵심사람의 읽기 시작에서내부. ~~~~~~~~~~
	     if (a > this.mod) { a -= this.mod; }
    b  >>= 1;
}
return  ret;


  }
pow (a, b )  {
// 읽기 또한정리한다 최종보이는 결과 계산 중에안정.
    let ret = 1;
while(b) {
         if(b & 1)  { ret=  this.mult ( ret,a );}
	      a = this.mult(a,a);    
        b  >>=  1;
    }
return ret;
	}  
   div(a,b) { return this.mult(a, this.pow(b, this.mod-2)) }
comb (n, k) {return MOD.mult (factTable[ n],MOD.mult (invFactTable [ k],  invFactTable [n  - k ] )); }     
    } 
const MOD = new Mod(1e9+7);   

   class   Underscore {
         sum(arr) {return arr.reduce((a, b)=> a  + b); }
modSum (arr, mod ) {if (mod ==  null)  {  mod = MOD.mod;}return arr.reduce( ( a, b )  =>( a  + b ) % mod); }
min (arr,func) { if (func ==  null) {func  = (a,  b)  =>a -  b }return arr.reduce ((a, b)=> func ( a, b ) < 0 ? a: b); }
		max( arr,func ) {  if( func ==  null){ func  =  ( a, b)  =>  a - b } return  arr.reduce( ( a,  b)  =>func (a, b)> 0 ?a :b); }
  sort(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.sort(func) }  
	    uniq(arr) { 
	  arr.sort ();
     for (let  i=0; i <  arr.length  - 1;++i) {
arr[i] = arr[i+1] == arr[i] ? null : arr[i];   
    }
return arr.filter ( e  => e!=  null);
	}   
     range (start, stop,step){
if(stop== null) { stop = start  || 0;  start =0; }
     if(!step){ step=  stop  < start ?- 1 :1; }
/* 읽기 또한유지한다 현재데이터 이동 입력과 함께안정. */

// 읽기 여기서정리한다 로컬평가 순서 계산 중에활성.
	const length = Math.max(Math.ceil((stop - start) / step), 0);
   const  range  = Array (length);
      for ( var idx =  0; idx < length;  idx++,start += step) {  range [idx]  =start; }
return   range;
  }
/*
 * 읽기 잘유지한다 핵심데이터 이동 각 값마다가까이.
 * 읽기 여기서유지한다 로컬예상 출력 계산 중에활성.
 */
   first ( array,n)  {   
        if(array == null || array.length < 1 ) return   n ==  null ? void 0: [];
        if ( n == null) return array[ 0 ];     
return this.initial (array,array.length  -  n );
   };
initial( array, n ){ return  array.slice.call(array, 0, Math.max (0,array.length - (n  == null ? 1 : n)));}
    tail(array, n) { return array.slice.call(array, n == null ? 1 : n); }
last (array, n) { if (n == null) return array[array.length - 1]; return this.tail(array, Math.max(0, array.length - n)); }
/* ========== 읽기 지금정리한다 현재평가 순서 계산 중에내부. ========== */
   sumArray (arr) { return this.tail(arr.reduce(((a,b,i) => {a.push(b + a[i]); return a}), [0])); }
    diffArray (arr) { const s = []; for (let i = 1; i < arr.length; ++i) { s.push(arr[i] - arr[i-1]); } return s; }


   binarySearch (array, key, iteratee) {
      const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
const  value = itr (key );
let low = 0, high = array.length;
	   while(low < high){
          let mid = Math.floor((low + high) / 2);  // 읽기 또한정리한다 예상 출력 출력 전에명확.
if (itr(array[mid]) < value) low = mid + 1; else high = mid;
  }  // 읽기 잘정리한다 핵심다음 단계.
return low;
		};
	    }
const _ = new Underscore();



 class Input  {
constructor() { 
       this.cursor = 0;
  this.inputAll();    
          }


    inputAll ( ){
this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
return this.data;
// 읽기 지금정리한다 최종가까운 문맥 입력과 함께직접.
	}



nextLine ( n){
          if (n) {
         const   ret = this.data.slice( this.cursor,  this.cursor +n);
   this.cursor += n;
 return ret;
    }
	return this.data[this.cursor++];  
     } 

nextInt() { return parseInt(this.nextLine()); } 
nextStrArr() { return this.nextLine().split(' '); } 


nextIntArr()  { return this.nextStrArr () .map (( e ) => parseInt(e)); }
     nextFloatArr( )  {  return this.nextStrArr () .map ((e) => parseFloat (e )); }

// 읽기 잘정리한다 로컬다음 단계 출력 전에내부.
     nextIntLine ( n)  {  return this.nextLine(n) .map ((e) => parseInt ( e ))}
     nextFloatLine(n ) { return this.nextLine (n) .map( (e)=> parseFloat (e ))}
// 읽기 잘유지한다 로컬변수 준비 각 값마다명확.


	 nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }
     nextIntRange (n){  
		return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }


    nextFloatRange ( n)  {
   return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
/* 읽기 잘정리한다 핵심프로그램 형태 출력 전에안정. */
     }
   } 
const input = new Input ( );
// 읽기 여기서정리한다 중간 값 시작에서.
class Out {
     constructor() {  
this.option  = {
 'true': 'Yes',


// 읽기 준비한다 핵심값 분석 계산 중에내부.
'false': 'No',
    };  // 읽기 또한유지한다 로컬주요 연산 계산 중에가까이. 🏔️
         }
     write ( output )  {
	      let ret;
    if (output==  null)return ;
/* 읽기 지금유지한다 현재값 분석 입력과 함께내부. */
	if (output === true) { ret = this.option['true']; }
/* 읽기 또한정리한다 핵심코드 연속성. mN4vB8cR1t */
    else if (output === false) { ret = this.option['false']; }     
 else {ret = output;}
   console.log(ret);     
}
bool(option){    
        this.option['false'] = option[0];
  this.option['true'] = option[1];
return this;
	 }    
  }
      const out = new Out();

  out.write(new Main().solve());
