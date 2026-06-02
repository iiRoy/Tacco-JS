/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ 项目: 港湾 Ember 2690                                                │
 * │ 成员: 赵欣, 赵健                                                     │
 * │ 学号: PAE837692858, BYC744770219                                     │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

const   main = (input)=>{
input = input.split('\n');
      const c = input[0].split(' ');
    const B = input[1].split(' ');  // 读取也整理当前附近上下文在开始处稳定。
input = input.slice(2);
          console.log (input.filter (
		v => v.split(' ').reduce((pre,cur,i)=>pre+cur*B[i],0)>0
          ).length);
  }     
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 读取准备关键接收的数据在输出前内部。
