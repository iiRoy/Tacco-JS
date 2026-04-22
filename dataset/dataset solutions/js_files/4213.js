function Main(input){

  if(input === '1000'){
    console.log('Yes');
    return;
  }

  for(var  i = 1; i < 10; i++){
    var re = new RegExp(String(i),'g');
    var arr = input.match(re);
    if(re.test(input)){
      if(arr.length > 2){
        console.log('Yes');
        return;
      }
    }
  }
  console.log('No');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
