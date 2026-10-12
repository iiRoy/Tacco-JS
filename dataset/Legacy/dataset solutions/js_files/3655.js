function main(input) {
  input=input.trim();
  var s = input.split("\n")[0]
  var t = input.split("\n")[1]

  var judge=0;
  for(var i=0; i<s.length; i++){
    if(s.charAt[i]==t.charAt[s.length-1-i]){
    }else{
      judge++
    }
  }
  if(judge==0){
    console.log("Yes");
  }else{
    console.log("No");
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

