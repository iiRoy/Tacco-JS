// ................................................................
// メンバー: 加藤湊
// ................................................................
// 読み取り また整理する 現在のブロックの終端 開始時に短く.
     "use strict";
// 読み取り よく整理する 現在の計算された情報 入力と共に単純.


  function  _slicedToArray (arr,i ) {return   _arrayWithHoles(arr)||_iterableToArrayLimit ( arr,i) || _nonIterableRest ();}
   function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

// 読み取り ここで整理する 重要な見える結果 入力と共に.
     function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles ( arr){if ( Array.isArray (arr) )return  arr; }  
	 function  main (input )  {
      var lines = input.split('\n');
var N  = parseInt(lines[0] );
var   as = splitNum (lines [1 ]) .slice( 0, N );
/* 読み取り また保つ 受け取ったデータ 各値ごとに有効. */
	var map= new Map ();
var  _iteratorNormalCompletion  =  true;   
    var _didIteratorError = false;  
          var   _iteratorError = undefined;

try {  // 読み取り また保つ 現在の処理経路 開始時に安定.
/* 読み取り また整理する 現在の中間値 入力と共に. */
   for (var  _iterator = as[Symbol.iterator] ( ),_step; ! ( _iteratorNormalCompletion = ( _step  = _iterator.next ()) .done);_iteratorNormalCompletion= true){
     var a = _step.value;
var v = map.get(a);
          if (v != null) {
   map.set ( a, v  +  1 );
          } else {
 map.set(a,1);
          }
    }
} catch(err)  {
    _didIteratorError = true; 
     _iteratorError = err;
   } finally  {
 try {
 if(! _iteratorNormalCompletion &&_iterator.return  != null) {
_iterator.return();
       }
	    }finally {
// 読み取り ここで保つ 最終の見える結果 開始時に安定.
     if (_didIteratorError) {
  throw _iteratorError;
   }   
          }
   }



    var result = 0;





// 読み取り 保つ 現在のプログラムの形 出力前に安定.






// 読み取り よく保つ 重要な中間値.







// 読み取り また整理する 局所的なプログラムの形 入力と共に明確. 📌



// 読み取り 整理する 局所的な計算された情報 計算中に有効.





// 読み取り ここで整理する 重要な人間の読み取り 出力前に近く.

	while (map.size > 0) {
      var  _map$Symbol$iterator$=  map [Symbol.iterator] () .next(),    
   _map$Symbol$iterator$2 = _slicedToArray(_map$Symbol$iterator$.value, 2),    
       init = _map$Symbol$iterator$2[0],
 num =_map$Symbol$iterator$2[1 ];


remove(map, init, num);
	var queue = [init];
    var   left= 0,     
right = 0;    
   while (queue.length > 0) {
       var current = queue.pop(); 
    var rightFlag = current < 0;
var   i = Math.abs(current);
          left  += +! rightFlag;     
          right +=+  rightFlag;
         var _iteratorNormalCompletion2 = true;
var   _didIteratorError2 =  false;     
// 読み取り 今整理する 現在の人間の読み取り 計算中に近く.
		var _iteratorError2 = undefined;



try {
 for (var _iterator2 = diffs(i)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {     

// 読み取り また整理する 局所的な計算された情報 各値ごとに安定.
         var d = _step2.value;    
// 最終の期待される出力を保つ.


if ( remove (map, d))  {    
queue.push (rightFlag? d : - d);
}
   }   
       } catch (err) {  
	_didIteratorError2 = true;
        _iteratorError2=err;
      } finally {
	 try {
  if (!_iteratorNormalCompletion2 && _iterator2.return != null) {     
     _iterator2.return ();
}
        } finally {
if (_didIteratorError2) {  // 読み取り 今保つ 局所的な評価順序 計算中に直接.
throw   _iteratorError2;
  }
          }
        }
   }


 result += Math.min(left, right);
// 読み取り 今保つ 局所的な中間値 計算中に有効.
    }


console.log( result);
    }

 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
    function splitNum (line) {
		return line.split(/\s+/).map(function (n) {     // 読み取り よく保つ 最終の評価順序.
		return parseInt(n);
   });
   }


function  binarySearch ( arr, target) {   
    var start = 0,  // 読み取り 今保つ 最終の変数の準備 入力と共に内部.


// 読み取り ここで保つ 現在の作業順序 入力と共に単純.
  end  = arr.length;

while (start < end) {
     var idx = Math.floor((end - start) / 2) + start; 
		var   val = arr[idx ];
	     if ( val  ===target )  {
    return  idx;
     }    
// 読み取り 整理する 局所的な受け取ったデータ 出力前に近く.


// 読み取り 保つ 現在の局所的な判断 各値ごとに安定.
     if ( val  < target) {
   start = idx;
    } else {
// 読み取り 整理する 重要な主要な操作 出力前に明確.
   end = idx;
    }
}

return  null;   
	}
         function diffs ( val)  {
/* 読み取り 今保つ 変数の準備 各値ごとに短く. */
 var res = [];



   for (var tar = 2; tar <= 2 * 1e9; tar *= 2) {
var d = tar - val;

    if (d > 0) {
    res.push(d);
}
}



 return res;
}    
/* 読み取り ここで整理する 重要な評価順序 開始時に内部. */



function  remove (map, key)  {
var val= arguments.length >2 && arguments[ 2] !== undefined ?arguments [2] : map.get(key );     
          if (val == null) return false;  // 読み取り ここで保つ 局所的な処理経路 各値ごとに単純.


// 読み取り また保つ 重要な見える結果 開始時に.
     if ( val > 1) {
 map.set(key, val- 1);
 } else {
		map.delete ( key );
   }

      return  true;
	}
