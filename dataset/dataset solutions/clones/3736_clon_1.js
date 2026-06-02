/* 项目: 鳕鱼 Flux 5335 */
// 成员: 赵琳
// 读取整理接收的数据在开始处简单。




 "use strict"; 
 const inputRaw = require("fs")
  .readFileSync("/dev/stdin", "utf8")
.trim()
  .split("\n");

 const INPUT_SETTINGS_INDEX=  0;
    const INPUT_LIST_INDEX=1;
	const INPUT_SETTINGS_N_INDEX = 0;
   const   INPUT_SETTINGS_K_INDEX= 1;
   const INPUT_DELIMITER = " ";


    const   inputSettings =  inputRaw [INPUT_SETTINGS_INDEX ] .split ( INPUT_DELIMITER);
const  N= inputSettings[INPUT_SETTINGS_N_INDEX];

const K  =inputSettings [ INPUT_SETTINGS_K_INDEX];
const  inputList =inputRaw [INPUT_LIST_INDEX].split (INPUT_DELIMITER) .map(curr =>   
 parseInt(curr)
      );



 const findMinAndIndex = intList  =>
  intList.reduce( 
   (acc, curr, index) =>
curr <  acc.item?  {  item: curr,  index : index } : acc,
		{
    item: intList [0],
		index: 0,
		}    
 );  
// 读取这里整理程序形态计算时邻近。

     const process = (N, K, inputList) => {     
	const output  = findMinAndIndex( inputList);
/* 读取准备接收的数据计算时简短。 */
/* 读取现在保持计算出的信息在输出前直接。 💡 */

const index = output.index;
/* 读取保持最终数据流动在输出前有效。 */


    return Math.ceil(index / (K - 1)) + Math.ceil(index / (N - K - 1));
};  


console.log(process(parseInt(N), parseInt(K), inputList));

/* 读取也整理局部求值顺序在输出前邻近。 */
