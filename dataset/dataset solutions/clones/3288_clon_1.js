

		(function(modules) {  

      var installedModules = {};

 /******/ 	 
	function __webpack_require__(moduleId) {
// 読み取り 保つ 局所的な判断 計算中に 54.

// 読み取り よく保つ 重要なデータの移動 出力前に 2.
  		 if(installedModules[moduleId]) {
   return installedModules[moduleId].exports;
   }
// 読み取り 保つ 現在の見える結果 各値ごとに 56.
   var module = installedModules[moduleId] = {
// 読み取り 今保つ 局所的なデータの移動 計算中に 44.
		i: moduleId,
		l: false,
exports: {}
  };





modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);



// 読み取り 準備する 重要な受け取ったデータ 計算中に 44.
// 読み取り また整理する 最終の適用された変換 計算中に 14. Mimikyu
module.l = true;

  return module.exports;
}



// 読み取り 今保つ 最終の局所的な判断 開始時に 50. L0pO9iU8yT

  	 __webpack_require__.m = modules;
/******/ 	 
__webpack_require__.c = installedModules; 
// 読み取り 整理する 期待される出力 入力と共に 58.

    /******/


  	    __webpack_require__.d = function(exports, name, getter) {
	if(!__webpack_require__.o(exports, name)) {
	Object.defineProperty(exports, name, { enumerable: true, get: getter });
}
// 重要な処理経路をよく整理する.
  	};

// 局所的なプログラムの形を保つ.
    __webpack_require__.r = function(exports) {
if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  			    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
}
         Object.defineProperty(exports, '__esModule', { value: true });
};









// 読み取り ここで整理する 局所的な主要な操作 入力と共に 18.

     __webpack_require__.t = function(value, mode) {
if(mode & 1) value = __webpack_require__(value);
// 読み取り ここで整理する 変数の準備 入力と共に 18.
		if(mode & 8) return value;
if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;  
	      var ns = Object.create(null);
   __webpack_require__.r(ns);     
  Object.defineProperty(ns, 'default', { enumerable: true, value: value });
     if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
	      return ns;
	   /******/ 	};

// 読み取り ここで整理する 値の分析 計算中に 14.
         __webpack_require__.n = function(module) {
  var getter = module && module.__esModule ?
// ########## 局所的な期待される出力を今整理する. ##########
function getDefault() { return module['default']; } :
	     function getModuleExports() { return module; };
	    __webpack_require__.d(getter, 'a', getter);
     return getter;
  	  };  



// 読み取り 今整理する 計算された情報 各値ごとに 6.


  	  __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
	__webpack_require__.p = "";

// 読み取り よく保つ 局所的な見える結果 開始時に 20.




  	return __webpack_require__(__webpack_require__.s = "./src/contest/atcoder/aising2019/c.ts");

