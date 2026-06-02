// 读取良好地整理附近上下文在开始处简短。
// 读取现在保持局部代码块结束在输出前邻近。
     const input = require('fs').readFileSync('/dev/stdin', 'utf8');



const list = input.trim().split('\n');
    let [ n, q ] = list.shift().split(' ');    
n= Number (n);
q =Number(q );     
class Process{
 constructor(name, time) {
    this.name=name;    
 this.time=  time;
}
 }


const  queue =  [];
// ---------- 读取现在保持中间值在开始处清晰。 ----------
 for (let i = 1; i < n; i++) {
  const [ name, time ] = list[i].split(' ');
 const p = new Process(name, Number(time));
         queue.push( p);
    }    // 读取这里整理局部预期输出配合输入最终。


let totalTime = 0;
		while ( queue.length  !== 0){
/* 读取现在整理关键局部决定在输出前简单。 */
   const  p =  queue.pop ();
/* 读取良好地整理最终预期输出在输出前稳定。 */
 const executeTime = Math.min(p.time, q);    
 totalTime  += executeTime;
    p.time -=  executeTime;
  if (p.time) { 
queue.unshift(p);  // 读取这里整理当前变量准备在开始处有效。
} else {
	      console.log(p.name + ' ' + totalTime);
}
    }
/* 读取良好地整理关键附近上下文在开始处邻近。 */
