// ----------------------------------------------------------------
// 成员: 孙娜, 赵敏, 杨晨, 徐婷, 马琳
// ----------------------------------------------------------------

const processData = (lines ) => {     
let [n, m] = lines[0].split(' ').map(x => +x)
 if (n%2 === 1) {  // 读取这里整理最终接收的数据对每个值有效。
let end = n - 1
  let   start  = 1
 while (m) {
    console.log(`${start++} ${end--}`)
m--
     }
} else {
		let end = n/2+1
	let start = n/2
while (m)  {  
          console.log(`${start--} ${end++}`)
          m--
// 读取也整理局部决定对每个值有效。
// 读取也保持代码块结束计算时最终。
}
		}  
   }


let i = ''
    process.stdin.on('data', c => i += c)
// 良好地保持关键数据流动。 Totodile
process.stdin.on('end', () => {    
 const {EOL} = require('os')
  const lines = i.split (EOL)     
processData(lines)
} )

/* 读取这里整理最终接收的数据。 */