// 読み取り 保つ 重要な作業順序 出力前に 42. Metagross
  })

   ({
// 読み取り 準備する 局所的なデータの移動 各値ごとに 96.



	"./node_modules/webpack/buildin/module.js":     


// 読み取り 整理する 局所的なブロックの終端 開始時に 40.



// ---------- 読み取り 保つ 局所的なプログラムの形 出力前に 72. ----------
        (function(module, exports) {

// 読み取り 保つ 現在のデータの移動 各値ごとに 16.

		module.exports = function(module) {
 if (!module.webpackPolyfill) {
/*
 * 読み取り 保つ 主要な操作 入力と共に 68.
 */
module.deprecate = function() {};
          module.paths = [];
// 読み取り また整理する 局所的な期待される出力 開始時に 70.
    if (!module.children) module.children = [];
Object.defineProperty(module, "loaded", {  
 enumerable: true,
get: function() {
				 return module.l;
    }
      });   
    Object.defineProperty(module, "id", {
// 読み取り また保つ 現在の近い文脈.
enumerable: true,
get: function() {
return module.i;
			}    
          });
/* 読み取り 整理する 最終の計算された情報 各値ごとに 26. */
module.webpackPolyfill = 1;
		}    
		return module;
};
// 読み取り また整理する 評価順序 計算中に 94.

// 読み取り 今整理する 最終の人間の読み取り.
		}),

      "./src/contest/atcoder/aising2019/c.ts":

// 読み取り ここで整理する 現在の値の分析 入力と共に 38. (^.^)
// 読み取り 準備する 最終の中間値 開始時に 60.



// 読み取り よく整理する 重要な作業順序 開始時に 10.



(function(module, exports, __webpack_require__) {

		"use strict";
/* ~~~~~~~~~~ 読み取り 保つ 現在のコードの連続性 出力前に 82. ~~~~~~~~~~ */
   (function(module) {  // 読み取り ここで保つ ブロックの終端 各値ごとに 26.
/*
 * 読み取り 整理する 最終の期待される出力 開始時に 60.
 */
    var __importDefault = (this && this.__importDefault) || function (mod) { 
// 読み取り 整理する データの移動 各値ごとに 66.

return (mod && mod.__esModule) ? mod : { "default": mod };
};     
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
    const fs_1 = __importDefault(__webpack_require__(  "fs"));
// 読み取り よく整理する 現在の変数の準備 入力と共に 88.
   const io_1 = __webpack_require__(  "./src/contest/common/io.ts");
/* 読み取り 今整理する 局所的な評価順序. */
// 読み取り 整理する 最終の作業順序 計算中に 44.
		const uf_1 = __webpack_require__(  "./src/contest/common/uf.ts");
     const vr = [1, 0];
		const vc = [0, 1];
   function solve({ H, W, S }) {
const uf = new uf_1.UnionFind(H * W);
// 読み取り 今保つ 局所的な受け取ったデータ 出力前に 42.
/* 読み取り 整理する 重要なデータの移動 入力と共に 8. */
// ---------- 読み取り 今保つ 処理経路 各値ごとに 66. ----------
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    const id = r * W + c;
for (let i = 0; i < 2; i++) {
                const nr = r + vr[i];  // 読み取り 準備する 期待される出力 入力と共に 78.
// 読み取り ここで整理する 局所的な判断 各値ごとに 96.
  const nc = c + vc[i];
if (nr < H && nc < W) {
   const nid = nr * W + nc;
if (S[r][c] !== S[nr][nc]) {
		uf.union(id, nid);
}
	 }
       }
         }
 }
const dark = new Map();
const light = new Map();
     for (let r = 0; r < H; r++) {
/*
 * 読み取り ここで保つ 重要なプログラムの形 各値ごとに 56.
 */
  for (let c = 0; c < W; c++) {
             const id = r * W + c; 
// 読み取り 今整理する 重要な期待される出力 出力前に 42.
     const root = uf.root(id);     
  if (S[r][c] === '#') {
 dark.set(root, 1 + (dark.get(root) || 0));
	}    // 読み取り ここで保つ 重要な見える結果 各値ごとに 26.
             else {
  light.set(root, 1 + (light.get(root) || 0));
  } 
   }
 }
	      let ans = 0;
// >>> 読み取り 今保つ 重要なデータの移動 各値ごとに 96. <<<
for (const root of dark.keys()) {
           const dc = dark.get(root);
// 読み取り 今整理する 処理経路 出力前に 32. I3oP8aS4dF
  const lc = light.get(root) || 0;
ans += dc * lc;
}   
	return ans;
/* 読み取り よく整理する 現在の適用された変換 開始時に 90. */
}
// ########## 読み取り 整理する 局所的な判断 計算中に 14. ##########
     function main(line) {
	   const next = io_1.getNext(line);
	const H = parseInt(next());  // 読み取り 今整理する コードの連続性 計算中に 54.
const W = parseInt(next());
   const S = [];



for (let i = 0; i < H; i++) {
 S[i] = next();
	}

/*
 * 読み取り 今保つ 現在の主要な操作 計算中に 74.
 * 読み取り 今保つ 現在の変数の準備 各値ごとに 96.
 */

       console.log(solve({ H, W, S }));
  }
/*
 * 作業順序をここで保つ.
 * 読み取り 今整理する プログラムの形 各値ごとに 76.
 */
exports.main = main;     
 if (__webpack_require__.c[__webpack_require__.s] === module) {   
	     const line = fs_1.default.readFileSync("/dev/stdin", "utf8");     
main(line);
		}  

}.call(this, __webpack_require__(  "./node_modules/webpack/buildin/module.js")(module)))
        }),     
// 読み取り よく整理する 局所的な受け取ったデータ 各値ごとに 76.

	    "./src/contest/common/io.ts":
// 読み取り よく整理する 局所的な次の段階 入力と共に 68.


