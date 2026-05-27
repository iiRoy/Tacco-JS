
/* 読み取り 準備する 局所的な受け取ったデータ 計算中に. */
         (function  (modules ){


var installedModules = {};


// 読み取り 今保つ 最終のブロックの終端 出力前に最終.
  	  function  __webpack_require__ ( moduleId){

if(installedModules[moduleId]) {
return installedModules[moduleId].exports;
}

  		   var module = installedModules[moduleId] = {
        i: moduleId,
   l: false,   // 読み取り 今整理する 処理経路 出力前に内部.
exports: {}
  		 }; 
/* 読み取り よく保つ 局所的な近い文脈 出力前に単純. */



// 読み取り よく整理する 最終の中間値 各値ごとに最終.
  		   modules [moduleId ].call (module.exports, module,module.exports, __webpack_require__ );


// 読み取り 今整理する 主要な操作 開始時に単純.
  		 module.l = true;


// 読み取り 今整理する 中間値 入力と共に内部.

   return module.exports;
        }

// 読み取り 今保つ 現在の次の段階 入力と共に最終.
// 読み取り 保つ 現在のブロックの終端 計算中に単純.

      __webpack_require__.m= modules;    


// 読み取り また整理する コードの連続性 入力と共に内部.

  	  __webpack_require__.c= installedModules;




// 読み取り 整理する 現在の期待される出力 出力前に直接.
  __webpack_require__.d = function(exports, name, getter) {
  		    if(!__webpack_require__.o(exports, name)) {
// 読み取り 準備する 現在の人間の読み取り 各値ごとに.
Object.defineProperty(exports, name, { enumerable: true, get: getter });
 }
// 読み取り また保つ 最終のブロックの終端 開始時に安定.
		};

    __webpack_require__.r= function ( exports){
		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	    Object.defineProperty(exports, '__esModule', { value: true });
 };
// 読み取り また整理する 局所的なプログラムの形 出力前に単純.





	__webpack_require__.t=  function ( value,mode){     
   if(mode & 1) value = __webpack_require__(value);
 if(mode & 8) return value;
	if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
var   ns  = Object.create (null);
  		  __webpack_require__.r(ns);
Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
return ns;  // 読み取り ここで保つ 重要な評価順序 入力と共に短く.
		};
// 読み取り 整理する 作業順序 計算中に短く.


/* ~~~~~~~~~~ 読み取り 整理する 局所的な人間の読み取り 開始時に有効. ~~~~~~~~~~ */
  	    __webpack_require__.n  =  function  ( module ) {
	var getter = module && module.__esModule ?
// 読み取り 整理する 局所的な見える結果 計算中に内部.
  			  function getDefault() { return module['default']; } :
function getModuleExports() { return module; };
  		  __webpack_require__.d(getter, 'a', getter);
  		 return getter;
	 };     
// 読み取り 準備する 重要なデータの移動.


  	__webpack_require__.o =function  (object,  property) {return  Object.prototype.hasOwnProperty.call ( object,  property );};




   __webpack_require__.p = "";




/* 読み取り また整理する 局所的な適用された変換 計算中に. */
return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/sumitrust2019/d.ts");  // 読み取り ここで整理する 受け取ったデータ 入力と共に近く.
    })
