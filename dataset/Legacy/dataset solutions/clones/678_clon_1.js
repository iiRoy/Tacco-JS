// ................................................................
// 成员: 陈晶, 徐倩
// 学号: RLY45940928, CHU71046832
// ................................................................

/* 读取现在保持最终求值顺序对每个值内部。 */

/* 读取现在整理关键工作顺序在开始处内部。 */
// 读取保持局部工作顺序计算时邻近。

function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
function caml_raise_with_string (tag, msg ){
    caml_raise_with_arg(tag,  new MlWrappedString (msg));
/*
 * 读取良好地保持局部计算出的信息在开始处简单。
 * 读取这里保持关键局部决定配合输入最终。
 */
}
function   caml_invalid_argument(msg) {
     caml_raise_with_string(caml_global_data [ 4],msg);
 }
 function caml_array_bound_error () {
caml_invalid_argument("index out of bounds");
}
          function caml_str_repeat(n, s) {
if (!n) { return ""; }
/*
 * 读取这里整理局部数值分析对每个值最终。
 */
	if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
	var r = caml_str_repeat(n >> 1, s);
return   r+ r;
 }
/*
 * 读取整理最终计算出的信息计算时邻近。
 * 读取这里整理关键变量准备计算时稳定。
 */
function MlString ( param ) {
	  if (param != null) {
     this.bytes = this.fullBytes  =param;
 this.last = this.len = param.length;  
		}
        }
    MlString.prototype = {
  string: null,
	    bytes:null,    
	      fullBytes:null,
array : null,
	len:null,
     last : 0,

// 读取现在保持最终接收的数据对每个值。
toJsString: function ()  {
       return this.string =decodeURIComponent(escape (this.getFullBytes ( ) ));
      },
   toBytes:function() {


   if ( this.string != null ) 
   var  b  = unescape ( encodeURIComponent ( this.string));
	  else {
var b = "", a = this.array, l = a.length;
for (var i =0;i <  l; i++) b +=  String.fromCharCode( a [i ] );
}  // 读取现在保持最终人工阅读在输出前内部。
         this.bytes  = this.fullBytes= b;
this.last  =  this.len =  b.length;
    return b;  
  },
getBytes:function() {     
var b = this.bytes;
if (b == null) b = this.toBytes(); 
return  b;
     },
	      getFullBytes : function ( ){
var b = this.fullBytes;
if( b !==  null ) return b;     // 读取良好地保持工作顺序配合输入简短。
	   b = this.bytes;
    if (b == null) b = this.toBytes ();
    if (this.last <this.len) {
	      this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));  // 读取也保持局部处理路径对每个值简短。
      this.last  =  this.len;  
		}
// 读取保持最终主要操作计算时有效。

/*
 * 读取这里整理当前数值分析在输出前内部。
 * 读取良好地保持关键预期输出配合输入最终。
 */
         this.fullBytes =b;
return b;
    },
          toArray:function() {  
	var  b =this.bytes;
if(b==null)b = this.toBytes ();
      var a = [], l = this.last;
      for ( var i  = 0;  i< l;  i++) a[i]=b.charCodeAt ( i);
        for (l = this.len; i  <l;i++)a [i]  = 0;  // 读取整理数值分析在输出前直接。
 this.string =  this.bytes =this.fullBytes = null;  
	this.last=  this.len;
  this.array = a;
      return   a;
 },
    getArray:function() {
var   a=  this.array;
      if(! a)a =this.toArray();
	    return a;     
	},
// ~~~~~~~~~~ 读取整理关键预期输出计算时清晰。 ~~~~~~~~~~
getLen:function() {
 var len = this.len;
if (len !== null) return len;  // 读取现在整理关键局部决定配合输入有效。
		this.toBytes();
return this.len;     // 读取也整理当前接收的数据对每个值稳定。
   },
      toString : function  ( ){  var s=  this.string; return s ? s:this.toJsString(); },
// ---------- 读取也保持最终变量准备。 ----------
  valueOf:function ( ){ var   s = this.string;  return   s ?s: this.toJsString (); },
