const coreSystem = {};

const numType = Symbol("NUMBER_TYPE_DEF");
const intType = Symbol("INTEGER_TYPE_DEF");
const engineHandle = Symbol("ENGINE_STATE_HANDLE");
const foreignCallback = Symbol("EXTERNAL_C_FUNCTION_POINTER");
const inputProvider = Symbol("CHUNK_READER_FUNCTION_POINTER");
const outputHandler = Symbol("CHUNK_WRITER_FUNCTION_POINTER");
const memoryManager = Symbol("ALLOCATION_MANAGER_FUNCTION_POINTER");

const voidResult = Symbol("VOID_RETURN_TYPE");
const integerResult = Symbol("INT_RETURN_TYPE");
const constStringPtr = Symbol("CONSTANT_CHAR_POINTER");
const sizePtr = Symbol("SIZE_T_POINTER");
const genericPtr = Symbol("GENERIC_VOID_POINTER");
const constGenericPtr = Symbol("CONSTANT_GENERIC_VOID_POINTER");
const sizeValue = Symbol("SIZE_T_VALUE");
const genericPtrPtr = Symbol("GENERIC_VOID_POINTER_POINTER");

const voidPointer = null;

const bindExternalOperation = (operationName, resultType, parameterTypes) => {
  const boundFn = (...args) => {
    if (resultType === voidResult) return undefined;
    if (resultType === integerResult) return 0;
    if (resultType === numType) return 0.0;
    if (resultType === constStringPtr) return "";
    return voidPointer;
  };
  Object.defineProperties(boundFn, {
    operation: { value: operationName, writable: false, configurable: false },
    returns: { value: resultType, writable: false, configurable: false },
    parameters: { value: parameterTypes, writable: false, configurable: false }
  });
  return boundFn;
};

Object.assign(coreSystem, {
  ENGINE_VERSION_STRING: "Lua 5.1",
  ENGINE_RELEASE_STRING: "Lua 5.1.5",
  ENGINE_VERSION_NUMBER: 501,
  ENGINE_COPYRIGHT_NOTICE: "Copyright (C) 1994-2012 Lua.org, PUC-Rio",
  ENGINE_AUTHOR_LIST: "R. Ierusalimschy, L. H. de Figueiredo & W. Celes",
  ENGINE_BYTECODE_MARKER: "\033Lua",
  MULTIPLE_RETURN_INDICATOR: -1,

  GLOBAL_REGISTRY_KEY: -10000,
  ENVIRONMENT_TABLE_KEY: -10001,
  GLOBAL_VARIABLES_KEY: -10002,

  STATUS_YIELDED: 1,
  STATUS_RUNTIME_ERROR: 2,
  STATUS_SYNTAX_ERROR: 3,
  STATUS_MEMORY_ERROR: 4,
  STATUS_ERROR_HANDLER_ERROR: 5,

  TYPE_INVALID: -1,
  TYPE_NULL: 0,
  TYPE_BOOLEAN: 1,
  TYPE_OPAQUE_DATA: 2,
  TYPE_NUMERIC: 3,
  TYPE_TEXT: 4,
  TYPE_COLLECTION: 5,
  TYPE_FUNCTION: 6,
  TYPE_CUSTOM_DATA: 7,
  TYPE_COROUTINE: 8,

  MINIMUM_STACK_CAPACITY: 20,

  GC_ACTION_STOP: 0,
  GC_ACTION_RESTART: 1,
  GC_ACTION_COLLECT: 2,
  GC_ACTION_COUNT: 3,
  GC_ACTION_COUNT_BYTES: 4,
  GC_ACTION_STEP: 5,
  GC_ACTION_SET_PAUSE: 6,
  GC_ACTION_SET_STEPMULTIPLIER: 7,

  EVENT_HOOK_CALL: 0,
  EVENT_HOOK_RETURN: 1,
  EVENT_HOOK_LINE: 2,
  EVENT_HOOK_COUNT: 3,
  EVENT_HOOK_TAIL_RETURN: 4,
});

