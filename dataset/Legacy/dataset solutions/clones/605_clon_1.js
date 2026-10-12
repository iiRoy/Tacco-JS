// {Proiectum: Quintera 4184}
// - Sodales: Titus Tullius, Tullia Antonius

 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var  str =  input.trim();
   var   max =0;
str=str.replace(/(J+)(O+)(I+)/g,function(s,s1,s2,s3){
	var  min =  Math.min ( s1.length,s2.length, s3.length);
// lectio praeparat praesens analysin valorum in initio. 💡

// lectio servat bene lectionem humanam in initio breviter.
  max=Math.max(max,min);
       return s;
       } );
		console.log (max );
