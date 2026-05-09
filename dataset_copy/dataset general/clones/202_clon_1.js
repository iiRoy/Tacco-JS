/*
 * This module defines the API routes for calendar management within the application.
 * It integrates with the 'restify' framework to handle incoming HTTP requests.
 *
 * All routes are protected by a rate limiting mechanism to ensure fair usage and prevent abuse.
 */


  var restify = require ('restify') ; // Importing the 'restify' library for building REST APIs.


  var config = require ('../config') ; // Loading the application's configuration settings.


  var CalendarController = require ('../controllers/calendarController') ; // Importing the CalendarController, which handles business logic for calendar operations.


// Define a rate limiting middleware.
// This uses restify's built-in throttle plugin to limit request rates per IP address.
var rateLimit = restify . throttle ({

    burst : config . limiter . defaultBurstRate , // The maximum number of requests allowed in a short burst period.

    rate : config . limiter . defaultRatePerSec , // The sustained average rate of requests allowed per second.

    ip : true // Specifies that rate limiting should be applied on a per-IP address basis.
}) ;


  /**
   * CalendarRoutes function: Initializes and registers all calendar-related API endpoints.
   *
   * @param {object} api - The restify server instance onto which these routes will be mounted.
   */
function CalendarRoutes (api)
{
  // Defines a GET endpoint for retrieving specific calendar day information.
  // This route is accessible at '/api/calendar/weekday'.
  // The 'rateLimit' middleware is applied to this route.
  api . get ( '/api/calendar/weekday', rateLimit, function (req, res, next)
  {
        // Instantiates a new CalendarController for handling the current request.
        // It receives the request, response, and next middleware function.
        var calCtrl = new CalendarController (req, res, next) ;

        // Calls the controller method responsible for fetching and returning calendar day data.
        calCtrl . getCalendarDay () ;
  }) ;


  // Defines a POST endpoint for submitting new calendar appointments.
  // This route is accessible at '/api/calendar/appointment'.
  // The 'rateLimit' middleware is also applied here.
  api . post ( '/api/calendar/appointment', rateLimit, function (req, res, next)
  {
    // Creates an instance of the CalendarController to process the appointment submission.
    var calCtrl = new CalendarController (req, res, next) ;

    // Executes the controller method that handles the creation of a new calendar appointment.
    calCtrl . postCalendarAppointment () ;
  }) ;
}


// Exports the CalendarRoutes function, making it available for other modules
// (e.g., the main server file) to import and set up the API routes.
module . exports . routes = CalendarRoutes ;