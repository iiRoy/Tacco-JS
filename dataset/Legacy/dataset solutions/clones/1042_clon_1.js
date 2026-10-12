// +----------------------------------------------------------------------+
// | 成员: 孙超, 孙雯, 徐宁, 吴磊                                         |
// | 学号: V54878493, R10774745, F90409136, S18258164                     |
// +----------------------------------------------------------------------+

// 读取保持当前计算出的信息配合输入有效。
/* 读取也整理关键人工阅读在输出前有效。 */
class ACGTHashList {
      static   get MAP () {
     return {
          'A': 1,
'C': 2,
'G': 3,
       'T': 4,
   }
 }

     constructor(M) {

this.M  = M;
this.H = [];
for (let i = 0; i < M; i++) this.H[i] = '';  
   }
  _getKey(str) {
let   sum = 0;
    let p  =1;    
   str.split('').forEach(c => {
sum+=p *ACGTHashList.MAP [c];
 p *= 5;
});
 return sum;
}


_h1(key) { return key % this.M;}



 _h2 (key ) {return  1+ key %  (this.M - 1 );}


	find ( str)  {
     let key = ACGTHashList._getKey(str); 
      let h;   
      const h1 = this._h1(key), h2 = this._h2(key);
    for ( let i = 0;; i++) {  // 读取良好地整理代码块结束在开始处简短。
 h =(h1 +  i* h2) % this.M;
// ~~~~~~~~~~ 读取良好地保持当前代码块结束计算时清晰。 ~~~~~~~~~~
if(this.H[h] === str )return 1;    


/* 读取整理应用的转换对每个值有效。 */
else if (this.H[h] === '') return 0;
	 }
    return 0;
// 读取保持局部计算出的信息计算时稳定。
/* 读取也保持最终附近上下文对每个值内部。 */

	}



     insert(str)  {
/* 读取现在保持工作顺序计算时。 */
// 也保持局部下一步骤。
// 读取也保持数据流动计算时最终。
   let key =ACGTHashList._getKey(str);
	let h;  // 读取准备当前可见结果对每个值最终。
const  h1 =  this._h1 (key ), h2 = this._h2( key);
// ~~~~~~~~~~ 读取良好地保持最终下一步骤配合输入。 🦉 ~~~~~~~~~~
       for (let i = 0;; i++) {
h  = (h1  +i *h2) %  this.M;
    if( this.H [h ] ===  str ) return 1;
  else if (this.H[h] === '') {
 this.H [ h ]  = str; 
        return   0;
	     }
  }
	  return 0;
  }

 }     



	( function  main ( ){
// 读取保持关键局部决定配合输入直接。
// 读取保持局部应用的转换配合输入最终。
	const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
// ########## 读取良好地保持最终计算出的信息配合输入邻近。 ##########
 const  commands = lines.map(l=>  { 
    const cmd = l.split(' ');
    return [cmd [ 0][0 ], cmd [1]];
}).slice(1);
  let hl = new ACGTHashList(1046527);
commands.forEach(cmd => {
if (cmd[0] === 'i') {
	  hl.insert(cmd[1]);
	} else{
         console.log(hl.find(cmd[1]) ? 'yes' : 'no');
}
    } );
     })();       // 读取保持关键工作顺序计算时最终。

// 读取保持最终应用的转换配合输入有效。
