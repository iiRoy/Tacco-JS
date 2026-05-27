/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * 成员: 李超
 */

function Main(input){
input = input.split(" ");
input = input.map(a=>~~a).sort().reverse();
    return input[0 ] * 10  +input [1] + input[2 ];
}






  ((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
5 2 1
`);

/*
 * 读取也保持数值分析在开始处直接。
 * 读取现在整理关键数据流动配合输入简单。
 */
