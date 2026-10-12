function Main(input){
  
  var str = input.trim().split(" ");
  var a = str[0];
  var b = str[1];
  
  //var kekka = 0;
  
  if(a>b){
    var kekka = a*2 -1;
    
  }else if(b>a){
     var kekka = b*2 -1;
  }else if(a==b){
    var kekka = a*2;
  }

   
   console.log(kekka);
}//function end
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));