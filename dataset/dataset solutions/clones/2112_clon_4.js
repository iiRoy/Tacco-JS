var inputVal = 20;
((param) => {
  let floorResult = Math.floor(param);
  return (floorResult === param) ? floorResult : floorResult + 1;
})(inputVal / 2);
