function myout(text){console.log(text);}//standard output
function Main(input) {
	//input = parseInt(input);
	//input = input.trim().split(" ");
	input = input.trim().split("\n");
	//input = input.trim().split(" ").map((a)=>Number(a));
	//input = input.trim().split("\n").map((a)=>Number(a));
  
  /*
  abcd→一番左は3パターン
  abcd→以降は2パターン
  ---------
  aac→左上3パターン、左下2パターン＝6パターン
  bbc→次の縦並びは必ず1パターンしか選べない
  ---------
  aacc→左上は3パターン、左下2パターン
  bbdd→右側は「左側の上下逆」「上だけ別」「下だけ別」の3パターン
  ---------
  abb→左側が決まってるので
  acc→上下まとめて2パターン
  */
  
  var N = parseInt(input[0]);
  var list1 = input[1].split("");
  var list2 = input[2].split("");
  var output = 1;
  var mod = 1000000007;
  var mae = true;//一つ前が縦並びか横並びか（true:縦、false:横）
  for(var i = 0; i < N; i++){
    if(i == 0){
       if(list1[i] == list2[i]){
          output = output * 3 % mod;
       }else{
          output = output * 6 % mod;
          i++;
          mae = false;
       }
    }else{
      if(mae){
        output = output * 2 % mod;
         if(list1[i] == list2[i]){
      	    mae = true;
     	  }else{
            i++;
            mae = false;
         }
      }else{
        if(list1[i] == list2[i]){
      	   mae = true;
     	}else{
          output = output * 3 % mod;
          i++;
            mae = false;
        }
      }
    }
    //myout(list1[i]+list2[i] + ":" + output);
  }
  myout(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
