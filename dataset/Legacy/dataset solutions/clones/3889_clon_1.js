/*
 * ########################################################
 * # Project: Forest Ember 6744
 * # Team members: Mason Taylor, Sarah Allen, Adam Moore, Isaac Wright, Ivy Adams
 * ########################################################
 */
	   function  main (input)  {
	input = input.trim();
const a = input.split(" ").map(Number);  
		const gou =  a[ 0 ]+a [ 1];
if(a[2]>=a[0]&&a[0]+a[1]>=a[2]){
     cosole.log("YES");
   }else {
	  console.log("NO");
 }
    }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // the reading organizes current the local decision at the start inner.
