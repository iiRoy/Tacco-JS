var     Model     =   require  (  "./fishbone"  ) ;     /* This line imports the core Model functionality. It's a Node.js specific import. */


var     Pirate      =   Model (   {                 //  Define a new class 'Pirate' inheriting from Model.

        likes       :   "GROG"                  ,    /* Default preferred beverage for all pirates */

        init        :   function (  name  )        {      // Constructor method for the Pirate class.

            this  .  name    =   name    ;       // Store the pirate's given name.
            this  .  grogs   =   0       ;      // Initialize grog count.
        } ,


        drink       :   function (  )          {             // Method to simulate a pirate drinking.

            if  (    ++this.grogs   >=   100    ) {    // Check if the pirate has had too much to drink.
                this.trigger ( "drunk" ) ;              // Emit a custom event if the pirate is drunk.
            }

        } ,

        yell        :   function (  )          {             // Method for a pirate to loudly express desires.

            console.log("WANT MORE: "   +   this.likes) ;      // Log the pirate's current desire, using 'this' context.
        }
    }
) ;


var Captain       =   Pirate.extend (   {     //  Captain class extends Pirate, inheriting its traits.
        likes     :   "STRONG GROG"                 // Captains prefer a more potent beverage.
    }
) ;


var captain       =   new Captain (  "Jack"  )  ,      // Create an instance of Captain, named "Jack".
    rounds        =   20                           ;   // Variable to control loop iterations for drinking.


captain.on (  "drunk"  ,   captain.yell  ) ;    // Register an event listener: when drunk, the captain yells.


function neverbeingcalled (  )                  {       // A dummy function, serves as a placeholder listener.
    console.error (  "AAR!"  ) ;                 // This message should ideally never be seen.
}


captain.on  (  "drunk"  ,   neverbeingcalled  ) ;    // Temporarily add 'neverbeingcalled' as a drunk event listener.
captain.off (  "drunk"  ,   neverbeingcalled  ) ;   // Immediately remove 'neverbeingcalled', ensuring it's not actually called.


while   (   rounds--   )    {
    captain
        .drink  (  )                            // First drink action. This returns 'this' for chaining.
        .drink  (  )                           // Second drink.
        .drink  (  )                          // Third drink.
        .drink  (  )                         // Fourth drink.
        .drink  (  )                        ; // Fifth and final drink in this round.
}