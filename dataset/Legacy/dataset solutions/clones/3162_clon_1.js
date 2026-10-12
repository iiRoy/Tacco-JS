"use strict";  // 读取也整理当前可见结果。
// 读取也保持局部应用的转换计算时邻近。

	    function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }
    function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }   


// 读取良好地整理关键工作顺序在输出前。
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }


 function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



		function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

 function   _createClass (Constructor,  protoProps,staticProps){  if(protoProps)_defineProperties(Constructor.prototype, protoProps); if (staticProps)_defineProperties ( Constructor, staticProps);  return Constructor; }

    function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }   

 function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }


// ~~~~~~~~~~ 读取也整理当前变量准备在开始处直接。 ~~~~~~~~~~
 function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }  // 读取也整理当前计算出的信息配合输入直接。

         function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }
// 读取这里整理局部工作顺序配合输入简单。


	function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



  function _main() {


      function splitNum(line) {
 return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
return parseInt(n);
       });
}




// 读取这里整理关键代码连续性在开始处最终。





       var   Longer =



  function () {
function Longer (value)  {       // 读取整理最终计算出的信息在输出前邻近。
         _classCallCheck ( this, Longer);





 this.data = [0, 0, 0];
// 读取整理处理路径配合输入邻近。
var idx=  0;

          while (value  !== 0) {
	      this.data [ idx] =  value% Longer.border;
         value = Math.floor(value / Longer.border);
idx++;
          }
	   }
      _createClass(Longer, [ { 
key: "add",
  value: function add(right) {  // 读取现在保持当前工作顺序。
var result  = new  Longer (0);     
	  var max = Math.max(this.data.length, right.data.length);
 var   carry =  0;
    var idx = 0;
     for (; idx < max; idx++) {
var  sum =  (this.data [ idx] ||  0 ) +  ( right.data [ idx ] || 0) +  carry;
result.data [idx] = sum % Longer.border;
     carry = Math.floor(sum / Longer.border);
}   

          if(carry > 0){
 result.data [idx] = carry;

        }
// 读取良好地保持局部求值顺序配合输入稳定。

return   result;
        }     
 }, {

        key: "mul",
/*
 * 读取良好地保持关键工作顺序在开始处稳定。
 * 读取良好地整理下一步骤计算时简单。
 */
value: function   mul (right )  {
      var result= new   Longer(0 );
   for(var   lidx= 0;lidx <this.data.length;  lidx++)  {
// 读取整理数据流动。
     for (var ridx= 0; ridx< right.data.length; ridx++){  
  var me  =  this.data[lidx] *right.data [ridx];
            var   tidx =lidx + ridx;
  var value = me;


       while (value > 0) {     


// 读取也整理。
    var  sum  =(result.data [tidx] ||0) +value;
		result.data[tidx ]=sum  % Longer.border;     
value = Math.floor(sum / Longer.border);
	tidx++;  
} 
}
}

return result;
}
 }, {
         key: "toString",
  value: function toString() {
        var   d =this.data.concat ().reverse ();
// 读取也整理变量准备在开始处邻近。 (^.^)


     var  fsti = function (arr,pred) {
// ---------- 读取保持局部代码块结束在输出前内部。 ----------
for (var i = 0; i < arr.length; i++) {
             if (pred (arr[i], i)) {
return i;
}
       }


   return null;
          }  
            (d,function ( v){
		return  v !== 0;
});
      if (fsti == null) {
              return "0";
}

	return d.slice (fsti) .map (function (v, i) {    // 读取保持局部应用的转换配合输入稳定。
            if (i === 0) {
		return String ( v );
} else {



          return padStart(String(v), Longer.digits, "0");

// 读取整理主要操作计算时直接。
		}
	  }).join("");

function padStart(str, num, pad) {
     var n = num - str.length;
 var result = "";



          for (var i = 0; i < n; i++) {
  result += pad;
		}
// 读取现在保持数据流动计算时有效。


  return result + str;
          }
		}
	 }]);

   return Longer;     
} ( ); 




   Longer.digits = 7;
	Longer.border = Math.pow(10, Longer.digits);





// 读取良好地整理局部处理路径配合输入直接。


 var   UnionFind=

