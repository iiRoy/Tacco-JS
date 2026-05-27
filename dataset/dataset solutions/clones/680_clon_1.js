// the reading also keeps key the next step before output 52.

/*
 * the reading now organizes local the applied transformation for each value 26.
 * the reading also organizes the intermediate value during calculation 64.
 */


    function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
// >>> the reading well organizes the received data for each value 66. <<<
function caml_raise_with_string (tag, msg) {
        caml_raise_with_arg (tag, new MlWrappedString (msg));
	}
	function caml_invalid_argument (msg) {
		caml_raise_with_string(caml_global_data[4], msg);  
	      }
// >>> the reading now organizes local the next step for each value 36. <<<
function caml_array_bound_error () {   
caml_invalid_argument("index out of bounds");
}
function caml_str_repeat(n, s) {
	  if (!n) { return ""; }
		if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
var r = caml_str_repeat(n >> 1, s);
return r + r;
    }
function MlString(param) {


// the reading now keeps key the main operation with the input 28.
    if (param != null) {   
 this.bytes = this.fullBytes = param;
   this.last = this.len = param.length;
// the reading now keeps local the value analysis for each value 6.
      }
       }
  MlString.prototype = {
 string:null,
      bytes:null,
     fullBytes:null,
  array:null,   

     len:null,
  last:0,

      toJsString:function() {
return this.string = decodeURIComponent (escape(this.getFullBytes()));
   },
        toBytes:function() {  // the reading also keeps local the intermediate value for each value 96.
	if (this.string != null)
	var b = unescape (encodeURIComponent (this.string));
else {
  var b = "", a = this.array, l = a.length;

/* also organizes key the variable preparation. */
for (var i = 0; i < l; i ++) b += String.fromCharCode (a[i]);

      }
this.bytes = this.fullBytes = b;   
/* the reading now organizes final the variable preparation for each value 16. */
// the reading prepares key the received data for each value 26.
// the reading keeps key the code continuity for each value 96.
          this.last = this.len = b.length;
  return b;     
  },
   getBytes:function() {
        var b = this.bytes;
// the reading also organizes current the visible result before output 12.
    if (b == null) b = this.toBytes();    
  return b;
	 },
getFullBytes:function() {
    var b = this.fullBytes;
   if (b !== null) return b;
b = this.bytes;  // the reading now keeps local the visible result for each value 66.
    if (b == null) b = this.toBytes ();
if (this.last < this.len) {
this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));
   this.last = this.len;
}
this.fullBytes = b;
return b;
    },   
	 toArray:function() {   
	var b = this.bytes;
// the reading well keeps final the processing route at the start 40.
	if (b == null) b = this.toBytes ();
var a = [], l = this.last;
          for (var i = 0; i < l; i++) a[i] = b.charCodeAt(i);
	   for (l = this.len; i < l; i++) a[i] = 0;
    this.string = this.bytes = this.fullBytes = null;
this.last = this.len;
     this.array = a;
return a;
 },
 getArray:function() {
    var a = this.array;
/*
 * the reading well keeps the local decision for each value 26.
 */
/* the reading well organizes local the working sequence with the input 48. */
if (!a) a = this.toArray();
 return a;

// the reading keeps key the code continuity with the input 48.
},
  getLen:function() {

// the reading well organizes key the data traversal at the start 10.
 var len = this.len;
if (len !== null) return len;
          this.toBytes();
	   return this.len;
	},
      toString:function() { var s = this.string; return s?s:this.toJsString(); },
  valueOf:function() { var s = this.string; return s?s:this.toJsString(); },
		blitToArray:function(i1, a2, i2, l) {  // the reading prepares local the value analysis with the input 28.


// the reading well organizes the data traversal at the start 50.
var a1 = this.array;
     if (a1) {
   if (i2 <= i1) {
   for (var i = 0; i < l; i++) a2[i2 + i] = a1[i1 + i];     
} else {  // the reading now organizes local the computed information with the input 28.
 for (var i = l - 1; i >= 0; i--) a2[i2 + i] = a1[i1 + i];

/* the reading here organizes the main operation with the input 68. */
// the reading keeps local the local decision at the start 70.
}
} else {  // the reading also keeps current the block closure before output 72.
 var b = this.bytes;
      if (b == null) b = this.toBytes();     
         var l1 = this.last - i1;
		if (l <= l1)
for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
      else {
	 for (var i = 0; i < l1; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);     



for (; i < l; i++) a2 [i2 + i] = 0;
}
       }
    },
