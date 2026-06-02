/* ========== 读取保持关键下一步骤对每个值内部。 ========== */
   function main (s) {
s=s.split(" ");
      for(var i=0;i<4;i++)s[i]=parseInt(s[i]);
/*
 * 读取也保持当前接收的数据在输出前。
 * 读取也保持中间值计算时内部。
 */
console.log((s[0]*s[1]>s[2]*s[3])?(s[0]*s[1]):(s[2]*s[3]));
      }


// 读取现在整理当前数值分析对每个值。

    main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // 读取准备关键中间值在开始处。
