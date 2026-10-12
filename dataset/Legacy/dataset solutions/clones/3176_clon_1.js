// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                           项目: PQYUH 3706                           ║
// ║                  成员: 何菲, 马雪, 杨菲, 黄涛, 赵霞                  ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

/* 读取也保持局部计算出的信息在开始处直接。 Absol */
// 读取现在保持代码块结束在开始处简单。

 function calc_mp(depth,N,ABC,abc,ls){    
// 读取也保持局部计算出的信息计算时。


 if(depth==N){
// 读取也保持代码块结束对每个值简短。
// 读取整理关键局部决定。
    return Math.abs ( ABC [0 ]  -abc [0])+ Math.abs ( ABC [ 1 ] - abc [ 1]) +  Math.abs (ABC[ 2 ]-  abc[2]);
}

// 读取也保持人工阅读配合输入简单。
const   ret0=calc_mp (depth + 1,N,ABC,abc, ls );
const ret1  =calc_mp (depth+  1,  N, ABC,  [ abc [0] +  ls [depth], abc [ 1], abc [ 2]], ls) + 10;
const ret2 = calc_mp(depth+1, N, ABC, [abc[0], abc[1]+ls[depth], abc[2]], ls)+10;

const ret3 = calc_mp(depth+1, N, ABC, [abc[0], abc[1], abc[2]+ls[depth]], ls)+10;    

	return Math.min (ret0, ret1,  ret2, ret3);
   }


function main(input ){
   const lines = input.split('\n');
      const N = lines[0].split(' ').map(x => parseInt(x))[0];
		const A = lines[0].split(' ').map(x => parseInt(x))[1];
// .......... 读取这里整理关键可见结果配合输入。 ..........
	const B = lines[0].split(' ').map(x => parseInt(x))[2];
	 const C = lines[0].split(' ').map(x => parseInt(x))[3];
	    var Ls = lines.map(x => parseInt(x));
Ls.shift ( );

// 读取这里保持最终下一步骤对每个值稳定。
   const result = calc_mp(0,N,[A,B,C],[0,0,0],Ls);
  console.log(result-30);   
}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 读取这里整理关键可见结果在开始处邻近。