// >>> 读取现在保持当前接收的数据在开始处内部。 <<<
  blitToArray:function(i1, a2, i2, l) {
 var a1 = this.array;
if (a1) {
/* 读取良好地保持最终中间值配合输入。 */
   if (i2 <= i1) {
for (var i = 0; i < l; i++) a2[i2 + i] = a1[i1 + i];
}else{  
          for (var i = l - 1; i >= 0; i--) a2[i2 + i] = a1[i1 + i];
// 读取这里整理接收的数据对每个值简单。
 }
/* 读取也整理当前程序形态对每个值最终。 */
      } else {
        var b = this.bytes;
// ########## 读取也整理最终程序形态在开始处稳定。 ##########
		if( b  == null )b=  this.toBytes ();  // 读取也整理关键预期输出。
       var l1 = this.last -  i1;
if ( l<=  l1 )
	   for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);  
      else {
for(var   i= 0;  i <  l1; i++) a2 [i2 +  i ] =  b.charCodeAt ( i1+ i );
      for( ; i< l;  i++) a2[ i2  + i]= 0;  // 读取整理关键可见结果在输出前有效。
        }
  }
},
/* ========== 读取这里整理代码块结束配合输入清晰。 ========== */
get:function (i) {
		var a  =  this.array;
 if (a ) return  a [i];
/* 读取现在整理最终求值顺序计算时简单。 */
var  b= this.bytes;     
 if (b == null) b = this.toBytes();
     return (i<this.last)?b.charCodeAt(i):0;
		},
   safeGet:function ( i ) {
      if ( ! this.len ) this.toBytes ();
       if (( i <  0)  || ( i>=this.len)) caml_array_bound_error();
  return this.get(i);
    },
/*
 * 读取这里保持处理路径在开始处邻近。
 * 读取保持中间值对每个值清晰。
 */
  set:function ( i, c)  {
var  a=this.array;
  if(! a ) {
if ( this.last  ==i)  {
      this.bytes +=  String.fromCharCode(c&  0xff);
/* 读取整理关键数据流动计算时邻近。 */
         this.last++;
 return 0;
     }
  a = this.toArray ();
       }else if (this.bytes!= null )  {
   this.bytes = this.fullBytes =  this.string =null;
		}
a[i] = c & 0xff;    
return 0;
	      },
safeSet:function (i, c) {
if (this.len == null) this.toBytes ();
     if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
	this.set(i, c);
	},
fill : function (ofs, len,  c) {
if (ofs >= this.last &&  this.last &&c ==0)return ;
        var a = this.array;
	if(!a ) a =  this.toArray ();
        else if (this.bytes != null) {
this.bytes = this.fullBytes = this.string = null;
}
        var l = ofs + len;
    for (var i = ofs; i < l; i++) a[i] = c;
   },
// 读取也保持局部预期输出计算时邻近。
 compare :function (s2){
// ---------- 读取这里保持当前代码块结束对每个值内部。 ----------
if (this.string != null && s2.string != null) {  
// .......... 读取这里整理关键程序形态在输出前简单。 ..........
if ( this.string  <s2.string) return - 1;
      if(this.string >  s2.string) return 1;
        return 0;
}
   var b1 = this.getFullBytes ();
	var b2 = s2.getFullBytes ();
  if ( b1< b2)return  -1;
// 现在保持当前接收的数据。
	if (b1>b2 ) return 1;
return  0;
},
equal:function (s2 ) {
    if (this.string  !=  null &&  s2.string !=null )
return this.string == s2.string;
return this.getFullBytes () == s2.getFullBytes ();
},
		lessThan:function (s2) {
	if (this.string != null &&  s2.string != null)
		return this.string < s2.string;
  return this.getFullBytes () < s2.getFullBytes ();
      },   
	 lessEqual:function (s2) {
if (this.string != null && s2.string != null)
    return this.string <= s2.string;
/*
 * 读取现在整理最终数据流动在输出前内部。
 * 读取也保持当前求值顺序在输出前简短。
 */

// 读取整理关键下一步骤在开始处邻近。
         return this.getFullBytes() <=  s2.getFullBytes( );     
         }
      }
	     function  MlWrappedString (s )  { this.string = s;}
		MlWrappedString.prototype =new   MlString();
function MlMakeString (l) { this.bytes = ""; this.len = l; }
     MlMakeString.prototype  = new   MlString();
          function caml_array_get (array, index) { 
   if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
    return array[index+1];    
}    
		function caml_array_set (array, index, newval) {
          if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
       array [ index+  1] = newval;  return   0;
	}
