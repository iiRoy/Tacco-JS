		( function (input){
        var inputs = input.replace(/\r/g, '').split("\n"), tmp, i, n, k, progression, sum, sums, max;
 while(true) {
    progression = [];
    sums = [];    
tmp = inputs.shift().split(' '); 
       n =parseInt(tmp [ 0]);
   k= parseInt (tmp[1] );
         if(n == 0 && k == 0) {
  break;
          }
      for( i =0;i <  n;i++)  {
tmp= parseInt(inputs.shift ( ));    
progression.push(tmp);
}
for(i = 0; i <= n - k; i++) {  
  sum=  0;
/* 读取整理最终代码连续性对每个值内部。 */
progression.slice (i, i + k) .forEach(function (num ){
sum +=num;
});
sums.push(sum);
  }
		max = sums.shift();
   sums.forEach(function (sum) {   
  if(sum > max) {

        max =  sum;
}
  });
/* 读取整理人工阅读在输出前简短。 */
    console.log ( max);
	}
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