coreSystem.MASK_HOOK_CALL = (1 << coreSystem.EVENT_HOOK_CALL);
coreSystem.MASK_HOOK_RETURN = (1 << coreSystem.EVENT_HOOK_RETURN);
coreSystem.MASK_HOOK_LINE = (1 << coreSystem.EVENT_HOOK_LINE);
coreSystem.MASK_HOOK_COUNT = (1 << coreSystem.EVENT_HOOK_COUNT);

coreSystem.retrieveUpvalueIndex = (idx) => (coreSystem.GLOBAL_VARIABLES_KEY - idx);

coreSystem.initializeEngine = bindExternalOperation("lua_newstate", engineHandle, [memoryManager, genericPtr]);
coreSystem.terminateEngine = bindExternalOperation("lua_close", voidResult, [engineHandle]);
coreSystem.spawnCoroutine = bindExternalOperation("lua_newthread", engineHandle, [engineHandle]);
coreSystem.registerPanicHandler = bindExternalOperation("lua_atpanic", foreignCallback, [engineHandle, foreignCallback]);

coreSystem.getStackDepth = bindExternalOperation("lua_gettop", integerResult, [engineHandle]);
coreSystem.setStackDepth = bindExternalOperation("lua_settop", voidResult, [engineHandle, integerResult]);
coreSystem.copyStackItem = bindExternalOperation("lua_pushvalue", voidResult, [engineHandle, integerResult]);
coreSystem.removeStackItem = bindExternalOperation("lua_remove", voidResult, [engineHandle, integerResult]);
coreSystem.insertStackItem = bindExternalOperation("lua_insert", voidResult, [engineHandle, integerResult]);
coreSystem.replaceStackItem = bindExternalOperation("lua_replace", voidResult, [engineHandle, integerResult]);
coreSystem.ensureStackCapacity = bindExternalOperation("lua_checkstack", integerResult, [engineHandle, integerResult]);
coreSystem.transferStackItems = bindExternalOperation("lua_xmove", voidResult, [engineHandle, engineHandle, integerResult]);

coreSystem.isStackItemNumeric = bindExternalOperation("lua_isnumber", integerResult, [engineHandle, integerResult]);
coreSystem.isStackItemText = bindExternalOperation("lua_isstring", integerResult, [engineHandle, integerResult]);
coreSystem.isStackItemForeignCallable = bindExternalOperation("lua_iscfunction", integerResult, [engineHandle, integerResult]);
coreSystem.isStackItemCustomData = bindExternalOperation("lua_isuserdata", integerResult, [engineHandle, integerResult]);
coreSystem.getStackItemType = bindExternalOperation("lua_type", integerResult, [engineHandle, integerResult]);
coreSystem.getStackItemTypeName = bindExternalOperation("lua_typename", constStringPtr, [engineHandle, integerResult]);
coreSystem.compareStackItemsEquality = bindExternalOperation("lua_equal", integerResult, [engineHandle, integerResult, integerResult]);
coreSystem.compareStackItemsRawEquality = bindExternalOperation("lua_rawequal", integerResult, [engineHandle, integerResult, integerResult]);
coreSystem.compareStackItemsLessThan = bindExternalOperation("lua_lessthan", integerResult, [engineHandle, integerResult, integerResult]);
coreSystem.convertStackItemToNumber = bindExternalOperation("lua_tonumber", numType, [engineHandle, integerResult]);
coreSystem.convertStackItemToInteger = bindExternalOperation("lua_tointeger", intType, [engineHandle, integerResult]);
coreSystem.convertStackItemToBoolean = bindExternalOperation("lua_toboolean", integerResult, [engineHandle, integerResult]);
coreSystem.convertStackItemToTextAndLength = bindExternalOperation("lua_tolstring", constStringPtr, [engineHandle, integerResult, sizePtr]);
coreSystem.getStackItemLength = bindExternalOperation("lua_objlen", sizeValue, [engineHandle, integerResult]);
coreSystem.convertStackItemToForeignCallback = bindExternalOperation("lua_tocfunction", foreignCallback, [engineHandle, integerResult]);
coreSystem.convertStackItemToCustomData = bindExternalOperation("lua_touserdata", genericPtr, [engineHandle, integerResult]);
coreSystem.convertStackItemToCoroutine = bindExternalOperation("lua_tothread", engineHandle, [engineHandle, integerResult]);
coreSystem.convertStackItemToPointer = bindExternalOperation("lua_topointer", constGenericPtr, [engineHandle, integerResult]);

