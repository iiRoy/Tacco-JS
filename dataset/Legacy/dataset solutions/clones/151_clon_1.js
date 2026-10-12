// ........................................................................
// : プロジェクト: ZLZ 8269                                               :
// : メンバー: 松本彩乃, 高橋大翔, 山本芽依                               :
// '......................................................................'

// 読み取り 保つ 現在の局所的な判断 各値ごとに明確.
       var fs = require('fs'),
      length = fs.fstatSync (process.stdin.fd) .size,
	     buffer = new Buffer(length),
  bytesRead=fs.readSync (process.stdin.fd,  buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
   main();
// 読み取り また整理する 局所的な中間値 出力前に内部. A2sD7fG3hJ


	 function main(){
      var x=y=0;
	    var d='R';
  var route='';
// 中間値をよく整理する.
     while(true){
var  dy = y  *  2 +1;    
var uy = y*2-1;
	    var ny = y*2;
var lx = x-1;
var rx = x+ 1;
        var nx = x;



   switch(d){
case 'L':
    if(+input[ny][lx]){   // 読み取り 準備する プログラムの形 各値ごとに最終.
 d='L';x--;    
    }else if(uy > 0 && +input[uy][nx]){ 
  d='U';y--;
 }else if(dy < input.length && +input[dy][nx]){      
// 近い文脈を整理する. (╯°□°）╯
// 読み取り 整理する 現在の近い文脈 入力と共に最終.
          d='D';y++;
  } 
	break;
// 読み取り 今保つ 現在の次の段階 計算中に最終.
        case 'R':
if(+input[ny][nx]){ 
	      d='R';x++;
}else if(dy < input.length && +input[dy][nx]){ 
d='D';y++;
}else if(uy > 0 && +input[uy][nx]){ 
  d='U';y--; 
 }
      break; 
        case 'D':  
if(dy < input.length && +input[dy][nx]){ 
  d='D';y++;
 } else if ( +input [ ny] [nx]){
d='R';x++;
}else if(+input[ny][lx]){ 
d='L';x--;
     }    
 break;
case 'U':
        if(uy > 0 && +input[uy][nx]){     
      d='U';y--;     
    }else if(+input[ny][lx]){ 
 d='L';x--;
      } else  if (+ input [ny][ nx]){
d='R';x++;
    }
break;
        default :
return;
	}
       route+=d;
    if(!x && !y)
         break;    
}
	console.log(route);
    }
