// Define the main djangochair constructor function
var   djangochair   =   function  (  url  )
{
    // Initialize the instance with the provided URL
    this .  init (  url  ) ;
}

/*
 *  Attach methods to the djangochair prototype.
 *  These methods provide an interface for interacting with
 *  Lawnchair storage and a remote Django backend.
 */
djangochair .  prototype   =   {

    // The 'init' method is called by the constructor to set up the instance.
    init :   function  (  url  )
    {
        // Initialize Lawnchair instance with 'django' as the store name.
        this .  django   =   new   Lawnchair (  'django'  ) ;

        // Store the base URL for remote operations.
        this .  url   =   url ;
    } , // End of init method


    // Retrieve a record by its key from local storage.
    get :   function  (  key  ,   callback  )
    {
        this .  django .  get (  key  ,   callback  )
    } , // End of get method


    // Remove a record by its key from local storage. This is a hard delete.
    purge :   function  (  key  ,   callback  )
    {
        this .  django .  remove (  key  ,   callback  ) ;
    } , // End of purge method


    // Clear all records from local storage.
    nuke :   function  (  callback  )
    {
        this .  django .  nuke (  callback  ) ;
        return   this
    } , // End of nuke method


    // Mark a record as "deleted" in local storage, rather than physically removing it.
    remove :   function  (  key  ,   callback  )
    {
        var   that   =   this ; // Capture 'this' for use in the callback closure.

        // First, get the record to ensure it exists and to retrieve its data.
        this .  django .  get (  key  ,   function  (  r  )
        {
            // Save the record back with a 'deleted' state.
            that .  django .  save (  {   'key' :   r .  key  ,
                                         'data' :   r .  data  ,
                                         'state' :   "deleted"   }  ,   callback  ) ;
        } ) ;
    } , // End of remove method


    // Generates a unique key for an object based on its primary key (pk) and model.
    key :   function  (  obj  )
    {
        var   key   =   obj .  pk   +   '.'   +   obj .  model ; // Concatenate pk and model.
        return   key ;
    } , // End of key method


    // Create a new record in local storage, marking its state as "created".
    create :   function  (  obj  ,   callback  )
    {
        this .  django .  save (  {   'key' :   this .  key (  obj  )  ,
                                     'data' :   obj  ,
                                     'state' :   'created'   }  ,   callback  ) ;
    } , // End of create method


    // Update an existing record in local storage, marking its state as "updated".
    update :   function  (  obj  ,   callback  )
    {
        obj .  state   =   "updated" ; // Set the state to updated.
        this .  django .  save (  obj  ,   callback  ) ; // Save the updated object.
    } , // End of update method


    // Find records matching a condition in local storage.
    find :   function  (  condition  ,   callback  )
    {
        this .  django .  find (  condition  ,   callback  )
    } , // End of find method


    // Retrieve all records marked as "created".
    created :   function  (  callback  )
    {
        this .  django .  find (  'r.state == "created"'  ,   callback  ) ;
    } , // End of created method


    // Retrieve all records marked as "updated".
    updated :   function  (  callback  )
    {
        this .  django .  find (  'r.state == "updated"'  ,   callback  ) ;
    } , // End of updated method


    // Retrieve all records marked as "deleted".
    deleted :   function  (  callback  )
    {
        this .  django .  find (  'r.state == "deleted"'  ,   callback  ) ;
    } , // End of deleted method


    // Retrieve all records marked as "synced".
    synced :   function  (  callback  )
    {
        this .  django .  find (  'r.state == "synced"'  ,   callback  ) ;
    } , // End of synced method


    // Iterate over all records in local storage.
    each :   function  (  callback  )
    {
        this .  django .  each (  callback  )
    } , // End of each method


    // Synchronize records from a remote Django endpoint to local storage.
    remote_get :   function  (  callback  )
    {
        var   that   =   this ; // Capture 'this'.
        var   url   =   this .  url   +   '/get/' ; // Construct the remote URL.

        // Make an AJAX GET request to the Django endpoint.
        $ .  getJSON (  url  ,   function  (  records  )
        {
            // Iterate through each record received from the server.
            $ (  records  ) .  each (  function  (  count  )
            {
                var   record   =   records [  count  ] ; // Current record from the server.
                var   key   =   that .  key (  record  ) ; // Generate key for the record.

                // Check if this record already exists in local storage.
                that .  django .  get (  key  ,   function  (  exists  )
                {
                    if   (  exists  )
                    {
                        // If it exists, update its data and mark as synced.
                        that .  django .  save (  {   'key' :   key  ,
                                                     'data' :   record  ,
                                                     'state' :   'synced'   }  ,   callback  ) ;
                    }
                    else
                    {
                        // If it's new, create it in local storage.
                        that .  create (  record  ,   callback  ) ;
                    } ; // End of if-else for existence check
                } ) // End of django.get callback
            } ) // End of $(records).each callback
        } ) ; // End of $.getJSON callback
    } , // End of remote_get method


    // Send a request to delete a record on the remote Django endpoint.
    remote_delete :   function  (  obj  ,   callback  )
    {
        var   url   =   this .  url   +   '/delete/' ; // Construct the remote delete URL.

        // Perform an AJAX POST request.
        $ .  ajax (  {
            type :   'POST'  ,
            url :   url  ,
            success :   callback  , // Callback on successful deletion.
            data :   {
                "key" :   obj .  data .  pk  , // Pass the primary key of the object.
            } , // End of data object
        } ) // End of $.ajax call
    } , // End of remote_delete method


    // Send a request to save/update a record on the remote Django endpoint.
    remote_save :   function  (  obj  ,   callback  )
    {
        var   url   =   this .  url   +   '/save/' ; // Construct the remote save URL.

        // Perform an AJAX POST request to save the data.
        $ .  ajax (  {
            type :   'POST'  ,
            url :   url  ,
            success :   callback  , // Callback on successful save.
            data :   {
                "key" :   obj .  data .  pk  , // Primary key.
                "data" :   this .  django .  adaptor .  serialize (  obj .  data .  fields  ) // Serialized fields.
            } , // End of data object
        } ) ; // End of $.ajax call

        obj .  state   =   "synced" ; // Mark the local object as synced.
        this .  django .  save (  obj  ) ; // Save the updated state locally.
    } // End of remote_save method

} // End of djangochair.prototype object