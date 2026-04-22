// --- Event Schema Definition ---
// This file describes the data structure for 'Event' objects
// within the CrowdNotes application.

var  mongoose   =  require('mongoose') ;


var  Schema     =  mongoose.Schema    ;

//
//  Define the Event data schema using Mongoose's Schema constructor.
//
var EventSchema =  new  Schema  (
  {
    name          :   String
  ,
    date          :
      {
        type      :   Date,
        default   :   Date.now
      }
  ,
    description   :   String
  ,
    hashtag       :   String // Important: client-side or server-side validation should prefix with '#'
  }
);


// Export the EventSchema as a Mongoose model named 'Event'.
// This makes the model available for database operations in other modules.
module.exports =  mongoose.model('Event', EventSchema) ;