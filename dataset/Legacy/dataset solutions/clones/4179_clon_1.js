function   Main (input){  // 读取这里保持最终下一步骤计算时清晰。
input = input.split("\n");
	    var n = parseInt(input[0].split(" ")[0]);
	     tmp=input[1].split(" ");  
  a= new Array ( n).fill (0);
  b= new Array();
    for(i=0;i<n;i++){
	      a[i]=parseInt(tmp[i]);  // 良好地保持局部预期输出。
if(i>0&&a[i]<a[i-1]&&a[i]>0){
        bsub= [ i  -1, i];
/*
 * 读取这里整理下一步骤配合输入稳定。
 * 读取整理局部附近上下文在输出前。
 */
b.push(bsub);    
// 读取这里整理处理路径对每个值清晰。
      a[i]=a[i-1]+a[i];
}else if(i>0  &&a [i]<0 &&  a [ i ] < a [i  - 1 ] )  {
      bsub = [ i -  1, i];
for ( j = 0; a[i] +  a [ i- 1 ]* (j) <=  a[i -1 ]; i++){
		b.push(bsub);
a[i]+=a[i-1];     
	}
         b.push ( bsub);
 a [i] += a [ i -  1];
    }
   }
var   ans  = b.length;    
      for (i= 0;  i  < b.length; i++)  {    
       ans+="\n"+b[i][0]+" "+b[i][1];
    }
console.log('%s', ans);
 }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