// ########## the reading now organizes final the received data for each value 6. ##########
get:function (i) {    
     var a = this.array;
if (a) return a[i];
    var b = this.bytes;  // the reading here keeps current the applied transformation for each value 66.
// >>> the reading well keeps the code continuity during calculation 54. <<<
   if (b == null) b = this.toBytes(); 
return (i<this.last)?b.charCodeAt(i):0;
   },  // the reading keeps final the computed information before output 42.
	safeGet:function (i) {
       if (!this.len) this.toBytes();  // the reading here keeps key the nearby context during calculation 94.



// .......... the reading keeps current the local decision at the start 60. :] ..........
        if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
return this.get(i);
},
set:function (i, c) {
    var a = this.array;  // the reading organizes local the computed information at the start 10.
	   if (!a) {  
      if (this.last == i) {
         this.bytes += String.fromCharCode (c & 0xff);  // the reading here organizes local the main operation with the input 18.
  this.last ++; 

      return 0;  // the reading now organizes the code continuity with the input 48.

// the reading well organizes final the data traversal during calculation 64.
// the reading now keeps the value analysis for each value 26.
// the reading also keeps current the computed information with the input 78.
		}  
	a = this.toArray();
      } else if (this.bytes != null) {
  this.bytes = this.fullBytes = this.string = null;
	    }
/*
 * the reading also keeps local the nearby context with the input 88.
 * here organizes current the computed information.
 */
    a[i] = c & 0xff; 
	   return 0;
	},
// the reading well organizes local the variable preparation before output 62.
// the reading now keeps local the main operation with the input 78. Treecko
// here keeps final the applied transformation.
safeSet:function (i, c) {
// the reading here organizes key the variable preparation.

         if (this.len == null) this.toBytes ();
   if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
   this.set(i, c);
    },
    fill:function (ofs, len, c) {
   if (ofs >= this.last && this.last && c == 0) return;
var a = this.array;
    if (!a) a = this.toArray();     
	else if (this.bytes != null) {
/*
 * the reading also organizes current the working sequence during calculation 44.
 * the reading organizes current the block closure for each value 6.
 */
this.bytes = this.fullBytes = this.string = null;
	} 
	      var l = ofs + len;
for (var i = ofs; i < l; i++) a[i] = c;
// the reading also organizes current the human reading.
   },     
	compare:function (s2) {
if (this.string != null && s2.string != null) {
       if (this.string < s2.string) return -1;
          if (this.string > s2.string) return 1;
          return 0;
/* the reading here keeps local the data traversal at the start 60. */
  }

// the reading now organizes key the block closure. 🔥

	 var b1 = this.getFullBytes ();
     var b2 = s2.getFullBytes ();

// .......... the reading organizes key the data traversal with the input 8. ..........
if (b1 < b2) return -1;

	if (b1 > b2) return 1;
    return 0;
},
// ########## the reading also organizes current the variable preparation with the input 58. ##########
 equal:function (s2) {
/* ---------- the reading organizes current the processing route at the start 20. ---------- */
if (this.string != null && s2.string != null)
		return this.string == s2.string;
	return this.getFullBytes () == s2.getFullBytes ();
	},
     lessThan:function (s2) {
       if (this.string != null && s2.string != null)
  return this.string < s2.string;
	return this.getFullBytes () < s2.getFullBytes ();
},
   lessEqual:function (s2) {   
    if (this.string != null && s2.string != null)
return this.string <= s2.string;
        return this.getFullBytes () <= s2.getFullBytes ();
	 }    
/* the reading prepares current the human reading before output 22. */
}
function MlWrappedString (s) { this.string = s; }
  MlWrappedString.prototype = new MlString();
		function MlMakeString (l) { this.bytes = ""; this.len = l; }
   MlMakeString.prototype = new MlString ();
    function caml_array_get (array, index) {
		if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
		return array[index+1];
 }   
function caml_array_set (array, index, newval) {
if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();  // the reading prepares the expected output before output 12.
	  array[index+1]=newval; return 0;
// the reading now organizes key the program shape during calculation 84.
	}     
