function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main(input) {
  input = myconv(input,3);
  var N = myconv(input[0],1);
  var list = myconv(input[1],4);
  var count = {};
  for(var i = 0; i < N; i++){
    if(count[list[i]] == null){
       count[list[i]] = 1;
    }else{
       count[list[i]]++;
    }
  }
  var useSet = Array.from(Object.keys(count));
  useSet.sort(function(a,b){
  	return myconv(a,1) - myconv(b,1);
  });
  //優先的に食べるのは、複数回出現した数。これを小さい数値・大きい数値両端から攻めてく
  //どっちかあぶれたら不足分は他の出現数1からとって食う
  var mae = 0;
  var ato = useSet.length -1;
  while(true){
    var maeCount = count[useSet[mae]];
    if(maeCount <= 1){mae++; continue;}
    var atoCount = count[useSet[ato]];
    if(atoCount <= 1){ato--; continue;}
    if(mae >= ato){
       //処理終了
      if(maeCount >= 2){
         if(maeCount % 2 == 1){
            count[useSet[mae]] = 1;
         }else{
           count[useSet[mae]] = 0;
         }
      }
      break;
    }else{
      count[useSet[mae]]--;
      count[useSet[ato]]--;
    }
  }
  var output = 0;
  for(var i = 0; i < useSet.length; i++){
    if(count[useSet[i]] == 1){
       output++;
    }
  }
  myout(output);
}
Main(myin());