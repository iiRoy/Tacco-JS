/*
 *  lua.h.js: Lua 5.1 C API, lua.h definitions (fragment file)
 *  This file constitutes a part of the lua5.1.js project.
 *  Copyright (c) LogicEditor <info@logiceditor.com>
 *  Copyright (c) lua5.1.js authors
 *  Please refer to the `COPYRIGHT` file for detailed licensing information.
 *  This implementation is based on the official Lua 5.1.5 header files.
 *  Copyright (c) 1994-2012 Lua.org, PUC-Rio.
 */

/*
 *  Note: The objective here is to maintain a close resemblance to the original
 *  Lua source code formatting. This includes intentionally avoiding strict
 *  80-character line limits, allowing for longer lines where they reflect
 *  the original style, even if it makes the JavaScript code appear
 *  somewhat extended.
 */


var lua_Number = "number" ; // Defines the JavaScript type equivalent for Lua's 'number'.


var lua_Integer = "number";  // Defines the JavaScript type equivalent for Lua's 'integer' (which is also 'number').



// Core Lua version and authorship constants.
C.LUA_VERSION     = "Lua 5.1" ; // The major Lua version string.
C.LUA_RELEASE     = "Lua 5.1.5";  // The full Lua release string.
C.LUA_VERSION_NUM = 501   ;      // Numerical representation of the Lua version (5.01).
C.LUA_COPYRIGHT   = "Copyright (C) 1994-2012 Lua.org, PUC-Rio"; /* Copyright notice for Lua */
C.LUA_AUTHORS     = "R. Ierusalimschy, L. H. de Figueiredo & W. Celes" ; // Authors of Lua.


/* mark for precompiled code (the escape sequence followed by 'Lua') */
C.LUA_SIGNATURE = "\033Lua" ;


/* option for multiple returns in `lua_pcall' and `lua_call' operations */
C.LUA_MULTRET = ( -1 ) ;


/*
**  These are pseudo-indices used for accessing special values in the Lua stack.
*/
C.LUA_REGISTRYINDEX = ( -10000 ) ; // Index for the Lua registry table.
C.LUA_ENVIRONINDEX  = ( -10001 ) ;  // Index for the environment table.
C.LUA_GLOBALSINDEX  = ( -10002 ) ;   // Index for the global environment table.
C.lua_upvalueindex  = function(i) { return (C.LUA_GLOBALSINDEX - (i)); } ; // Calculates an upvalue index.


/*
 *  Thread status codes; 0 indicates OK (no error).
 */
C.LUA_YIELD     = 1 ; // Thread is suspended (yielded).
C.LUA_ERRRUN    = 2 ;  // A runtime error occurred.
C.LUA_ERRSYNTAX = 3 ;   // A syntax error occurred during compilation.
C.LUA_ERRMEM    = 4 ;    // A memory allocation error occurred.
C.LUA_ERRERR    = 5 ;     // An error occurred while running the error handler.


var lua_State = "number" ; // Represents the Lua state pointer (opaque type).


// typedef int (*lua_CFunction) (lua_State *L); - Original C definition.
var lua_CFunction = "number" ; // JavaScript type for a C function pointer in Lua.


/*
 *  Functions designed to read/write blocks of data when loading/dumping Lua chunks.
 */
// typedef const char * (*lua_Reader) (lua_State *L, void *ud, size_t *sz); - Original C definition.
var lua_Reader = "number" ; // JavaScript type for a Lua reader function pointer.


// typedef int (*lua_Writer) (lua_State *L, const void* p, size_t sz, void* ud); - Original C definition.
var lua_Writer = "number" ; // JavaScript type for a Lua writer function pointer.


/*
 *  Prototype for memory-allocation functions used by Lua.
 */
// typedef void * (*lua_Alloc) (void *ud, void *ptr, size_t osize, size_t nsize); - Original C definition.
var lua_Alloc = "number" ; // JavaScript type for a Lua memory allocator function pointer.


/*
 *  Basic Lua data types.
 */
C.LUA_TNONE = ( -1 ) ; // Represents an invalid type (or no value).

C.LUA_TNIL           = 0 ; // The 'nil' type.
C.LUA_TBOOLEAN       = 1 ;  // The 'boolean' type.
C.LUA_TLIGHTUSERDATA = 2 ;   // The 'light userdata' type.
C.LUA_TNUMBER        = 3 ;    // The 'number' type.
C.LUA_TSTRING        = 4 ;     // The 'string' type.
C.LUA_TTABLE         = 5 ;      // The 'table' type.
C.LUA_TFUNCTION      = 6 ;       // The 'function' type.
C.LUA_TUSERDATA      = 7 ;        // The 'full userdata' type.
C.LUA_TTHREAD        = 8 ;         // The 'thread' type.


