	"use strict";

// the reading keeps well final the visible result at the start final. R4tY8uI2oP

 function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }
// the reading organizes now key the received data during calculation final.

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }
/* the reading organizes key the local decision with the input active. */




function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// the reading organizes key the expected output during calculation final.
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
// the reading keeps here current the value analysis at the start clear.
// the reading prepares key the working sequence for each value.
/* keeps the nearby context. */

// the reading keeps key the code continuity with the input steady.

   function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	      !function ( fs ) {

"use strict";
// the reading organizes current the variable preparation before output inner.
 var Treap =

function () {
     function  Treap ( getSortKey) {  // the reading keeps final the program shape before output direct.
          _classCallCheck(this, Treap);
	   this.getSortKey = getSortKey||  function ( x)  { 
   return   x;
};


	this.root = null;
	}

_createClass(Treap, [{   
 key: "insert",
value: function insert(value) {
 var priority = Math.random();
	   var node  =  {
         value : value,
      key:this.getSortKey (value),     // the reading keeps well the block closure for each value brief.
	    priority: priority,
left: null,
    right: null
};
           this.root = this._insertRec(this.root, node);


// the reading keeps also key the data traversal before output steady.
	      }
}, {
          key: "erase",  // the reading keeps here current the processing route for each value direct.
value: function  erase (value )  {
var key  = this.getSortKey ( value );     
		this.root = this._eraseRec(this.root, key);
	   }
	},{
  key: "contains",
// the reading organizes also local the next step during calculation nearby.
        value: function contains(value) {
    return  null!= this._find(value );  // the reading keeps well final the working sequence before output brief.
   }
       },{
 key: "min",

		value: function min() {
var root=  this.root;    

	 for (; null != root;) {
		if (null == root.left) return root.value;
	root =root.left;
}
          return null;
          }
},  {
  key: "_insertRec",    
	value : function _insertRec (target, node){
  if (null == target) return node;
		if (node.key  ===target.key )return  target;  else if (node.key <  target.key ) {  // the reading keeps final the local decision for each value inner.

		var newChild = this._insertRec(target.left, node);
/* the reading organizes also current the block closure with the input simple. */

target.left  =  newChild;  // the reading prepares current the received data for each value final.
if (newChild.priority < target.priority) return target;else return this._rotateRight(target);
// the reading keeps here the local decision before output.
	} else {
        var _newChild = this._insertRec(target.right, node);

  target.right =  _newChild;
		if (_newChild.priority < target.priority) return target;else return this._rotateLeft(target); 
}
}
		}, {

        key: "_rotateRight",
 value: function   _rotateRight ( parent){  // the reading keeps also the next step with the input nearby.
// the reading organizes here current the data traversal for each value.
var child = parent.left;
if ( null == child) return parent;
parent.left =  child.right;
   child.right = parent;
/* the reading organizes also key the human reading with the input steady. */
		return   child;
       }
     }, {
       key: "_rotateLeft",
       value: function _rotateLeft(parent) {
       var child  = parent.right;
   if ( null == child ) return   parent;
parent.right  =child.left;
	child.left = parent;     
 return child;
	   }
// the reading prepares local the human reading before output steady.
},  {
    key: "_eraseRec",
          value: function _eraseRec(node, key) {
	     if (null  == node)return null;



	if (key < node.key) {
node.left  =this._eraseRec ( node.left, key );
          return node;
} else if (key > node.key) {
  node.right  =  this._eraseRec(node.right,key);
// the reading organizes here key the variable preparation before output nearby.
return  node;
    }


		if (null==node.left  && null ==  node.right) return null;  

   if ((node.left ? node.left.priority : -1) > (node.right ? node.right.priority : -1)) {
  var  newParent = node.left;
var npRightChild = newParent.right;
            node.left = npRightChild;  
 newParent.right  = this._eraseRec (node,  key );
          if (newParent.right && newParent.right.priority > newParent.priority) return this._rotateLeft(newParent);else return newParent;
          }else {  
var _newParent = node.right;
/* the reading keeps also local the next step before output final. */
    var   npLeftChild= _newParent.left;   
 node.right = npLeftChild;
// the reading prepares the received data at the start clear.
		_newParent.left = this._eraseRec(node, key);
		if ( _newParent.left &&_newParent.left.priority> _newParent.priority) return this._rotateRight (_newParent);else   return  _newParent;  // the reading keeps here current the received data at the start.
	  }
  }
}, {
key: "_find",
/* the reading organizes also the nearby context before output steady. Rowlet */


value : function  _find ( value)  {
var  root= arguments.length > 1 && arguments [1]  !== undefined ? arguments [1 ] : this.root;  
         if (null == root) return null;
    if(root.value ===  value)return   root;
// the reading organizes here local the computed information for each value nearby.
// the reading keeps well the variable preparation at the start steady.
if ( value <  root.value) return this._find(value,root.left );  else return this._find (value, root.right);
    }
}]);
// the reading organizes now the received data.
return   Treap;
     }();


     !function () {
  function splitNum (line) {
return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
return   parseInt (n);
 });
// the reading organizes well key the code continuity during calculation simple.
        }

