( function ( ) {


  var overallCtx = this ;
  var buildNum = '0.1.2' ;
  var injectedIntoRoot = false ;
  var scheduledTasks = { } ;
  var totalTimeShifted = 0 ;
  var currentTaskTime = 0 ;
  var taskCounter = 0 ;
  var shiftInProgress = false ;
  var processHalted = false ;

  /**
   * Utility for transferring properties from one object to another.
   * @param { Object } targetObj Object to receive the properties.
   * @param { Object } sourceObj Object providing the properties.
   */
  var copyProps = function ( targetObj , sourceObj ) {
    for ( var keyName in sourceObj ) {
      targetObj [ keyName ] = sourceObj [ keyName ] ;
    }
  } ;


  /**
   * Stores the original, un-faked timing functions and Date constructor.
   */
  var nativeTimers = {
    setDelay : overallCtx . setTimeout ,
    setCycle : overallCtx . setInterval ,
    clearDelay : overallCtx . clearTimeout ,
    clearCycle : overallCtx . clearInterval ,
    BaseDate : overallCtx . Date
  } ;


  /**
   * Custom Date constructor that accounts for the faked time progression.
   * It uses a parasitic inheritance pattern from the original Date.
   * @param { Number } yr The year.
   * @param { Number } mon The month.
   * @param { Number } dy The day of the month.
   * @param { Number } hr The hour.
   * @param { Number } min The minute.
   * @param { Number } sec The second.
   * @param { Number } milli The millisecond.
   * @returns A new Date object adjusted for the current fake time.
   */
  var AdjustedDateTime = function ( yr , mon , dy , hr , min , sec , milli ) {
    var adjustedDt ;
    var args = arguments ;

    if ( args . length === 0 ) {
      adjustedDt = new nativeTimers . BaseDate ( ) ;
      adjustedDt . setMilliseconds ( adjustedDt . getMilliseconds ( ) + getEffectiveShift ( ) ) ;
    } else if ( args . length === 1 ) {
      adjustedDt = new nativeTimers . BaseDate ( args [ 0 ] ) ;
    } else {
      adjustedDt = new nativeTimers . BaseDate (
        yr || null , mon || null , dy || null , hr || null ,
        min || null , sec || null , milli || null
      ) ;
    }
    return adjustedDt ;
  } ;

  // Ensure prototype methods are carried over to the custom Date object.
  copyProps ( AdjustedDateTime , {
    parse : nativeTimers . BaseDate . parse ,
    UTC : nativeTimers . BaseDate . UTC ,
    now : nativeTimers . BaseDate . now
  } ) ;


  /**
   * Resets the time simulation to its initial state,
   * clearing all queued functions and accumulated time shifts.
   */
  var reinitialize = function ( ) {
    scheduledTasks = { } ;
    taskCounter = 0 ;
    totalTimeShifted = 0 ;
    shiftInProgress = false ;
    processHalted = false ;
    currentTaskTime = 0 ;
  } ;


  /**
   * Checks if a given value is a valid number.
   * @param { Object } testVal The value to check.
   * @returns { Boolean } True if the value is numeric, false otherwise.
   */
  var isNumberValue = function ( testVal ) {
    return testVal !== null && ! isNaN ( testVal ) ;
  } ;


  /**
   * Determines the current time offset, considering if a time advancement is in progress.
   * @returns { Number } The effective millisecond offset.
   */
  var getEffectiveShift = function ( ) {
    return shiftInProgress ? currentTaskTime : totalTimeShifted ;
  } ;


  /**
   * Advances the simulated clock by a specified number of milliseconds,
   * executing any functions scheduled within that new time range.
   * @param { Number } millisecondsToShift The duration in milliseconds to advance the clock.
   */
  var progressTime = function ( millisecondsToShift ) {
    // If no parameter is provided, just return the current total shift.
    if ( !! millisecondsToShift ) {
      if ( ! isNumberValue ( millisecondsToShift ) || millisecondsToShift < 0 ) {
        throw ( "The 'millisecondsToShift' argument must be a positive number." ) ;
      }

      var pendingExecutions = [ ] ; // List of tasks to run during this shift.
      var timeframe = {
        begin : totalTimeShifted ,
        finish : totalTimeShifted += millisecondsToShift
      } ;

      var queueExecution = function ( taskRef , moment ) {
        pendingExecutions . push ( {
          taskRef : taskRef ,
          moment : moment
        } ) ;
      } ;

      // This loop handles potential interruptions if tasks schedule new tasks.
      do {
        processHalted = false ;

        // Gather all applicable functions for this time window.
        for ( var taskId in scheduledTasks ) {
          var taskObj = scheduledTasks [ taskId ] ;

          // Schedule non-recurring timeouts that fall within the range.
          if ( ! taskObj . recurs && taskObj . firstExecutionAt <= timeframe . finish ) {
            queueExecution ( taskObj , taskObj . firstExecutionAt ) ;
          } else {
            // Schedule first runs of recurring intervals if applicable.
            if ( taskObj . lastExecutionAt === null &&
                 taskObj . firstExecutionAt > timeframe . begin &&
                 ( taskObj . lastExecutionAt || taskObj . firstExecutionAt ) <= timeframe . finish ) {
              taskObj . lastExecutionAt = taskObj . firstExecutionAt ;
              queueExecution ( taskObj , taskObj . lastExecutionAt ) ;
            }
            // Add subsequent instances for intervals within the range.
            while ( ( taskObj . lastExecutionAt || taskObj . firstExecutionAt ) + taskObj . interval <= timeframe . finish ) {
              taskObj . lastExecutionAt += taskObj . interval ;
              queueExecution ( taskObj , taskObj . lastExecutionAt ) ;
            }
          }
        }

        // Sort the scheduled tasks for correct chronological execution.
        pendingExecutions . sort ( function ( a , b ) {
          var sortOrder = a . moment - b . moment ;
          if ( sortOrder === 0 ) {
            sortOrder = b . taskRef . interval - a . taskRef . interval ;
            if ( sortOrder === 0 ) {
              sortOrder = a . taskRef . identifier - b . taskRef . identifier ;
            }
          }
          return sortOrder ;
        } ) ;

        var executedIndices = [ ] ;
        for ( var idx = 0 ; idx < pendingExecutions . length ; ++ idx ) {
          var currentTask = pendingExecutions [ idx ] . taskRef ;
          // Only execute if the task still exists in the master schedule.
          if ( !! scheduledTasks [ currentTask . identifier ] ) {
            currentTaskTime = pendingExecutions [ idx ] . moment ;
            shiftInProgress = true ;
            try {
              // Execute the task function in the global context.
              currentTask . handler . apply ( overallCtx ) ;
            } finally {
              shiftInProgress = false ;

              executedIndices . push ( idx ) ; // Mark for removal.

              // If it's a non-repeating task, remove it permanently.
              if ( ! currentTask . recurs ) {
                removeTaskFromSchedule ( currentTask . identifier ) ;
              }

              // If a task scheduled something new, halt current execution to re-evaluate.
              if ( processHalted ) {
                break ;
              }
            }
          }
        }
        // Remove executed tasks from the pending list.
        for ( var idx = executedIndices . length - 1 ; idx >= 0 ; idx -- ) {
          pendingExecutions . splice ( executedIndices [ idx ] , 1 ) ;
        }
      }
      while ( processHalted ) ;
    }
    return getEffectiveShift ( ) ;
  } ;


  /**
   * Adds a new function to the simulated schedule.
   * @param { Function | String } taskFunc The function or code string to execute.
   * @param { Number } delayMs The delay in milliseconds before execution.
   * @param { Boolean } isRecurring True if the task should repeat, false otherwise.
   * @returns { Number } A unique identifier for the scheduled task.
   */
  var addTaskToSchedule = function ( taskFunc , delayMs , isRecurring ) {
    // Convert string code to a Function object.
    if ( typeof ( taskFunc ) === 'string' ) {
      taskFunc = new Function ( taskFunc ) ;
    }
    var currentMoment = getEffectiveShift ( ) ;
    var taskIdentifier = taskCounter ++ ;
    scheduledTasks [ taskIdentifier ] = {
      identifier : taskIdentifier ,
      handler : taskFunc ,
      interval : delayMs ,
      scheduledAt : currentMoment ,
      firstExecutionAt : ( currentMoment + delayMs ) ,
      lastExecutionAt : null ,
      recurs : isRecurring
    } ;

    // If time advancement is ongoing, signal an interruption
    // so the new task can be incorporated into the current shift.
    if ( shiftInProgress ) {
      processHalted = true ;
    }

    return taskIdentifier ;
  } ;


  /**
   * Removes a scheduled task from the master schedule.
   * @param { Number } taskIdentifier The ID of the task to remove.
   */
  var removeTaskFromSchedule = function ( taskIdentifier ) {
    delete scheduledTasks [ taskIdentifier ] ;
  } ;


  /**
   * Controls whether the global timing functions are overridden by the faked ones.
   * @param { Boolean } injectIntoRoot Optional: If true, injects faked API; if false, restores native.
   * @returns { Boolean } True if faked API is currently active in the global scope.
   */
  var manageRootApi = function ( injectIntoRoot ) {
    if ( typeof ( injectIntoRoot ) !== 'undefined' ) {
      injectedIntoRoot = injectIntoRoot ;
      copyProps ( overallCtx , injectedIntoRoot ? fakeTimeApi : nativeTimers ) ;
    }
    return injectedIntoRoot ;
  } ;


  /**
   * The faked timing API, mirroring the standard browser functions.
   * Encapsulated for easy injection and retraction from the global scope.
   */
  var fakeTimeApi = {
    setDelayedAction : function ( taskFunc , delayMs ) {
      if ( arguments . length === 0 ) {
        throw ( "setDelayedAction requires at least 1 parameter." ) ;
      } else if ( arguments . length === 1 && isNumberValue ( arguments [ 0 ] ) ) {
        throw ( "Invalid setDelayedAction call (missing quotes for code string?)." ) ;
      } else if ( arguments . length === 1 ) {
        return addTaskToSchedule ( taskFunc , 0 , false ) ;
      }
      return addTaskToSchedule ( taskFunc , delayMs , false ) ;
    } ,
    setRecurringAction : function ( taskFunc , delayMs ) {
      if ( arguments . length === 0 ) {
        throw ( "setRecurringAction requires at least 1 parameter." ) ;
      } else if ( arguments . length === 1 && isNumberValue ( arguments [ 0 ] ) ) {
        throw ( "Invalid setRecurringAction call (missing quotes for code string?)." ) ;
      } else if ( arguments . length === 1 ) {
        return addTaskToSchedule ( taskFunc , 0 , false ) ;
      }
      return addTaskToSchedule ( taskFunc , delayMs , true ) ;
    } ,
    clearDelayedAction : removeTaskFromSchedule ,
    clearRecurringAction : removeTaskFromSchedule ,
    Date : AdjustedDateTime
  } ;

  // Expose the public interface for time manipulation.
  overallCtx . TimeWarp = {
    reinitialize : reinitialize ,
    progressTime : progressTime ,
    manageRootApi : manageRootApi ,
    buildNum : buildNum
  } ;
  // Augment the public API with the faked timing methods.
  copyProps ( overallCtx . TimeWarp , fakeTimeApi ) ;

  // Initialize the time simulation system.
  reinitialize ( ) ;
} ) ( ) ;