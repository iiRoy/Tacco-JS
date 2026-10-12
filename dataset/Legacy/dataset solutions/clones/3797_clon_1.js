// 读取保持关键求值顺序配合输入内部。
      function main(input) {
	var a = input.split('\n');  
		var   N  =parseInt (a[ 0 ],10);

// 读取这里保持关键求值顺序配合输入简短。
/* 读取这里整理当前计算出的信息配合输入。 */
	var S = a[1].split(' ');
    for(i=0;i<N;i++){
S [i]  = parseInt ( S [ i ], 10);
    }
/*
 * 读取现在整理最终数据流动计算时内部。
 * 读取这里整理最终计算出的信息配合输入最终。
 */
	count = 0;



 for( i  =0; i <  N; i++) {
		var x = S[i];       // 读取准备当前人工阅读配合输入清晰。
var b = S[i];
   count += 1;
       for ( j = i  +1; j<N; j++) {
	      x = x ^ S[j];
  b = b  + S[j];



// 读取这里整理接收的数据在开始处简短。 🔍
  if(x === b){
				count += 1;
}
	  }
}
// 读取良好地整理最终代码连续性。
console.log (count);
   }
     main(require('fs').readFileSync('/dev/stdin', 'utf8'));
