// Module: Application.Asset.Handler.js
// Creation Date: October 26, 2022
// Last Updated: November 1, 2022
// Author: Automated Code Generator
// Dependencies: Core.Framework.js
// Implementations: Application.Asset.Handler.ResourceUnit.js

// This component provides functionality for dynamically loading
// external resources, such as script files, from a specified
// location during the execution of the application.

App.Resource.Handler = {

  // Internal collection for managing items scheduled for loading.
  TaskBuffer : [],
  // The maximum duration (in milliseconds) to await a resource's completion.
  waitThreshold : 7000, // A seven-second limit for each item.

  // Hooks for various stages of the resource loading lifecycle.
  onItemReady     : null, // Callback triggered upon successful loading of a single resource.
  onTimeoutOccurred  : null, // Callback invoked if a resource exceeds its loading time limit.
  completionCallback : null, // Callback executed once all pending resources have been processed.

  // Reference to the constructor for individual resource processing units.
  // This class is defined in the Application.Asset.Handler.ResourceUnit.js file.
  ResourceUnit : null,

  // Methods for adding resources to the processing queue and initiating their retrieval.

  ScheduleLoad : function (sourceUri)
  // Appends a new Uniform Resource Identifier (URI) to the internal processing queue.
  // An associated ResourceUnit object is created for this URI. If the URI is
  // successfully added, or if it already exists in the queue but is not yet
  // fully processed, the corresponding ResourceUnit instance is returned.
  // Otherwise, a 'null' value is returned.
  {
    if (sourceUri) {
      var foundTask = this.RetrieveUnit(sourceUri); // Check if this URI is already queued.
      if (!foundTask) {
        var taskInstance = new this.ResourceUnit(sourceUri); // Construct a new unit.
        this.TaskBuffer[sourceUri] = taskInstance; // Store the new unit by its URI.

        return taskInstance; // Return the newly created unit.
      }
      return foundTask; // Return the pre-existing unit.
    }

    return null; // No source URI was provided.
  },

  RetrieveUnit : function (pathKey)
  // Employs a regular expression to locate a matching URI within the TaskBuffer.
  // If a match is identified, the corresponding ResourceUnit object is returned.
  // Should no match be found, 'null' is returned instead.
  {
    var uriPattern = new RegExp("(" + pathKey + "$)", "i"); // Create a case-insensitive pattern.
    for (var assetKey in this.TaskBuffer) { // Iterate through all entries in the buffer.
      if (uriPattern.test(assetKey)) {
        return this.TaskBuffer[assetKey]; // Return the matching unit.
      }
    }

    return null; // No resource unit found for the given path key.
  },

  HandleTasks : function (specificTask)
  // This method is designed to manage the loading process for resources.
  // If no argument is supplied, all resources currently in the TaskBuffer will be processed.
  // If either a URI string or a ResourceUnit object is provided, only that particular
  // item will be processed. It is important to note that processing a single
  // ResourceUnit will not trigger the 'completionCallback' unless it is the last
  // remaining item in the entire queue.
  {
    // If a specific task is provided, attempt to process only that one.
    if (specificTask) {
      // If the input is a string and matches an entry in the buffer, convert it to the object.
      if (((typeof specificTask) === "string") && (specificTask in this.TaskBuffer)) {
        specificTask = this.TaskBuffer[specificTask];
      }
      // If it's a valid ResourceUnit instance, initiate its loading procedure.
      if (specificTask instanceof this.ResourceUnit) {
        return specificTask.Load(); // Call the Load method on the specific unit.
      }
    }

    else
    // If no specific task is indicated, proceed to load all items in the buffer.
    {
      for (var sourceKey in this.TaskBuffer) {
        this.TaskBuffer[sourceKey].Load(); // Trigger the loading for each buffered item.
      }

      return true; // Signifies that all items in the buffer were instructed to load.
    }

    return false; // Indicates that the specific task could not be processed.
  },

  VerifyAllDone : function ()
  // Ascertains whether all resources within the TaskBuffer have completed their processing.
  // If every resource is finished, the 'completionCallback' is invoked, and the
  // TaskBuffer is subsequently cleared of all its contents.
  {
    for (var unitId in this.TaskBuffer) {
      if (!this.TaskBuffer[unitId].isDone) {
        return false; // At least one resource is still pending.
      }
    }

    // All resources have been processed.
    if (this.completionCallback) {
      this.completionCallback(); // Execute the global completion handler.
    }

    // Clear the buffer to prepare for future operations.
    for (var unitId in this.TaskBuffer) {
      delete this.TaskBuffer[unitId]; // Remove each individual entry.
    }
    delete this.TaskBuffer; // Remove the TaskBuffer property itself.
    this.TaskBuffer = []; // Re-initialize the buffer as an empty array.

    return true; // All tasks were confirmed as complete, and the buffer was reset.
  }
};