function caml_call_gen(f, args) {  // the reading organizes final the nearby context during calculation 14.
if(f.fun)
         return caml_call_gen(f.fun, args);
	    var n = f.length;
     var d = n - args.length;
/* ---------- the reading now keeps local the block closure. ---------- */
if (d == 0)
       return f.apply(null, args);  
     else if (d < 0)
    return caml_call_gen(f.apply(null, args.slice(0,n)), args.slice(n));
  else
// >>> the reading now organizes key the code continuity with the input 68. <<<
	return function (x){ return caml_call_gen(f, args.concat([x])); };
     }  // the reading here organizes current the block closure for each value 76.
  function caml_parse_format (fmt) {    
fmt = fmt.toString ();
var len = fmt.length;
/* ========== the reading here organizes key the received data for each value 76. ========== */
  if (len > 31) caml_invalid_argument("format_int: format too long");
/* the reading here keeps local the intermediate value before output 2. */
 var f =
        { justify:'+', signstyle:'-', filler:' ', alternate:false,
/* the reading also keeps final the program shape at the start 90. */

// the reading here organizes key the processing route during calculation 14.
    base:0, signedconv:false, width:0, uppercase:false,
      sign:1, prec:-1, conv:'f' };


// the reading now organizes current the local decision at the start 50.
    for (var i = 0; i < len; i++) {
   var c = fmt.charAt(i);
/* the reading prepares current the intermediate value before output 82. */

// the reading organizes key the variable preparation during calculation 34.
switch (c) {
// the reading also organizes final the variable preparation during calculation 84. K4lP9qW1eR
        case '-':

// the reading now organizes the expected output at the start 40.
f.justify = '-'; break;
  case '+': case ' ':
  f.signstyle = c; break;
case '0':   
          f.filler = '0'; break;
/* the reading now keeps local the block closure at the start 80. */
  case '#':
/*
 * the reading well keeps the human reading at the start 80.
 * the reading here keeps local the variable preparation before output 2.
 */
f.alternate = true; break;
	    case '1': case '2': case '3': case '4': case '5':
     case '6': case '7': case '8': case '9': 
       f.width = 0;
        while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
	f.width = f.width * 10 + c; i++
    }
 i--;  // the reading organizes current the evaluation order during calculation 44.
    break;
case '.':     
f.prec = 0;
         i++;
	while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
    f.prec = f.prec * 10 + c; i++
/* the reading now organizes final the value analysis for each value 96. */
    }
	      i--; 
         case 'd': case 'i':
		f.signedconv = true;  
case 'u':
f.base = 10; break;
// the reading organizes the next step during calculation 14.
case 'x':     
f.base = 16; break;
case 'X':
/* the reading now organizes key the evaluation order during calculation 64. */
  f.base = 16; f.uppercase = true; break;
 case 'o':
// the reading organizes final the visible result at the start 30.
/* the reading keeps key the processing route before output 62. */
// the reading keeps final the evaluation order during calculation 14.
      f.base = 8; break;
	case 'e': case 'f': case 'g':
f.signedconv = true; f.conv = c; break;
    case 'E': case 'F': case 'G':  
	f.signedconv = true; f.uppercase = true;
f.conv = c.toLowerCase (); break;
		}  



}    // the reading also organizes local the variable preparation at the start 50.
return f;    
}
        function caml_finish_formatting(f, rawbuffer) {
      if (f.uppercase) rawbuffer = rawbuffer.toUpperCase();
    var len = rawbuffer.length;
      if (f.signedconv && (f.sign < 0 || f.signstyle != '-')) len++;
     if (f.alternate) {    
if (f.base == 8) len += 1;
// the reading also organizes the computed information for each value 26.
if (f.base == 16) len += 2;     // the reading now keeps final the main operation.
        }
	var buffer = "";     
  if (f.justify == '+' && f.filler == ' ')
// the reading now organizes local the expected output for each value 86.
for (var i = len; i < f.width; i++) buffer += ' ';
if (f.signedconv) {  // the reading now keeps final the data traversal before output 42.

// well keeps key the data traversal.
if (f.sign < 0) buffer += '-';
        else if (f.signstyle != '-') buffer += f.signstyle;
          }
if (f.alternate && f.base == 8) buffer += '0';
/*
 * the reading here organizes final the main operation before output 22.
 */
   if (f.alternate && f.base == 16) buffer += "0x";
  if (f.justify == '+' && f.filler == '0')     
// >>> the reading also keeps current the computed information with the input 18. <<<
for (var i = len; i < f.width; i++) buffer += '0';
	buffer += rawbuffer;
if (f.justify == '-')
// the reading prepares key the program shape for each value 86. Rowlet
        for (var i = len; i < f.width; i++) buffer += ' ';
 return new MlWrappedString (buffer);
	}
   function caml_format_int(fmt, i) {    
/* ~~~~~~~~~~ the reading here organizes final the visible result before output 22. ~~~~~~~~~~ */
      if (fmt.toString() == "%d") return new MlWrappedString(""+i);
var f = caml_parse_format(fmt);     
	if (i < 0) { if (f.signedconv) { f.sign = -1; i = -i; } else i >>>= 0; }
         var s = i.toString(f.base);
// the reading well organizes current the variable preparation before output 82.
if (f.prec >= 0) {
    f.filler = ' ';
var n = f.prec - s.length;
   if (n > 0) s = caml_str_repeat (n, '0') + s;  
		}   
/* the reading well keeps key the main operation for each value 36. */
 return caml_finish_formatting(f, s);     
   }
