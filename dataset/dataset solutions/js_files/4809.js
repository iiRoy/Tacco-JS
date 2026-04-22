function Main(input) {
    input = input.split("\n");
    tmp = input[1].split(" ");
    var c = 1;
    var d = 0;
    var e = [];
    for(k=0;k<tmp.length;k++){
       e[k]=0;
    }
    for(i=0;i<tmp.length;i++){
      e[tmp[i]]++;
      if(e[tmp[i]] > 2){
        c = 0;
        break;
      }
    }
    if(input[0]%2==1 && e[0] != 1){
      c = 0;
    } else {
      for(j=1;j<tmp.length;j++){
         if((input[0]%2==0 && j%2 == 1 && e[j] != 2) || (input[0]%2==1 && j%2 == 0 && e[j] != 2) || (input[0]%2==0 && j%2 == 0 && e[j] != 0) || (input[0]%2==1 && j%2 == 1 && e[j] != 0)){
           c = 0;
           break;
         }
      }
    }
    if(c==1){
      c = Math.pow(parseInt(tmp.length / 2) , 2) % (Math.pow(10,9)+7);
    }
    console.log('%s', c);
}

function debug(){
	var input = document.getElementById("input").value;
	Main(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));