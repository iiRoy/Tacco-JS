/*
 * This is a constructor function for the Comment object.
 * It initializes a new instance of Comment.
 * @class Comment
 * @param {object} section - The section object associated with this comment.
 * @param {object} attributes - Additional attributes for the comment.
 */
// External dependencies
var _ = require( 'lodash' ) ;

// Internal dependencies, template for rendering
var CommentTemplate = require( '../templates/comment.html' ) ;


function Comment ( section , attributes )
{
    // Assign the section provided to the instance property.
    this . section = section ;


    // Assign the attributes provided to the instance property.
    this . attributes = attributes ;
}

// Define a method on the Comment prototype for rendering.
Comment . prototype . render = function ( )
{
    // This method is currently empty and serves as a placeholder.
    // Future implementation will involve rendering the comment using CommentTemplate.
} ;