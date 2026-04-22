/**
 * @fileoverview Module for dynamically loading JavaScript resources.
 * @module App.System.ResourceLoader
 * @version 1.1.0
 * @author A. N. Other
 * @since 2011-03-02
 * @lastUpdated 2024-01-15
 * @dependencies App.System.ResourceLoader.ScriptItem.js
 */
var App = App || {};
App.System = App.System || {};

App.System.ResourceLoader = {

  /**
   * A hash map storing all registered script loading tasks.
   * Keys are resource paths (URLs), values are instances of ScriptItem.
   * @private
   * @type {Object.<string, App.System.ResourceLoader.ScriptItem>}
   */
  resourceMap: {},

  /**
   * The maximum time, in milliseconds, to await the successful loading
   * of an individual script before it's considered a timeout event.
   * @private
   * @type {number}
   */
  maxWaitMs: 7500,

  /**
   * An internal counter tracking how many script loading operations are
   * currently in progress. It's decremented as each script finishes.
   * @private
   * @type {number}
   */
  activeLoadCounter: 0,

  /**
   * A boolean flag indicating whether a bulk loading operation
   * has been initiated and is still underway.
   * @private
   * @type {boolean}
   */
  isBatchInProgress: false,

  /**
   * Constructor reference for the ScriptItem class.
   * This class is responsible for managing the actual DOM insertion and
   * lifecycle of a single script. It must be provided externally.
   * @public
   * @type {Function}
   */
  ScriptItem: null,

  /**
   * A user-defined callback function executed when a single script
   * successfully completes its loading process.
   * @public
   * @type {?function(App.System.ResourceLoader.ScriptItem): void}
   */
  onScriptSuccess: null,

  /**
   * A user-defined callback function executed when a single script
   * fails to load, typically due to a timeout or network error.
   * @public
   * @type {?function(App.System.ResourceLoader.ScriptItem): void}
   */
  onScriptTimeout: null,

  /**
   * A user-defined callback function invoked only after all scripts
   * in the current processing batch have concluded their loading attempts.
   * @public
   * @type {?function(): void}
   */
  onAllFinished: null,

  /**
   * Initializes or re-initializes the resource loader's internal state.
   * This ensures that the loader is in a clean and ready state for use.
   * @public
   */
  initialize: function() {
    this.resourceMap = this.resourceMap || {}; // Ensure map exists
    this.activeLoadCounter = 0;
    this.isBatchInProgress = false;
    console.info("ResourceLoader: System initialized and ready.");
  },

  /**
   * Enqueues a new script for subsequent loading.
   * If the script's path already exists in the registry, the existing entry
   * is returned. Otherwise, a new ScriptItem is created and added.
   * Includes basic validation for the resource path.
   *
   * @public
   * @param {string} resourcePath - The unique URL string of the script to be loaded.
   * @returns {?App.System.ResourceLoader.ScriptItem} The ScriptItem instance, or `null` if input is invalid or ScriptItem is not defined.
   */
  addScriptToQueue: function(resourcePath) {
    if (typeof resourcePath !== 'string' || resourcePath.trim().length === 0) {
      console.error("ResourceLoader: Attempted to queue an invalid or empty resource path.");
      return null;
    }

    // A lenient check for script file extension and basic URL format
    if (!/\.js(\?.*)?$/i.test(resourcePath)) {
      console.warn(`ResourceLoader: Path "${resourcePath}" does not appear to be a standard JavaScript file.`);
    }

    let existingEntry = this.resourceMap[resourcePath];
    if (existingEntry) {
      console.debug(`ResourceLoader: Script "${resourcePath}" is already present in the queue.`);
      return existingEntry;
    }

    if (!this.ScriptItem) {
      console.error("ResourceLoader: ScriptItem constructor is unavailable. Cannot enqueue resource.");
      return null;
    }

    try {
      let newScriptInstance = new this.ScriptItem(resourcePath, this);
      this.resourceMap[resourcePath] = newScriptInstance;
      console.log(`ResourceLoader: Script "${resourcePath}" successfully added to the loading queue.`);
      return newScriptInstance;
    } catch (creationError) {
      console.error(`ResourceLoader: Failed to create ScriptItem for "${resourcePath}":`, creationError);
      return null;
    }
  },

  /**
   * Begins the loading sequence for one or more scripts within the queue.
   * If `itemToLoad` is provided, only that specific script is processed.
   * If no argument is given, all currently queued scripts are initiated.
   * This method is responsible for managing the `activeLoadCounter` and
   * orchestrating the batch completion logic.
   *
   * @public
   * @param {string|App.System.ResourceLoader.ScriptItem} [itemToLoad] - Optional. The path string or ScriptItem instance to load.
   * @returns {boolean} `true` if any scripts were initiated for loading, `false` otherwise.
   */
  startLoadingProcess: function(itemToLoad) {
    let targetsForLoading = [];

    if (itemToLoad) {
      let specificScript = null;
      if (typeof itemToLoad === "string") {
        specificScript = this.resourceMap[itemToLoad];
      } else if (itemToLoad instanceof this.ScriptItem) {
        specificScript = itemToLoad;
      }

      if (specificScript && specificScript.loadStatus === 'queued') {
        targetsForLoading.push(specificScript);
      } else {
        console.warn(`ResourceLoader: Cannot process item "${itemToLoad}". It's either not found, invalid, or not in 'queued' status.`);
        return false;
      }
    } else {
      // If no specific item, gather all 'queued' scripts from the map
      for (let scriptPath in this.resourceMap) {
        let scriptEntry = this.resourceMap[scriptPath];
        if (scriptEntry && scriptEntry.loadStatus === 'queued') {
          targetsForLoading.push(scriptEntry);
        }
      }
      if (targetsForLoading.length > 0) {
        this.isBatchInProgress = true; // Mark batch as active only if there are items to process
      }
    }

    if (targetsForLoading.length === 0) {
      console.info("ResourceLoader: No scripts are currently available or in 'queued' state to begin processing.");
      return false;
    }

    console.log(`ResourceLoader: Initiating load for ${targetsForLoading.length} script(s).`);

    targetsForLoading.forEach(script => {
      // Double check status before initiating to prevent race conditions
      if (script.loadStatus === 'queued') {
        this.activeLoadCounter++;
        // The ScriptItem's commenceLoad will internally call handleScriptFinished
        script.commenceLoad(this.maxWaitMs, this.onScriptSuccess, this.onScriptTimeout);
      }
    });

    return true;
  },

  /**
   * An internal callback method invoked by a ScriptItem instance upon
   * the completion (success or failure) of its loading attempt.
   * This method manages the `activeLoadCounter` and determines
   * when the entire batch of scripts has finished.
   *
   * @private
   * @param {App.System.ResourceLoader.ScriptItem} completedItem - The ScriptItem that has just finished its lifecycle.
   * @param {boolean} loadSuccessful - `true` if the script loaded without issues, `false` if it timed out or failed.
   */
  handleScriptFinished: function(completedItem, loadSuccessful) {
    this.activeLoadCounter--;
    console.debug(`ResourceLoader: Script "${completedItem.path}" concluded. Remaining active loads: ${this.activeLoadCounter}`);

    if (loadSuccessful) {
      if (typeof this.onScriptSuccess === 'function') {
        this.onScriptSuccess(completedItem);
      }
    } else {
      if (typeof this.onScriptTimeout === 'function') {
        this.onScriptTimeout(completedItem);
      }
    }

    // Check if all pending loads have completed.
    // Ensure activeLoadCounter doesn't go negative if a script reports completion multiple times (though it shouldn't).
    if (this.activeLoadCounter <= 0 && this.isBatchInProgress) {
      this._triggerBatchCompletion();
    }
  },

  /**
   * Internal method to signal and handle the completion of an entire
   * batch of script loading operations. Invokes the `onAllFinished`
   * callback and then resets the loader's state for future use.
   * @private
   */
  _triggerBatchCompletion: function() {
    this.activeLoadCounter = 0; // Reset counter for safety
    this.isBatchInProgress = false;
    console.log("ResourceLoader: All script loading operations for the current batch have concluded.");

    if (typeof this.onAllFinished === 'function') {
      this.onAllFinished();
    }
    this.resetLoader(); // Clear the queue and state after batch completion
  },

  /**
   * Resets the entire state of the resource loader.
   * This operation clears all queued, active, and completed script entries,
   * effectively preparing the loader for a completely new set of tasks.
   * @public
   */
  resetLoader: function() {
    console.info("ResourceLoader: Performing full reset. All queued items and internal state cleared.");
    // Clear the map by reassigning a new empty object
    this.resourceMap = {};
    this.activeLoadCounter = 0;
    this.isBatchInProgress = false;
  }
};