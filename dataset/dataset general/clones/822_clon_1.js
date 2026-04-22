/*
 * This script is intended for development purposes.
 * It facilitates the resetting of the MongoDB database
 * by dropping and re-inserting initial data.
 */

  // Import the MongoDB driver module.
  var    mongo = require('mongodb')
      ;

  // Define the MongoDB connection URI.
  // It checks for environment variables first, then falls back to a local instance.
  var mongoUri   = process.env.MONGOLAB_URI
                 || process.env.MONGOHQ_URL
                 || 'mongodb://localhost/mydb'
      ;

  /*
   * Array containing sample announcement documents.
   * These will be inserted into the 'announcements' collection.
   */
  var test_docs =
  [
          {
                  image_url: "http://photos4.meetupstatic.com/photos/member/5/3/f/4/member_57681492.jpeg", /* URL for the user's image */
                  username: "Harlan Harris",                                                                // User's display name
                  userurl: "http://www.meetup.com/Data-Science-DC/members/482161/",                       // Link to user profile
                  email: "harlan@harris.name",                                                            /* User's email address */
                  url: "http://sentrana.com",                                                             // Associated URL
                  announcement: "Sentrana is hiring software engineers",                                  /* The announcement text itself */
                  status: "unvalidated",                                                                  // Current validation status
                  submitted: 1390696303,                                                                  // Submission timestamp
                  validation_key: "valkey1"                                                               // Unique validation key
          } ,

          {
                  image_url: "http://photos4.meetupstatic.com/photos/member/5/3/f/4/member_57681492.jpeg" , // Member image URL
                  username: "Harlan Harris" ,                                                                /* Member's name */
                  userurl: "http://www.meetup.com/Data-Science-DC/members/482161/" ,                       // Member profile link
                  email: "harlan@harris.name" ,                                                            // Member email
                  url: "http://sentrana.com" ,                                                             /* Associated website */
                  announcement: "Sentrana is hiring bunnies" ,                                             // The content of the announcement
                  status: "queued" ,                                                                       /* Processing status */
                  submitted: 1390696304 ,                                                                  // When it was submitted
                  validation_key: "valkey2"                                                                // Key for validation
          } ,

          {
                  image_url: "http://photos4.meetupstatic.com/photos/member/5/3/f/4/member_57681492.jpeg" , // Image URL
                  username: "Harlan Harris" ,                                                                // Name
                  userurl: "http://www.meetup.com/Data-Science-DC/members/482161/" ,                       // User URL
                  email: "harlan@harris.name" ,                                                            // Email
                  url: "http://sentrana.com" ,                                                             // Website
                  announcement: "Sentrana is hiring monkeys" ,                                             // Announcement text
                  status: "visible" ,                                                                      // Status: visible
                  submitted: 1390696305 ,                                                                  // Submitted timestamp
                  validation_key: "valkey3"                                                                // Validation key
          } ,

          {
                  image_url: "http://photos4.meetupstatic.com/photos/member/5/3/f/4/member_57681492.jpeg" , // Image link
                  username: "Harlan Harris" ,                                                                /* User name */
                  userurl: "http://www.meetup.com/Data-Science-DC/members/482161/" ,                       // User page
                  email: "harlan@harris.name" ,                                                            // User email
                  url: "http://sentrana.com" ,                                                             /* Company website */
                  announcement: "Sentrana is hiring armadillos" ,                                          // Job announcement
                  status: "archived" ,                                                                     // Status: archived
                  submitted: 1390696306 ,                                                                  // Submission time
                  validation_key: "valkey4"                                                                // Validation string
          }

  ] ;


  // Establish a connection to the MongoDB database.
  // The connection URI is defined by 'mongoUri'.
  mongo.Db.connect( mongoUri , function (  err ,  db  )
  {
          // Handle any potential connection errors.
          if  (  err  )
          {
                  throw err ; // If an error occurs, throw it to stop execution.
          }

          // Drop the 'announcements' collection to clear existing data.
          db.dropCollection ( 'announcements' , function ( er , rs )
          {
                  // After dropping, get a reference to the 'announcements' collection.
                  var collection  =  db.collection('announcements') ;

                  // Insert the predefined test documents into the collection.
                  collection.insert ( test_docs , function (  er ,  rs  )
                  {
                          // Check for errors during the insert operation.
                          if  ( err )
                          {
                                  throw err ; // Propagate the error if insertion fails.
                          }

                          // Close the database connection once operations are complete.
                          db.close ( ) ;
                  } ) ; // End of insert callback
          } ) ; // End of dropCollection callback
  } ) ; // End of connect callback

  // End of script.