/* minimum Lua stack available to a C function */
C.LUA_MINSTACK = 20 ;


/* type of numbers in Lua (aliased from lua_Number) */
var LUA_NUMBER = lua_Number ;

/* type for integer functions (aliased from lua_Integer) */
var LUA_INTEGER = lua_Integer ;


/*
 *  ===============================================================
 *  State manipulation functions
 *  ===============================================================
 */
C.lua_newstate  = F("lua_newstate", lua_State, [lua_Alloc, void_ptr_t]) ; // Creates a new Lua state.
C.lua_close     = F("lua_close", void_t, [lua_State]) ;                   // Closes a Lua state.
C.lua_newthread = F("lua_newthread", lua_State, [lua_State]) ;           // Creates a new thread (coroutine) in an existing state.

C.lua_atpanic = F("lua_atpanic", lua_CFunction, [lua_State, lua_CFunction]) ; // Sets a panic function.


/*
 *  ===============================================================
 *  Basic stack manipulation functions
 *  ===============================================================
 */
C.lua_gettop     = F("lua_gettop", int_t, [lua_State]) ;                       // Returns the index of the top element.
C.lua_settop     = F("lua_settop", void_t, [lua_State, int_t]) ;               // Sets the stack top to a specific index.
C.lua_pushvalue  = F("lua_pushvalue", void_t, [lua_State, int_t]) ;            // Pushes a copy of an element to the top.
C.lua_remove     = F("lua_remove", void_t, [lua_State, int_t]) ;               // Removes an element from the stack.
C.lua_insert     = F("lua_insert", void_t, [lua_State, int_t]) ;               // Inserts an element into the stack.
C.lua_replace    = F("lua_replace", void_t, [lua_State, int_t]) ;              // Replaces an element on the stack.
C.lua_checkstack = F("lua_checkstack", int_t, [lua_State, int_t]) ;            // Ensures stack has enough space.

C.lua_xmove = F("lua_xmove", void_t, [lua_State, lua_State, int_t]) ; // Moves elements between Lua states.


/*
 *  ===============================================================
 *  Access functions (read values from stack into C)
 *  ===============================================================
 */

C.lua_isnumber    = F("lua_isnumber", int_t, [lua_State, int_t]) ;              // Checks if value is a number.
C.lua_isstring    = F("lua_isstring", int_t, [lua_State, int_t]) ;              // Checks if value is a string.
C.lua_iscfunction = F("lua_iscfunction", int_t, [lua_State, int_t]) ;           // Checks if value is a C function.
C.lua_isuserdata  = F("lua_isuserdata", int_t, [lua_State, int_t]) ;            // Checks if value is userdata.
C.lua_type        = F("lua_type", int_t, [lua_State, int_t]) ;                  // Returns the type of the value.
C.lua_typename    = F("lua_typename", const_char_ptr_t, [lua_State, int_t]) ;   // Returns the name of a type.

C.lua_equal    = F("lua_equal", int_t, [lua_State, int_t, int_t]) ;         // Compares two Lua values for equality.
C.lua_rawequal = F("lua_rawequal", int_t, [lua_State, int_t, int_t]) ;      // Compares two Lua values for raw equality.
C.lua_lessthan = F("lua_lessthan", int_t, [lua_State, int_t, int_t]) ;      // Compares if one Lua value is less than another.

C.lua_tonumber    = F("lua_tonumber", lua_Number, [lua_State, int_t]) ;                         // Converts value to a number.
C.lua_tointeger   = F("lua_tointeger", lua_Integer, [lua_State, int_t]) ;                       // Converts value to an integer.
C.lua_toboolean   = F("lua_toboolean", int_t, [lua_State, int_t]) ;                             // Converts value to a boolean.
C.lua_tolstring   = F("lua_tolstring", const_char_ptr_t, [lua_State, int_t, size_t_ptr_t]) ;    // Converts value to a string, returns length.
C.lua_objlen      = F("lua_objlen", size_t, [lua_State, int_t]) ;                               // Returns the length of an object.
C.lua_tocfunction = F("lua_tocfunction", lua_CFunction, [lua_State, int_t]) ;                   // Converts value to a C function pointer.
C.lua_touserdata  = F("lua_touserdata", void_ptr_t, [lua_State, int_t]) ;                       // Converts value to a userdata pointer.
C.lua_tothread    = F("lua_tothread", lua_State, [lua_State, int_t]) ;                          // Converts value to a thread.
C.lua_topointer   = F("lua_topointer", const_void_ptr_t, [lua_State, int_t]) ;                  // Converts value to a generic C pointer.


