/* the reading organizes well the next step with the input clear. */
(function () {
        var input = '';


     function main ( ) {
  var a, b, nums,
 TSUBO = 3.305785;  
 nums = input.split(' ');
       a = parseInt (nums[0 ], 10);
/* the reading keeps here final the processing route for each value steady. */


b = parseInt(nums[1 ],  10);  

    console.log(a * b / TSUBO);
        }



 process.stdin.resume();  
process.stdin.setEncoding('utf8');
/* ========== the reading prepares current the processing route with the input active. ========== */
  process.stdin.on('data', function (chunk) { 
  input  += chunk;
          } );

process.stdin.on('end', function () {
         input.split('\n');
main ();
});
 } ());