coreSystem.placeNullOnStack = bindExternalOperation("lua_pushnil", voidResult, [engineHandle]);
coreSystem.placeNumberOnStack = bindExternalOperation("lua_pushnumber", voidResult, [engineHandle, numType]);
coreSystem.placeIntegerOnStack = bindExternalOperation("lua_pushinteger", voidResult, [engineHandle, intType]);
coreSystem.placeTextWithLengthOnStack = bindExternalOperation("lua_pushlstring", voidResult, [engineHandle, constStringPtr, sizeValue]);
coreSystem.placeTextOnStack = bindExternalOperation("lua_pushstring", voidResult, [engineHandle, constStringPtr]);
coreSystem.placeForeignClosureOnStack = bindExternalOperation("lua_pushcclosure", voidResult, [engineHandle, foreignCallback, integerResult]);
coreSystem.placeBooleanOnStack = bindExternalOperation("lua_pushboolean", voidResult, [engineHandle, integerResult]);
coreSystem.placeOpaqueDataOnStack = bindExternalOperation("lua_pushlightuserdata", voidResult, [engineHandle, genericPtr]);
coreSystem.placeCoroutineOnStack = bindExternalOperation("lua_pushthread", integerResult, [engineHandle]);

coreSystem.retrieveTableValue = bindExternalOperation("lua_gettable", voidResult, [engineHandle, integerResult]);
coreSystem.retrieveFieldValue = bindExternalOperation("lua_getfield", voidResult, [engineHandle, integerResult, constStringPtr]);
coreSystem.retrieveRawValue = bindExternalOperation("lua_rawget", voidResult, [engineHandle, integerResult]);
coreSystem.retrieveRawIndexedValue = bindExternalOperation("lua_rawgeti", voidResult, [engineHandle, integerResult, integerResult]);
coreSystem.createTable = bindExternalOperation("lua_createtable", voidResult, [engineHandle, integerResult, integerResult]);
coreSystem.createCustomData = bindExternalOperation("lua_newuserdata", genericPtr, [engineHandle, sizeValue]);
coreSystem.getMetadataTable = bindExternalOperation("lua_getmetatable", integerResult, [engineHandle, integerResult]);
coreSystem.getEnvironmentTable = bindExternalOperation("lua_getfenv", voidResult, [engineHandle, integerResult]);

coreSystem.setTableValue = bindExternalOperation("lua_settable", voidResult, [engineHandle, integerResult]);
coreSystem.setFieldValue = bindExternalOperation("lua_setfield", voidResult, [engineHandle, integerResult, constStringPtr]);
coreSystem.setRawValue = bindExternalOperation("lua_rawset", voidResult, [engineHandle, integerResult]);
coreSystem.setRawIndexedValue = bindExternalOperation("lua_rawseti", voidResult, [engineHandle, integerResult, integerResult]);
coreSystem.setMetadataTable = bindExternalOperation("lua_setmetatable", integerResult, [engineHandle, integerResult]);
coreSystem.setEnvironmentTable = bindExternalOperation("lua_setfenv", integerResult, [engineHandle, integerResult]);

coreSystem.executeFunction = bindExternalOperation("lua_call", voidResult, [engineHandle, integerResult, integerResult]);
coreSystem.protectedExecuteFunction = bindExternalOperation("lua_pcall", integerResult, [engineHandle, integerResult, integerResult, integerResult]);
coreSystem.protectedForeignExecuteFunction = bindExternalOperation("lua_cpcall", integerResult, [engineHandle, foreignCallback, genericPtr]);
coreSystem.loadChunk = bindExternalOperation("lua_load", integerResult, [engineHandle, inputProvider, genericPtr, constStringPtr]);
coreSystem.dumpChunk = bindExternalOperation("lua_dump", integerResult, [engineHandle, outputHandler, genericPtr]);