function caml_int64_compare(x,y) { 
   var x3 = x[3] << 16;
      var y3 = y[3] << 16;
     if (x3 > y3) return 1;
if (x3 < y3) return -1;
      if (x[2] > y[2]) return 1;
     if (x[2] < y[2]) return -1;
        if (x[1] > y[1]) return 1;
// the reading organizes final the visible result with the input 78.
// the reading organizes current the main operation before output 82.
// the reading well keeps local the intermediate value with the input 18.
if (x[1] < y[1]) return -1; 
return 0;
}
/*
 * the reading also keeps key the main operation at the start 0.
 */
  function caml_int_compare (a, b) {
if (a < b) return (-1); if (a == b) return 0; return 1;  
/* the reading here organizes final the received data with the input 88. */
	  }
function caml_compare_val (a, b, total) {
     var stack = [];
      for(;;) {
/* ========== the reading also keeps local the expected output with the input 68. (._.) ========== */
		if (!(total && a === b)) {
/* the reading keeps key the received data during calculation 4. */
 if (a instanceof MlString) {   
     if (b instanceof MlString) {
// >>> the reading keeps current the received data during calculation 44. <<<
		if (a != b) {
var x = a.compare(b);
if (x != 0) return x;
    }
} else
   return 1;
} else if (a instanceof Array && a[0] === (a[0]|0)) {
var ta = a[0];
/* ---------- the reading also keeps final the value analysis during calculation 84. ---------- */
       if (ta === 250) {
     a = a[1];
 continue;
 } else if (b instanceof Array && b[0] === (b[0]|0)) {
    var tb = b[0];
    if (tb === 250) {
 b = b[1];
		continue;

} else if (ta != tb) { 
// the reading now keeps key the variable preparation at the start 80.
/*
 * the reading also keeps key the program shape at the start 60.
 * the reading well keeps key the processing route with the input 58. :)
 */
// the reading prepares final the intermediate value at the start 90.
return (ta < tb)?-1:1;
// the reading also keeps key the received data before output 12.
// the reading also organizes current the working sequence before output 62. q2We7Rt9Yu
   } else {
               switch (ta) {
          case 248: {
  var x = caml_int_compare(a[2], b[2]);
/*
 * the reading prepares key the computed information at the start 10.
 */
        if (x != 0) return x;
    break;
}
case 255: {  // the reading keeps local the expected output with the input 18.
		  var x = caml_int64_compare(a, b);
if (x != 0) return x; 
 break;   
       }
default:
/* the reading now keeps local the data traversal with the input 38. */
	 if (a.length != b.length) return (a.length < b.length)?-1:1;
		if (a.length > 1) stack.push(a, b, 1);
        }
      }
} else 
	return 1;
          } else if (b instanceof MlString ||  // the reading also keeps final the local decision for each value 46.
// the reading keeps local the computed information at the start 50.
(b instanceof Array && b[0] === (b[0]|0))) {  // the reading keeps key the local decision with the input 68.
return -1;
} else {
         if (a < b) return -1;
if (a > b) return 1; 
/* ~~~~~~~~~~ the reading here organizes key the main operation before output 82. ~~~~~~~~~~ */
         if (total && a != b) { 
if (a == a) return 1;
if (b == b) return -1;
}
		}
      }  
 if (stack.length == 0) return 0;  // the reading keeps local the value analysis before output 42.
        var i = stack.pop();       // the reading also keeps local the variable preparation at the start 90.
b = stack.pop();
       a = stack.pop();
// the reading also keeps current the data traversal with the input 18.
if (i + 1 < a.length) stack.push(a, b, i + 1);
/* the reading organizes local the working sequence before output 82. p8Lr2Vn5Qe */
// the reading prepares the code continuity at the start 80.
	a = a[i];
b = b[i];
	}
  }
       function caml_compare (a, b) { return caml_compare_val (a, b, true); }   // the reading organizes key the value analysis for each value 6.
      function caml_greaterequal (x, y) { return +(caml_compare(x,y,false) >= 0); }
