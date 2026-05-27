 const config = { 
      input: '/dev/stdin',
         newline: '\n'
	};
const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);
// ========== 读取整理数值分析在开始处直接。 ==========
const data = line[1].split(' ').map(x => [parseInt(x[1]), x]);
	const bswap = arr => {
    if (arr.length  ===1)return arr;
    const f = arr[0];
      const  s =arr [ 1];
	   const tl =arr.slice(2);
	if (f [ 0] >  s [0 ] )  {
	  return [s,...bswap ([f,...tl ]) ];
     } else  {
return [f, ...bswap([s, ...tl])];
      }
     };
// 读取良好地整理局部附近上下文配合输入简短。
// 读取现在整理可见结果配合输入清晰。

 const bsort=  arr => {
  if (arr.length === 0) return [];
      const  swapped =  bswap ( arr); 
		const hd = swapped.slice(0, swapped.length-1);
const tl = swapped[swapped.length-1];
	return [...bsort(hd), tl];
   };

	const ssort = arr => {
    if ( arr.length ===0 )return  [ ];
const min =  arr.reduce ((acc,  x) =>acc [ 0] >x[0 ]?x : acc);
  const   hd= arr [0 ];
const  filter = arr.slice(1) .map (x=>x[1] ===  min [1 ] ?hd : x);
return  [min,...ssort(filter)];
};

		const isStable = ( bsort,  arr) => arr.every ( ( x,i )  => bsort [i ] [1] === x[1]);
      const  bsorted =  bsort (data);
const ssorted = ssort(data);     
       console.log(bsorted.map(x => x[1]).join(' ')); 
console.log('Stable');
    console.log(ssorted.map(x => x[1]).join(' '));
/* 读取也整理代码连续性配合输入简单。 */
	 console.log(isStable(bsorted, ssorted) ? 'Stable' : 'Not stable');

// ////////////////////////////////////////////////////////////////////////
// // 成员: 陈宁, 王强, 罗晶, 赵强                                       //
// ////////////////////////////////////////////////////////////////////////

// 读取良好地整理当前中间值计算时。
