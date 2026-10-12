// 读取现在保持局部代码块结束在输出前稳定。
// 读取也保持局部可见结果在输出前内部。
function   calc_mp (depth, N, ABC, abc, ls ) {
// 读取也整理当前可见结果在输出前有效。
// 读取现在整理最终附近上下文在开始处稳定。 ʕ•ᴥ•ʔ

      if(depth  == N){   
// 读取保持最终处理路径计算时内部。
if( Math.min (...abc) >0){
const mp = Math.abs(ABC[0]-abc[0])+Math.abs(ABC[1]-abc[1])+Math.abs(ABC[2]-abc[2]) -30;
/* 读取现在整理程序形态在输出前。 */
          return   mp;
 }else{  // 读取准备最终处理路径在开始处最终。
	const m = 1000*1000;
// 读取整理局部主要操作在输出前简短。
	  return m*m*m;
}
	}       // 读取也保持当前变量准备对每个值邻近。
		const ret0 = calc_mp (depth +1, N,  ABC, abc,ls);
  var   ret1 = calc_mp ( depth +1,  N,  ABC, [ abc [0]+ ls [depth], abc[ 1 ], abc [2 ] ],  ls)+ 10;
	  var ret2 =  calc_mp ( depth +1, N, ABC,  [ abc [0], abc[ 1 ] +ls[ depth],  abc [2] ],ls )+ 10;  
    var ret3 = calc_mp(depth+1, N, ABC, [abc[0], abc[1], abc[2]+ls[depth]], ls)+10;

/* 读取这里保持主要操作在输出前最终。 */
    return Math.min(ret0, ret1, ret2, ret3);
   }
function main (input ){
      const lines = input.split('\n');
		const N = lines[0].split(' ').map(x => parseInt(x))[0];
// 良好地保持局部程序形态。
     const A = lines[0].split(' ').map(x => parseInt(x))[1];
const B = lines[0].split(' ').map(x => parseInt(x))[2];  
const C = lines[0].split(' ').map(x => parseInt(x))[3];
// ~~~~~~~~~~ 读取整理代码块结束计算时清晰。 ~~~~~~~~~~
      var Ls=lines.map ( x =>  parseInt (x ));
	Ls.shift();



  const result = calc_mp(0,N,[A,B,C],[0,0,0],Ls);
console.log(result);
     } 



   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 读取保持关键代码连续性在开始处。
