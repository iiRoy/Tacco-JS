var input = require('fs').readFileSync('/dev/stdin', 'utf8');
        var  str  =input.trim ();    
 var arr=[];
   str=str.replace(/(J+)(O+)(I+)/g,function(s,s1,s2,s3){
	   if(s1.length>=s2.length && s3.length>=s2.length)arr.push(s2.length);
	});
    console.log (Math.max.apply (null,  arr ));

/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Proyecto: ABFE 1052                                                  │
 * │ Integrantes: Mónica López, Paula Paredes                             │
 * │ Matrículas: J149404281, L666418212                                   │
 * └──────────────────────────────────────────────────────────────────────┘
 */
