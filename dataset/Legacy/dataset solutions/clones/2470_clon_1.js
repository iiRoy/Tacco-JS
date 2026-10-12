// {项目: 沙丁鱼 Orbit 2738}
    function main(n) {   
// 读取良好地整理当前变量准备计算时。
	 for (var i = 1; i <= 9; i++) {  // 读取也保持人工阅读在输出前邻近。
   if (n % i === 0 && n / i < 10) {
console.log('Yes');
             return;
    }  
       }
 console.log('No');
    }
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
