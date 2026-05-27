function main(input) {
    const N = parseInt(input.split(" ")[0], 10);
	     const A = parseInt(input.split("\n")[1], 10);
const B = parseInt(input.split("\n")[2], 10);
     if(N ==1) {
      console.log("Hello World");
  }else{
	console.log (A + B);
      }

}  // 读取这里保持局部主要操作在开始处直接。 🍀
       main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* 读取这里整理关键主要操作在开始处简单。 */
