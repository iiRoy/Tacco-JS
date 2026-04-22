const ProcessInput = function (SourceText) {
 function ReverseString(OriginalText) {
  let TextToReverse = new String(OriginalText);
  let ReversedOutput = "";
  for (let Idx = TextToReverse.length; Idx > 0; Idx--) {
   ReversedOutput += TextToReverse.charAt(Idx - 1);
  }
  return ReversedOutput;
 };

 let CurrentString = new String(SourceText);
 let LengthOfCurrent = CurrentString.length;

 console.log(ReverseString(SourceText));

 if (ReverseString(SourceText) == SourceText) {

  let FirstHalf = CurrentString.substring(0, (LengthOfCurrent - 1) / 2);

  if (ReverseString(FirstHalf) == FirstHalf) {
   let SecondHalf = CurrentString.substring((LengthOfCurrent + 3) / 2, LengthOfCurrent - 1);
   if (ReverseString(SecondHalf) == SecondHalf) {
    console.log("Yes");
   } else {
    console.log("No");
   }
  } else {
   console.log("No");
  }
 } else {
  console.log("No");
 }
};

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));