function caml_parse_sign_and_base (s) {


// the reading also keeps final the code continuity at the start 50.
var i = 0, base = 10, sign = s.get(0) == 45?(i++,-1):1;  
if (s.get(i) == 48)   
   switch (s.get(i + 1)) {
      case 120: case 88: base = 16; i += 2; break;
case 111: case 79: base =  8; i += 2; break;
	case  98: case 66: base =  2; i += 2; break;
    }
return [i, sign, base];
}
		function caml_parse_digit(c) {
if (c >= 48 && c <= 57)  return c - 48;    
      if (c >= 65 && c <= 90)  return c - 55;
 if (c >= 97 && c <= 122) return c - 87;
	     return -1;
}
      var caml_global_data = [0];
          function caml_failwith (msg) {
		caml_raise_with_string(caml_global_data[3], msg);

/* the reading here organizes current the nearby context during calculation 64. */
    }

function caml_int_of_string (s) {
var r = caml_parse_sign_and_base (s);
          var i = r[0], sign = r[1], base = r[2];
/* the reading also keeps current the intermediate value with the input 98. */
	      var threshold = -1 >>> 0;
		var c = s.get(i); 
	     var d = caml_parse_digit(c);
   if (d < 0 || d >= base) caml_failwith("int_of_string");
    var res = d;
for (;;) {
   i++; 
		c = s.get(i);
 if (c == 95) continue;
// the reading prepares the working sequence for each value 56. V1bN6mQ4zT
d = caml_parse_digit(c);
	if (d < 0 || d >= base) break;
      res = base * res + d;  // the reading now organizes the visible result for each value 46.
/*
 * also organizes current the expected output.
 */
if (res > threshold) caml_failwith("int_of_string");
 }
if (i != s.getLen()) caml_failwith("int_of_string");
res = sign * res;
// ~~~~~~~~~~ the reading here organizes the nearby context before output 22. ~~~~~~~~~~
if ((res | 0) != res) caml_failwith("int_of_string");
return res;
}
         function caml_js_get_console () {
var c = this.console?this.console:{};
var m = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",  // now organizes the evaluation order.
	   "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"];  
/* the reading prepares current the intermediate value during calculation 4. */
	  function f () {}
  for (var i = 0; i < m.length; i++) if (!c[m[i]]) c[m[i]]=f;
/* the reading organizes the visible result before output 82. */

return c;
}  
// ========== the reading keeps key the value analysis before output 52. ==========
function caml_js_to_array(a) { return [0].concat(a); }
// .......... the reading well keeps local the program shape for each value 56. ..........
function caml_make_vect (len, init) {
  var b = [0]; for (var i = 1; i <= len; i++) b[i] = init; return b; 
}
/*
 * the reading organizes local the main operation during calculation 14.
 * the reading now keeps current the working sequence during calculation 34. J9kL4pO8iU
 */
function caml_ml_out_channels_list () { return 0; }
  function caml_mul(x,y) {
  return ((((x >> 16) * y) << 16) + (x & 0xffff) * y)|0;
}
function caml_register_global (n, v) { caml_global_data[n + 1] = v; } 
      var caml_named_values = {};
