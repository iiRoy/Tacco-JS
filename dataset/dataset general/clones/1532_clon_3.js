/**
 * @file lua-bindings-module.js - Core definitions for Lua 5.1 C API integration.
 * @copyright (c) 2023-2024 JS Lua Adapters. Based on Lua 5.1.5 headers.
 * @license See accompanying LICENSE file for details.
 * @author J. Doe, A. Smith, B. Williams
 *
 * This module provides a JavaScript interface for interacting with a Lua 5.1
 * runtime, mapping C API functions and constants to a structured JS object.
 * Identifiers and structures have been extensively refactored to align with
 * modern JavaScript conventions and to introduce additional helper logic.
 */

/* --- Core Type Definitions --- */
const luaFloatType = "lua_float_val";
const luaIntType = "lua_integer_val";

const LuaEngine = {}; // Global namespace for Lua API bindings

/**
 * @namespace LuaEngine.Config
 * @description Configuration and meta-information about the Lua binding.
 */
LuaEngine.Config = Object.freeze({
  bridgeName: "LuaJS Interop Layer",
  apiMajorVersion: "5.1",
  releaseIdentifier: "5.1.5-js-alpha",
  versionNumeric: 501,
  copyrightStatement: "© 2023-2024 JS Lua Adapters. Original Lua 5.1.5 by Lua.org, PUC-Rio.",
  primaryMaintainers: "J. Doe, A. Smith, B. Williams",
  compiledCodeMagic: "\x1BLua", // Byte sequence for precompiled chunks
  multiReturnSpecifier: -1 // Special value for multiple returns
});

/* --- Helper for Pseudo-Index Calculation --- */
/**
 * Calculates a pseudo-index for stack operations.
 * @param {number} baseIndex - The base pseudo-index (e.g., GLOBALS).
 * @param {number} offset - The offset from the base.
 * @returns {number} The calculated pseudo-index.
 */
const derivePseudoIndex = (baseIndex, offset) => baseIndex - offset;

/**
 * @namespace LuaEngine.StackIndexes
 * @description Predefined stack pseudo-indexes for Lua state access.
 */
LuaEngine.StackIndexes = {
  REGISTRY_TABLE: -10000,
  ENVIRONMENT_TABLE: -10001,
  GLOBAL_TABLE: -10002
};

/**
 * Computes the correct pseudo-index for accessing an upvalue.
 * @param {number} index - The upvalue index.
 * @returns {number} The pseudo-index for the upvalue.
 */
LuaEngine.computeUpvalueIndex = (index) => {
  if (typeof index !== 'number' || index < 1) {
    console.error("Invalid upvalue index provided. Must be a positive integer.");
    return LuaEngine.StackIndexes.GLOBAL_TABLE; // Fallback to a sensible default
  }
  return derivePseudoIndex(LuaEngine.StackIndexes.GLOBAL_TABLE, index);
};

/**
 * @namespace LuaEngine.ReturnCodes
 * @description Status codes returned by Lua API functions.
 */
LuaEngine.ReturnCodes = {
  SUCCESS: 0,
  YIELDED: 1,
  RUNTIME_ERROR: 2,
  SYNTAX_ERROR: 3,
  MEMORY_ALLOCATION_ERROR: 4,
  MESSAGE_HANDLER_ERROR: 5
};

/* --- Core Data Type Aliases (for function signatures) --- */
const luaStatePtr = "lua_state_handle";
const cFunctionPtr = "lua_c_function_ptr";
const chunkReadCallback = "lua_chunk_reader";
const chunkWriteCallback = "lua_chunk_writer";
const allocFunction = "lua_memory_allocator";

/**
 * @namespace LuaEngine.ValueTypes
 * @description Enumeration of Lua's basic data types.
 */
LuaEngine.ValueTypes = {
  NO_TYPE: -1,
  NIL: 0,
  BOOLEAN: 1,
  LIGHTUSERDATA: 2,
  NUMBER: 3,
  STRING: 4,
  TABLE: 5,
  FUNCTION: 6,
  USERDATA: 7,
  THREAD: 8
};

/**
 * @namespace LuaEngine.StackConfig
 * @description Configuration related to the Lua stack.
 */
LuaEngine.StackConfig = {
  MIN_STACK_SIZE: 20
};

/* --- Aliases for number types --- */
const LUA_NUMBER_TYPE_ALIAS = luaFloatType;
const LUA_INTEGER_TYPE_ALIAS = luaIntType;

