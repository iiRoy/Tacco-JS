function Main(input) {
    input = input.split(" ");
    one = false;
    nana = false;
    nine = false;
    four = false;
    for(i = 0; i < 4; i++){
        if(input[i] === "1") one=true;
        if(input[i] == "7") nana = true;
        if(input[i] == "4") four = true;
        if(input[i] == "9") nine = true;
    }
  if(one && nana && nine && four){
    console.log('YES')
  }
    
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