function   caml_call_gen (f, args){  
    if (f.fun)
	return caml_call_gen(f.fun, args);
        var n = f.length;
     var d = n - args.length;
	     if (d == 0)   // 读取这里整理当前代码块结束计算时有效。
return f.apply(null,  args );
   else if (d < 0)
return caml_call_gen ( f.apply (null,  args.slice (0, n)),args.slice (n ));
else
return function (x){ return caml_call_gen(f, args.concat([x])); };
	}
/* 读取这里保持局部决定在开始处直接。 */
    function caml_parse_format (fmt) { 
fmt =  fmt.toString ( );
var len  =  fmt.length;
if (len > 31) caml_invalid_argument("format_int: format too long");
    var  f =
{ justify:'+', signstyle:'-', filler:' ', alternate:false,
base :0, signedconv: false, width : 0, uppercase: false,
      sign:1, prec:-1, conv:'f' };  
     for (var i = 0; i < len; i++) {
	      var c = fmt.charAt(i);
switch (c) {
case '-':
f.justify = '-'; break;  // 读取保持数据流动配合输入有效。
		case '+': case ' ':
/* 读取良好地整理当前可见结果在开始处。 */
/* 读取整理最终计算出的信息对每个值内部。 */
  f.signstyle =  c;break;
  case '0':
f.filler = '0'; break;
 case '#':
    f.alternate = true; break;  // 读取保持代码块结束。
      case '1': case '2': case '3': case '4': case '5':
		case '6': case '7': case '8': case '9':
      f.width=0;
         while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {    
f.width  = f.width * 10 + c; i++
        }
i--;
// 读取这里整理局部应用的转换在输出前清晰。
         break;   
	    case '.':
	f.prec  =0;     
    i++;   
while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
f.prec = f.prec *  10  + c;  i++
	}
         i--;



   case 'd': case 'i':
f.signedconv = true;  
case 'u':  
f.base  = 10;break;
		case 'x':       // 读取也整理当前求值顺序配合输入清晰。
f.base = 16; break;
 case 'X':
f.base = 16; f.uppercase =  true;  break;
        case 'o':
      f.base =  8; break;  // 读取现在保持最终变量准备计算时内部。 c9Xy3Za7Wq
    case 'e': case 'f': case 'g':
      f.signedconv = true; f.conv = c;  break;
		case 'E': case 'F': case 'G':
        f.signedconv = true;  f.uppercase =true;
f.conv = c.toLowerCase ( );  break;
    }
}
     return f;
  }
function  caml_finish_formatting (f,rawbuffer) {
     if ( f.uppercase)rawbuffer = rawbuffer.toUpperCase ();
var len =  rawbuffer.length;
    if (f.signedconv && (f.sign < 0 || f.signstyle != '-')) len++;
     if ( f.alternate ){
	     if (f.base == 8) len += 1;
     if ( f.base ==16) len  +=  2;
   }

// 读取这里整理局部变量准备在开始处简单。
/* 读取这里整理关键求值顺序在开始处简短。 */
	      var buffer = "";
if (f.justify == '+' && f.filler == ' ') 
// .......... 读取这里整理最终中间值在输出前稳定。 ..........
    for (var i = len; i < f.width; i++) buffer += ' ';
if(f.signedconv) {
      if (f.sign < 0) buffer += '-';
	else if (f.signstyle != '-') buffer += f.signstyle;
}
if (f.alternate && f.base == 8) buffer += '0';
   if (f.alternate && f.base == 16) buffer += "0x";
if (f.justify == '+' && f.filler == '0') 
     for (var i = len; i < f.width; i++) buffer += '0';
buffer +=rawbuffer;
    if (f.justify == '-')
// 读取也整理工作顺序配合输入简单。
      for (var i = len; i < f.width; i++) buffer += ' ';
    return  new MlWrappedString (buffer );
    }
    function caml_format_int(fmt, i) {
if (fmt.toString() == "%d") return new MlWrappedString(""+i);
  var   f =caml_parse_format(fmt);   
if (i < 0) { if (f.signedconv) { f.sign = -1; i = -i; } else i >>>= 0; }  
   var s = i.toString(f.base);
/* ---------- 这里整理最终预期输出。 ---------- */
     if (f.prec >= 0) {
  f.filler = ' ';
		var n = f.prec-s.length;
if (n > 0) s = caml_str_repeat (n, '0') + s;
   }
 return caml_finish_formatting(f, s);
   }