/**
 * Factory function to create a binding definition for a native Lua C function.
 * @param {string} funcName - The name of the C function.
 * @param {string} returnType - The JavaScript representation of the return type.
 * @param {Array<string>} argumentTypes - An array of JavaScript representations of argument types.
 * @returns {object} A structured object describing the function binding.
 */
const defineNativeBinding = (funcName, returnType, argumentTypes) => {
  if (!funcName || !returnType || !Array.isArray(argumentTypes)) {
    throw new Error("Invalid parameters for native function binding definition.");
  }
  return {
    cName: funcName,
    returns: returnType,
    params: argumentTypes
  };
};

/* --- Primitive Type Representations for Bindings --- */
const voidResult = "void";
const integerResult = "int";
const constCharPointer = "const_char*";
const sizeTPointer = "size_t*";
const voidPointer = "void*";
const immutableVoidPointer = "const_void*";
const sizeTValue = "size_t";

/* --- State Management Functions --- */
LuaEngine.StateManagement = {
  initializeNewState: defineNativeBinding("lua_newstate", luaStatePtr, [allocFunction, voidPointer]),
  terminateState: defineNativeBinding("lua_close", voidResult, [luaStatePtr]),
  spawnNewThread: defineNativeBinding("lua_newthread", luaStatePtr, [luaStatePtr]),
  setPanicCallback: defineNativeBinding("lua_atpanic", cFunctionPtr, [luaStatePtr, cFunctionPtr])
};

/* --- Basic Stack Operations --- */
LuaEngine.StackManipulation = {
  getStackDepth: defineNativeBinding("lua_gettop", integerResult, [luaStatePtr]),
  setStackDepth: defineNativeBinding("lua_settop", voidResult, [luaStatePtr, integerResult]),
  copyValue: defineNativeBinding("lua_pushvalue", voidResult, [luaStatePtr, integerResult]),
  deleteItem: defineNativeBinding("lua_remove", voidResult, [luaStatePtr, integerResult]),
  insertItem: defineNativeBinding("lua_insert", voidResult, [luaStatePtr, integerResult]),
  replaceItem: defineNativeBinding("lua_replace", voidResult, [luaStatePtr, integerResult]),
  verifyStackCapacity: defineNativeBinding("lua_checkstack", integerResult, [luaStatePtr, integerResult]),
  transferStackItems: defineNativeBinding("lua_xmove", voidResult, [luaStatePtr, luaStatePtr, integerResult])
};

/* --- Access Functions (Stack -> C) --- */
LuaEngine.StackAccess = {
  checkIsNumber: defineNativeBinding("lua_isnumber", integerResult, [luaStatePtr, integerResult]),
  checkIsString: defineNativeBinding("lua_isstring", integerResult, [luaStatePtr, integerResult]),
  checkIsCFunction: defineNativeBinding("lua_iscfunction", integerResult, [luaStatePtr, integerResult]),
  checkIsUserData: defineNativeBinding("lua_isuserdata", integerResult, [luaStatePtr, integerResult]),
  queryValueType: defineNativeBinding("lua_type", integerResult, [luaStatePtr, integerResult]),
  resolveTypeName: defineNativeBinding("lua_typename", constCharPointer, [luaStatePtr, integerResult]),

  compareValues: defineNativeBinding("lua_equal", integerResult, [luaStatePtr, integerResult, integerResult]),
  compareRawValues: defineNativeBinding("lua_rawequal", integerResult, [luaStatePtr, integerResult, integerResult]),
  compareLessThan: defineNativeBinding("lua_lessthan", integerResult, [luaStatePtr, integerResult, integerResult]),

  toNumber: defineNativeBinding("lua_tonumber", LUA_NUMBER_TYPE_ALIAS, [luaStatePtr, integerResult]),
  toInteger: defineNativeBinding("lua_tointeger", LUA_INTEGER_TYPE_ALIAS, [luaStatePtr, integerResult]),
  toBoolean: defineNativeBinding("lua_toboolean", integerResult, [luaStatePtr, integerResult]),
  toStringWithLength: defineNativeBinding("lua_tolstring", constCharPointer, [luaStatePtr, integerResult, sizeTPointer]),
  getRawObjectLength: defineNativeBinding("lua_objlen", sizeTValue, [luaStatePtr, integerResult]),
  toCFunction: defineNativeBinding("lua_tocfunction", cFunctionPtr, [luaStatePtr, integerResult]),
  toUserData: defineNativeBinding("lua_touserdata", voidPointer, [luaStatePtr, integerResult]),
  toThread: defineNativeBinding("lua_tothread", luaStatePtr, [luaStatePtr, integerResult]),
  toPointer: defineNativeBinding("lua_topointer", immutableVoidPointer, [luaStatePtr, integerResult])
};

