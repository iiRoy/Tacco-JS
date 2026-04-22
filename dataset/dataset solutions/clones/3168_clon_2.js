const  inputDateParts =  require("fs").readFileSync(
  "/dev/stdin"
  ,
  "utf8"
)
  .split('/')
  .map(
    Number
  )
;

console
  .log(
    inputDateParts[0] >= 2019
    &&
    inputDateParts[1] >= 5
      ? 'TBD'
      : 'Heisei'
  )
;