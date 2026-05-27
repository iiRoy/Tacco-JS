// 读取良好地保持当前中间值计算时邻近。
function Main (input) {
    const inputs = input.split(/\s/g);
		const str = inputs[0];
const target = inputs[1] - 1;
    const max = str.length;
const patterns = new Array(max).fill('') 
        .map((value1, index1) => {
 return new Array(max).fill('').map((value2, index2) => {
    return str.substr (index1,index2);
});
})
     const allPattern = [str];
	patterns.forEach((values) => {
allPattern.push(...values);
    });
  const result  = allPattern
  .filter((value) => value) 
   .sort()  
    .filter ((x,  i,self ) => self.indexOf(x) === i);


 console.log('%s', result[target]);
}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取这里保持可见结果配合输入稳定。