/* --- Push Functions (C -> Stack) --- */
LuaEngine.StackPush = {
  pushNil: defineNativeBinding("lua_pushnil", voidResult, [luaStatePtr]),
  pushNumeric: defineNativeBinding("lua_pushnumber", voidResult, [luaStatePtr, LUA_NUMBER_TYPE_ALIAS]),
  pushIntegral: defineNativeBinding("lua_pushinteger", voidResult, [luaStatePtr, LUA_INTEGER_TYPE_ALIAS]),
  pushLengthyString: defineNativeBinding("lua_pushlstring", voidResult, [luaStatePtr, constCharPointer, sizeTValue]),
  pushSimpleString: defineNativeBinding("lua_pushstring", voidResult, [luaStatePtr, constCharPointer]),
  pushCClosure: defineNativeBinding("lua_pushcclosure", voidResult, [luaStatePtr, cFunctionPtr, integerResult]),
  pushBoolean: defineNativeBinding("lua_pushboolean", voidResult, [luaStatePtr, integerResult]),
  pushLightUserData: defineNativeBinding("lua_pushlightuserdata", voidResult, [luaStatePtr, voidPointer]),
  pushCurrentThread: defineNativeBinding("lua_pushthread", integerResult, [luaStatePtr])
};

/* --- Get Functions (Lua -> Stack) --- */
LuaEngine.TableGet = {
  fetchTableValue: defineNativeBinding("lua_gettable", voidResult, [luaStatePtr, integerResult]),
  fetchFieldValue: defineNativeBinding("lua_getfield", voidResult, [luaStatePtr, integerResult, constCharPointer]),
  fetchRawValue: defineNativeBinding("lua_rawget", voidResult, [luaStatePtr, integerResult]),
  fetchRawIndexedValue: defineNativeBinding("lua_rawgeti", voidResult, [luaStatePtr, integerResult, integerResult]),
  createEmptyTable: defineNativeBinding("lua_createtable", voidResult, [luaStatePtr, integerResult, integerResult]),
  allocateNewUserData: defineNativeBinding("lua_newuserdata", voidPointer, [luaStatePtr, sizeTValue]),
  retrieveMetatable: defineNativeBinding("lua_getmetatable", integerResult, [luaStatePtr, integerResult]),
  retrieveEnvironment: defineNativeBinding("lua_getfenv", voidResult, [luaStatePtr, integerResult])
};

/* --- Set Functions (Stack -> Lua) --- */
LuaEngine.TableSet = {
  assignTableValue: defineNativeBinding("lua_settable", voidResult, [luaStatePtr, integerResult]),
  assignFieldValue: defineNativeBinding("lua_setfield", voidResult, [luaStatePtr, integerResult, constCharPointer]),
  assignRawValue: defineNativeBinding("lua_rawset", voidResult, [luaStatePtr, integerResult]),
  assignRawIndexedValue: defineNativeBinding("lua_rawseti", voidResult, [luaStatePtr, integerResult, integerResult]),
  assignMetatable: defineNativeBinding("lua_setmetatable", integerResult, [luaStatePtr, integerResult]),
  assignEnvironment: defineNativeBinding("lua_setfenv", integerResult, [luaStatePtr, integerResult])
};

/* --- Execution and Loading Functions --- */
LuaEngine.Execution = {
  directCall: defineNativeBinding("lua_call", voidResult, [luaStatePtr, integerResult, integerResult]),
  protectedCall: defineNativeBinding("lua_pcall", integerResult, [luaStatePtr, integerResult, integerResult, integerResult]),
  protectedCCall: defineNativeBinding("lua_cpcall", integerResult, [luaStatePtr, cFunctionPtr, voidPointer]),
  loadCodeChunk: defineNativeBinding("lua_load", integerResult, [luaStatePtr, chunkReadCallback, voidPointer, constCharPointer]),
  dumpCodeChunk: defineNativeBinding("lua_dump", integerResult, [luaStatePtr, chunkWriteCallback, voidPointer])
};