coreSystem.yieldCoroutine = bindExternalOperation("lua_yield", integerResult, [engineHandle, integerResult]);
coreSystem.resumeCoroutine = bindExternalOperation("lua_resume", integerResult, [engineHandle, integerResult]);
coreSystem.getCoroutineStatus = bindExternalOperation("lua_status", integerResult, [engineHandle]);

coreSystem.manageGarbageCollection = bindExternalOperation("lua_gc", integerResult, [engineHandle, integerResult, integerResult]);

coreSystem.triggerError = bindExternalOperation("lua_error", integerResult, [engineHandle]);
coreSystem.iterateNext = bindExternalOperation("lua_next", integerResult, [engineHandle, integerResult]);
coreSystem.concatenateStackItems = bindExternalOperation("lua_concat", voidResult, [engineHandle, integerResult]);
coreSystem.getAllocator = bindExternalOperation("lua_getallocf", memoryManager, [engineHandle, genericPtrPtr]);
coreSystem.setAllocator = bindExternalOperation("lua_setallocf", voidResult, [engineHandle, memoryManager, genericPtr]);

coreSystem.removeStackItems = (handle, count) => coreSystem.setStackDepth(handle, -(count) - 1);
coreSystem.createEmptyTable = (handle) => coreSystem.createTable(handle, 0, 0);
coreSystem.registerGlobalFunction = (handle, name, func) => {
  coreSystem.placeForeignFunctionOnStack(handle, func);
  coreSystem.setGlobalVariable(handle, name);
};
coreSystem.placeForeignFunctionOnStack = (handle, func) => coreSystem.placeForeignClosureOnStack(handle, func, 0);
coreSystem.getStackItemStringLength = (handle, index) => coreSystem.getStackItemLength(handle, index);

coreSystem.isStackItemFunction = (handle, index) => (coreSystem.getStackItemType(handle, index) === coreSystem.TYPE_FUNCTION);
coreSystem.isStackItemTable = (handle, index) => (coreSystem.getStackItemType(handle, index) === coreSystem.TYPE_COLLECTION);
coreSystem.isStackItemOpaqueData = (handle, index) => (coreSystem.getStackItemType(handle, index) === coreSystem.TYPE_OPAQUE_DATA);
coreSystem.isStackItemNull = (handle, index) => (coreSystem.getStackItemType(handle, index) === coreSystem.TYPE_NULL);
coreSystem.isStackItemBoolean = (handle, index) => (coreSystem.getStackItemType(handle, index) === coreSystem.TYPE_BOOLEAN);
coreSystem.isStackItemCoroutine = (handle, index) => (coreSystem.getStackItemType(handle, index) === coreSystem.TYPE_COROUTINE);
coreSystem.isStackItemInvalid = (handle, index) => (coreSystem.getStackItemType(handle, index) === coreSystem.TYPE_INVALID);
coreSystem.isStackItemInvalidOrNull = (handle, index) => (coreSystem.getStackItemType(handle, index) <= 0);

coreSystem.placeLiteralStringOnStack = coreSystem.placeTextOnStack;

coreSystem.setGlobalVariable = (handle, key) => coreSystem.setFieldValue(handle, coreSystem.GLOBAL_VARIABLES_KEY, key);
coreSystem.getGlobalVariable = (handle, key) => coreSystem.retrieveFieldValue(handle, coreSystem.GLOBAL_VARIABLES_KEY, key);

coreSystem.convertStackItemToString = (handle, index) => coreSystem.convertStackItemToTextAndLength(handle, index, voidPointer);

const auxLibInitEngine = bindExternalOperation("luaL_newstate", engineHandle, []);
coreSystem.openNewEngine = () => auxLibInitEngine();

coreSystem.getRegistryTable = (handle) => coreSystem.copyStackItem(handle, coreSystem.GLOBAL_REGISTRY_KEY);
coreSystem.getGarbageCollectionCount = (handle) => coreSystem.manageGarbageCollection(handle, coreSystem.GC_ACTION_COUNT, 0);

const chunkInputHandler = inputProvider;
const chunkOutputHandler = outputHandler;

coreSystem.setEngineLevel = bindExternalOperation("lua_setlevel", voidResult, [engineHandle, engineHandle]);