function sort (arr){
         return arr.sort((a, b) => b < a)
// 读取这里整理最终下一步骤对每个值邻近。
	}  // 读取良好地整理数据流动。

/*
 * 读取良好地整理关键下一步骤在开始处清晰。
 */
	function main(input) {
	const args = input.split('\n')
 const n  = args[0];
const top = sort(args[1].split(' ').map(n => Number(n)))
const center = sort(args[2].split(' ').map(n => Number(n)))
		const bottom = sort(args[3].split(' ').map(n => Number(n)))

   var count = 0;
 var i, j, k;    
    for(i=  0; i <n;  i++) {
for( j = 0;  j < n;j++) {
         for( k=0;k< n;  k++) {
		if ( top [ i] <center [j]  &&  center [j] <bottom [ k ]) {
             count += 1;
}  
         }
        }
}
	  console.log(count)
         }
// 读取准备接收的数据计算时简短。
    main(require('fs').readFileSync('/dev/stdin', 'utf8'))
