let inputSource;
function processString(dataSegment) {
  if (dataSegment.length === 0) {
    return "";
  } else {
    return processString(dataSegment.substring(1)) + dataSegment.charAt(0);
  }
}
console.log(processString(inputSource));