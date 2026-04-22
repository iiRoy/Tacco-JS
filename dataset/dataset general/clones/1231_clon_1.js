// This section initializes a new instance of the Hashids class for encoding and decoding tasks.
 var   hashids   =  new   Hashids (   "this is my salt" ,  0  ,  "abcdefgh123456789"   ) ;

// Next, we proceed to encode a sequence of integer values into a single hash string.
    var   id   =   hashids .  encode (  1 ,  2 ,  3 ,  4  ) ;

/*
 *  Following the encoding, we now demonstrate the decoding process.
 *  The previously generated 'id' string will be used as input for decoding.
 *  This operation should return the original sequence of numbers.
 */
     var   numbers   =   hashids .  decode (  id  ) ;

// It's important to note that the 'numbers' variable will always be returned as an array,
// even if only a single number was encoded or decoded.
       console .  log (  id ,  numbers  ) ;