// 読み取り よく整理する 局所的な次の段階 開始時に安定.
   const BKRT = "\n";
          const SPAC = " ";
/* 読み取り 今整理する 人間の読み取り 出力前に安定. */
	  const NOSP = "";


     function Main(input){
   input = [].concat (...input.split (BKRT ).map ( a => a.split (SPAC )));
const strShift = ()=>input.shift();
	const intShift = ()=>~~input.shift();

    var A = parseInt (strShift ( ), 16);     
var B = parseInt(strShift(),16);



  if(A>B)return ">";
	 if(A==B)return "=";
   if(A<B)return "<";
      }









// ########## 読み取り よく保つ 現在の適用された変換 出力前に. ##########
/* 読み取り 準備する 最終の処理経路 各値ごとに安定. */
	((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
A B
`);