/*
 *  ===============================================================
 *  Push functions (push C values onto the stack)
 *  ===============================================================
 */
C.lua_pushnil           = F("lua_pushnil", void_t, [lua_State]) ;                               // Pushes a nil value.
C.lua_pushnumber        = F("lua_pushnumber", void_t, [lua_State, lua_Number]) ;                // Pushes a number.
C.lua_pushinteger       = F("lua_pushinteger", void_t, [lua_State, lua_Integer]) ;              // Pushes an integer.
C.lua_pushlstring       = F("lua_pushlstring", void_t, [lua_State, const_char_ptr_t, size_t]) ; // Pushes a string with specified length.
C.lua_pushstring        = F("lua_pushstring", void_t, [lua_State, const_char_ptr_t]) ;          // Pushes a null-terminated string.
/*
// TODO: Support these functions for formatted string pushing.
LUA_API const char *(lua_pushvfstring) (lua_State *L, const char *fmt,
                                                      va_list argp);
LUA_API const char *(lua_pushfstring) (lua_State *L, const char *fmt, ...);
*/
C.lua_pushcclosure      = F("lua_pushcclosure", void_t, [lua_State, lua_CFunction, int_t]) ;    // Pushes a C closure.
C.lua_pushboolean       = F("lua_pushboolean", void_t, [lua_State, int_t]) ;                    // Pushes a boolean value.
C.lua_pushlightuserdata = F("lua_pushlightuserdata", void_t, [lua_State, void_ptr_t]) ;         // Pushes light userdata.
C.lua_pushthread        = F("lua_pushthread", int_t, [lua_State]) ;                             // Pushes the current thread.


/*
 *  ===============================================================
 *  Get functions (read values from Lua tables onto stack)
 *  ===============================================================
 */
C.lua_gettable     = F("lua_gettable", void_t, [lua_State, int_t]) ;                            // Pushes `t[k]` where `t` is at index and `k` is at top.
C.lua_getfield     = F("lua_getfield", void_t, [lua_State, int_t, const_char_ptr_t]) ;          // Pushes `t[k]` where `t` is at index and `k` is a string.
C.lua_rawget       = F("lua_rawget", void_t, [lua_State, int_t]) ;                              // Raw `t[k]` without metatable lookup.
C.lua_rawgeti      = F("lua_rawgeti", void_t, [lua_State, int_t, int_t]) ;                      // Raw `t[n]` for integer key `n`.
C.lua_createtable  = F("lua_createtable", void_t, [lua_State, int_t, int_t]) ;                  // Creates a new empty table.
C.lua_newuserdata  = F("lua_newuserdata", void_ptr_t, [lua_State, size_t]) ;                    // Creates new full userdata.
C.lua_getmetatable = F("lua_getmetatable", int_t, [lua_State, int_t]) ;                         // Pushes the metatable of a value.
C.lua_getfenv      = F("lua_getfenv", void_t, [lua_State, int_t]) ;                             // Pushes the environment table of a value.


/*
 *  ===============================================================
 *  Set functions (write values from stack into Lua tables)
 *  ===============================================================
 */
C.lua_settable     = F("lua_settable", void_t, [lua_State, int_t]) ;                            // Sets `t[k] = v` where `t` is at index, `k` and `v` are at top.
C.lua_setfield     = F("lua_setfield", void_t, [lua_State, int_t, const_char_ptr_t]) ;          // Sets `t[k] = v` where `t` is at index, `k` is a string, `v` is at top.
C.lua_rawset       = F("lua_rawset", void_t, [lua_State, int_t]) ;                              // Raw `t[k] = v` without metatable lookup.
C.lua_rawseti      = F("lua_rawseti", void_t, [lua_State, int_t, int_t]) ;                      // Raw `t[n] = v` for integer key `n`.
C.lua_setmetatable = F("lua_setmetatable", int_t, [lua_State, int_t]) ;                         // Sets the metatable for a value.
C.lua_setfenv      = F("lua_setfenv", int_t, [lua_State, int_t]) ;                              // Sets the environment table for a value.


/*
 *  ===============================================================
 *  `load' and `call' functions (to load and execute Lua code)
 *  ===============================================================
 */
