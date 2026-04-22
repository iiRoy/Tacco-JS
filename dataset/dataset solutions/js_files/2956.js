function main(input) {
  var data = input.split("");

  var A = data[0]+data[1];
  var B = data[2]+data[3];

  var judgeA = IsYY(Number(A));
  var judgeB = IsYY(Number(B));

  var result;

    /*
    2? => NA
    ?2 => NA
    11 => ???? => AMBIGUOUS
    10 => MMYY
    01 => YYMM
    00 => YYYY => NA
  */

  if(judgeA == "2" || judgeB == "2" || (judgeA == "0" && judgeB == "0")){
    result = "NA";
  }else if(judgeA == "1"){
      if(judgeB == "0"){
        result = "MMYY";
      }else{
        result = "AMBIGUOUS";
      }
  }else{
    if(judgeB == "1"){
      result = "YYMM";
    }else{
      result = "NA";
    }
  }

  console.log(result);
}

function IsYY(value){
if(value == 0){
    return "2"; 
  }else if(1 <= value && value <= 12){
    return "1"; 
  }else{
    return "0"; 
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));


