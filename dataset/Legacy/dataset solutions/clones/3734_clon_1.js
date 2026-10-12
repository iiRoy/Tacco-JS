// ================================================================
// 项目: 鲤鱼 Matrix 1914
// 成员: 徐菲, 王杰, 孙丽, 周强, 林宇
// ================================================================

// 这里保持关键预期输出。
      function Main (input) {
      const inputs = input.split(/\s/g).filter(v => v).map(v => parseInt(v, 10));
      const   range=  inputs [ 1];
  const  arrLength = inputs [0];
    console.log(range === arrLength ? 1 : arrLength / (range - 1));   
 }

// 读取也整理局部预期输出计算时简单。
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
