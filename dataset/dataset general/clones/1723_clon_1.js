// This is a Type I clone of the original Cordova JavaScript file.
// All functional aspects, variable names, and operators remain identical.
// Only whitespace, indentation, and comments have been altered significantly
// to create a visually distinct, yet logically equivalent, piece of code.


// Original Apache License comment block.
// This software is licensed under the Apache License, Version 2.0.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Some base contributions copyright (c) 2011, Proyectos Equis Ka, S.L.


if(typeof Cordova === "undefined") {

      // Check if DeviceInfo object exists; if not, initialize it.
      if (typeof(DeviceInfo) !== 'object') {
          DeviceInfo  =  {};
      }

      /**
       * The main Cordova API object.
       * Provides a global namespace for accessing information about the Cordova environment.
       * @class
       * @global
       */
      Cordova = {
              // This array holds all commands pending execution via Cordova.exec().
              commandQueue: [],

              // Flag indicating if the command queue is currently being processed by the native side.
              commandQueueFlushing: false,

              // Internal storage for constructor functions to be run on device ready.
              _constructors: [],

              // Collection of custom document event handlers, managed by Cordova.
              documentEventHandler: {},

              // Collection of custom window event handlers, managed by Cordova.
              windowEventHandler: {}
      };


      /**
       * List of resources that have been loaded by Cordova.
       * This mechanism helps prevent duplicate loading of JavaScript and other assets.
       * @property {Object} resources
       */
      Cordova.resources = {
            base: true // Base resource is always considered loaded.
      };

      /**
       * Determines if a specific resource has already been loaded by Cordova.
       *
       * @param {string} name - The identifier of the resource to check.
       * @returns {boolean} True if the resource is loaded, false otherwise.
       */
      Cordova.hasResource = function(name)
      {
            return Cordova.resources[name];
      };


      /**
       * Adds a resource to the list of resources loaded by Cordova.
       *
       * @param {string} name - The identifier of the resource to add.
       */
      Cordova.addResource = function(name)
      {
            Cordova.resources[name] = true;
      };


      /**
       * A boolean flag indicating whether the Cordova API is available and fully initialized.
       * This property is kept for legacy compatibility but may not be actively used.
       * @property {boolean} available
       */
      Cordova.available = true;


      /**
       * Adds a function to a queue that will be executed once Cordova has been fully initialized
       * and the 'deviceready' event is fired.
       *
       * @param {Function} func - The callback function to be executed.
       */
      Cordova.addConstructor = function(func)
      {
            var state = document.readyState;
            if((state == 'loaded' || state == 'complete') && DeviceInfo.uuid != null)
            {
                func(); // If ready, execute immediately.
            }
            else
            {
                Cordova._constructors.push(func); // Otherwise, queue it up.
            }
      };


      // Self-executing anonymous function to manage the deviceready event.
      (function()
       {
          var timer = setInterval(function()
          {
              var state = document.readyState;

              // Check if the document is loaded and DeviceInfo is available.
              if((state == 'loaded' || state == 'complete') && DeviceInfo.uuid != null)
              {
                  clearInterval(timer); // Stop polling once ready.

                  // Execute all queued constructor functions.
                  while (Cordova._constructors.length > 0)
                  {
                      var constructor = Cordova._constructors.shift();
                      try
                      {
                          constructor();
                      }
                      catch(e)
                      {
                          // Log errors during constructor execution.
                          if (typeof(console['log']) == 'function')
                          {
                              console.log("Failed to run constructor: " + console.processMessage(e));
                          }
                          else
                          {
                              alert("Failed to run constructor: " + e.message);
                          }
                      }
                  }

                  // All constructors have run, now dispatch the 'deviceready' event.
                  var e = document.createEvent('Events');
                  e.initEvent('deviceready');
                  document.dispatchEvent(e);
              }
          }, 1); // Check every 1 millisecond.
      })();


      // Unique session identifier for tracking calls.
      Cordova.sessionKey = 0;

      // Centralized callback management for native calls.
      Cordova.callbackId = 0;
      Cordova.callbacks = {};
      Cordova.callbackStatus = {
          NO_RESULT: 0,
          OK: 1,
          CLASS_NOT_FOUND_EXCEPTION: 2,
          ILLEGAL_ACCESS_EXCEPTION: 3,
          INSTANTIATION_EXCEPTION: 4,
          MALFORMED_URL_EXCEPTION: 5,
          IO_EXCEPTION: 6,
          INVALID_ACTION: 7,
          JSON_EXCEPTION: 8,
          ERROR: 9
      };


      /**
       * Creates an invisible iframe (the "gap bridge") used to signal the native side
       * that there are commands waiting in the queue.
       * @private
       * @returns {HTMLIFrameElement} The created iframe element.
       */
      Cordova.createGapBridge = function()
      {
          gapBridge = document.createElement("iframe");
          gapBridge.setAttribute("style", "display:none;");
          gapBridge.setAttribute("height", "0px");
          gapBridge.setAttribute("width", "0px");
          gapBridge.setAttribute("frameborder", "0");
          document.documentElement.appendChild(gapBridge);
          return gapBridge;
      };


      /**
       * Executes a Cordova command. This function queues the command and notifies the
       * native side to process the queue.
       *
       * This method supports two argument formats for flexibility and backward compatibility.
       *
       * FORMAT ONE (recommended):
       * @param {Function} successCallback - The function to call upon successful completion.
       * @param {Function} failCallback - The function to call if an error occurs.
       * @param {string} service - The name of the native service to invoke.
       * @param {string} action - The action/method to call within the service.
       * @param {Array<any>} [args] - An array of arguments to pass to the native method.
       *
       * FORMAT TWO (legacy):
       * @param {string} command - A string combining service and action (e.g., "ClassName.method").
       * @param {Array<any>} [args] - An array of arguments. Object parameters are passed as JSON strings.
       */
      Cordova.exec = function()
      {
            if (!Cordova.available) {
                  alert("ERROR: Attempting to call Cordova.exec() before 'deviceready'. Ignoring.");
                  return;
            }

            var successCallback, failCallback, service, action, actionArgs;
            var callbackId = null;

            // Determine argument format.
            if (typeof arguments[0] !== "string")
            {
                  // FORMAT ONE: success, fail, service, action, args
                  successCallback = arguments[0];
                  failCallback = arguments[1];
                  service = arguments[2];
                  action = arguments[3];
                  actionArgs = arguments[4];

                  // A callbackId is always generated, even if no callbacks are provided,
                  // to maintain consistency with native plugin expectations.
                  callbackId = 'INVALID';
            }
            else
            {
                  // FORMAT TWO: command string, args
                  splitCommand = arguments[0].split(".");
                  action = splitCommand.pop();
                  service = splitCommand.join(".");
                  actionArgs = Array.prototype.splice.call(arguments, 1);
            }

            // Construct the command object for native execution.
            var command = {
                className: service,
                methodName: action,
                arguments: []
            };

            // Register callbacks if provided and add callbackId to command arguments.
            if (successCallback || failCallback)
            {
                callbackId = service + Cordova.callbackId++;
                Cordova.callbacks[callbackId] =
                    {success: successCallback, fail: failCallback};
            }
            if (callbackId != null)
            {
                command.arguments.push(callbackId);
            }

            // Process and add action arguments to the command.
            for (var i = 0; i < actionArgs.length; ++i)
            {
                var arg = actionArgs[i];
                if (arg == undefined || arg == null)
                {
                    continue; // Skip undefined or null arguments.
                }
                else if (typeof(arg) == 'object')
                {
                    command.options = arg; // Objects are often passed as 'options'.
                }
                else
                {
                    command.arguments.push(arg); // Primitive types are added directly.
                }
            }

            // Stringify the command and add it to the queue.
            // Stringifying now effectively clones the arguments.
            Cordova.commandQueue.push(JSON.stringify(command));

            // If this is the first command in an empty queue, or if the queue isn't
            // currently flushing, notify the native side.
            if (Cordova.commandQueue.length == 1 && !Cordova.commandQueueFlushing)
            {
                if (!Cordova.gapBridge)
                {
                    Cordova.gapBridge = Cordova.createGapBridge();
                }
                // Trigger the native side to check for new commands.
                Cordova.gapBridge.src = "gap://ready";
            }
      };


      /**
       * Called by native code to retrieve all currently queued commands and then clear the queue.
       * This method is part of the bridge communication.
       *
       * @returns {string} A JSON string representing the array of queued commands.
       */
      Cordova.getAndClearQueuedCommands = function()
      {
            json = JSON.stringify(Cordova.commandQueue);
            Cordova.commandQueue = []; // Reset the queue after retrieval.
            return json;
      };


      /**
       * Called by native code to deliver a successful result from an executed action.
       * This function locates the appropriate callback and invokes it.
       *
       * @param {string} callbackId - The ID of the callback to invoke.
       * @param {Object} args - An object containing the status, message (return value),
       *                        and a flag to keep the callback alive.
       * @param {number} args.status - The status of the result (e.g., Cordova.callbackStatus.OK).
       * @param {any} args.message - The data returned by the native action.
       * @param {number} args.keepCallback - 0 to remove the callback, 1 to keep it.
       */
      Cordova.callbackSuccess = function(callbackId, args)
      {
            if (Cordova.callbacks[callbackId])
            {
                // If the status is OK, attempt to call the success callback.
                if (args.status == Cordova.callbackStatus.OK)
                {
                    try
                    {
                        if (Cordova.callbacks[callbackId].success)
                        {
                            Cordova.callbacks[callbackId].success(args.message);
                        }
                    }
                    catch (e)
                    {
                        // Log any errors occurring within the success callback itself.
                        console.log("Error in success callback: "+callbackId+" = "+e);
                    }
                }

                // Remove the callback if it's not meant to be kept for future results.
                if (!args.keepCallback)
                {
                    delete Cordova.callbacks[callbackId];
                }
            }
      };


      /**
       * Called by native code to deliver an error result from an executed action.
       * This function locates the appropriate error callback and invokes it.
       *
       * @param {string} callbackId - The ID of the callback to invoke.
       * @param {Object} args - An object containing the error message and a flag
       *                        to keep the callback alive.
       * @param {any} args.message - The error message or error object.
       * @param {number} args.keepCallback - 0 to remove the callback, 1 to keep it.
       */
      Cordova.callbackError = function(callbackId, args)
      {
            if (Cordova.callbacks[callbackId])
            {
                try
                {
                    if (Cordova.callbacks[callbackId].fail)
                    {
                        Cordova.callbacks[callbackId].fail(args.message);
                    }
                }
                catch (e)
                {
                    // Log errors occurring within the error callback itself.
                    console.log("Error in error callback: "+callbackId+" = "+e);
                }

                // Remove the callback if it's not meant to be kept.
                if (!args.keepCallback)
                {
                    delete Cordova.callbacks[callbackId];
                }
            }
      };


      /**
       * Performs a deep clone of a given object.
       * Handles arrays, functions, objects, and primitive types.
       *
       * @param {any} obj - The object to clone.
       * @returns {any} A deep copy of the input object.
       */
      Cordova.clone = function(obj)
      {
          // Handle null or undefined.
          if (!obj)
          {
              return obj;
          }

          // Handle Arrays.
          if (obj instanceof Array)
          {
              var retVal = new Array();
              for (var i = 0; i < obj.length; ++i)
              {
                  retVal.push(Cordova.clone(obj[i]));
              }
              return retVal;
          }

          // Functions are returned as-is (not cloned).
          if (obj instanceof Function)
          {
              return obj;
          }

          // Non-object types are returned as-is.
          if (!(obj instanceof Object))
          {
              return obj;
          }

          // Dates are returned as-is (not cloned, but a new Date object could be made).
          if (obj instanceof Date)
          {
              return obj;
          }

          // Handle generic objects.
          retVal = new Object();
          for (i in obj)
          {
              // Ensure we don't re-process already copied properties, or properties that are identical.
              if (!(i in retVal) || retVal[i] != obj[i])
              {
                  retVal[i] = Cordova.clone(obj[i]);
              }
          }
          return retVal;
      };


      // Store original document.addEventListener for internal use.
      Cordova.m_document_addEventListener = document.addEventListener;

      // Store original window.addEventListener for internal use.
      Cordova.m_window_addEventListener = window.addEventListener;


      /**
       * Registers a custom handler for a window event.
       * This allows plugins to intercept and manage window events.
       *
       * @param {string} event - The name of the event (e.g., 'online', 'offline').
       * @param {Function} callback - The handler function for the event.
       */
      Cordova.addWindowEventHandler = function(event, callback)
      {
            Cordova.windowEventHandler[event] = callback;
      };


      /**
       * Registers a custom handler for a document event.
       * This allows plugins to intercept and manage document events.
       *
       * @param {string} event - The name of the event (e.g., 'deviceready', 'pause').
       * @param {Function} callback - The handler function for the event.
       */
      Cordova.addDocumentEventHandler = function(event, callback)
      {
            Cordova.documentEventHandler[event] = callback;
      };


      /**
       * Overrides the standard document.addEventListener to allow Cordova
       * to intercept and manage certain events, passing them to custom handlers
       * if registered.
       *
       * @param {string} evt - The event type.
       * @param {Function} handler - The event handler function.
       * @param {boolean} capture - Whether to use capture phase.
       */
      document.addEventListener = function(evt, handler, capture)
      {
            var e = evt.toLowerCase();

            // Check if there's a custom handler for this document event.
            if (typeof Cordova.documentEventHandler[e] !== "undefined")
            {
                  // If the custom handler returns true, it signifies that
                  // the event has been fully handled and no further action is needed.
                  if (Cordova.documentEventHandler[e](e, handler, true))
                  {
                        return; // Stop default behavior.
                  }
            }

            // If no custom handler or it didn't fully handle the event,
            // fall back to the original addEventListener.
            Cordova.m_document_addEventListener.call(document, evt, handler, capture);
      };


      /**
       * Overrides the standard window.addEventListener to allow Cordova
       * to intercept and manage certain events, passing them to custom handlers
       * if registered.
       *
       * @param {string} evt - The event type.
       * @param {Function} handler - The event handler function.
       * @param {boolean} capture - Whether to use capture phase.
       */
      window.addEventListener = function(evt, handler, capture)
      {
            var e = evt.toLowerCase();

            // Check for a custom handler for this window event.
            if (typeof Cordova.windowEventHandler[e] !== "undefined")
            {
                  // If the custom handler returns true, the event is considered handled.
                  if (Cordova.windowEventHandler[e](e, handler, true))
                  {
                        return; // Prevent default window event listener behavior.
                  }
            }

            // Fallback to the original addEventListener if not handled by a custom handler.
            Cordova.m_window_addEventListener.call(window, evt, handler, capture);
      };


      // Store original document.removeEventListener for internal use.
      Cordova.m_document_removeEventListener = document.removeEventListener;

      // Store original window.removeEventListener for internal use.
      Cordova.m_window_removeEventListener = window.removeEventListener;


      /**
       * Overrides the standard document.removeEventListener to allow Cordova
       * to manage removal of event listeners that might be tied to custom handlers.
       *
       * @param {string} evt - The event type to remove.
       * @param {Function} handler - The handler function to remove.
       * @param {boolean} capture - Whether the listener was registered with capture phase.
       */
      document.removeEventListener = function(evt, handler, capture)
      {
            var e = evt.toLowerCase();

            // Check if a custom handler exists for this document event.
            if (typeof Cordova.documentEventHandler[e] !== "undefined")
            {
                  // If the custom handler indicates it has processed the removal, stop.
                  if (Cordova.documentEventHandler[e](e, handler, false))
                  {
                        return; // Event removal handled by custom logic.
                  }
            }

            // Fallback to the original removeEventListener.
            Cordova.m_document_removeEventListener.call(document, evt, handler, capture);
      };


      /**
       * Overrides the standard window.removeEventListener to allow Cordova
       * to manage removal of event listeners that might be tied to custom handlers.
       *
       * @param {string} evt - The event type to remove.
       * @param {Function} handler - The handler function to remove.
       * @param {boolean} capture - Whether the listener was registered with capture phase.
       */
      window.removeEventListener = function(evt, handler, capture)
      {
            var e = evt.toLowerCase();

            // Check for a custom handler for this window event.
            if (typeof Cordova.windowEventHandler[e] !== "undefined")
            {
                  // If the custom handler processes the removal, return.
                  if (Cordova.windowEventHandler[e](e, handler, false))
                  {
                        return; // Custom handler took care of it.
                  }
            }

            // Fallback to the original removeEventListener.
            Cordova.m_window_removeEventListener.call(window, evt, handler, capture);
      };


      /**
       * Dispatches a custom document event with optional data.
       *
       * @param {string} type - The type of event to fire (e.g., 'online', 'pause').
       * @param {Object} [data] - An optional object whose properties will be copied
       *                          onto the event object.
       */
      Cordova.fireDocumentEvent = function(type, data)
      {
            var e = document.createEvent('Events');
            e.initEvent(type); // Initialize a generic event.

            // Copy properties from the 'data' object to the event object.
            if (data)
            {
                for (var i in data)
                {
                    e[i] = data[i];
                }
            }
            // The document event is dispatched here.
            document.dispatchEvent(e);
      };
}