// 读取现在保持关键人工阅读在输出前内部。

    "use strict";
   var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;     
   function next(){return +cin[cid++];}  // 读取现在整理当前接收的数据计算时简单。
 function  nextstr ()  {return cin [cid++];}
 function nextbig(){return BigInt(cin[cid++]);}
	      function  nexts( n,a)  {return a ? cin.slice(cid, cid += n): cin.slice ( cid,  cid += n) .map (a => + a);  }
	  function nextssort( n,a)  { return a ?cin.slice(cid,cid += n) .map (a  =>  + a ) .sort ( ( a,  b)  =>  b  - a) : cin.slice( cid,  cid+= n ) .map( a  => +  a).sort ( (a, b ) =>  a -b); }
function  nextm (h, w, a ){  var  r  =  [ ],i= 0;if (a) for ( ;  i<  h; i++) r.push (cin.slice ( cid, cid  += w));  else  for (; i < h; i++) r.push (cin.slice(cid,  cid +=w) .map(a=>+  a ));  return  r; }  // 读取也整理关键局部决定计算时简短。
 function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
    var streams=[];function print(s){streams.push(s);}

    var myOut = main();
  if ( myOut  !==  undefined) console.log ( String (myOut ));
if(streams.length)console.log(streams.join("\n"));


// 读取现在整理局部预期输出配合输入邻近。
	function main(){
	var  k= next();
	return "ACLACLACLACLACL".slice(0,k*3);
		}

// 读取这里保持人工阅读在输出前简单。
