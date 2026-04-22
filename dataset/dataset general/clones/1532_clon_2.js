/*
 ********************************************************************************
 * vm_api.js: Virtual Machine 5.1 C Interface, vm_api.h definitions (fragment)
 * This component is part of the vm5.1.js project:
 * Copyright (c) LogicEditor <info@logiceditor.com>
 * Copyright (c) vm5.1.js contributors
 * Refer to `LICENSE.md` file for licensing information
 * Based on original Lua 5.1.5 header files:
 * Copyright (c) 1994-2012 Lua.org, PUC-Rio
 ********************************************************************************
 * Note: Aiming for high fidelity to the original Lua source formatting.
 *       This includes preserving line lengths, even if they exceed typical
 *       JavaScript style guides, to reflect the source structure.
 ********************************************************************************
 */

var script_NumType = "numeric_val";
var script_IntType = "numeric_val";

EngineAPI.VM_VERSION_STR     = "Lua 5.1";
EngineAPI.VM_RELEASE_STR     = "Lua 5.1.5";
EngineAPI.VM_VERSION_CODE    = 501;
EngineAPI.VM_LEGAL_NOTICE    = "Copyright (C) 1994-2012 Lua.org, PUC-Rio";
EngineAPI.VM_CREATORS        = "R. Ierusalimschy, L. H. de Figueiredo & W. Celes";

/* Unique marker for precompiled binary chunks (e.g., `<esc>Lua') */
EngineAPI.VM_BYTECODE_MARK = "\033Lua";

/* Indicator for functions supporting multiple return values in `vm_safe_exec` and `vm_execute_func` */
EngineAPI.VM_MULTIPLE_RESULTS = (-1);

/*
 * pseudo-indices for stack access
 */
EngineAPI.VM_REGISTRY_LOC    = (-10000);
EngineAPI.VM_ENVIRONMENT_LOC = (-10001);
EngineAPI.VM_GLOBAL_SCOPE_LOC = (-10002);
EngineAPI.vm_closure_var_pos = function(pos) {
    return (EngineAPI.VM_GLOBAL_SCOPE_LOC - (pos));
};

/* State of a coroutine; 0 signifies normal operation */
EngineAPI.VM_EXEC_PAUSED     = 1;
EngineAPI.VM_RUNTIME_FAIL    = 2;
EngineAPI.VM_SYNTAX_ISSUE    = 3;
EngineAPI.VM_MEMORY_FAULT    = 4;
EngineAPI.VM_ERROR_HANDLER_FAIL = 5;

var vm_EngineState = "numeric_val";

// Corresponding to C: typedef int (*vm_HostCallback) (vm_EngineState *state_ptr);
var vm_HostCallback = "numeric_val";

/*
 * Functions responsible for block-wise reading/writing during code chunk
 * loading and serialization processes in the VM.
 */
// Corresponding to C: typedef const char * (*vm_DataStreamer) (vm_EngineState *state_ptr, void *user_data, size_t *data_size_ptr);
var vm_DataStreamer = "numeric_val";

// Corresponding to C: typedef int (*vm_DataEmitter) (vm_EngineState *state_ptr, const void* data_ptr, size_t data_size, void* user_data);
var vm_DataEmitter = "numeric_val";

/*
 * Prototype for memory management routines within the VM
 */
// Corresponding to C: typedef void * (*vm_Allocator) (void *user_data, void *old_ptr, size_t old_size, size_t new_size);
var vm_Allocator = "numeric_val";

/*
 * Fundamental data types recognized by the VM
 */
EngineAPI.VM_TYPE_UNKNOWN       = (-1);

EngineAPI.VM_TYPE_NULL          = 0;
EngineAPI.VM_TYPE_BOOLEAN       = 1;
EngineAPI.VM_TYPE_RAW_USERDATA  = 2;
EngineAPI.VM_TYPE_NUMBER        = 3;
EngineAPI.VM_TYPE_STRING        = 4;
EngineAPI.VM_TYPE_COLLECTION    = 5;
EngineAPI.VM_TYPE_FUNCTION      = 6;
EngineAPI.VM_TYPE_USERDATA      = 7;
EngineAPI.VM_TYPE_COROUTINE     = 8;

/* Minimum stack capacity for a C function call */
EngineAPI.VM_MIN_CALL_STACK = 20;

/* Standard numeric type for VM operations */
var VM_NUM_TYPE = script_NumType;

