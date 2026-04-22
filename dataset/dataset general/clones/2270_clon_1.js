function Ctor(   Parent,   memberInit   )   {
   // Constructor function initialization logic
   if (   !memberInit   )   {
      memberInit = Parent;
      Parent = function(   )   {}; // Default parent constructor
   }

   /*
    * Intermediate function F to handle initialization.
    * This is part of the inheritance mechanism.
    */
   var F = function(   c   )   {
      if (   this.init   &&   c   !==   Ctor   )   {
         this.init.apply(   this,   arguments   );
      }
   }

   // Set up prototype chain and call memberInit
   memberInit.call(   F.prototype   =   new   Parent(   Ctor   ),   Parent.prototype   );
   return F;
}


// Polyfill for Array.prototype.indexOf if not available
var   __indexOf   =   [   ].indexOf   ||   function(   item   )   {
   for (   var i   =   0,   l   =   this.length;   i   <   l;   i++   )   {
      if (   i   in   this   &&   this[i]   ===   item   )   return i;
   }
   return   -1;
},
   __hasProp   =   {   }.hasOwnProperty;   // Reference to hasOwnProperty for safer iteration


ko.utils.IdentityMap   =   function(   )   {
   // Defines a method to find an item in the map
   this.find   =   function(   id,   params   )   {

      return   $.grep(   this,   function(   d   )   {
         return   d.id   ===   id   &&   ko.utils.stringifyJson(   d.params   )   ===   ko.utils.stringifyJson(   params   );
      }   )[0];

   };

   return this;
};


// IdentityMap inherits from Array to allow push/pop/etc.
ko.utils.IdentityMap.prototype   =   new   Array(   );


ko.utils.unescapeHtml   =   function(   str   )   {

   var   result,   temp;

   if (   str.length   >   0   )   {
      temp   =   document.createElement(   "div"   );
      temp.innerHTML   =   str;
      result   =   temp.childNodes[0].nodeValue;
      temp.removeChild(   temp.firstChild   );
      return   result;
   }   else   {
      return   str;
   }
};


