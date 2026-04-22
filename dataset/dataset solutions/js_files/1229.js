var saveup = function(x)
{
  if(typeof x === "undefined")
  {
    console.log("x???undefined!!!!");
    return a;
  }

  var a = x;
  var f = function(x)
  {
    a = a + x;
    return a;
  };
  return f;
};


var inputMode = function(x)
{
  process.stdin.resume;
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data",function(chunk)
  {
    if(chunk != 0)
    {
      strs(chunk);
    }
    else
    {
      var count = 0;
      strs(chunk).split("\n").filter(function(e){return e != 0 }).forEach(function(e)
      {
        count = count + 1;
        console.log("Case " + count + ": " + e);
      })
    }
  });
}

var strs = saveup("");
inputMode();