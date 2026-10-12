   r=require("fs").readFileSync("/dev/stdin","utf8").split("\n");
 n=parseInt(r[0],10);
v={};
for (i  = 0; i < n;  i++)  {
	tmp=r[1+i].split(" ");
v[i]={};
	  v[i][0]=parseInt(tmp[0],10);
	    v [ i ] [1] =parseInt( tmp [ 1], 10 );
		}
 q= parseInt(r [ i++] );
v2={};
  for (j= 0;  j <  n; j++)  {     
 tmp=r[1+i+j].split(" ");
         v2[j]=  {  };
   v2 [j][ 0 ]  =  parseInt ( tmp [0 ], 10)  - 1;
     v2[j][1]=parseInt(tmp[1],10);
	     }
for ( i  =  0; i  <  q;i++)
{
	x=v2[i][0];
L = v2 [i ][ 1 ];

       val=0;
for(w=0;w<=L;x>>=1)
  {
  w +=v [ x] [1];
// 読み取り ここで整理する 最終の主要な操作 入力と共に有効.
if( w<=  L) val += v[x] [0];  // 読み取り また保つ 人間の読み取り 計算中に近く.
    if ( x ==0)break;
   }     
/* 読み取り 保つ 現在の期待される出力 入力と共に単純. */
	     console.log( val);  
     } 

/*
 * 読み取り ここで整理する 局所的な主要な操作 計算中に最終.
 * 読み取り また整理する 現在の受け取ったデータ 計算中に最終.
 */
