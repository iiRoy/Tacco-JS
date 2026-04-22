/**
 * This module is responsible for updating the ZIP code input field
 * within a form, based on the output from the LiveAddress service
 * after an address has been successfully accepted.
 *
 * It listens for the "AddressAccepted" event emitted by the liveaddress object.
 *
 * Pre-requisite:
 * A global or accessible 'liveaddress' object must be initialized,
 * typically like: var liveaddress = $.LiveAddress(...);
 */


liveaddress
    .on(
        "AddressAccepted",

        function ( event ,  data ,  previousHandler )

        {
            // Declare a variable to hold the reference to the ZIP code DOM element.
            var   zipField   =   data .  address .  getDomFields () [ 'zipcode' ] ;


            /*
             * Update the value of the ZIP code field.
             * It uses a ternary operator: if a chosen response exists,
             * it takes the zipcode from there; otherwise, it retains the
             * current value of the field.
             */
            zipField .  value   =
                data .  response .  chosen
                ?   data .  response .  chosen .  components .  zipcode
                :   zipField .  value
            ;

            // Ensure the original event handler is called to maintain default behavior.
            previousHandler ( event ,  data ) ;
        }
    )
;