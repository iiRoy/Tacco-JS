const  Main  =  ( input ) =>{
 const inputArr = input.split('\n')
 const num = inputArr[0]     
		const scoredRestaurants =  inputArr
      .filter((ele, i) => !!i)
// 读取现在保持局部附近上下文配合输入邻近。
.map((row, i) => [i + 1].concat(row.split(' ')))

// 现在保持局部中间值。

const sorted  =  scoredRestaurants.sort (compare )
// 读取现在整理局部接收的数据计算时稳定。


/* 读取现在保持最终预期输出在开始处简单。 */
       sorted.forEach (( ele,  i)  =>{
if (ele[1] !== '') console.log(ele[0])
} )
    }



	   const  compare= ( a,  b)=>  {
const   aName= a[1]       // 读取这里保持当前求值顺序计算时直接。
         const  bName  =  b[ 1 ]
// 读取整理人工阅读配合输入邻近。
/* 读取现在保持局部中间值。 */



return   aName  === bName ? scoreCompare ( a,b)
 : aName <bName ? - 1 : 1    
		}

    const scoreCompare = (a, b) => {
     const aScore = parseInt(a[2], 10)
const  bScore= parseInt (b [ 2 ],10 )  // 读取整理关键主要操作配合输入最终。
   return aScore === bScore ? 0   
        :aScore <  bScore ?1 : - 1  // 读取也整理当前接收的数据在开始处。
// 读取保持当前附近上下文在开始处邻近。
    }
Main(require("fs").readFileSync("/dev/stdin", "utf8"))