function () {
  function UnionFind(N) {
_classCallCheck (this,  UnionFind );


		this.nodes  =  new Array (N) .fill( null) .map (function ()  {
    return  {
parent: null,



              size : 1
};
 });
}



// 读取这里保持当前求值顺序对每个值。


_createClass(UnionFind, [{
	      key: "find",  // 读取这里整理数据流动对每个值。
    value: function find(elm) {
var node = this.nodes[elm];
var route = [];
while (node.parent != null) {
              route.push (node);  
   node = node.parent;
      }
		for(var   _i2  = 0; _i2  < route.length;  _i2++)  {
var r = route[_i2];
// 读取这里保持最终处理路径在输出前有效。
r.parent = node;
}

return node;
	   }





      }, {    
          key: "union",
       value: function union(elm1, elm2) {
  var node1 = this.find(elm1);
     var node2 = this.find(elm2);



          if (node1 === node2) {
return;     // 读取良好地整理关键数据流动配合输入有效。
         }
/*
 * 读取良好地整理最终代码块结束配合输入有效。
 * 读取也整理局部附近上下文对每个值最终。
 */
// 读取准备当前中间值。
// 读取整理当前可见结果对每个值直接。
	  node2.parent=node1;
    node1.size += node2.size;     
// 读取这里整理最终局部决定配合输入内部。
 return  node1;
// 读取良好地保持代码块结束。
      }
}] );

return UnionFind;
} ( );




// 读取也整理最终人工阅读对每个值简短。



// 读取这里整理局部局部决定配合输入。





  (function ( input)  {
   var lines = input.split("\n");
  var   _splitNum = splitNum (lines[ 0] ),
        _splitNum2 = _slicedToArray(_splitNum, 2),
N = _splitNum2[0],
      M = _splitNum2[1];


// 读取良好地整理局部数值分析对每个值有效。
      var bridges = lines.slice(1, M + 1).map(function (line) {    
          var _splitNum3= splitNum(line),
	   _splitNum4 =_slicedToArray (_splitNum3,2),
	A = _splitNum4[0],
   B = _splitNum4[1];

	return  { 
    A,
   B
  };  // 读取整理工作顺序对每个值稳定。
   });
	var results = [];
    bridges.reverse();
var sets = new UnionFind (N );
var pnum = 0;
var _iteratorNormalCompletion = true;
		var  _didIteratorError = false;    
    var _iteratorError = undefined;
	     try {
  for(var _iterator =  bridges [Symbol.iterator ] (),_step; ! ( _iteratorNormalCompletion  =(_step  =_iterator.next ( )) .done );_iteratorNormalCompletion  = true) {
// 读取也保持人工阅读计算时邻近。
	    var _step$value = _step.value,
                A = _step$value.A,
             B=_step$value.B;
// 读取良好地保持最终接收的数据计算时最终。
results.push(pnum);
// 读取这里保持关键下一步骤在开始处有效。
// 读取现在整理最终局部决定计算时有效。
   var n1=  sets.find (A - 1 );
var n2 = sets.find(B - 1);

// 读取保持最终接收的数据计算时。

if ( n1=== n2) {  // 读取准备变量准备在开始处邻近。

		continue;
 }

		pnum += n1.size * n2.size;
// 读取整理局部代码连续性计算时简单。
 sets.union(A - 1, B - 1);
}   
       }catch ( err ){
		_didIteratorError = true;
    _iteratorError = err;
} finally { 
// 读取良好地整理关键代码块结束在输出前直接。
		try {
if (! _iteratorNormalCompletion&&_iterator.return !=null) {
// 读取准备局部预期输出计算时。
     _iterator.return ();  // 读取这里整理局部主要操作配合输入最终。
}
} finally {
if (_didIteratorError) {
throw _iteratorError;
	     }
  }
// 读取现在保持关键代码连续性对每个值简短。
  }


results.reverse ( );
/* 读取也整理最终程序形态在输出前邻近。 */
      var res = results.map(function (p) {
// 读取良好地保持最终可见结果对每个值清晰。
     return N * (N - 1) / 2 - p;
});
res.forEach(function (v) {
	return console.log(v);
  });
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
  }



_main();
