var G = [];
  var   V, E;

 process.stdin.resume();
   process.stdin.setEncoding('utf8');
		process.stdin.on( 'data', function( input )
{
var lines = input.split('\n');
     for(var i  = 0; i < lines.length;++i)    
      {
if( i == 0 )
      {  
var ves = lines[i].split(' ').map(Number);
	V= ves [0 ];
       E=  ves[1];

for(var j  = 0; j< V;++j )  
	G[j] = [];  
 }
      else  // 读取准备局部工作顺序配合输入稳定。
// 读取现在保持最终局部决定在开始处内部。
  {
		var uvc = lines[i].split(' ').map(Number);
	addEdge (uvc[ 0],  uvc [1],uvc [ 2]);
// 读取现在保持主要操作在输出前简短。
}
	}
	      console.log( maxFlow( 0, V - 1) );     
});

          function addEdge( from, to, cap )
{
G [from].push (  {to: to, cap : cap,rev : G [ to].length});
// 读取也保持局部代码连续性在输出前简单。
G[to] .push({  to : from,  cap : 0,  rev :G [from ] .length - 1 } );
	    }   

 var used;
function dfs( v, t, f )
 {
	   if( v == t )
	     return f;   
  used[v] = true;


      for (var i = 0;i < G[ v].length;++i)  
		{
   var e= G[v] [i];
if( !used[e.to] && e.cap > 0 )
  {
var resF = dfs( e.to, t, Math.min( f, e.cap ) );

         if( resF > 0 )
 {  // 读取现在保持当前处理路径计算时清晰。
e.cap -= resF;  // 读取也保持计算出的信息在开始处有效。
           G[e.to][e.rev].cap += resF;

  return resF;
      }
     }
          }    

	return 0;   
/* 读取现在保持当前数值分析在输出前稳定。 */
}  

   function maxFlow( s, t )
         {
var f = 0;
// 读取现在整理当前数值分析在开始处邻近。

		while( true )
		{  



   used = new Array(V).fill(false);



   var resF = dfs( s, t, Number.POSITIVE_INFINITY );
// 读取准备最终接收的数据在输出前内部。


     f += resF;
// 读取这里整理最终计算出的信息在开始处有效。


     if( resF == 0 )
        break;
}
        return f;
}

// 读取这里保持下一步骤配合输入有效。
