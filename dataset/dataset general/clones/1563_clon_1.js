/**
 * This module defines commands for interacting with GitHub teams.
 * It provides functionality to add users to teams and repositories to teams.
 *
 * To integrate this into a commander.js based application, ensure you require it
 * before calling `program.parse()`.
 * Example: require('../cmds/team.js')(program);
 */
'use strict' ;


var   request = require ( "superagent" ) ;
var   fs      = require ( 'fs' )      ;
var   path    = require ( 'path' )    ;
var   inquirer = require ( "inquirer" ) ;
var   Sifter  = require ( "sifter" ) ;



module.exports = function ( program ) {


  /**
   * Helper function to suggest a match if the input name isn't exact.
   * Uses Sifter.js for fuzzy matching.
   *
   * @param {string}   name       The name to search for.
   * @param {Array<Object>} collection The collection of objects to search within (each object must have a 'name' property).
   * @param {Function} callback   The callback function to execute with the matched item.
   */
  var didYouMean = function ( name ,  collection ,  callback ) {

    // Initialize Sifter with the provided collection.
    var sifter = new Sifter ( collection ) ;

    // Perform a search for the given name, limiting to one result based on the 'name' field.
    var result = sifter . search ( name ,  {
      fields : [ 'name' ] ,
      limit  : 1
    } ) ;

    // Retrieve the best match from the collection using the sifter result.
    var match  = collection [ result . items [ 0 ] . id ] ;


    // If the best match's name is not an exact match to the input name,
    // prompt the user with a "Did you mean..." question.
    if ( match . name  !==  name ) {

      var questions = [ {
        type    : "confirm" ,
        name    : "didyoumean" ,
        message : "Did you mean " +  match . name  + " ?" ,
        default : false
      } ] ;

      // Prompt the user for confirmation.
      inquirer . prompt ( questions ,  function ( answer ) {

        if ( answer . didyoumean  ===  true ) {

          // If confirmed, and a callback is provided, execute it with the matched item.
          if ( callback  !==  undefined  &&  callback  !==  null ) {
            callback . apply ( this ,  [ match ] ) ;
          }

        } else {

          // If not confirmed, log a message indicating no match was found.
          console . log ( "Couldn't find a match." ) ;

        }

      } ) ;

    } else {

      // If the match is exact, and a callback is provided, execute it immediately.
      if ( callback  !==  undefined  &&  callback  !==  null ) {
        callback . apply ( this ,  [ match ] ) ;
      }

    }

  } ;


  /**
   * Retrieves the ID of a GitHub team by its name within a specified organization.
   * It uses the didYouMean helper for fuzzy matching team names.
   *
   * @param {string}   teamName The name of the team to find.
   * @param {string}   orgName  The name of the GitHub organization.
   * @param {Function} callback The callback function to receive the team ID.
   */
  var getTeamId = function getTeamId ( teamName ,  orgName ,  callback ) {

    request
      . get ( "https://api.github.com/orgs/"  +  orgName  +  "/teams" )
      . query ( { access_token : program . config . github . token } )
      . query ( { per_page     : 100 } ) // Note: Current implementation only fetches the first 100 teams.
      . set   ( 'Content-Type' , 'application/json' )
      . end   ( function ( res ) {

        if ( res . ok ) {

          console . log ( "...got first 100 teams" ) ;

          // TODO: Accommodate paginated results from the GitHub API.
          // This will only process the first page (up to 100 results).
          didYouMean ( teamName ,  res . body ,  function ( match ) {
            callback . apply ( this ,  [ match . id ] ) ;
          } ) ;

        } else {

          // Log the error response body if the request was not successful.
          console . log ( res . body ) ;

        }

      } ) ;

  } ;


  /**
   * Adds a GitHub user to a specific team.
   *
   * @param {number}   teamId   The ID of the team.
   * @param {string}   userName The GitHub username to add.
   * @param {Function} callback An optional callback function to execute on success.
   * @param {Array}    args     Arguments to pass to the callback function.
   */
  var addTeamUser = function addTeamUser ( teamId ,  userName ,  callback ,  args ) {

    request
      . put ( "https://api.github.com/teams/"  +  teamId  +  "/members/"  +  userName )
      . query ( { access_token : program . config . github . token } )
      . set   ( 'Content-Type' , 'application/json' )
      . end   ( function ( res ) {

        if ( res . ok ) {

          console . log ( "user:"  +  userName  +  " has been added to team:"  +  teamId ) ;

          // If a callback is provided, execute it.
          if ( callback  !==  undefined  &&  callback  !==  null ) {
            callback . apply ( this ,  args ) ;
          }

        } else {

          // Log the error response body if the request failed.
          console . log ( res . body ) ;

        }

      } ) ;

  } ;


  /**
   * Grants a GitHub team access to a specific repository.
   *
   * @param {number}   teamId   The ID of the team.
   * @param {string}   orgName  The name of the GitHub organization the repo belongs to.
   * @param {string}   repoName The name of the repository.
   * @param {Function} callback An optional callback function to execute on success.
   * @param {Array}    args     Arguments to pass to the callback function.
   */
  var addTeamRepo = function addTeamRepo ( teamId ,  orgName ,  repoName ,  callback ,  args ) {

    request
      . put ( "https://api.github.com/teams/"  +  teamId  +  "/repos/"  +  orgName  +  "/"  +  repoName )
      . query ( { access_token : program . config . github . token } )
      . set   ( 'Content-Type' , 'application/json' )
      . end   ( function ( res ) {

        if ( res . ok ) {

          console . log ( teamId  +  " granted access" ) ;

          // If a callback is provided, execute it.
          if ( callback  !==  undefined  &&  callback  !==  null ) {
            callback . apply ( this ,  args ) ;
          }

        } else {

          // Log the error response body if the request failed.
          console . log ( res . body ) ;

        }

      } ) ;

  } ;


  // Define the 'tua' command for adding a user to a team.
  // Example Usage: ghi tua -o "macroscope" -t "Team alexis" -u "alexanderphillip"
  program
    . command     ( 'tua' )
    . description ( 'Team User Add: Add a GitHub user to an existing team ' )
    . option      ( '-o, --org <orgname>' , 'GitHub OrgName' )
    . option      ( '-t, --team <teamname>' , 'GitHub TeamName' )
    . option      ( '-u, --user <username>' , 'GitHub UserName' )
    . action      ( function ( options ) {

      // First, get the team ID using the provided team name and organization.
      getTeamId ( options . team ,  options . org ,  function ( teamId ) {

        // Once the team ID is retrieved, add the user to that team.
        addTeamUser ( teamId ,  options . user ) ;

      } ) ;

    } ) ;


  // Define the 'tra' command for adding a repository to a team.
  // Example Usage: ghi tra -o "macroscope" -t "Team alexis" -r "blog"
  program
    . command     ( 'tra' )
    . description ( 'Team Repo Add: Add a GitHub repo to an existing team' )
    . option      ( '-o, --org <orgname>' , 'GitHub OrgName' )
    . option      ( '-t, --team <teamname>' , 'GitHub TeamName' )
    . option      ( '-r, --repo <reponame>' , 'GitHub RepoName' )
    . action      ( function ( options ) {

      // First, retrieve the team ID for the given team and organization.
      getTeamId ( options . team ,  options . org ,  function ( teamId ) {

        // After getting the team ID, grant the team access to the specified repository.
        addTeamRepo ( teamId ,  options . org ,  options . repo ) ;

      } ) ;

    } ) ;

} ; // End of module.exports function