/* --- Coroutine Functions --- */
LuaEngine.Coroutines = {
  yieldCurrentThread: defineNativeBinding("lua_yield", integerResult, [luaStatePtr, integerResult]),
  resumeSuspendedThread: defineNativeBinding("lua_resume", integerResult, [luaStatePtr, integerResult]),
  getThreadStatus: defineNativeBinding("lua_status", integerResult, [luaStatePtr])
};

/* --- Garbage Collection Management --- */
LuaEngine.GarbageCollection = {
  ControlOptions: {
    STOP_GC: 0,
    RESTART_GC: 1,
    PERFORM_COLLECTION: 2,
    GET_COLLECTED_BYTES: 3, // Renamed from LUA_GCCOUNT
    GET_COLLECTED_KILOBYTES: 4, // Renamed from LUA_GCCOUNTB
    STEP_COLLECTION: 5,
    SET_PAUSE_FACTOR: 6,
    SET_STEP_MULTIPLIER: 7
  },
  controlGC: defineNativeBinding("lua_gc", integerResult, [luaStatePtr, integerResult, integerResult])
};

/* --- Miscellaneous Utility Functions --- */
LuaEngine.Utilities = {
  triggerError: defineNativeBinding("lua_error", integerResult, [luaStatePtr]),
  iterateNextElement: defineNativeBinding("lua_next", integerResult, [luaStatePtr, integerResult]),
  concatenateStackStrings: defineNativeBinding("lua_concat", voidResult, [luaStatePtr, integerResult]),
  retrieveAllocatorFn: defineNativeBinding("lua_getallocf", allocFunction, [luaStatePtr, sizeTPointer]), // Changed arg type
  assignAllocatorFn: defineNativeBinding("lua_setallocf", voidResult, [luaStatePtr, allocFunction, voidPointer])
};

/*
 * ===============================================================
 * High-level Macro Implementations
 * These provide convenient wrappers around the lower-level API.
 * ===============================================================
 */
LuaEngine.MacroWrappers = {
  /**
   * Pops `count` elements from the top of the stack.
   * @param {luaStatePtr} L - The Lua state.
   * @param {number} count - Number of elements to pop.
   */
  popStackElements: (L, count) => LuaEngine.StackManipulation.setStackDepth(L, -(count + 1)), // Rewritten arithmetic

  /**
   * Creates and pushes an empty table onto the stack.
   * @param {luaStatePtr} L - The Lua state.
   */
  createAndPushTable: (L) => LuaEngine.TableGet.createEmptyTable(L, 0, 0),

  /**
   * Registers a C function as a global variable.
   * @param {luaStatePtr} L - The Lua state.
   * @param {string} name - The global variable name.
   * @param {cFunctionPtr} func - The C function to register.
   */
  registerGlobalCFunction: (L, name, func) => {
    LuaEngine.StackPush.pushCClosure(L, func, 0);
    LuaEngine.MacroWrappers.setGlobalVariable(L, name);
  },

  /**
   * Pushes a C function onto the stack with no upvalues.
   * @param {luaStatePtr} L - The Lua state.
   * @param {cFunctionPtr} func - The C function.
   */
  pushBasicCFunction: (L, func) => LuaEngine.StackPush.pushCClosure(L, func, 0),

  /**
   * Gets the length of the string or table at the given stack index.
   * @param {luaStatePtr} L - The Lua state.
   * @param {number} index - The stack index.
   * @returns {sizeTValue} The length.
   */
  getStringOrObjectLength: (L, index) => LuaEngine.StackAccess.getRawObjectLength(L, index),

  // Type checking convenience functions
  isFunctionType: (L, idx) => LuaEngine.StackAccess.queryValueType(L, idx) === LuaEngine.ValueTypes.FUNCTION,
  isTableType: (L, idx) => LuaEngine.StackAccess.queryValueType(L, idx) === LuaEngine.ValueTypes.TABLE,
  isLightUserData: (L, idx) => LuaEngine.StackAccess.queryValueType(L, idx) === LuaEngine.ValueTypes.LIGHTUSERDATA,
  isNilValue: (L, idx) => LuaEngine.StackAccess.queryValueType(L, idx) === LuaEngine.ValueTypes.NIL,
  isBooleanValue: (L, idx) => LuaEngine.StackAccess.queryValueType(L, idx) === LuaEngine.ValueTypes.BOOLEAN,
  isThreadContext: (L, idx) => LuaEngine.StackAccess.queryValueType(L, idx) === LuaEngine.ValueTypes.THREAD,
  isNoneValue: (L, idx) => LuaEngine.StackAccess.queryValueType(L, idx) === LuaEngine.ValueTypes.NO_TYPE,
  isNoneOrNil: (L, idx) => LuaEngine.StackAccess.queryValueType(L, idx) <= LuaEngine.ValueTypes.NIL, // Rewritten condition

  /**
   * Pushes a literal string onto the stack. Alias for `pushSimpleString`.
   * @param {luaStatePtr} L - The Lua state.
   * @param {string} str - The string to push.
   */
  pushLiteralString: (L, str) => LuaEngine.StackPush.pushSimpleString(L, str),

  /**
   * Sets a global variable.
   * @param {luaStatePtr} L - The Lua state.
   * @param {string} name - The name of the global variable.
   */
  setGlobalVariable: (L, name) => LuaEngine.TableSet.assignFieldValue(L, LuaEngine.StackIndexes.GLOBAL_TABLE, name),

  /**
   * Gets a global variable and pushes it onto the stack.
   * @param {luaStatePtr} L - The Lua state.
   * @param {string} name - The name of the global variable.
   */
  getGlobalVariable: (L, name) => LuaEngine.TableGet.fetchFieldValue(L, LuaEngine.StackIndexes.GLOBAL_TABLE, name),

  /**
   * Converts a stack value to a string representation.
   * @param {luaStatePtr} L - The Lua state.
   * @param {number} index - The stack index.
   * @returns {constCharPointer} The string representation.
   */
  getStringRepresentation: (L, index) => LuaEngine.StackAccess.toStringWithLength(L, index, null)
};