C.lua_call   = F("lua_call", void_t, [lua_State, int_t, int_t]) ;                               // Calls a Lua function.
C.lua_pcall  = F("lua_pcall", int_t, [lua_State, int_t, int_t, int_t]) ;                       // Calls a Lua function in protected mode.
C.lua_cpcall = F("lua_cpcall", int_t, [lua_State, lua_CFunction, void_ptr_t]) ;                // Calls a C function in protected mode.
C.lua_load   = F("lua_load", int_t, [lua_State, lua_Reader, void_ptr_t,
                                        const_char_ptr_t]) ;                                   // Loads a Lua chunk.

C.lua_dump = F("lua_dump", int_t, [lua_State, lua_Writer, void_ptr_t]) ; // Dumps a function as a binary chunk.


/*
 *  ===============================================================
 *  Coroutine functions
 *  ===============================================================
 */
C.lua_yield  = F("lua_yield", int_t, [lua_State, int_t]) ;   // Yields a coroutine.
C.lua_resume = F("lua_resume", int_t, [lua_State, int_t]) ;  // Resumes a coroutine.
C.lua_status = F("lua_status", int_t, [lua_State]) ;         // Returns the status of a coroutine.


/*
 *  ===============================================================
 *  Garbage-collection function and options
 *  ===============================================================
 */

C.LUA_GCSTOP       = 0 ; // Stop the garbage collector.
C.LUA_GCRESTART    = 1 ;  // Restart the garbage collector.
C.LUA_GCCOLLECT    = 2 ;   // Perform a full garbage collection cycle.
C.LUA_GCCOUNT      = 3 ;    // Returns the current memory usage in Kbytes.
C.LUA_GCCOUNTB     = 4 ;     // Returns the remainder of memory usage in bytes.
C.LUA_GCSTEP       = 5 ;      // Performs an incremental step of garbage collection.
C.LUA_GCSETPAUSE   = 6 ;       // Sets the GC pause.
C.LUA_GCSETSTEPMUL = 7 ;        // Sets the GC step multiplier.

C.lua_gc = F("lua_gc", int_t, [lua_State, int_t, int_t]) ; // Controls the garbage collector.


/*
 *  ===============================================================
 *  Miscellaneous functions
 *  ===============================================================
 */

C.lua_error = F("lua_error", int_t, [lua_State]) ; // Generates a Lua error.

C.lua_next = F("lua_next", int_t, [lua_State, int_t]) ; // Iterates a table.

C.lua_concat = F("lua_concat", void_t, [lua_State, int_t]) ; // Concatenates 'n' values on the stack.

C.lua_getallocf = F("lua_getallocf", lua_Alloc, [lua_State, void_ptr_t_ptr_t]) ; // Gets the memory allocation function.
C.lua_setallocf = F("lua_setallocf", void_t, [lua_State, lua_Alloc, void_ptr_t]) ; // Sets the memory allocation function.


/*
 *  ===============================================================
 *  Some useful macros (implemented as functions in JS)
 *  ===============================================================
 */

C.lua_pop = function(L, n) { return C.lua_settop(L, -(n)-1); } ; // Pops 'n' elements from the stack.

C.lua_newtable = function(L) { return C.lua_createtable(L, 0, 0); } ; // Creates an empty table and pushes it.

C.lua_register = function(L, n, f) { return (C.lua_pushcfunction(L, (f)), C.lua_setglobal(L, (n))); } ; // Registers a C function as a global.

C.lua_pushcfunction = function(L, f) { return C.lua_pushcclosure(L, (f), 0); } ; // Pushes a C function onto the stack.

C.lua_strlen = function(L, i) { return C.lua_objlen(L, (i)); } ; // Returns the length of a string or table.

C.lua_isfunction      = function(L, n) { return (C.lua_type(L, (n)) === C.LUA_TFUNCTION); } ;       // Checks if value is a function.
C.lua_istable         = function(L, n) { return (C.lua_type(L, (n)) === C.LUA_TTABLE); } ;          // Checks if value is a table.
C.lua_islightuserdata = function(L, n) { return (C.lua_type(L, (n)) === C.LUA_TLIGHTUSERDATA); } ; // Checks if value is light userdata.
C.lua_isnil           = function(L, n) { return (C.lua_type(L, (n)) === C.LUA_TNIL); } ;            // Checks if value is nil.
C.lua_isboolean       = function(L, n) { return (C.lua_type(L, (n)) === C.LUA_TBOOLEAN); } ;        // Checks if value is a boolean.
C.lua_isthread        = function(L, n) { return (C.lua_type(L, (n)) === C.LUA_TTHREAD); } ;         // Checks if value is a thread.
C.lua_isnone          = function(L, n) { return (C.lua_type(L, (n)) === C.LUA_TNONE); } ;           // Checks if value is none.
C.lua_isnoneornil     = function(L, n) { return (C.lua_type(L, (n)) <= 0); } ;                       // Checks if value is none or nil.

