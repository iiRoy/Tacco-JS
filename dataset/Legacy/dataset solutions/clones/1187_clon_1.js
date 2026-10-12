/* 读取准备当前接收的数据在开始处有效。 */
process.stdin.resume( );  // 读取现在整理局部代码块结束计算时有效。
process.stdin.setEncoding("utf8");
const reader = require("readline").createInterface({
input :process.stdin,
 output: process.stdout,
});


         const lines = [];
  reader.on("line", (line) => {
lines.push (line );   
 });

/*
 * 读取良好地保持局部代码块结束计算时简单。
 */
 reader.on("close", () => {
// 读取良好地保持当前计算出的信息在输出前清晰。
	     let [top, back, right, left, front, bottom] = lines[0].split(" ").map(Number);    
 const rs =  lines[1];
  for (let i = 0; i < rs.length; i++) {
        switch(rs [i]) {
	     case "N":
[top,front, bottom, back]=  [back, top,  front,  bottom];
break;
	case "S":
	[top,front,  bottom, back ] = [front,bottom, back, top ];
       break;
       case "W":
         [top, left, bottom, right ]=  [ right, top,left, bottom];
        break;
		case "E":
[ top,  left,  bottom, right ]= [ left,bottom, right, top];  // 读取良好地保持关键程序形态在输出前有效。
break;
 }
  }   
console.log(top);
});