/*
 * ===============================================================
 * Compatibility APIs (often found in `lauxlib.h` in original Lua)
 * ===============================================================
 */
LuaEngine.Compatibility = {
  /**
   * Initializes a new Lua state with standard libraries.
   * This function typically relies on `luaL_newstate` from `lauxlib.h`.
   * @returns {luaStatePtr|null} A new Lua state handle, or null if initialization fails.
   */
  initStandardLuaState: () => {
    // This assumes an external 'LuaAuxLib' global or similar is available.
    if (typeof LuaAuxLib === 'undefined' || !LuaAuxLib.createNewLuaState) {
      console.warn("LuaAuxLib not detected. `initStandardLuaState` may not function correctly.");
      return null;
    }
    const newState = LuaAuxLib.createNewLuaState();
    if (!newState) {
        console.error("Failed to create new Lua state via LuaAuxLib.");
    }
    return newState;
  },

  /**
   * Pushes the registry table onto the stack.
   * @param {luaStatePtr} L - The Lua state.
   */
  pushRegistryTable: (L) => LuaEngine.StackManipulation.copyValue(L, LuaEngine.StackIndexes.REGISTRY_TABLE),

  /**
   * Gets the current garbage collection count (in bytes).
   * @param {luaStatePtr} L - The Lua state.
   * @returns {integerResult} The collected byte count.
   */
  getGarbageCollectionByteCount: (L) => LuaEngine.GarbageCollection.controlGC(L, LuaEngine.GarbageCollection.ControlOptions.GET_COLLECTED_BYTES, 0)
};

/* --- Aliases for chunk reader/writer types --- */
const chunkReader = chunkReadCallback;
const chunkWriter = chunkWriteCallback;

/*
 * ===============================================================
 * Debugging API Definitions
 * ===============================================================
 */
LuaEngine.DebuggingAPI = {
  /**
   * Sets the debug level.
   * @param {luaStatePtr} L - The Lua state.
   * @param {luaStatePtr} fromL - The source Lua state for level information.
   */
  setDebugLevel: defineNativeBinding("lua_setlevel", voidResult, [luaStatePtr, luaStatePtr]),

  /**
   * @namespace LuaEngine.DebuggingAPI.HookEvents
   * @description Event codes for Lua debugging hooks.
   */
  HookEvents: {
    CALL_EVENT: 0,
    RETURN_EVENT: 1,
    LINE_EVENT: 2,
    COUNT_EVENT: 3,
    TAIL_RETURN_EVENT: 4
  },

  /**
   * @namespace LuaEngine.DebuggingAPI.HookMasks
   * @description Bitmasks for enabling specific debugging hooks.
   */
  HookMasks: {
    ENABLE_CALL_HOOK: 1 << 0, // Direct bit shift for clarity
    ENABLE_RETURN_HOOK: 1 << 1,
    ENABLE_LINE_HOOK: 1 << 2,
    ENABLE_COUNT_HOOK: 1 << 3
  }
};