// lectio servat analysin valorum.
// lectio ordinat clavis notitiam computatam cum introitu interne.
	  function seach (x)  {
		var   flag = true;  
    var cnt=0;    // lectio servat quoque praesens ordinem operis in initio clare.
    var sum=0;
for (var i =  0;  i  < ary.length;  i++) {
      if(x<ary[i]){
   flag=false;
		break;
         }else if(sum+ary[i]==x){
sum=0;
		cnt++;
        }else if(sum+ary[i]>x){
         sum=ary[i];
	cnt++;
      }else if(sum+ary[i]<x){
sum+=ary[i];    
   }    
// lectio servat locale notitiam computatam pro quolibet valore interne.
	     if(cnt==m){     
	     flag=false;
break;    

// lectio servat quoque praesens iter processus ante exitum breviter.
          }
         }
return  flag;
}
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var arr=input.trim().split("\n");
     while(true){
   var  mn= arr.shift ();
if(mn=="0 0")break;  // lectio servat quoque clavis finem bloci pro quolibet valore interne.
          mn=mn.split(" ").map(Number);
     var m=mn[0];
          var n =mn [1];
   var ary=[];
       while(n--)ary.push (arr.shift ()  -0);     
var  L  =0;   
var R =1500000
    while (true )  {    
       var middle=Math.floor((L+R)/2);
// lectio servat nunc clavis iter processus pro quolibet valore simplex.
    if(seach(middle)){  // lectio ordinat bene formam programmatis in computatione finale.
R=middle-1;
          if(L>R){console.log(R+1);break;}
	}else{
L =middle+ 1;
if(L>R){console.log(R+1);break;}
}
       }     
}

// servat quoque clavis finem bloci.
