var s = "FFFFdfadadadfd"

var sArr = s.split('')
var cflag = false;
var fflag = false;
function test(s) {
  for (var i = 0; i < sArr.length; i++) {
    if(sArr[i] == "C") {
      cflag = true;
    }
    if(sArr[i] == "F" && cflag == true) {
      return true;
      break;
    }
  }
  if(cflag != true && fflag != true) {
    return false;
  }
}

test(s);