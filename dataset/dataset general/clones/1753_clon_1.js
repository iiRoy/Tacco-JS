/**
 *  This is a Type I clone of the original JavaScript code.
 *  It provides a `setTimeout` function that wraps `vertx.setTimer`.
 */
this
  .setTimeout
  =
  function
  (
    fn
    ,
    delay
  )
{
  // The core logic delegates directly to the Vert.x timer API.
  return
    vertx
      .setTimer
      (
        delay
        ,
        fn
      )
  ;
}
;


/**
 *  This function cancels a previously scheduled timer.
 *  It wraps `vertx.cancelTimer`.
 */
this
  .clearTimeout
  =
  function
  (
    id
  )
{
  // Only attempt to cancel if the ID is not null or undefined.
  if
  (
    id
    !=
    null
  )
  {
    return
      vertx
        .cancelTimer
        (
          id
        )
    ;
  }
}
;