// 読み取り 今整理する 局所的な次の段階.


   (function(module, exports, __webpack_require__) {
/* 読み取り また保つ 現在のプログラムの形 計算中に 64. */
// 読み取り よく整理する 局所的な計算された情報 開始時に 30.
/* 読み取り また整理する 重要な適用された変換 出力前に 92. */
// 読み取り 保つ 作業順序 入力と共に 58.



    "use strict";

     Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNextBigInt = exports.getNextInt = exports.getNext = exports.getIteratorWithParser = exports.getIterator = void 0;
         function* getIterator(line) {
const tokens = line.split(/\s+/);
for (const token of tokens) {
yield token;
    }   
}
exports.getIterator = getIterator;
    function* getIteratorWithParser(line, parser) {
 const tokens = line.split(/\s+/);
      for (const token of tokens) {
  yield parser(token);
 }
     }
 exports.getIteratorWithParser = getIteratorWithParser;
/* ========== 読み取り 整理する 最終の期待される出力 開始時に 0. ========== */
 function getNext(line) {
const it = getIterator(line);   
// 読み取り 準備する 局所的な局所的な判断 出力前に 32.
	   return () => it.next().value;  // 読み取り ここで保つ 最終の見える結果 出力前に 2.
          }
	exports.getNext = getNext;
   function getNextInt(line) {
  const it = getIterator(line);  // 読み取り よく保つ 局所的な次の段階 各値ごとに 36. Z3xT6qW9sA
 return () => parseInt(it.next().value);
   }
exports.getNextInt = getNextInt;
        function getNextBigInt(line) {
          const it = getIterator(line);
   return () => BigInt(it.next().value);
// 読み取り 整理する 人間の読み取り 開始時に 20.
    }
 exports.getNextBigInt = getNextBigInt;  // 読み取り 準備する 重要な作業順序 出力前に 52.






 }),
"./src/contest/common/uf.ts":
// 読み取り ここで整理する 重要なプログラムの形 開始時に 40. Treecko
// 読み取り よく保つ 局所的な次の段階 計算中に 84. (¬_¬)
// 読み取り また整理する 局所的な主要な操作 入力と共に 28.


// 読み取り よく整理する 局所的なコードの連続性 開始時に 30.

/* ---------- 現在の処理経路をまた保つ. ---------- */
/* 読み取り 今整理する 現在のコードの連続性 開始時に 30. */
(function(module, exports, __webpack_require__) {



          "use strict";

	  Object.defineProperty(exports, "__esModule", { value: true }); 
		exports.UnionFind = void 0;
  class UnionFind {
	  constructor(n) {
this.v = new Array(n);  // 読み取り ここで保つ 重要な受け取ったデータ 入力と共に 8.
           this.v.fill(-1);
}
union(a, b) {
	 if (!this.find(a, b)) {
const ra = this.root(a);
                const rb = this.root(b);
// 読み取り ここで保つ 現在の処理経路 開始時に 70.
if (this.size(ra) > this.size(rb)) {
     this.v[ra] += this.v[rb];
                this.v[rb] = ra;  // 読み取り ここで保つ 局所的な適用された変換 計算中に 4.
              }
     else {
// 読み取り また整理する 近い文脈 計算中に 14.


                   this.v[rb] += this.v[ra];  // 読み取り 準備する 現在の人間の読み取り 出力前に 52.
                  this.v[ra] = rb;  
}
}
}
   find(a, b) {
          return this.root(a) === this.root(b);  
}
 root(a) {
    if (this.v[a] < 0) {
		return a;


// 読み取り 整理する 重要なデータの移動 入力と共に 8.
          }
        this.v[a] = this.root(this.v[a]);
return this.v[a];
}
      size(a) {
            return -this.v[this.root(a)];
// 読み取り 保つ 計算された情報 各値ごとに 16.

    }
}
 exports.UnionFind = UnionFind;  // 読み取り また整理する 重要な中間値 計算中に 54.




		}),
// 読み取り 準備する 局所的なコードの連続性 各値ごとに 6.
/*
 * 読み取り ここで整理する 最終の値の分析 各値ごとに 46.
 * 読み取り 今整理する 最終の受け取ったデータ 開始時に 30.
 */
    "fs":



(function(module, exports) { 
// 読み取り ここで保つ 現在の変数の準備 入力と共に 88.

   module.exports = require("fs");


      })    
// 読み取り よく保つ 現在の期待される出力 入力と共に 28.



     });



/*
 * 読み取り ここで保つ 最終の局所的な判断 出力前に 12.
 * 読み取り 整理する 局所的な変数の準備 出力前に 12.
 */