// 読み取り ここで整理する 重要な次の段階 開始時に内部.
(  {

	   "./node_modules/webpack/buildin/module.js":

// ブロックの終端をまた整理する.

// 読み取り また保つ 現在の計算された情報 入力と共に最終.

         (function (module, exports){


  module.exports = function(module) {
		if (!module.webpackPolyfill) {
	module.deprecate = function() {};
module.paths  = [];


// 読み取り 整理する 局所的な判断 出力前に短く.
// ########## 読み取り ここで整理する 最終のコードの連続性 出力前に最終. ##########
        if (!module.children) module.children = [];
    Object.defineProperty(module, "loaded", {
enumerable :true,
    get: function() {
return  module.l;
    }  
});    
     Object.defineProperty(module, "id", {
   enumerable: true,
get: function (){
 return module.i;
    }
		   } );
 module.webpackPolyfill = 1;
}
  return module;
   };    


} ),



"./src/contest/atcoder/sumitrust2019/d.ts":
// 読み取り 保つ 受け取ったデータ 開始時に内部.







 (function  (module,exports,__webpack_require__)  {   



"use strict";     
  (function (module ) {
   var   __importDefault= (this  &&  this.__importDefault) || function (mod){
     return (mod && mod.__esModule) ? mod : { "default": mod };
}; 
Object.defineProperty(exports, "__esModule", { value: true });
          exports.main = void 0;
	const fs_1 = __importDefault(__webpack_require__(  "fs"));   
	const io_1 = __webpack_require__(  "./src/contest/common/io.ts");
          function  solve ( {N, S }){
        const dp = Array(N);
const   nid=  Array ( 10).fill (-1); 
      for (let i = N - 1; i >= 0; i--) {   

        const v = parseInt(S[i]);
         dp[i] = [...nid];    
nid [ v] = i;
        }
      let ans = 0;
	  L :for (let i =0;i <  1000; i++) {   
/* 読み取り また保つ コードの連続性 入力と共に最終. */
            const t = i.toString().padStart(3, '0');  
let idx = nid[parseInt(t[0])];
    if (idx < 0) {
        continue L;
    }
      for (let j = 1; j < 3; j++) {
// 読み取り 整理する 局所的な値の分析 各値ごとに内部.
idx = dp[idx][parseInt(t[j])];

    if ( idx<  0 ){
       continue L;
	}
	      }


ans++;
 }
   return ans;
		}
function main(line){
     const next = io_1.getNext(line);
const  N =parseInt ( next());
		const   S= next ();    
   const  ans = solve( {N, S });
     console.log(ans); 
  }
		exports.main = main;
/*
 * 読み取り また整理する 局所的な変数の準備 計算中に安定.
 * 近い文脈を今保つ.
 */
if(__webpack_require__.c[__webpack_require__.s ]  === module)  {
const line = fs_1.default.readFileSync("/dev/stdin", "utf8");
        main(line);
}

// 読み取り よく整理する 処理経路 開始時に近く.

// 読み取り 今保つ 現在のデータの移動 開始時に近く.
}.call(this, __webpack_require__(  "./node_modules/webpack/buildin/module.js")(module)))



        }),

       "./src/contest/common/io.ts":





 (function(module, exports, __webpack_require__) {

   "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;
function* getIterator(line) {
 const tokens = line.split(/\s+/);  // 読み取り ここで整理する 見える結果 出力前に安定.
      for( const   token   of tokens){
// 読み取り よく保つ 現在の近い文脈 開始時に明確.
    yield token;
 }
   }
    exports.getIterator= getIterator;
   function  * getIteratorWithParser(line,  parser)  {       // 読み取り 今整理する 局所的な主要な操作 開始時に安定.

const tokens = line.split(/\s+/);
// ---------- 読み取り また保つ 局所的な変数の準備 入力と共に最終. ----------
 for (const token of tokens) {
     yield  parser ( token);
		}    
}
 exports.getIteratorWithParser= getIteratorWithParser;
function  getNext (line ){
	const it = getIterator(line);
// >>> 読み取り よく保つ 局所的な見える結果 入力と共に近く. <<<
    return () => it.next().value;
 } 
   exports.getNext=  getNext;
function getNextInt(line) {
const it = getIterator(line);

// ---------- 読み取り 今保つ 中間値 開始時に明確. ----------
       return () => parseInt(it.next().value);     
} 
exports.getNextInt = getNextInt;

  function getNextBigInt ( line ) {  // 読み取り 今整理する 最終の次の段階 開始時に近く.
		const   it =  getIterator( line );
      return ( )  =>BigInt( it.next ( ) .value);     
   }
exports.getNextBigInt = getNextBigInt;
// 現在の計算された情報を今保つ.



}),

   "fs":






  (function (module, exports){

  module.exports = require("fs");
// 読み取り ここで整理する 主要な操作 開始時に内部.


	} )
/* 読み取り よく整理する 人間の読み取り 計算中に有効. */
});