C.lua_pushliteral = C.lua_pushstring ; // Alias for pushing string literals.

C.lua_setglobal = function(L, s) { return C.lua_setfield(L, C.LUA_GLOBALSINDEX, (s)); } ; // Sets a global variable.
C.lua_getglobal = function(L, s) { return C.lua_getfield(L, C.LUA_GLOBALSINDEX, (s)); } ; // Gets a global variable.

C.lua_tostring = function(L, i) { return C.lua_tolstring(L, (i), NULL); } ; // Converts value to string (without length).


/*
 *  ===============================================================
 *  Compatibility macros and functions
 *  ===============================================================
 */

C.lua_open = function() { return C.luaL_newstate(); } ; // Opens a new Lua state (compatibility function).

C.lua_getregistry = function(L) { return C.lua_pushvalue(L, C.LUA_REGISTRYINDEX); } ; // Pushes the registry table.

C.lua_getgccount = function(L) { return C.lua_gc(L, C.LUA_GCCOUNT, 0); } ; // Returns the number of Kbytes used by the GC.

var lua_Chunkreader = lua_Reader ; // Alias for chunk reader.
var lua_Chunkwriter = lua_Writer ; // Alias for chunk writer.

/* hack */
C.lua_setlevel = F("lua_setlevel", void_t, [lua_State, lua_State]) ; // Internal function for debug level.


/*
 *  {======================================================================
 *  Debug API
 *  ======================================================================
 */

/*
 *  Event codes for the debug hook.
 */
C.LUA_HOOKCALL    = 0 ; // Function call event.
C.LUA_HOOKRET     = 1 ;  // Function return event.
C.LUA_HOOKLINE    = 2 ;   // Line change event.
C.LUA_HOOKCOUNT   = 3 ;    // Count event.
C.LUA_HOOKTAILRET = 4 ;     // Tail call return event.

/*
 *  Event masks for the debug hook.
 */
C.LUA_MASKCALL  = (1 << C.LUA_HOOKCALL) ;  // Mask for call events.
C.LUA_MASKRET   = (1 << C.LUA_HOOKRET) ;   // Mask for return events.
C.LUA_MASKLINE  = (1 << C.LUA_HOOKLINE) ;  // Mask for line events.
C.LUA_MASKCOUNT = (1 << C.LUA_HOOKCOUNT) ; // Mask for count events.

// TODO: Future implementation should include support for these debug-related structures and functions.
/*
typedef struct lua_Debug lua_Debug;  //  Activation record structure.

// Functions to be invoked by the debugger during specific events.
typedef void (*lua_Hook) (lua_State *L, lua_Debug *ar);

LUA_API int lua_getstack (lua_State *L, int level, lua_Debug *ar);
LUA_API int lua_getinfo (lua_State *L, const char *what, lua_Debug *ar);
LUA_API const char *lua_getlocal (lua_State *L, const lua_Debug *ar, int n);
LUA_API const char *lua_setlocal (lua_State *L, const lua_Debug *ar, int n);
LUA_API const char *lua_getupvalue (lua_State *L, int funcindex, int n);
LUA_API const char *lua_setupvalue (lua_State *L, int funcindex, int n);

LUA_API int lua_sethook (lua_State *L, lua_Hook func, int mask, int count);
LUA_API lua_Hook lua_gethook (lua_State *L);
LUA_API int lua_gethookmask (lua_State *L);
LUA_API int lua_gethookcount (lua_State *L);

// The `lua_Debug` structure provides detailed information about an activation record.
struct lua_Debug {
  int event;              //  The event that triggered the hook.
  const char *name;       //  (n) Name of the function.
  const char *namewhat;   //  (n) Describes what the name means (`global`, `local`, `field`, `method`).
  const char *what;       //  (S) Type of function (`Lua`, `C`, `main`, `tail`).
  const char *source;     //  (S) Source file name.
  int currentline;        //  (l) Current line number.
  int nups;               //  (u) Number of upvalues.
  int linedefined;        //  (S) Line where the function was defined.
  int lastlinedefined;    //  (S) Last line of the function definition.
  char short_src[LUA_IDSIZE]; // (S) A 'short' name for the source.
  // private part
  int i_ci;  // Internal: index of the active call info.
};
*/