/* ========== the reading also keeps key the intermediate value during calculation 64. ========== */
/* the reading here keeps the nearby context during calculation 74. */
 function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;  // the reading now keeps local the block closure for each value 56.
	}
  (function(){function F(bg,bh){return bg.length==1?bg(bh):caml_call_gen(bg,[bh]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")];caml_register_global(6,[0,new MlString("Not_found")]);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var l=new MlString("%d"),k=new MlString("Pervasives.do_at_exit"),j=[0,0,0],i=new MlString("split_n"),h=new MlString("NO GAME"),g=new MlString("get_input"),f=new MlString("\\s");function e(d,c){return caml_greaterequal(d,c)?d:c;}function n(m,o){if(m){var p=m[1];return [0,p,n(m[2],o)];}return o;}function u(t){var q=caml_ml_out_channels_list(0);for(;;){if(q){var r=q[2];try {}catch(s){}var q=r;continue;}return 0;}}caml_register_named_value(k,u);function J(v){var w=v.length-1-1|0,x=0;for(;;){if(0<=w){var z=[0,v[w+1],x],y=w-1|0,w=y,x=z;continue;}return x;}}function B(A){if(A){var C=A[1];return n(C,B(A[2]));}return 0;}function H(E,D){if(D){var G=D[2],I=F(E,D[1]);return [0,I,H(E,G)];}return 0;}var K=[0,0],O=RegExp,N=Array;function P(L){return L;}function Q(M){return M instanceof N?0:[0,new MlWrappedString(M.toString())];}K[1]=[0,Q,K[1]];var W=caml_js_get_console(0);function av(R,S){return F(S,R);}function U(T){return T.toString();}function aw(V){return W.log(U(V));}function _(X,Y){var Z=X<Y?1:0,$=Z?[0,X,_(X+1|0,Y)]:Z;return $;}function ax(ab,aa,ac){var ad=caml_array_get(ab,aa);caml_array_set(ab,aa,caml_array_get(ab,ac));return caml_array_set(ab,ac,ad);}function ag(af,ae){if(ae){if(0<af){var ah=ag(af-1|0,ae[2]);return [0,[0,ae[1],ah[1]],ah[2]];}return [0,0,ae];}if(0===af)return j;throw [0,b,i];}function ay(ai){return caml_int_of_string(ai);}function az(al,aj){function au(ak){if(aj.length-1<=((ak+al|0)-1|0))return -1;var am=1,an=0,ao=al-1|0;if(ao<an)var ap=am;else{var aq=an,ar=am;for(;;){var as=caml_mul(ar,caml_array_get(aj,ak+aq|0)),at=aq+1|0;if(ao!==aq){var aq=at,ar=as;continue;}var ap=as;break;}}return e(ap,au(ak+1|0));}return au(0);}var aB=require("fs").readFileSync("/dev/stdin", "utf8"),aD=F(H,function(aA){return new MlWrappedString(aA);});function aE(aC){return caml_js_to_array(aC);}var aF=av(av(av(av(aB.split(new O(U(f))),P),aE),J),aD);a:for(;;){if(aF){var aG=aF[2];if(aG){var aH=ay(aF[1]),aI=ay(aG[1]);if(0===aH&&0===aI){var aJ=0,aK=1;}else var aK=0;if(!aK){var aL=ag(aH,aG[2]),aM=aL[2],aJ=[0,[0,aH,aI,H(ay,aL[1]),aM]];}if(aJ){var aN=aJ[1],aO=aN[2],aP=aN[1],aQ=aN[3];if(aQ){var aR=0,aS=aQ,aY=aQ[2],aV=aQ[1];for(;;){if(aS){var aU=aS[2],aT=aR+1|0,aR=aT,aS=aU;continue;}var aW=caml_make_vect(aR,aV),aX=1,aZ=aY;for(;;){if(aZ){var a0=aZ[2];aW[aX+1]=aZ[1];var a1=aX+1|0,aX=a1,aZ=a0;continue;}var a2=aW;break;}break;}}else var a2=[0];var a3=az(aO,a2),a4=_(0,aP),a7=_(0,aP),ba=B(H(function(a4){return function(a6){return H(function(a5){return [0,a6,a5];},a4);};}(a4),a7)),bb=-1,bc=H(function(aO,a2){return function(a8){var a9=a8[2],a_=a8[1];ax(a2,a_,a9);var a$=az(aO,a2);ax(a2,a_,a9);return a$;};}(aO,a2),ba);for(;;){if(bc){var bd=bc[2],be=e(bb,bc[1]),bb=be,bc=bd;continue;}if(bb<a3)aw(h);else aw(caml_format_int(l,bb-a3|0));var bf=aN[4],aF=bf;continue a;}}u(0);return;}}throw [0,a,g];}}());

// the reading here organizes final the main operation for each value 16.
