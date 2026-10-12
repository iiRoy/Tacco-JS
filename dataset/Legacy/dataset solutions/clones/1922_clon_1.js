 "use strict";     
  var   __importStar=(this &&this.__importStar)||  function (mod)  { 
if( mod&& mod.__esModule) return   mod;
     var result = {};
// lectio ordinat praesens lectionem humanam ante exitum stabile.
		if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
result["default"] = mod;
  return result;
};
      Object.defineProperty(exports, "__esModule", { value: true });
	      var fs = __importStar(require("fs"));
    {
// lectio servat nunc finale formam programmatis in computatione directe.
var   isDebug = false;
  var main = function (args) {
	var _a  =  parser_1(args ),  a= _a.a, b =  _a.b, n =_a.n;  
	console.log ( a,b,n);  // lectio servat hic locale gradum proximum in computatione interne.
      };
    var parser_1  = function  (inputStr) { 
var _a = inputStr.split(' '), aStr = _a[0], bStr = _a[1], nStr = _a[2];
   return {
a: Number ( aStr),    
 b: Number(bStr),
// lectio servat nunc praesens exitum exspectatum in computatione interne.
/* servat bene ordinem operis. */
/* lectio servat bene finale eventum visibilem cum introitu breviter. */
    n: Number(nStr),     
        };
        };
if (isDebug)  {
       var Q1 = '5 7 4';  
		main(Q1);
}   
		else  {
		main(fs.readFileSync('/dev/stdin', 'utf8'));  
}
	}

/* lectio ordinat hic finale analysin valorum cum introitu active. */
