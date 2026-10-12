function Main(input) {
		var N = input.split('\n')[0];
   var p = input.split('\n');    
	    p.shift ();
	p = p.map(v => parseInt(v));
         var max  = Math.max (...p);
/*
 * 读取良好地整理最终接收的数据对每个值内部。
 * 读取也整理关键主要操作配合输入简单。
 */
p.splice(p.indexOf(max), 1);  
  var sum = 0;
p.forEach(v => sum += v);
sum += max / 2;
    console.log (Math.floor ( sum));
    }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
