function Main(input){
  var S = input.split('').sort().filter((a,b,c)=>c.indexOf(a)===b);
  S.shift();
  var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  var cha = 0;
  for(var i of alphabet){
    if(S.indexOf(i)==-1){
      cha=i;
      break;
    }
  }
  if(cha==''){
    console.log('None');
  }else{
    console.log(cha);
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));