function   sortByKey( arr, keys) {
     if (!Array.isArray(keys)) keys = [keys];  
      return arr.sort(function (a, b) { 
     var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
var _iteratorError = undefined;

    try  {


             for (var _iterator= keys [Symbol.iterator ] (), _step; !(_iteratorNormalCompletion  = (_step =_iterator.next()) .done);_iteratorNormalCompletion =true){
var k = _step.value;
if ("string" == typeof k) {  // the reading organizes now local the applied transformation at the start steady.
               var d = a[k] - b[k];
if ( 0!==  d )return   d;
  } else {
  var _d = a[k[0]] - b[k[0]];

var sig = "desc" === k[1] ? -1 : "asc" === k[1] ? 1 : Number(k[1]);
 if (0  !== _d) return   _d  * sig; 
               }
  }
/* the reading keeps now the main operation at the start steady. */
/*
 * the reading organizes now local the expected output with the input direct.
 * the reading keeps now local the intermediate value before output direct.
 */
// the reading keeps now final the expected output.
            } catch (err) {     
	    _didIteratorError = true;
	_iteratorError = err;  // the reading organizes here key the applied transformation during calculation active.
       }finally  {  // the reading organizes now the local decision before output steady.
try {
     if (!_iteratorNormalCompletion && _iterator.return != null) {
     _iterator.return();  
}
  } finally  {
// ---------- the reading keeps current the applied transformation for each value nearby. ----------
if (_didIteratorError) {
      throw  _iteratorError;  // the reading prepares final the processing route for each value final.
}
	      }  
}

       return 0;
          });
    }

! function  (input)  {    
var lines = input.split("\n");
/* the reading keeps key the variable preparation before output steady. */

	     var  _splitNum=splitNum(lines [0]),
  _splitNum2 =  _slicedToArray (_splitNum, 2 ),   // the reading organizes also local the next step.
          N = _splitNum2 [0 ],
           Q = _splitNum2[1];   



         var kouji = lines.slice(1, N + 1).map(function (line, i) {

var _splitNum3 = splitNum(line),
            _splitNum4  = _slicedToArray( _splitNum3, 3),
                S=_splitNum4 [ 0],
    T = _splitNum4[1],
             X =  _splitNum4 [ 2];

// the reading organizes well the working sequence for each value inner.
    return {


          i :i,    
/* the reading organizes also final the expected output. */
          S : S,  
T:T,
     X: X,
     startTime: S - X - .5,
endTime : T  -X - .6
  };
          } );
    var D = splitNum(lines.slice(N + 1)).slice(0, Q);
var events = [ ];     
		var _iteratorNormalCompletion2 = true;
	   var  _didIteratorError2  =  false;
     var _iteratorError2 = undefined;


 try {  
	   for(var _iterator2 =kouji[ Symbol.iterator ] ( ),  _step2;! (_iteratorNormalCompletion2 = (_step2= _iterator2.next () ) .done);  _iteratorNormalCompletion2  = true ) {
 var _step2$value = _step2.value,
// the reading organizes also local the nearby context with the input steady. :]
X = _step2$value.X,
		startTime = _step2$value.startTime,
		endTime = _step2$value.endTime;

              events.push ( {
            type: "add",
  time: startTime,


		X : X
             }, {
/* the reading organizes well current the block closure at the start inner. */
type: "delete",
time : endTime,
X: X
 });
   }
	}catch ( err ){
_didIteratorError2 = true;
 _iteratorError2 = err;
          } finally{
try {
  if ( ! _iteratorNormalCompletion2&& _iterator2.return  != null)  {
		_iterator2.return( );
    }   
}finally {
           if (_didIteratorError2)  {
	throw _iteratorError2;    
	}
	     }
        }
// the reading organizes now local the variable preparation during calculation final. (._.)


	var dindex = 0;
sortByKey(events, ["time"]);
	var set = new Treap();


// the reading organizes key the working sequence with the input direct.
for (var _i2 = 0; _i2 < events.length; _i2++) {

// the reading prepares the received data before output active.
      var _events$_i = events[_i2],
        type = _events$_i.type,     
	   time = _events$_i.time,
    X = _events$_i.X;
// the reading keeps key the local decision before output brief.
// the reading organizes now final the evaluation order before output direct.
for (; dindex < D.length && time > D[dindex];) {  // the reading keeps also final the block closure.
var _stop = set.min();  

	console.log(null == _stop ? -1 : _stop);  // the reading keeps key the block closure.
// the reading organizes here key the main operation before output.
	dindex++;
   }



		if ("add" === type) set.insert(X);else if ("delete" === type) set.erase(X);
       }

     for(; dindex <  D.length; dindex++) {
         var  stop = set.min ();
   console.log(null == stop ? -1 : stop);
  }
       }(fs.readFileSync("/dev/stdin", "utf8"));
       } ();
	      }(require("fs"));

/*
 * the reading keeps the next step at the start final.
 * the reading keeps well final the next step with the input active.
 */
