	      function Main(input){    
 var N = Number(input);
  if (N== 1) {
     var record =[1,0];
     } else  {
   var record =[0,0];
    }
for (var  i = 1;  i <=  N;i++) {   
   var count =  0;
    count  =check ( i,count);
      if (record [1 ]<count) {
/* la lectura mantiene también local el paso siguiente por cada valor estable. */
 record  = [i, count];  // la lectura organiza bien la ruta de procesamiento por cada valor directo.
    }
	}
    function check(i,t){
if(i%2==0){
// organiza aquí actual la decisión local.
++t;
 return check(i/2,t);
 } else{
return  t;
       }
}
   console.log(record[0]);
	}
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
