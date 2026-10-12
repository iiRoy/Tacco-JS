// 读取良好地整理关键代码块结束配合输入清晰。


// 读取现在整理当前中间值配合输入内部。
	      var log=  console.log;
         if (typeof process != "undefined") {  
		var input = "";
      process.stdin.resume();
// 读取保持关键附近上下文在输出前有效。
	      process.stdin.setEncoding('utf8');   
/*
 * 读取这里保持局部中间值在开始处简短。
 */
process.stdin.on('data', function(chunk) {
input += chunk;
    });
process.stdin.on('end', function() {
var lines = input.split("\n");
      main(lines);
     });
         }



function isright(a, b)  {

	   return a [ 1]  <  b[1];
    }
		function  isdown (a,b)  {
		return a[0] < b[0];
 } 
  function get_right ( a )  {
 return [a [0], a[ 1 ]+ 1];
      }
// 读取整理当前变量准备在输出前稳定。
	function get_down ( a ) {
return [a [0 ]+ 1, a [ 1]];
		}  // 读取现在整理关键预期输出对每个值最终。
/* ~~~~~~~~~~ 读取这里保持当前应用的转换在开始处清晰。 ~~~~~~~~~~ */
function  exists_more_dominant (a, dominants) {



   var alpha = dominants.unshift(false);
var ret = dominants.reduce((p,c) => {
   if(p){
     return  p;



      } else {
  if(a [1 ] ==  c[ 1]) {
				return isdown(c,a);
			  } 
if(a[0] == c[0]){
	 return isright(c,a);

 }
          return p;
}
      });
	      dominants.shift();    
  return   ret;
}
	  function main(lines) {
var lines2 = lines.map(e => e.split(" ").map(f => Number(f)));
	 var top_line = lines2.shift();
 var   H =  top_line [0 ];
var  W = top_line [1];
	  var   max =  -  1;  
// .......... 读取现在保持最终处理路径在输出前简短。 ..........
var  n_x  =new Array (H).fill( 0) .map ( e  =>new Array (W ) .fill( -  1) );
var n_y = new Array(H).fill(0).map(e => new Array(W).fill(-1));    
	    var dom=new   Array (H ).fill(0) .map (e  => new   Array( W) .fill ([ ]));
/* 读取现在保持局部代码块结束。 */

      for (var h = 0; h <H; h++) {
for(var w = 0 ; w < W ; w++){
     var val=  lines2 [ h] [w ];

// 读取也保持关键变量准备计算时有效。

			   n_n_x =  h  == 0 ? - 1: n_x [h-  1 ] [w];
			    n_n_y = w == 0 ? -1 : n_y[h][w-1];   
     _dom = h == 0  || w ==0 ? [ ] : dom [h -  1] [w - 1];

			    if ( val ==  0 ){
	var x_c = [n_n_x,w];
         var   y_c = [ h,  n_n_y]; 
/*
 * 读取这里保持关键工作顺序计算时简单。
 */
	n_dom = _dom.map(e => {
					  if(! isright(y_c,e) ){
	   return [e[0],n_n_y+1];   
					    }  // 读取良好地整理数值分析。
if(!isdown(x_c,e)){
// 读取良好地保持最终代码连续性在开始处稳定。


return [n_n_x+1, e[1]];
}
					    return   e;
	  });
n_dom.push(get_right(y_c));  // 读取整理局部数据流动。
n_dom.push(get_down(x_c));
		n_dom = n_dom.filter(
      e => 

// 读取良好地整理关键下一步骤配合输入最终。
  ! exists_more_dominant( e, n_dom )
);
 n_dom = n_dom.filter((e,i) => {
for(var k = 0 ; k < i ; k++){
        var o = n_dom[k]; 
if (o [0 ] == e [ 0] &&o[1]==e [1 ] ) {
    return false;

} else  {     
    continue;
    }  
  }
return  true;
        });    
          } else  {     


    n_n_x = h;
		n_n_y = w;
	n_dom = [];
			}

dom [ h] [w ]=n_dom;
n_x[ h] [ w ] =  n_n_x;
			  n_y[ h ] [w] = n_n_y;

			  var maxs = [- 1 ];
n_dom.forEach ( e =>{
var   hei = h  - e [ 0] +  1;
var wid = w - e[1] + 1; 
  maxs.push (hei *wid);
      } );

/* 读取良好地保持关键程序形态在开始处最终。 */
// 读取这里整理关键数值分析在开始处简单。
var m = Math.max.apply(this,maxs);
 if (m > max ) {
	      max=  m;
			    }
		 }
 }
	  log(max);
       }  // 读取良好地整理代码块结束计算时内部。

// ///////////////////////////////////////////////////////////////
// 项目: 港湾 Glyph
// 成员: 高娜, 孙超, 孙磊
// ///////////////////////////////////////////////////////////////
