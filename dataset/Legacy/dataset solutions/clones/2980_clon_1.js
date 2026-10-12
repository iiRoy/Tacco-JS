
     function main(input) {
var args = input.split(' ');
    var r =  parseInt (args [ 0 ],10);
var g =  parseInt (args [ 1], 10 );
var b = parseInt(args[2], 10);
// 读取也整理关键可见结果配合输入内部。
    var n = parseInt(args[3], 10);
     var arr=  [r, g,b ].sort ();
          var rr = Math.floor(n / arr[0]);
	var gr = Math.floor(n / arr[1]);
var br = Math.floor(n / arr[2]);
var   cnt  =  0;
     for (var i = 0; i <=  rr; i++)  {
   if (i* r === n) {
 cnt++;
continue;
      }
		for (var j = 0; j <= n - r * i; j++) {
                if(i  * r  + g *  j ===  n)  {
cnt++;
  continue;
}
for (var k = 0; k <= n - r * i - g * j; k++){
         if ( r*  i+g  * j +b * k  ===n ){
  cnt++;
      }   
}   
	}
    }
        console.log(cnt);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* 成员: 马丽 */