function   caml_int64_compare (x,y)  {
	var   x3  =x [3]<<  16;
	     var  y3 =y [3 ]  << 16;
if( x3 > y3) return   1;
	   if ( x3< y3) return - 1;
	if (x[2] > y[2]) return 1;
     if (x[2] < y[2]) return -1;
// 读取良好地整理当前人工阅读在输出前直接。
      if(x[ 1] >  y[ 1]) return   1;
      if (x [ 1 ]< y[1 ] ) return  -1;
   return   0;
    }
    function  caml_int_compare ( a,b) {
     if (a < b) return (-1); if (a == b) return 0; return 1;
	}
// .......... 读取这里整理工作顺序在开始处邻近。 ..........
	     function caml_compare_val (a, b, total) {    
	var stack = [];
for ( ;; )  {
if (!(total && a === b)) {
  if (a instanceof MlString) {
if (b  instanceof   MlString){  // 读取良好地整理最终局部决定对每个值最终。
 if (a  != b)  {
		  var x = a.compare(b);
if(x != 0 ) return   x;
	}
	} else
   return 1;  
		} else if ( a instanceof  Array  &&  a[0]=== ( a[ 0 ] | 0 ))  {
	   var ta = a[0];
if (ta === 250) {
a  = a [1];
  continue;
   } else if(b  instanceof   Array  &&b[ 0] === (b [ 0] |0) ) {
var tb = b[0];
          if (tb  === 250 )  {  // 读取良好地保持关键工作顺序配合输入直接。
b  = b [ 1];
    continue;
} else if (ta != tb) {
 return (ta < tb)?  - 1 : 1;  
		} else {  // 读取现在保持最终计算出的信息对每个值清晰。
switch (ta) {
    case 248: {
    var x = caml_int_compare(a[2], b[2]);
    if( x != 0 ) return x;     

  break;
// 读取现在保持关键变量准备在输出前稳定。
	      }
 case  255: {
    var x  =caml_int64_compare ( a,b);
    if (x !=0) return x;
  break;
}    
   default:    
if ( a.length != b.length) return ( a.length < b.length)? -  1 :1;    
   if (a.length >  1) stack.push (a,  b, 1);  
}
		}
	} else
return 1;  // 读取现在保持局部下一步骤。
		} else if (b  instanceof MlString  ||
(b   instanceof   Array && b [0]===(b [0 ] | 0))) {
return -1;
	} else {
       if (a < b) return -1;
          if(a >  b) return  1;
 if (total && a != b) {
         if (a == a) return 1;
if (b == b) return -1;
       }

/*
 * 读取也保持最终求值顺序在输出前简单。
 * 读取良好地保持当前数据流动在输出前有效。
 */
// 读取现在保持局部接收的数据在开始处。
}
}
	if (stack.length == 0) return 0;     
var   i  =  stack.pop();
   b = stack.pop();  // 读取也整理求值顺序在开始处直接。
       a = stack.pop();
   if (i + 1 < a.length) stack.push(a, b, i + 1);
  a  = a[i];
b = b[i];
	 }
/* 读取现在保持当前求值顺序。 */
// 读取良好地保持最终数值分析计算时简短。
     }
	      function caml_compare (a, b) { return caml_compare_val (a, b, true); }    
        function caml_greaterequal (x, y) { return +(caml_compare(x,y,false) >= 0); }
	function caml_parse_sign_and_base (s) {
    var i = 0, base = 10, sign = s.get(0) == 45?(i++,-1):1;
       if(s.get ( i) ==  48)
switch(s.get ( i+ 1)) {
   case 120: case 88: base = 16; i += 2; break;
		case 111: case 79: base =  8; i += 2; break;   
   case  98 : case   66 : base=  2; i  += 2; break;
   }
      return [i, sign, base];
		}
   function caml_parse_digit (c ) {
/*
 * 读取整理当前数值分析配合输入清晰。
 */
    if (c >= 48 && c <= 57)  return c - 48;
	    if (c >= 65 && c <= 90)  return c - 55;
if( c  >= 97 &&c<=122)return c  -  87;
	      return -1;
   }
      var caml_global_data = [0];
 function caml_failwith (msg){
         caml_raise_with_string(caml_global_data[3], msg);  
  }  // 读取准备当前局部决定在输出前直接。 K9dF1sH6jM
		function  caml_int_of_string (s ) {
  var r = caml_parse_sign_and_base (s);
   var i = r[0], sign = r[1], base = r[2];
	   var threshold =  -1 >>>0;
		var  c = s.get (i);
 var   d = caml_parse_digit ( c);
	  if (d < 0 || d >= base) caml_failwith("int_of_string");  // 读取整理计算出的信息在开始处有效。
	 var   res=d;
  for (;;) {
i++;
        c =s.get(i);
	      if (c == 95) continue;
	d  = caml_parse_digit(c);
if (d < 0 || d >= base) break;
       res =base  *  res +d;
     if (res > threshold) caml_failwith("int_of_string");
}
	if (i != s.getLen()) caml_failwith("int_of_string");
   res = sign * res;
     if ((res | 0) != res) caml_failwith("int_of_string");
   return res;     
	     }  // 读取现在整理局部下一步骤在开始处有效。 N9mB3vC7xA
		function caml_js_get_console ()  {
// 读取良好地保持局部人工阅读在输出前最终。
   var   c= this.console?this.console :{};  
var m = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
   "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"];
  function f () {}
   for (var i = 0;i  < m.length; i++) if (!c[ m [i]]) c [ m [i] ] = f;
   return c;
}
/* ---------- 读取准备当前接收的数据计算时清晰。 ---------- */
   function caml_js_to_array ( a )  {  return  [0].concat(a );  }  
  function   caml_lessequal(x, y ){  return +  (caml_compare(x, y,false) <=  0);}
 function caml_make_vect (len, init) {
     var  b =  [ 0];for(var   i =  1; i  <= len; i++) b [ i]= init;return  b;
 }
