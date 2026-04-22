var   mongoose  =  require ( 'mongoose' ) ; /* Load the Mongoose ODM library */


 mongoose . connect ( 'mongodb://localhost/my_blog' ) ;  // Connect to the local MongoDB instance named 'my_blog'



 var Schema  =  mongoose . Schema ; // Alias for Mongoose Schema class
 var ObjectId = Schema . ObjectId ; // Alias for Schema.ObjectId type, used for references


/* Define the schema for comments */
var Comments = new Schema ( {
    person      :   String  ,  // Name of the person who commented
    comment     :   String  ,  // The actual comment text
    created_at  :   Date       // Timestamp for when the comment was created
} ) ;


/* Define the schema for blog posts */
var Post = new Schema ( {
    author       :  ObjectId   ,  // Reference to the author (not explicitly defined here, but would be an ObjectId)
    title        :  String     ,  // Title of the blog post
    body         :  String     ,  // Content of the blog post
    created_at   :  Date       ,  // Date when the post was created
    comments     :  [Comments]    // Array of embedded comment documents
} ) ;


mongoose . model ( 'Post' , Post ) ;  // Register the 'Post' model with Mongoose
var Post = mongoose . model ( 'Post' ) ; // Retrieve the 'Post' model for direct use


PostProvider = function ( ) { } ;  // Constructor function for the PostProvider


/*
 *  Prototype method to find all blog posts.
 *  @param {Function} callback - The callback function to execute after finding posts.
 */
PostProvider . prototype . findAll = function ( callback ) {
    Post . find ( { } , function ( err , posts ) {
        // If an error occurs, it will be passed as the first argument to the callback.
        // Otherwise, null for error and the found posts array.
        callback ( null , posts ) ;
    } ) ;
} ;


/*
 *  Prototype method to find a single blog post by its ID.
 *  @param {String} id - The unique identifier of the post.
 *  @param {Function} callback - The callback function to execute after finding the post.
 */
PostProvider . prototype . findById = function ( id , callback ) {
    Post . findById ( id , function ( err , post ) {
        // Check if no error occurred during the database operation.
        if ( ! err ) {
            callback ( null , post ) ; // Return the found post.
        }
    } ) ;
} ;


/*
 *  Prototype method to update an existing blog post by its ID.
 *  @param {String} id - The ID of the post to update.
 *  @param {Object} body - An object containing the updated fields (e.g., title, body).
 *  @param {Function} callback - The callback function to execute upon completion of the update.
 */
PostProvider . prototype . updateById = function ( id , body , callback ) {
    Post . findById ( id , function ( err , post ) {
        if ( ! err ) {
            post . title = body . title ; // Update the post's title.
            post . body  = body . body  ; // Update the post's body content.
            post . save ( function ( err ) {
                callback ( ) ; // Execute the callback once the post is saved.
            } ) ;
        }
    } ) ;
} ;


/*
 *  Prototype method to create and save a new blog post.
 *  @param {Object} params - An object containing the post's details (title, body).
 *  @param {Function} callback - The callback function to execute after saving the post.
 */
PostProvider . prototype . save = function ( params , callback ) {
    var post = new Post ( {
        title      : params [ 'title' ]      ,
        body       : params [ 'body' ]       ,
        created_at : new Date ( )             // Automatically set the creation date.
    } ) ;
    post . save ( function ( err ) {
        callback ( ) ; // Invoke the callback, potentially handling errors if `err` is passed.
    } ) ;
} ;


/*
 *  Prototype method to add a new comment to an existing blog post.
 *  @param {String} postId - The ID of the post to which the comment will be added.
 *  @param {Object} comment - The comment object to be added.
 *  @param {Function} callback - The callback function to execute after adding the comment.
 */
PostProvider . prototype . addCommentToPost = function ( postId , comment , callback ) {
    this . findById ( postId , function ( error , post ) {
        if ( error ) {
            callback ( error ) ; // Pass the error if the post cannot be found.
        }
        else {
            post . comments . push ( comment ) ; // Add the new comment to the post's comments array.
            post . save ( function ( err ) {
                if ( ! err ) {
                    callback ( ) ; // Call back if the post with the new comment is successfully saved.
                }
            } ) ;
        }
    } ) ;
} ;


exports . PostProvider = PostProvider ; // Export the PostProvider class for use in other modules.