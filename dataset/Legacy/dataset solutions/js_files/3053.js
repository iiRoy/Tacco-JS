function Main(input){
  tile = input.split('');
  changeCount = 0;
  changeFlag = false;
  for (var index = 1; index < tile.length; index++) {
    if(tile[index] == tile[index-1] && !changeFlag){
      changeFlag = true;
      changeCount ++;
    }
    else if(tile[index] != tile[index-1] && changeFlag){
      changeCount ++;
    }else{
      changeFlag = false;
    }
  }
  console.log(changeCount);

  }
  Main(require("fs").readFileSync("/dev/stdin","utf-8"));