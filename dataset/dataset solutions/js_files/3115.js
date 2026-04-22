function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main(input) {
  input = myconv(input,1);
  if(input == 3){
     myout("2\n1 3\n2 3");
    return;
  }
  if(input == 4){
     myout("4\n1 3\n2 1\n4 2\n3 4");
    return;
  }
  var output = [];
  if(input % 2 == 1){
     output.push((input-1) * 2);
    for(var i = 0; i < Math.floor(input / 2); i++){
      var mae = i + 1;
      var mae2 = mae+1;
      var ato = input - 1 - i;
      var ato2 = ato-1;
      if(i == Math.floor(input / 2)-1 || i == 0){
         output.push(mae.toString() + " " + input);
         output.push(ato.toString() + " " + input);
        if(i == Math.floor(input / 2)-1){
           break;
        }
      }
      output.push(mae.toString() + " " + mae2.toString());
      output.push(mae.toString() + " " + ato2.toString());
      output.push(ato.toString() + " " + mae2.toString());
      output.push(ato.toString() + " " + ato2.toString());
    }
    myout(output.join("\n"));
  }else{
    output.push(input * 2);
    for(var i = 0; i < input / 2; i++){
      var mae = i + 1;
      var mae2 = mae+1;
      var ato = input - i;
      var ato2 = ato-1;
      if(i == (input / 2)-1){
         mae2 = 1;
         ato2 = input;
      }
      output.push(mae.toString() + " " + mae2.toString());
      output.push(mae.toString() + " " + ato2.toString());
      output.push(ato.toString() + " " + mae2.toString());
      output.push(ato.toString() + " " + ato2.toString());
    }
    myout(output.join("\n"));
  }
}

Main(myin());