// Main KnockoutModel constructor using the Ctor pattern
var KnockoutModel = Ctor(   function(   )   {

   // Internal variables for the model instance
   var   __urls   =   {},
      __defaults   =   {},
      __transientParameters   =   [],
      __afterHooks   =   {},
      __cacheContainer   =   new   ko.utils.IdentityMap(   ),
      __backup   =   {};


   // Custom equality comparer for observable properties
   var __equalityComparer = function(   a,   b   )   {

      var   oldValueIsPrimitive,   primitiveTypes,   _ref;

      primitiveTypes   =   {
         'undefined':   true,
         'boolean':   true,
         'number':   true,
         'string':   true
      };

      oldValueIsPrimitive   =   (   a   ===   null   )   ||   (   _ref   =   typeof   a,   __indexOf.call(   primitiveTypes,   _ref   )   >=   0   );

      if (   oldValueIsPrimitive   )   {
         return   a   ===   b;
      }   else   {
         return   false;
      }
   };


   // Initialization method for new model instances
   this.init   =   function(   )   {

      var   i,   item;

      this.__urls   =   __urls;

      for (   i   in   this   )   {
         if (   !__hasProp.call(   this,   i   )   )   continue;
         item   =   this[i];

         if (   i   !==   "__urls"   )   {
            if (   ko.isObservable(   this[i]   )   )   {
               this[i].equalityComparer   =   __equalityComparer;
            }
            __defaults[i]   =   this.get(   i   );
         }
      }
   }


   // Initialize URLs property
   this.__urls   =   {};


   // Adds a route to the model's internal URL mapping
   this.addRoute   =   function(   id,   href,   isStatic   )   {

      if (   isStatic   ==   null   )   {
         isStatic   =   true;
      }

      this.__urls[id]   =   href;

      if (   isStatic   ===   true   )   {
         return   __urls[id]   =   href;
      }
   };


   // Getter for model attributes, unwraps observables
   this.get   =   function(   attr   )   {
      return   ko.utils.unwrapObservable(   this[attr]   );
   };


   // Setter for model attributes, handles observables and HTML unescaping
   this.set   =   function(   args   )   {

      var   i,   item,   new_value,   obj;

      obj   =   this;

      for (   i   in   args   )   {
         item   =   args[i];

         if (   ko.isWriteableObservable(   obj[i]   )   )   {

            new_value   =   typeof   item   ===   "string"   &&   item.match(   /&[^\s]*;/   )   !==   false   ?   ko.utils.unescapeHtml(   item   )   :   item;

            if (   new_value   !==   obj[i](   )   )   {
               obj[i](   new_value   );
            }

         }   else   if (   obj[i]   !==   void   0   &&   ko.isObservable(   obj[i]   )   ===   false   )   {

            new_value   =   item.match(   /&[^\s]*;/   )   !==   false   ?   ko.utils.unescapeHtml(   item   )   :   item;
            obj[i]   =   new_value;

         }
      }
      return   obj;
   };


   // Performs a POST request
   this.doPost   =   function(   routeName,   params,   callback,   type   )   {

      var   url;

      if (   params   ==   null   )   {
         params   =   {};
      }

      if (   callback   ==   null   )   {
         callback   =   null;
      }

      if (   type   ==   null   )   {
         type   =   "json";
      }

      if (   routeName.match(   /^https?:\/\//   )   ===   null   )   {
         url   =   this.__urls[routeName];
      }   else   {
         url   =   routeName;
      }

      return   doPost(   url,   params,   callback,   type   );
   };


   // Performs a GET request
   this.doGet   =   function(   routeName,   params,   callback,   type   )   {

      var   url;

      if (   params   ==   null   )   {
         params   =   {};
      }

      if (   callback   ==   null   )   {
         callback   =   null;
      }

      if (   type   ==   null   )   {
         type   =   "json";
      }

      if (   routeName.match(   /^https?:\/\//   )   ===   null   )   {
         url   =   this.__urls[routeName];
      }   else   {
         url   =   routeName;
      }

      return   doGet(   url,   params,   callback,   type   );
   };


   // Private function to handle POST requests
   var doPost = function(   routeName,   params,   callback,   type   )   {

      var   ah,   className,   url;

      if (   params   ==   null   )   {
         params   =   {};
      }

      if (   callback   ==   null   )   {
         callback   =   null;
      }

      if (   type   ==   null   )   {
         type   =   "json";
      }

      // Determine the URL based on routeName
      if (   routeName.match(   /^https?:\/\//   )   ===   null   )   {
         url   =   this.__parse_url(   this.__urls[routeName],   params   );
      }   else   {
         url   =   this.__parse_url(   routeName,   params   );
      }

      className   =   this.name;
      ah   =   this.__afterHooks;

      return   RQ.add(   $.post(   url,   params,   function(   data   )   {
         try   {
            if (   typeof   ah[routeName]   ===   "function"   )   {
               ah[routeName](   data   );
            }
            if (   typeof   callback   ===   "function"   )   {
               return   callback(   data   );
            }
         }   catch (   error   )   {
            // Error handling for afterHooks or callback execution
         }
      },   type   ),   (   "rq_"   +   className   +   "_"   )   +   new   Date(   )   );
   };


   // Private function to handle GET requests, including caching
   var doGet = function(   routeName,   params,   callback,   type   )   {

      var   ah,   cached,   cc,   className,   isCache,   tempParams,   url;

      if (   params   ==   null   )   {
         params   =   {};
      }

      if (   callback   ==   null   )   {
         callback   =   null;
      }

      if (   type   ==   null   )   {
         type   =   "json";
      }

      if (   routeName.match(   /^https?:\/\//   )   ===   null   )   {
         url   =   this.__parse_url(   this.__urls[routeName],   params   );
      }   else   {
         url   =   this.__parse_url(   routeName,   params   );
      }

      className   =   this.name;
      isCache   =   params["__cache"]   ===   true;

      if (   isCache   ===   true   )   {
         delete   params["__cache"];
      }

      cc   =   this.__cacheContainer;
      ah   =   this.__afterHooks;

      if (   isCache   ===   true   )   {
         cached   =   cc.find(   ""   +   className   +   "#"   +   routeName,   params   );
      }

      if (   cached   !=   null   )   {
         if (   typeof   callback   ===   "function"   )   {
            return   callback(   cached.data   );
         }
      }   else   {

         tempParams   =   $.extend(   {},   params   );
         tempParams["__no_cache"]   =   new   Date(   ).getTime(   );

         return   RQ.add(   $.get(   url,   tempParams,   function(   data   )   {

            if (   isCache   ===   true   )   {
               cc.push(   {
                  id:   ""   +   className   +   "#"   +   routeName,
                  params:   params,
                  data:   data
               }   );
            }

            try   {
               if (   typeof   ah[routeName]   ===   "function"   )   {
                  ah[routeName](   data   );
               }
               if (   typeof   callback   ===   "function"   )   {
                  return   callback(   data   );
               }
            }   catch (   error   )   {
               // Callback or afterHook failed.
            }
         },   type,   (   "rq_"   +   className   +   "_"   )   +   new   Date(   )   )   );
      }
   };


   // Private function to create a collection of model instances
   var createCollection = function(   data,   callback   )   {

      var   collection,   item,   obj,   _i,   _len;

      collection   =   [];

      for (   _i   =   0,   _len   =   data.length;   _i   <   _len;   _i++   )   {
         item   =   data[_i];
         obj   =   new   this;

         if (   typeof   callback   ===   "function"   )   {
            obj.set(   callback(   item   )   );
         }   else   {
            obj.set(   item   );
         }
         collection.push(   obj   );
      }
      return   collection;
   };


   // Resets model attributes to their default values
   this.clear   =   function(   )   {
      return   this.set(   __defaults   );
   };


   // Refreshes the model data by calling the 'show' method
   this.refresh   =   function(   callback   )   {

      return   this.show(   function(   data   )   {

         if (   data.status   ===   "SUCCESS"   )   {
            this.set(   data   );
         }

         if (   typeof   callback   ===   "function"   )   {
            return   callback(   data   );
         }
      }   );
   };


   // Converts the model to a JSON string
   this.toJSON   =   function(   options   )   {
      return   ko.toJSON(   this.clone(   options   )   );
   };


   // Converts the model to a plain JavaScript object
   this.toJS   =   function(   options   )   {
      return   ko.toJS(   this.clone(   options   )   );
   };


   // Creates a clone of the model, excluding transient attributes
   this.clone   =   function(   args   )   {

      var   i,   param,   temp,   transientAttributes,   _i,   _len,   _ref;

      if (   args   ==   null   )   {
         args   =   {};
      }

      transientAttributes   =   {
         '__urls':   false
      };

      _ref   =   __transientParameters;

      for (   _i   =   0,   _len   =   _ref.length;   _i   <   _len;   _i++   )   {
         param   =   _ref[_i];
         transientAttributes[param]   =   false;
      }

      args   =   $.extend(   transientAttributes,   args   );
      temp   =   {};

      for (   i   in   this   )   {
         if (   !__hasProp.call(   this,   i   )   )   continue;

         if (   args[i]   ===   true   ||   args[i]   ===   void   0   )   {
            temp[i]   =   this.get(   i   );
         }
      }
      return   temp;
   };


   // Backs up the current state of the model
   this.backup   =   function(   )   {
      return   __backup   =   this.toJS(   );
   };


   // Restores the model to its backed-up state
   this.restore   =   function(   )   {
      this.set(   __backup   );
      __backup   =   {};
      return   this;
   };


   // Starts a transaction, temporarily disabling equality comparisons for observables
   this.start_transaction   =   function(   )   {

      var   i,   item,   _results;

      _results   =   [];

      for (   i   in   this   )   {
         if (   !__hasProp.call(   this,   i   )   )   continue;
         item   =   this[i];

         if (   typeof   this[i].equalityComparer   ===   "function"   )   {
            _results.push(   this[i].equalityComparer   =   function(   )   {
               return   true;
            }   );
         }   else   {
            _results.push(   void   0   );
         }
      }
      return   _results;
   };


   // Commits a transaction, re-enabling equality comparisons and mutating observables
   this.commit   =   function(   )   {

      var   i,   item,   _results;

      _results   =   [];

      for (   i   in   this   )   {
         if (   !__hasProp.call(   this,   i   )   )   continue;
         item   =   this[i];

         if (   typeof   this[i].equalityComparer   ===   "function"   )   {
            this[i].equalityComparer   =   __equalityComparer;

            if (   typeof   this[i].valueHasMutated   ===   "function"   )   {
               _results.push(   this[i].valueHasMutated(   )   );
            }   else   {
               _results.push(   void   0   );
            }
         }   else   {
            _results.push(   void   0   );
         }
      }
      return   _results;
   };


   // Checks if the model is new (has no ID)
   this.isNew   =   function(   )   {

      var   value;

      value   =   this.get(   "id"   );
      return   value   ===   null   ||   value   ===   void   0   ||   value   ===   "";
   };


   // Placeholder for validation logic
   this.validate   =   function(   )   {
      return   true;
   };


   // Saves the model (creates if new, updates if existing)
   this.save   =   function(   )   {

      var   callback,   params,   _ref;

      if (   this.validate(   )   ===   true   )   {
         if (   this.isNew(   )   ===   true   )   {
            return   this.create.apply(   this,   arguments   );
         }   else   {
            return   this.update.apply(   this,   arguments   );
         }
      }   else   {
         _ref   =   __generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];

         if (   typeof   callback   ===   "function"   )   {
            return   callback(   {
               status:   "ERROR",
               message:   "Invalid object"
            }   );
         }
      }
   };


   // Private helper to parse arguments into params and callback
   var __generate_request_parameters = function(   )   {

      var   callback,   params;

      params   =   {};
      callback   =   null;

      if (   typeof   arguments[0]   ===   "function"   )   {
         callback   =   arguments[0];
      }   else   if (   typeof   arguments[0]   ===   "object"   )   {
         params   =   arguments[0];

         if (   typeof   arguments[1]   ===   "function"   )   {
            callback   =   arguments[1];
         }
      }
      return   [   params,   callback   ];
   };


   // Private helper to parse and replace URL parameters
   var __parse_url = function(   url,   params   )   {

      var   a,   link;

      a   =   document.createElement(   "a"   );
      a.href   =   url;

      a.pathname   =   a.pathname.replace(   /:([a-zA-Z0-9_]+)/g,   function(   match   )   {

         var   attr,   value;

         attr   =   match.substring(   1   );
         value   =   params[attr];
         delete   params[attr];
         return   value;
      }   );

      link   =   a.href;
      a   =   null;
      return   link;
   };


   // Public method to create a new model instance on the backend
   this.create   =   function(   )   {

      var   callback,   params,   _ref;

      _ref   =   __generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      params   =   $.extend(   params,   this.toJS(   )   );
      return   this.doPost(   "create",   params,   callback   );
   };


   // Public method to update an existing model instance on the backend
   this.update   =   function(   )   {

      var   callback,   params,   _ref;

      _ref   =   __generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      params   =   $.extend(   params,   this.toJS(   )   );
      return   this.doPost(   "update",   params,   callback   );
   };


   // Public method to delete a model instance from the backend
   this.destroy   =   function(   )   {

      var   callback,   params,   _ref;

      _ref   =   __generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      params   =   $.extend(   params,   this.toJS(   )   );
      return   this.doPost(   "destroy",   params,   callback   );
   };


   // Public method to retrieve a single model instance from the backend
   this.show   =   function(   )   {

      var   callback,   params,   _ref;

      _ref   =   __generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      params   =   $.extend(   params,   {
         id:   this.get(   "id"   )
      }   );
      return   this.doGet(   "show",   params,   callback   );
   };


   // Public method to retrieve a collection of model instances from the backend
   this.index   =   function(   )   {

      var   callback,   params,   _ref;

      _ref   =   __generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      return   this.doGet(   "index",   params,   callback   );
   };


   // Private version of create (likely for internal use or older pattern)
   var create = function(   )   {

      var   callback,   params,   _ref;

      _ref   =   this.__generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      return   this.doPost(   "create",   params,   callback   );
   };


   // Private version of update
   var update = function(   )   {

      var   callback,   params,   _ref;

      _ref   =   this.__generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      return   this.doPost(   "update",   params,   callback   );
   };


   // Private version of destroy
   var destroy = function(   )   {

      var   callback,   params,   _ref;

      _ref   =   this.__generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      return   this.doPost(   "destroy",   params,   callback   );
   };


   // Private version of show
   var show = function(   )   {

      var   callback,   params,   _ref;

      _ref   =   this.__generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      return   this.doGet(   "show",   params,   callback   );
   };


   // Private version of index
   var index = function(   )   {

      var   callback,   params,   _ref;

      _ref   =   this.__generate_request_parameters.apply(   this,   arguments   ),   params   =   _ref[0],   callback   =   _ref[1];
      return   this.doGet(   "index",   params,   callback   );
   };


   // Private function to kill all pending requests related to this model
   var killAllRequests = function(   )   {
      return   RQ.killByRegex(   /^rq_#{@name}_/   );
   };
}   );