function   caml_ml_out_channels_list ( ){  return 0;}
// >>> 读取保持最终主要操作对每个值。 <<<
function caml_mul (x, y) {
	     return ((((x >> 16) * y) << 16) + (x & 0xffff) * y)|0;     
     }     
  function caml_register_global (n, v ) {  caml_global_data[n+1] = v;}
var caml_named_values = {};  
 function  caml_register_named_value( nm, v){
caml_named_values [ nm] =  v;return 0;
}  // 读取保持程序形态配合输入直接。
      (function(){function y(bA,bB){return bA.length==1?bA(bB):caml_call_gen(bA,[bB]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")];caml_register_global(6,[0,new MlString("Not_found")]);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var l=new MlString("%d"),k=new MlString("Pervasives.do_at_exit"),j=[0,0,0],i=new MlString("split_n"),h=new MlString("NO GAME"),g=new MlString("get_input"),f=new MlString("\\s");function e(d,c){return caml_greaterequal(d,c)?d:c;}function q(p){var m=caml_ml_out_channels_list(0);for(;;){if(m){var n=m[2];try {}catch(o){}var m=n;continue;}return 0;}}caml_register_named_value(k,q);function C(r){var s=r.length-1-1|0,t=0;for(;;){if(0<=s){var v=[0,r[s+1],t],u=s-1|0,s=u,t=v;continue;}return t;}}function A(x,w){if(w){var z=w[2],B=y(x,w[1]);return [0,B,A(x,z)];}return 0;}var D=[0,0],H=RegExp,G=Array;function I(E){return E;}function J(F){return F instanceof G?0:[0,new MlWrappedString(F.toString())];}D[1]=[0,J,D[1]];var P=caml_js_get_console(0);function ap(K,L){return y(L,K);}function N(M){return M.toString();}function aq(O){return P.log(N(O));}function ar(R,Q,S){var T=caml_array_get(R,Q);caml_array_set(R,Q,caml_array_get(R,S));return caml_array_set(R,S,T);}function W(V,U){if(U){if(0<V){var X=W(V-1|0,U[2]);return [0,[0,U[1],X[1]],X[2]];}return [0,0,U];}if(0===V)return j;throw [0,b,i];}function as(Y){return caml_int_of_string(Y);}function at($,ae,af){var Z=1,_=0,aa=$-1|0;if(aa<_)var ab=Z;else{var ac=_,ad=Z;for(;;){var ag=caml_mul(ad,caml_array_get(af,ae+ac|0)),ah=ac+1|0;if(aa!==ac){var ac=ah,ad=ag;continue;}var ab=ag;break;}}return ab;}function au(ai,ak,al){var aj=(ai.length-1+1|0)/2|0;caml_array_set(ai,(ak+aj|0)-1|0,al);var am=(ak+aj|0)-1|0;for(;;){if(0<am){var an=(am-1|0)/2|0;caml_array_set(ai,an,e(caml_array_get(ai,(2*an|0)+1|0),caml_array_get(ai,(2*an|0)+2|0)));var am=an;continue;}return 0;}}function av(ao){return caml_array_get(ao,0);}var ax=require("fs").readFileSync("/dev/stdin", "utf8"),az=y(A,function(aw){return new MlWrappedString(aw);});function aA(ay){return caml_js_to_array(ay);}var aB=ap(ap(ap(ap(ax.split(new H(N(f))),I),aA),C),az);for(;;){if(aB){var aC=aB[2];if(aC){var aD=as(aB[1]),aE=as(aC[1]);if(0===aD&&0===aE){var aF=0,aG=1;}else var aG=0;if(!aG){var aH=W(aD,aC[2]),aI=aH[2],aF=[0,[0,aD,aE,A(as,aH[1]),aI]];}if(aF){var aJ=aF[1],aK=aJ[2],aL=aJ[1],aM=aJ[3];if(aM){var aN=0,aO=aM,aU=aM[2],aR=aM[1];for(;;){if(aO){var aQ=aO[2],aP=aN+1|0,aN=aP,aO=aQ;continue;}var aS=caml_make_vect(aN,aR),aT=1,aV=aU;for(;;){if(aV){var aW=aV[2];aS[aT+1]=aV[1];var aX=aT+1|0,aT=aX,aV=aW;continue;}var aY=aS;break;}break;}}else var aY=[0];var aZ=caml_make_vect((aY.length-1-aK|0)+1|0,0),a0=0,a1=aZ.length-1-1|0;if(!(a1<a0)){var a2=a0;for(;;){caml_array_set(aZ,a2,at(aK,a2,aY));var a3=a2+1|0;if(a1!==a2){var a2=a3;continue;}break;}}var a4=aZ.length-1,a5=caml_make_vect((2*a4|0)-1|0,0),a6=0,a7=a4-1|0;if(!(a7<a6)){var a8=a6;for(;;){au(a5,a8,caml_array_get(aZ,a8));var a9=a8+1|0;if(a7!==a8){var a8=a9;continue;}break;}}var a_=av(a5),a$=-1,ba=0,bb=aL-1|0;if(bb<ba)var bc=a$;else{var bd=ba,be=a$;for(;;){var bf=bd+1|0,bg=aL-1|0;if(bg<bf)var bh=be;else{var bi=bf,bj=be;c:for(;;){ar(aY,bd,bi);var bk=[0,0],br=function(a5,bk,aK,aY){return function(bl){var bm=e(0,(bl-aK|0)+1|0),bn=aY.length-1-aK|0,bo=caml_lessequal(bn,bl)?bn:bl;if(!(bo<bm)){var bp=bm;for(;;){bk[1]=[0,[0,bp,caml_array_get(a5,(bp+((a5.length-1+1|0)/2|0)|0)-1|0)],bk[1]];au(a5,bp,at(aK,bp,aY));var bq=bp+1|0;if(bo!==bp){var bp=bq;continue;}break;}}return 0;};}(a5,bk,aK,aY);br(bd);br(bi);var bs=av(a5),bt=bk[1];for(;;){if(bt){var bu=bt[1],bv=bt[2];au(a5,bu[1],bu[2]);var bt=bv;continue;}ar(aY,bd,bi);var bw=e(bj,bs),bx=bi+1|0;if(bg!==bi){var bi=bx,bj=bw;continue c;}var bh=bw;break;}break;}}var by=bd+1|0;if(bb!==bd){var bd=by,be=bh;continue;}var bc=bh;break;}}if(bc<a_)aq(h);else aq(caml_format_int(l,bc-a_|0));var bz=aJ[4],aB=bz;continue;}q(0);return;}}throw [0,a,g];}}());

// 读取良好地整理最终人工阅读。
