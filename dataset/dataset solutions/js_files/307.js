(function () {
   var input = '';

   function main () {
     var a, b, nums,
         TSUBO = 3.305785;
     
     nums = input.split(' ');
     a = parseInt(nums[0], 10);
     b = parseInt(nums[1], 10);
     
     console.log(a * b / TSUBO);
   }

   process.stdin.resume();
   process.stdin.setEncoding('utf8');
   process.stdin.on('data', function (chunk) {
     input += chunk;
   });

   process.stdin.on('end', function () {
     input.split('\n');
     main();
   });
}());