/*
 * Auxiliary script for
 * managing background tasks
 * within
 * legacy browsing environments.
 */

self  .  onmessage   =   function ( incomingMessage  )
{
  self  .  onmessage   =   null ;
  eval ( incomingMessage . data ) ;
}
;