/* Standard integer type for VM operations */
var VM_INT_TYPE = script_IntType;

/*
 * State management functions
 */
EngineAPI.vm_initialize_state = DefineExternal("vm_initialize_state", vm_EngineState, [vm_Allocator, void_type_ptr]);
EngineAPI.vm_dispose_state    = DefineExternal("vm_dispose_state", void_type_def, [vm_EngineState]);
EngineAPI.vm_spawn_thread     = DefineExternal("vm_spawn_thread", vm_EngineState, [vm_EngineState]);

EngineAPI.vm_set_panic_handler = DefineExternal("vm_set_panic_handler", vm_HostCallback, [vm_EngineState, vm_HostCallback]);

/*
 * Core stack manipulation routines
 */
EngineAPI.vm_query_stack_head     = DefineExternal("vm_query_stack_head", int_type_def, [vm_EngineState]);
EngineAPI.vm_adjust_stack_head    = DefineExternal("vm_adjust_stack_head", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_duplicate_item       = DefineExternal("vm_duplicate_item", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_delete_item          = DefineExternal("vm_delete_item", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_place_item           = DefineExternal("vm_place_item", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_swap_item            = DefineExternal("vm_swap_item", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_verify_stack_space   = DefineExternal("vm_verify_stack_space", int_type_def, [vm_EngineState, int_type_def]);

EngineAPI.vm_move_between_states  = DefineExternal("vm_move_between_states", void_type_def, [vm_EngineState, vm_EngineState, int_type_def]);

/*
 * Accessors (stack -> host C environment)
 */

EngineAPI.vm_is_number           = DefineExternal("vm_is_number", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_is_string           = DefineExternal("vm_is_string", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_is_c_callable       = DefineExternal("vm_is_c_callable", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_is_user_data        = DefineExternal("vm_is_user_data", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_retrieve_type       = DefineExternal("vm_retrieve_type", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_fetch_type_label    = DefineExternal("vm_fetch_type_label", const_char_type_ptr, [vm_EngineState, int_type_def]);

EngineAPI.vm_compare_equality    = DefineExternal("vm_compare_equality", int_type_def, [vm_EngineState, int_type_def, int_type_def]);
EngineAPI.vm_compare_raw_equality = DefineExternal("vm_compare_raw_equality", int_type_def, [vm_EngineState, int_type_def, int_type_def]);
EngineAPI.vm_compare_less        = DefineExternal("vm_compare_less", int_type_def, [vm_EngineState, int_type_def, int_type_def]);

EngineAPI.vm_convert_to_number       = DefineExternal("vm_convert_to_number", script_NumType, [vm_EngineState, int_type_def]);
EngineAPI.vm_convert_to_integer      = DefineExternal("vm_convert_to_integer", script_IntType, [vm_EngineState, int_type_def]);
EngineAPI.vm_convert_to_boolean      = DefineExternal("vm_convert_to_boolean", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_convert_to_len_string   = DefineExternal("vm_convert_to_len_string", const_char_type_ptr, [vm_EngineState, int_type_def, size_type_ptr]);
EngineAPI.vm_get_object_length       = DefineExternal("vm_get_object_length", size_type_val, [vm_EngineState, int_type_def]);
EngineAPI.vm_convert_to_c_func       = DefineExternal("vm_convert_to_c_func", vm_HostCallback, [vm_EngineState, int_type_def]);
EngineAPI.vm_convert_to_user_data    = DefineExternal("vm_convert_to_user_data", void_type_ptr, [vm_EngineState, int_type_def]);
EngineAPI.vm_convert_to_thread       = DefineExternal("vm_convert_to_thread", vm_EngineState, [vm_EngineState, int_type_def]);
EngineAPI.vm_convert_to_ptr          = DefineExternal("vm_convert_to_ptr", const_void_type_ptr, [vm_EngineState, int_type_def]);

/*
 * Push operations (host C environment -> stack)
 */
EngineAPI.vm_place_nil              = DefineExternal("vm_place_nil", void_type_def, [vm_EngineState]);
EngineAPI.vm_place_number           = DefineExternal("vm_place_number", void_type_def, [vm_EngineState, script_NumType]);
EngineAPI.vm_place_integer          = DefineExternal("vm_place_integer", void_type_def, [vm_EngineState, script_IntType]);
EngineAPI.vm_place_len_string       = DefineExternal("vm_place_len_string", void_type_def, [vm_EngineState, const_char_type_ptr, size_type_val]);
EngineAPI.vm_place_string           = DefineExternal("vm_place_string", void_type_def, [vm_EngineState, const_char_type_ptr]);
/*
// REMINDER: Implement these features later.
// LUA_API const char *(lua_pushvfstring) (lua_State *L, const char *fmt,
//                                                       va_list argp);
// LUA_API const char *(lua_pushfstring) (lua_State *L, const char *fmt, ...);
*/
EngineAPI.vm_place_c_closure        = DefineExternal("vm_place_c_closure", void_type_def, [vm_EngineState, vm_HostCallback, int_type_def]);
EngineAPI.vm_place_boolean          = DefineExternal("vm_place_boolean", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_place_raw_user_data    = DefineExternal("vm_place_raw_user_data", void_type_def, [vm_EngineState, void_type_ptr]);
EngineAPI.vm_place_thread           = DefineExternal("vm_place_thread", int_type_def, [vm_EngineState]);

/*
 * Get operations (VM -> stack)
 */
EngineAPI.vm_retrieve_table_entry    = DefineExternal("vm_retrieve_table_entry", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_retrieve_field_value    = DefineExternal("vm_retrieve_field_value", void_type_def, [vm_EngineState, int_type_def, const_char_type_ptr]);
EngineAPI.vm_fetch_raw               = DefineExternal("vm_fetch_raw", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_fetch_raw_indexed       = DefineExternal("vm_fetch_raw_indexed", void_type_def, [vm_EngineState, int_type_def, int_type_def]);
EngineAPI.vm_construct_table         = DefineExternal("vm_construct_table", void_type_def, [vm_EngineState, int_type_def, int_type_def]);
EngineAPI.vm_allocate_user_data      = DefineExternal("vm_allocate_user_data", void_type_ptr, [vm_EngineState, size_type_val]);
EngineAPI.vm_retrieve_metatable      = DefineExternal("vm_retrieve_metatable", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_retrieve_function_env   = DefineExternal("vm_retrieve_function_env", void_type_def, [vm_EngineState, int_type_def]);

/*
 * Set operations (stack -> VM)
 */
EngineAPI.vm_assign_table_entry      = DefineExternal("vm_assign_table_entry", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_assign_field_value      = DefineExternal("vm_assign_field_value", void_type_def, [vm_EngineState, int_type_def, const_char_type_ptr]);
EngineAPI.vm_store_raw               = DefineExternal("vm_store_raw", void_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_store_raw_indexed       = DefineExternal("vm_store_raw_indexed", void_type_def, [vm_EngineState, int_type_def, int_type_def]);
EngineAPI.vm_assign_metatable        = DefineExternal("vm_assign_metatable", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_assign_function_env     = DefineExternal("vm_assign_function_env", int_type_def, [vm_EngineState, int_type_def]);

/*
 * Code loading and execution functions
 */
EngineAPI.vm_execute_function        = DefineExternal("vm_execute_function", void_type_def, [vm_EngineState, int_type_def, int_type_def]);
EngineAPI.vm_safe_execute_function   = DefineExternal("vm_safe_execute_function", int_type_def, [vm_EngineState, int_type_def, int_type_def, int_type_def]);
EngineAPI.vm_safe_execute_c_function = DefineExternal("vm_safe_execute_c_function", int_type_def, [vm_EngineState, vm_HostCallback, void_type_ptr]);
EngineAPI.vm_load_code_block         = DefineExternal("vm_load_code_block", int_type_def, [vm_EngineState, vm_DataStreamer, void_type_ptr,
                                        const_char_type_ptr]);

EngineAPI.vm_serialize_code_block    = DefineExternal("vm_serialize_code_block", int_type_def, [vm_EngineState, vm_DataEmitter, void_type_ptr]);

/*
 * Coroutine management routines
 */
EngineAPI.vm_pause_coroutine         = DefineExternal("vm_pause_coroutine", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_continue_coroutine      = DefineExternal("vm_continue_coroutine", int_type_def, [vm_EngineState, int_type_def]);
EngineAPI.vm_query_coroutine_status  = DefineExternal("vm_query_coroutine_status", int_type_def, [vm_EngineState]);

/*
 * Garbage collection functions and control options
 */

EngineAPI.VM_GC_CMD_STOP            = 0;
EngineAPI.VM_GC_CMD_RESUME          = 1;
EngineAPI.VM_GC_CMD_RUN_FULL        = 2;
EngineAPI.VM_GC_CMD_GET_MEM_COUNT   = 3;
EngineAPI.VM_GC_CMD_GET_MEM_BYTES   = 4;
EngineAPI.VM_GC_CMD_STEP            = 5;
EngineAPI.VM_GC_CMD_SET_PAUSE       = 6;
EngineAPI.VM_GC_CMD_SET_STEP_MUL    = 7;

EngineAPI.vm_manage_garbage = DefineExternal("vm_manage_garbage", int_type_def, [vm_EngineState, int_type_def, int_type_def]);

/*
 * Miscellaneous utility functions
 */

EngineAPI.vm_signal_error = DefineExternal("vm_signal_error", int_type_def, [vm_EngineState]);

EngineAPI.vm_iterate_next = DefineExternal("vm_iterate_next", int_type_def, [vm_EngineState, int_type_def]);

EngineAPI.vm_join_strings = DefineExternal("vm_join_strings", void_type_def, [vm_EngineState, int_type_def]);

EngineAPI.vm_retrieve_alloc_func = DefineExternal("vm_retrieve_alloc_func", vm_Allocator, [vm_EngineState, void_type_ptr_ptr]);
EngineAPI.vm_assign_alloc_func   = DefineExternal("vm_assign_alloc_func", void_type_def, [vm_EngineState, vm_Allocator, void_type_ptr]);

/*
 * ===============================================================
 * Handy macro-like definitions for convenience
 * ===============================================================
 */

EngineAPI.vm_remove_stack_elements = function(st, num_items) {
    return EngineAPI.vm_adjust_stack_head(st, -(num_items) - 1);
};

EngineAPI.vm_make_new_table = function(st) {
    return EngineAPI.vm_construct_table(st, 0, 0);
};

EngineAPI.vm_expose_global_function = function(st, func_name, func_ref) {
    return (EngineAPI.vm_place_c_function(st, (func_ref)), EngineAPI.vm_set_global_variable(st, (func_name)));
};

EngineAPI.vm_place_c_function = function(st, func_ref) {
    return EngineAPI.vm_place_c_closure(st, (func_ref), 0);
};

EngineAPI.vm_measure_string = function(st, idx) {
    return EngineAPI.vm_get_object_length(st, (idx));
};

EngineAPI.vm_check_is_function      = function(st, idx) {
    return (EngineAPI.vm_retrieve_type(st, (idx)) === EngineAPI.VM_TYPE_FUNCTION);
};
EngineAPI.vm_check_is_table         = function(st, idx) {
    return (EngineAPI.vm_retrieve_type(st, (idx)) === EngineAPI.VM_TYPE_COLLECTION);
};
EngineAPI.vm_check_is_raw_user_data = function(st, idx) {
    return (EngineAPI.vm_retrieve_type(st, (idx)) === EngineAPI.VM_TYPE_RAW_USERDATA);
};
EngineAPI.vm_check_is_null          = function(st, idx) {
    return (EngineAPI.vm_retrieve_type(st, (idx)) === EngineAPI.VM_TYPE_NULL);
};
EngineAPI.vm_check_is_boolean       = function(st, idx) {
    return (EngineAPI.vm_retrieve_type(st, (idx)) === EngineAPI.VM_TYPE_BOOLEAN);
};
EngineAPI.vm_check_is_thread        = function(st, idx) {
    return (EngineAPI.vm_retrieve_type(st, (idx)) === EngineAPI.VM_TYPE_COROUTINE);
};
EngineAPI.vm_check_is_unknown       = function(st, idx) {
    return (EngineAPI.vm_retrieve_type(st, (idx)) === EngineAPI.VM_TYPE_UNKNOWN);
};
EngineAPI.vm_check_is_unknown_or_null = function(st, idx) {
    return (EngineAPI.vm_retrieve_type(st, (idx)) <= 0);
};

EngineAPI.vm_place_literal_string = EngineAPI.vm_place_string;

EngineAPI.vm_set_global_variable = function(st, name_str) {
    return EngineAPI.vm_assign_field_value(st, EngineAPI.VM_GLOBAL_SCOPE_LOC, (name_str));
};
EngineAPI.vm_get_global_variable = function(st, name_str) {
    return EngineAPI.vm_retrieve_field_value(st, EngineAPI.VM_GLOBAL_SCOPE_LOC, (name_str));
};

EngineAPI.vm_convert_to_string = function(st, idx) {
    return EngineAPI.vm_convert_to_len_string(st, (idx), NO_PTR);
};

/*
 * Compatibility aliases and functions for older APIs
 */

EngineAPI.vm_init_runtime = function() {
    return EngineAPI.luaL_newstate();
};

EngineAPI.vm_fetch_registry = function(st) {
    return EngineAPI.vm_duplicate_item(st, EngineAPI.VM_REGISTRY_LOC);
};

EngineAPI.vm_get_gc_memory_usage = function(st) {
    return EngineAPI.vm_manage_garbage(st, EngineAPI.VM_GC_CMD_GET_MEM_COUNT, 0);
};

var vm_CodeBlockInput  = vm_DataStreamer;
var vm_CodeBlockOutput = vm_DataEmitter;

/* internal: tracing level adjustment */
EngineAPI.vm_adjust_trace_level = DefineExternal("vm_adjust_trace_level", void_type_def, [vm_EngineState, vm_EngineState]);

/*
 * {======================================================================
 * Debugging Interface Definitions
 * =======================================================================
 */

/*
 * Debug event codes
 */
EngineAPI.VM_DEBUG_EVENT_CALL       = 0;
EngineAPI.VM_DEBUG_EVENT_RETURN     = 1;
EngineAPI.VM_DEBUG_EVENT_LINE       = 2;
EngineAPI.VM_DEBUG_EVENT_COUNT      = 3;
EngineAPI.VM_DEBUG_EVENT_TAIL_RETURN = 4;

/*
 * Debug event masks
 */
EngineAPI.VM_DEBUG_MASK_CALL    = (1 << EngineAPI.VM_DEBUG_EVENT_CALL);
EngineAPI.VM_DEBUG_MASK_RETURN  = (1 << EngineAPI.VM_DEBUG_EVENT_RETURN);
EngineAPI.VM_DEBUG_MASK_LINE    = (1 << EngineAPI.VM_DEBUG_EVENT_LINE);
EngineAPI.VM_DEBUG_MASK_COUNT   = (1 << EngineAPI.VM_DEBUG_EVENT_COUNT);

// NOTE: Debug API structures and functions are planned for future implementation. (LUA_IDSIZE is also pending.)
/*
// typedef struct vm_DebugInfo vm_DebugInfo;  //  activation record
//
// // Callbacks for the debugger on specific events
// typedef void (*vm_DebugHook) (vm_EngineState *state_ptr, vm_DebugInfo *activation_record);
//
// LUA_API int vm_get_stack_info (vm_EngineState *state_ptr, int level, vm_DebugInfo *activation_record);
// LUA_API int vm_get_function_info (vm_EngineState *state_ptr, const char *what_flags, vm_DebugInfo *activation_record);
// LUA_API const char *vm_get_local_var (vm_EngineState *state_ptr, const vm_DebugInfo *activation_record, int var_index);
// LUA_API const char *vm_set_local_var (vm_EngineState *state_ptr, const vm_DebugInfo *activation_record, int var_index);
// LUA_API const char *vm_get_upvalue_var (vm_EngineState *state_ptr, int func_idx, int var_index);
// LUA_API const char *vm_set_upvalue_var (vm_EngineState *state_ptr, int func_idx, int var_index);
//
// LUA_API int vm_set_debug_hook (vm_EngineState *state_ptr, vm_DebugHook hook_func, int event_mask, int call_count);
// LUA_API vm_DebugHook vm_get_debug_hook (vm_EngineState *state_ptr);
// LUA_API int vm_get_debug_mask (vm_EngineState *state_ptr);
// LUA_API int vm_get_debug_count (vm_EngineState *state_ptr);
//
// struct vm_DebugInfo {
//   int event_type;
//   const char *name_str;       // (n)
//   const char *name_kind;      // (n) `global`, `local`, `field`, `method`
//   const char *what_type;      // (S) `Lua`, `C`, `main`, `tail`
//   const char *source_path;    // (S)
//   int current_line_num;       // (l)
//   int upvalue_count;          // (u) number of upvalues
//   int line_defined_start;     // (S)
//   int line_defined_end;       // (S)
//   char short_source_name[LUA_IDSIZE]; // (S)
//   // Private internal data
//   int call_info_idx;  // active function call index
// };
*/