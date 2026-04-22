'use strict';

// This source file is part of an Erlang-like runtime environment implemented in JavaScript.
// It is provided under an open-source license.
// For licensing details, please refer to the project's license documentation.

// Virtual machine instruction codes and their corresponding string representations.
const InstructionMnemonics = [
  'NO_OP_CODE', 'label_definition', 'function_meta_info', 'end_code_marker', 'function_call', 'tail_call', 'only_call', 'external_call', 'external_tail_call', 'bif_arity_0',
  'bif_arity_1', 'bif_arity_2', 'allocate_stack', 'allocate_heap_memory', 'allocate_zeroed', 'allocate_heap_zeroed', 'check_heap_space', 'initialize_process', 'deallocate_stack',
  'return_value', 'send_message', 'remove_message_from_queue', 'handle_timeout', 'loop_receiver', 'end_loop_receiver', 'wait_for_message', 'wait_with_timeout_val',
  'math_add', 'math_subtract', 'math_multiply', 'math_float_divide', 'math_int_divide', 'math_int_remainder', 'bitwise_and', 'bitwise_or', 'bitwise_xor', 'bitwise_shift_left',
  'bitwise_shift_right', 'bitwise_not', 'test_less_than', 'test_greater_equal', 'test_equality', 'test_inequality', 'test_exact_equality',
  'test_exact_inequality', 'type_is_integer', 'type_is_float', 'type_is_number', 'type_is_atom', 'type_is_pid', 'type_is_reference', 'type_is_port', 'type_is_nil', 'type_is_binary', 'type_is_constant',
  'type_is_list', 'type_is_non_empty_list', 'type_is_tuple', 'test_tuple_arity', 'select_on_value', 'select_on_tuple_arity', 'unconditional_jump', 'start_catch', 'end_catch', 'move_data', 'get_list_head_tail',
  'get_tuple_element_val', 'set_tuple_element_val', 'put_string_constant', 'put_list_constant', 'put_tuple_constant', 'put_generic_value', 'bad_match_exception', 'end_if_block', 'end_case_block',
  'call_fun_closure', 'create_fun_closure', 'type_is_function', 'external_only_call', 'bitstring_start_match', 'bitstring_get_integer', 'bitstring_get_float', 'bitstring_get_binary',
  'bitstring_skip_bits', 'bitstring_test_tail', 'bitstring_save_context', 'bitstring_restore_context', 'bitstring_init_context', 'bitstring_finalize_context', 'bitstring_put_integer', 'bitstring_put_binary', 'bitstring_put_float',
  'bitstring_put_string', 'bitstring_need_buffer', 'fpu_clear_error_flag', 'fpu_check_error_flag', 'fpu_move_value', 'fpu_convert_type', 'fpu_add_op', 'fpu_subtract_op', 'fpu_multiply_op', 'fpu_divide_op', 'fpu_negate_op', 'create_fun_closure_v2',
  'start_try_block', 'end_try_block', 'try_case_block_alt', 'end_try_case_block', 'raise_exception_val', 'bitstring_init_v2', 'bitstring_bits_to_bytes', 'bitstring_add', 'apply_function', 'apply_tail_function', 'type_is_boolean',
  'type_is_function_v2', 'bitstring_start_match_v2', 'bitstring_get_integer_v2', 'bitstring_get_float_v2', 'bitstring_get_binary_v2', 'bitstring_skip_bits_v2', 'bitstring_test_tail_v2', 'bitstring_save_v2',
  'bitstring_restore_v2', 'gc_bif_1_arg', 'gc_bif_2_arg', 'bitstring_finalize_v2', 'bitstring_bits_to_bytes_v2', 'put_literal_value', 'type_is_bitstring', 'bitstring_context_to_binary', 'bitstring_test_unit',
  'bitstring_match_string', 'bitstring_init_writable', 'bitstring_append', 'bitstring_private_append', 'trim_stack_frame', 'bitstring_init_bits', 'bitstring_get_utf8', 'bitstring_skip_utf8', 'bitstring_get_utf16',
  'bitstring_skip_utf16', 'bitstring_get_utf32', 'bitstring_skip_utf32', 'bitstring_utf8_size', 'bitstring_put_utf8', 'bitstring_utf16_size', 'bitstring_put_utf16', 'bitstring_put_utf32',
  'on_load_hook', 'receive_mark_message', 'receive_set_message', 'gc_bif_3_arg'
];

// Number of operands (arity) for each instruction.
const OperationArities = [
  0, 1, 3, 0, 2, 3, 2, 2, 3, 2, 4, 5, 2, 3, 2, 3, 2, 1, 1, 0, 0, 0, 0, 2, 1, 1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 2, 1, 2, 3, 3, 3, 3, 3, 2, 1, 1, 0, 1, 1, 3, 2, 2, 2, 5, 5, 5, 4, 2, 1, 1, 2, 2, 5, 5,
  5, 2, 1, 0, 1, 2, 2, 4, 4, 4, 4, 3, 1, 2, 1, 1, 1, 2, 6, 3, 5, 1, 2, 2, 3, 5, 7, 7, 7, 5, 3, 2, 2, 5, 6, 2, 2, 2, 2, 1, 3, 4, 0, 8, 6,
  2, 6, 5, 4, 5, 4, 5, 4, 3, 3, 3, 3, 3, 0, 1, 1, 7
];

// Stores references to currently loaded modules.
let loadedModuleReferences = [];

// --- Code Loading and Atom Management ---

// Counter for generating unique atom identifiers during the initial loading phase.
let nextAtomSequenceNumber = (2 << 27) + 1;
// A map to cache string-to-atom identifier conversions during module loading.
const initialAtomStringCache = new Map();

/**
 * Assigns or retrieves a unique integer identifier for a given string,
 * primarily used for atom management during the code loading process.
 * Ensures that each unique string maps to a single, consistent atom ID.
 * @param {string} atomStringValue The string representation of the atom.
 * @returns {number} The unique integer identifier for the atom.
 */
function mapStringToLoadingAtom(atomStringValue) {
  // Input validation: ensure a non-empty string is provided.
  if (typeof atomStringValue !== 'string' || atomStringValue.length === 0) {
    throw new Error("Cannot map an empty or non-string value to an atom.");
  }
  let existingId = initialAtomStringCache.get(atomStringValue);
  if (existingId !== undefined) {
    return existingId;
  }
  const newAtomId = nextAtomSequenceNumber++;
  initialAtomStringCache.set(atomStringValue, newAtomId);
  return newAtomId;
}

// Global constants representing common Erlang atoms, pre-mapped to their identifiers.
const ATOM_TRUE = mapStringToLoadingAtom('true');
const ATOM_FALSE = mapStringToLoadingAtom('false');
const ATOM_ERLANG = mapStringToLoadingAtom('erlang');
const ATOM_SELF = mapStringToLoadingAtom('self');
const ATOM_NODE = mapStringToLoadingAtom('node');
const ATOM_OK = mapStringToLoadingAtom('ok');
const ATOM_ROUND = mapStringToLoadingAtom('round');
const ATOM_FLOAT = mapStringToLoadingAtom('float');
const ATOM_SIZE = mapStringToLoadingAtom('size');
const ATOM_BYTE_SIZE = mapStringToLoadingAtom('byte_size');
const ATOM_BIT_SIZE = mapStringToLoadingAtom('bit_size');
const ATOM_LENGTH = mapStringToLoadingAtom('length');
const ATOM_ABS = mapStringToLoadingAtom('abs');
const ATOM_TRUNC = mapStringToLoadingAtom('trunc');
const ATOM_IS_PORT = mapStringToLoadingAtom('is_port');
const ATOM_IS_NUMBER = mapStringToLoadingAtom('is_number');
const ATOM_IS_INTEGER = mapStringToLoadingAtom('is_integer');
const ATOM_IS_LIST = mapStringToLoadingAtom('is_list');
const ATOM_IS_TUPLE = mapStringToLoadingAtom('is_tuple');
const ATOM_IS_ATOM = mapStringToLoadingAtom('is_atom');
const ATOM_IS_PID = mapStringToLoadingAtom('is_pid');
const ATOM_IS_BINARY = mapStringToLoadingAtom('is_binary');
const ATOM_IS_BOOLEAN = mapStringToLoadingAtom('is_boolean');
const ATOM_TUPLE_SIZE = mapStringToLoadingAtom('tuple_size');
const ATOM_NOT = mapStringToLoadingAtom('not');
const ATOM_HD = mapStringToLoadingAtom('hd');
const ATOM_TL = mapStringToLoadingAtom('tl');
const ATOM_GET = mapStringToLoadingAtom('get');
const ATOM_ELEMENT = mapStringToLoadingAtom('element');
const ATOM_AND = mapStringToLoadingAtom('and');
const ATOM_OR = mapStringToLoadingAtom('or');
const ATOM_APPLY = mapStringToLoadingAtom('apply');
const ATOM_YIELD = mapStringToLoadingAtom('yield');
const ATOM_OS = mapStringToLoadingAtom('os');
const ATOM_BAND = mapStringToLoadingAtom('band');
const ATOM_BSR = mapStringToLoadingAtom('bsr');
const ATOM_BSL = mapStringToLoadingAtom('bsl');
const ATOM_BOR = mapStringToLoadingAtom('bor');
const ATOM_BXOR = mapStringToLoadingAtom('bxor');
const ATOM_TIMESTAMP = mapStringToLoadingAtom('timestamp');
const ATOM_GETENV = mapStringToLoadingAtom('getenv');
const ATOM_PUTENV = mapStringToLoadingAtom('putenv');
const ATOM_ETS = mapStringToLoadingAtom('ets');
const ATOM_LISTS = mapStringToLoadingAtom('lists');
const ATOM_UNICODE = mapStringToLoadingAtom('unicode');
const ATOM_ERROR_LOGGER = mapStringToLoadingAtom('error_logger');
const ATOM_PRIM_FILE = mapStringToLoadingAtom('prim_file');
const ATOM_NET_KERNEL = mapStringToLoadingAtom('net_kernel');
const ATOM_SETNODE = mapStringToLoadingAtom('setnode');
const ATOM_CODE = mapStringToLoadingAtom('code');
const ATOM_FILE = mapStringToLoadingAtom('file');
const ATOM_MATH = mapStringToLoadingAtom('math');
const ATOM_BADARG = mapStringToLoadingAtom('badarg');
const ATOM_BADARITY = mapStringToLoadingAtom('badarity');
const ATOM_DELETE_OBJECT = mapStringToLoadingAtom('delete_object');
const ATOM_NEW = mapStringToLoadingAtom('new');
const ATOM_DELETE = mapStringToLoadingAtom('delete');
const ATOM_SELECT_DELETE = mapStringToLoadingAtom('select_delete');
const ATOM_SELECT = mapStringToLoadingAtom('select');
const ATOM_INSERT = mapStringToLoadingAtom('insert');
const ATOM_LOOKUP = mapStringToLoadingAtom('lookup');
const ATOM_LOOKUP_ELEMENT = mapStringToLoadingAtom('lookup_element');
const ATOM_SLOT = mapStringToLoadingAtom('slot');
const ATOM_FIRST = mapStringToLoadingAtom('first');
const ATOM_NEXT = mapStringToLoadingAtom('next');
const ATOM_ALL = mapStringToLoadingAtom('all');
const ATOM_INFO = mapStringToLoadingAtom('info');
const ATOM_MATCH = mapStringToLoadingAtom('match');
const ATOM_MATCH_OBJECT = mapStringToLoadingAtom('match_object');
const ATOM_MEMBER = mapStringToLoadingAtom('member');
const ATOM_KEYSEARCH = mapStringToLoadingAtom('keysearch');
const ATOM_KEYFIND = mapStringToLoadingAtom('keyfind');
const ATOM_KEYMEMBER = mapStringToLoadingAtom('keymember');
const ATOM_REVERSE = mapStringToLoadingAtom('reverse');
const ATOM_BIN_IS_7BIT = mapStringToLoadingAtom('bin_is_7bit');
const ATOM_CHARS_TO_BINARY = mapStringToLoadingAtom('characters_to_binary');
const ATOM_CHARS_TO_LIST = mapStringToLoadingAtom('characters_to_list');
const ATOM_WARNING_MAP = mapStringToLoadingAtom('warning_map');
const ATOM_DFLAG_UNICODE_IO = mapStringToLoadingAtom('dflag_unicode_io');
const ATOM_INTERNAL_NATIVE2NAME = mapStringToLoadingAtom('internal_native2name');
const ATOM_INTERNAL_NAME2NATIVE = mapStringToLoadingAtom('internal_name2native');
const ATOM_GET_CHUNK = mapStringToLoadingAtom('get_chunk');
const ATOM_NATIVE_NAME_ENCODING = mapStringToLoadingAtom('native_name_encoding');
const ATOM_LOG10 = mapStringToLoadingAtom('log10');
const ATOM_LOG = mapStringToLoadingAtom('log');
const ATOM_NOW = mapStringToLoadingAtom('now');
const ATOM_DATE = mapStringToLoadingAtom('date');
const ATOM_UNIVERSALTIME_TO_LOCALTIME = mapStringToLoadingAtom('universaltime_to_localtime');
const ATOM_LOCALTIME = mapStringToLoadingAtom('localtime');
const ATOM_TIME = mapStringToLoadingAtom('time');
const ATOM_STATISTICS = mapStringToLoadingAtom('statistics');
const ATOM_DIV = mapStringToLoadingAtom('div');
const ATOM_REM = mapStringToLoadingAtom('rem');
const ATOM_GROUP_LEADER = mapStringToLoadingAtom('group_leader');
const ATOM_GARBAGE_COLLECT = mapStringToLoadingAtom('garbage_collect');
const ATOM_CANCEL_TIMER = mapStringToLoadingAtom('cancel_timer');
const ATOM_MEMORY = mapStringToLoadingAtom('memory');
const ATOM_REGISTERED = mapStringToLoadingAtom('registered');
const ATOM_PROCESSES = mapStringToLoadingAtom('processes');
const ATOM_LIST_TO_PID = mapStringToLoadingAtom('list_to_pid');
const ATOM_PID_TO_LIST = mapStringToLoadingAtom('pid_to_list');
const ATOM_PORT_TO_LIST = mapStringToLoadingAtom('port_to_list');
const ATOM_FUN_TO_LIST = mapStringToLoadingAtom('fun_to_list');
const ATOM_FUN_INFO = mapStringToLoadingAtom('fun_info');
const ATOM_REGISTER = mapStringToLoadingAtom('register');
const ATOM_UNREGISTER = mapStringToLoadingAtom('unregister');
const ATOM_LIST_TO_FLOAT = mapStringToLoadingAtom('list_to_float');
const ATOM_FLOAT_TO_LIST = mapStringToLoadingAtom('float_to_list');
const ATOM_MAKE_TUPLE = mapStringToLoadingAtom('make_tuple');
const ATOM_WHEREIS = mapStringToLoadingAtom('whereis');
const ATOM_PROCESS_INFO = mapStringToLoadingAtom('process_info');
const ATOM_PROCESS_DISPLAY = mapStringToLoadingAtom('process_display');
const ATOM_IS_ALIVE = mapStringToLoadingAtom('is_alive');
const ATOM_PROCESS_FLAG = mapStringToLoadingAtom('process_flag');
const ATOM_GET_MODULE_INFO = mapStringToLoadingAtom('get_module_info');
const ATOM_SYSTEM_INFO = mapStringToLoadingAtom('system_info');
const ATOM_PRE_LOADED = mapStringToLoadingAtom('pre_loaded');
const ATOM_MODULE_LOADED = mapStringToLoadingAtom('module_loaded');
const ATOM_LOAD_MODULE = mapStringToLoadingAtom('load_module');
const ATOM_FUNCTION_EXPORTED = mapStringToLoadingAtom('function_exported');
const ATOM_MAKE_REF = mapStringToLoadingAtom('make_ref');
const ATOM_IOLIST_SIZE = mapStringToLoadingAtom('iolist_size');
const ATOM_LIST_TO_INTEGER = mapStringToLoadingAtom('list_to_integer');
const ATOM_INTEGER_TO_LIST = mapStringToLoadingAtom('integer_to_list');
const ATOM_IOLIST_TO_BINARY = mapStringToLoadingAtom('iolist_to_binary');
const ATOM_NODES = mapStringToLoadingAtom('nodes');
const ATOM_OPEN_PORT = mapStringToLoadingAtom('open_port');
const ATOM_PORT_COMMAND = mapStringToLoadingAtom('port_command');
const ATOM_PORT_CONTROL = mapStringToLoadingAtom('port_control');
const ATOM_PORT_CONNECT = mapStringToLoadingAtom('port_connect');
const ATOM_PORT_CLOSE = mapStringToLoadingAtom('port_close');
const ATOM_MONITOR = mapStringToLoadingAtom('monitor');
const ATOM_DEMONITOR = mapStringToLoadingAtom('demonitor');
const ATOM_IS_PROCESS_ALIVE = mapStringToLoadingAtom('is_process_alive');
const ATOM_LINK = mapStringToLoadingAtom('link');
const ATOM_UNLINK = mapStringToLoadingAtom('unlink');
const ATOM_DISPLAY = mapStringToLoadingAtom('display');
const ATOM_BUMP_REDUCTIONS = mapStringToLoadingAtom('bump_reductions');
const ATOM_GET_STACKTRACE = mapStringToLoadingAtom('get_stacktrace');
const ATOM_EXIT = mapStringToLoadingAtom('exit');
const ATOM_ERROR = mapStringToLoadingAtom('error');
const ATOM_THROW = mapStringToLoadingAtom('throw');
const ATOM_RAISE = mapStringToLoadingAtom('raise');
const ATOM_ATOM_TO_LIST = mapStringToLoadingAtom('atom_to_list');
const ATOM_TERM_TO_BINARY = mapStringToLoadingAtom('term_to_binary');
const ATOM_BINARY_TO_TERM = mapStringToLoadingAtom('binary_to_term');
const ATOM_SETELEMENT = mapStringToLoadingAtom('setelement');
const ATOM_LIST_TO_TUPLE = mapStringToLoadingAtom('list_to_tuple');
const ATOM_TUPLE_TO_LIST = mapStringToLoadingAtom('tuple_to_list');
const ATOM_LIST_TO_BINARY = mapStringToLoadingAtom('list_to_binary');
const ATOM_REF_TO_LIST = mapStringToLoadingAtom('ref_to_list');
const ATOM_SEND = mapStringToLoadingAtom('send');
const ATOM_SEND_AFTER = mapStringToLoadingAtom('send_after');
const ATOM_LIST_TO_ATOM = mapStringToLoadingAtom('list_to_atom');
const ATOM_BINARY_TO_LIST = mapStringToLoadingAtom('binary_to_list');
const ATOM_PHASH = mapStringToLoadingAtom('phash');
const ATOM_PUT = mapStringToLoadingAtom('put');
const ATOM_ERASE = mapStringToLoadingAtom('erase');
const ATOM_MAKE_FUN = mapStringToLoadingAtom('make_fun');
const ATOM_SPAWN_OPT = mapStringToLoadingAtom('spawn_opt');
const ATOM_SPAWN = mapStringToLoadingAtom('spawn');
const ATOM_SPAWN_LINK = mapStringToLoadingAtom('spawn_link');
const ATOM_NONODE_NOHOST = mapStringToLoadingAtom('nonode@nohost');
const ATOM_PID_TYPE = mapStringToLoadingAtom('pid');
const ATOM_EVAL = mapStringToLoadingAtom('eval');
const ATOM_SET = mapStringToLoadingAtom('set');
const ATOM_CALL = mapStringToLoadingAtom('call');
const ATOM_JS = mapStringToLoadingAtom('js');
const ATOM_BROWSERL_DIST = mapStringToLoadingAtom('browserl_dist');
const ATOM_LISTEN = mapStringToLoadingAtom('listen');
const ATOM_ACCEPT = mapStringToLoadingAtom('accept');
const ATOM_CHILD_SPECS = mapStringToLoadingAtom('childspecs');
const ATOM_RE = mapStringToLoadingAtom('re');
const ATOM_RUN = mapStringToLoadingAtom('run');

// Atoms representing Erlang operators.
const ATOM_OP_MINUS = mapStringToLoadingAtom('-');
const ATOM_OP_EXACT_EQ = mapStringToLoadingAtom('=:=');
const ATOM_OP_EXACT_NE = mapStringToLoadingAtom('=/=');
const ATOM_OP_EQ = mapStringToLoadingAtom('==');
const ATOM_OP_GT = mapStringToLoadingAtom('>');
const ATOM_OP_LT = mapStringToLoadingAtom('<');
const ATOM_OP_GTE = mapStringToLoadingAtom('>=');
const ATOM_OP_LTE = mapStringToLoadingAtom('=<');
const ATOM_OP_NE = mapStringToLoadingAtom('/=');
const ATOM_OP_ASSIGN = mapStringToLoadingAtom('=');
const ATOM_OP_PLUS = mapStringToLoadingAtom('+');
const ATOM_OP_MULTIPLY = mapStringToLoadingAtom('*');
const ATOM_OP_DIVIDE = mapStringToLoadingAtom('/');
const ATOM_OP_EXCLAMATION = mapStringToLoadingAtom('!');
const ATOM_OP_CONCAT = mapStringToLoadingAtom('++');
const ATOM_OP_DIFF = mapStringToLoadingAtom('--');


// Provides Date.now() functionality for environments that might lack it.
if (typeof Date.now === 'undefined') {
  Date.now = function() {
    return (new Date()).getTime();
  };
}

// --- Generic Buffer Access Utilities ---

/**
 * Retrieves a single byte (0-255) from a buffer-like object at a specified offset.
 * Performs bounds checking.
 * @param {Array|Uint8Array|String} buffer The source buffer.
 * @param {number} offset The byte offset to read from.
 * @returns {number} The byte value.
 * @throws {RangeError} If the offset is out of bounds.
 */
const getSingleByte = (buffer, offset) => {
  if (offset < 0 || offset >= buffer.length) {
    throw new RangeError(`Offset ${offset} is outside buffer boundaries (length: ${buffer.length}).`);
  }
  return buffer[offset];
};

/**
 * Reads a 32-bit signed integer from a buffer-like object at a specified offset.
 * Assumes big-endian byte order.
 * @param {Array|Uint8Array|String} buffer The source buffer.
 * @param {number} offset The byte offset to start reading from.
 * @returns {number} The decoded 32-bit integer.
 * @throws {RangeError} If reading goes past buffer end.
 */
const getFourByteInteger = (buffer, offset) => {
  if (offset + 3 >= buffer.length) {
    throw new RangeError(`Attempted to read 32-bit integer beyond buffer end at offset ${offset}.`);
  }
  return (getSingleByte(buffer, offset) << 24) |
         (getSingleByte(buffer, offset + 1) << 16) |
         (getSingleByte(buffer, offset + 2) << 8) |
         getSingleByte(buffer, offset + 3);
};

/**
 * Extracts a substring from a buffer-like object, interpreting bytes as UTF-16 code units.
 * @param {Array|Uint8Array|String} buffer The source buffer.
 * @param {number} offset The starting byte offset.
 * @param {number} length The number of bytes to read.
 * @returns {string} The constructed string.
 * @throws {RangeError} If the read operation exceeds buffer boundaries.
 */
const extractCharacterSequence = (buffer, offset, length) => {
  if (offset < 0 || offset + length > buffer.length) {
    throw new RangeError(`String read out of bounds: offset ${offset}, length ${length}, buffer size ${buffer.length}.`);
  }
  let charAccumulator = '';
  for (let k = 0; k < length; k++) {
    charAccumulator += String.fromCharCode(getSingleByte(buffer, offset + k));
  }
  return charAccumulator;
};

/**
 * Reads a null-terminated string from a buffer-like object up to a maximum length.
 * @param {Array|Uint8Array|String} buffer The source buffer.
 * @param {number} offset The starting byte offset.
 * @param {number} maximumLength The maximum number of bytes to read.
 * @returns {string} The constructed string, truncated at the first null byte or maximum length.
 */
const extractNullTerminatedString = (buffer, offset, maximumLength) => {
  let resultString = '';
  let currentPosition = offset;
  let charactersProcessed = 0;
  while (charactersProcessed < maximumLength) {
    if (currentPosition >= buffer.length) {
      break;
    }
    const charCode = getSingleByte(buffer, currentPosition);
    if (charCode === 0) {
      break;
    }
    resultString += String.fromCharCode(charCode);
    currentPosition++;
    charactersProcessed++;
  }
  return resultString;
};

/**
 * Creates a new array containing a portion of the original buffer-like object.
 * @param {Array|Uint8Array|String} buffer The source buffer.
 * @param {number} startIndex The starting index (inclusive).
 * @param {number} endIndex The ending index (exclusive).
 * @returns {number[]} A new array containing the bytes.
 * @throws {RangeError} If indices are invalid.
 */
const generatePartialArray = (buffer, startIndex, endIndex) => {
  if (startIndex < 0 || endIndex > buffer.length || startIndex > endIndex) {
    throw new RangeError(`Invalid indices for partial array: start ${startIndex}, end ${endIndex}, buffer length ${buffer.length}.`);
  }
  const extractedBytes = new Array(endIndex - startIndex);
  for (let k = startIndex; k < endIndex; k++) {
    extractedBytes[k - startIndex] = buffer[k];
  }
  return extractedBytes;
};


// Extend built-in types to provide uniform buffer access methods.
if (typeof Uint8Array !== 'undefined') {
  Object.assign(Uint8Array.prototype, {
    readString: function(position, count) { return extractCharacterSequence(this, position, count); },
    readNullTerminatedString: function(position, maxLen) { return extractNullTerminatedString(this, position, maxLen); },
    readByte: function(position) { return getSingleByte(this, position); },
    readInt32: function(position) { return getFourByteInteger(this, position); }
  });
}

Object.assign(Array.prototype, {
  readString: function(position, count) { return extractCharacterSequence(this, position, count); },
  readNullTerminatedString: function(position, maxLen) { return extractNullTerminatedString(this, position, maxLen); },
  readByte: function(position) { return getSingleByte(this, position); },
  readInt32: function(position) { return getFourByteInteger(this, position); },
  readSubarray: function(startPos, endPos) { return generatePartialArray(this, startPos, endPos); }
});

Object.assign(String.prototype, {
  // For strings, charCodeAt is used as the byte source, assuming 0-255 range.
  readByte: function(position) {
    if (position < 0 || position >= this.length) {
      throw new RangeError(`String byte read out of bounds: position ${position}, string length ${this.length}.`);
    }
    return this.charCodeAt(position) & 0xFF;
  },
  readInt32: function(position) {
    if (position + 3 >= this.length) {
      throw new RangeError(`String 32-bit int read beyond bounds: position ${position}, string length ${this.length}.`);
    }
    return (this.readByte(position) << 24) |
           (this.readByte(position + 1) << 16) |
           (this.readByte(position + 2) << 8) |
           this.readByte(position + 3);
  },
  readString: function(position, count) {
    if (position < 0 || position + count > this.length) {
      throw new RangeError(`String read out of bounds: position ${position}, count ${count}, string length ${this.length}.`);
    }
    let res = '';
    for (let k = 0; k < count; k++) {
      res += String.fromCharCode(this.readByte(position + k));
    }
    return res;
  },
  readNullTerminatedString: function(position, maxLen) {
    let res = '';
    let currentIdx = position;
    let charsAppended = 0;
    while (charsAppended < maxLen && currentIdx < this.length) {
      const charVal = this.readByte(currentIdx);
      if (charVal === 0) break;
      res += String.fromCharCode(charVal);
      currentIdx++;
      charsAppended++;
    }
    return res;
  },
  readSubarray: function(startPos, endPos) {
    if (startPos < 0 || endPos > this.length || startPos > endPos) {
      throw new RangeError(`Invalid subarray indices for string: start ${startPos}, end ${endPos}, length ${this.length}.`);
    }
    const byteList = [];
    for (let k = startPos; k < endPos; k++) {
      byteList.push(this.readByte(k));
    }
    return byteList;
  }
});


/**
 * Decodes an IEEE 754 double-precision (64-bit) floating-point number
 * from an array-like byte source.
 * @param {Array|Uint8Array|String} byteSource The buffer containing the float.
 * @param {number} offset The starting byte offset of the float.
 * @returns {number} The decoded JavaScript number.
 */
function decodeFloat64(byteSource, offset) {
  const highWord = byteSource.readInt32(offset);
  const lowWord = byteSource.readInt32(offset + 4);

  const sign = (highWord >>> 31);
  const exponent = ((highWord >>> 20) & 0x7FF);
  const mantissaHigh = (highWord & 0xFFFFF);
  const mantissaLow = lowWord;

  let mantissa = mantissaHigh * (2 ** 32) + (mantissaLow >>> 0); // Combine 52-bit mantissa

  let resultValue;
  if (exponent === 0) { // Denormalized or Zero
    resultValue = (mantissa === 0) ? 0.0 : (2 ** -1022) * (mantissa / (2 ** 52));
  } else if (exponent === 0x7FF) { // Infinity or NaN
    resultValue = (mantissa === 0) ? Infinity : NaN;
  } else { // Normalized
    resultValue = (2 ** (exponent - 1023)) * (1 + (mantissa / (2 ** 52)));
  }

  return (sign === 1) ? -resultValue : resultValue;
}

/**
 * Encodes a JavaScript number into an 8-byte array representing an IEEE 754
 * double-precision (64-bit) floating-point number.
 * @param {number} jsNumber The number to encode.
 * @returns {number[]} An array of 8 bytes (octets).
 */
function encodeFloat64(jsNumber) {
  if (jsNumber === 0) return [0, 0, 0, 0, 0, 0, 0, 0];
  if (jsNumber === Infinity) return [0x7F, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
  if (jsNumber === -Infinity) return [0xFF, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
  if (isNaN(jsNumber)) return [0x7F, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

  const signBit = (jsNumber < 0) ? 1 : 0;
  let absNum = Math.abs(jsNumber);

  let expField = 0;
  let fractionField;

  if (absNum === 0) {
    expField = 0;
    fractionField = 0;
  } else {
    // Normalize absNum to be in [1, 2) and determine exponent
    while (absNum >= 2) { absNum /= 2; expField++; }
    while (absNum < 1) { absNum *= 2; expField--; }
    // Remove implicit leading 1 for fraction (mantissa)
    fractionField = absNum - 1;
  }

  // Apply exponent bias (1023 for double precision)
  const biasedExp = expField + 1023;

  // Handle denormalized numbers
  if (biasedExp <= 0) {
    // Denormalized: exponent field is all zeros, implicit exponent is -1022.
    // Fraction is `absNum / (2 ** -1022)`.
    fractionField = absNum / (2 ** -1022);
    expField = 0; // Exponent field becomes 0 for denormalized
  } else if (biasedExp >= 2047) { // Exponent field all ones (0x7FF)
    // This case should ideally be handled by Infinity/NaN checks above.
    // If it reaches here due to precision issues, it's an overflow.
    return (signBit === 1) ? [0xFF, 0xF0, 0, 0, 0, 0, 0, 0] : [0x7F, 0xF0, 0, 0, 0, 0, 0, 0]; // +/- Infinity
  } else {
    expField = biasedExp;
  }

  const scaledFraction = fractionField * (2 ** 52);
  const fractionUpper20 = Math.floor(scaledFraction / (2 ** 32));
  const fractionLower32 = Math.floor(scaledFraction % (2 ** 32));

  const wordOne = (signBit << 31) | (expField << 20) | fractionUpper20;
  const wordTwo = fractionLower32;

  const outputBytes = new Array(8);
  outputBytes[0] = (wordOne >>> 24) & 0xFF;
  outputBytes[1] = (wordOne >>> 16) & 0xFF;
  outputBytes[2] = (wordOne >>> 8) & 0xFF;
  outputBytes[3] = wordOne & 0xFF;
  outputBytes[4] = (wordTwo >>> 24) & 0xFF;
  outputBytes[5] = (wordTwo >>> 16) & 0xFF;
  outputBytes[6] = (wordTwo >>> 8) & 0xFF;
  outputBytes[7] = wordTwo & 0xFF;

  return outputBytes;
}

const ERLANG_EXTERNAL_TERM_MAGIC_BYTE = 131;
const ERLANG_NIL_ATOM_IDENTIFIER = (2 << 27); // Standard representation for Erlang's '[]' (nil)

/**
 * Deserializes a binary sequence into an Erlang term structure.
 * This function supports various Erlang external term format tags.
 * @param {Array|Uint8Array|String} binaryData The byte sequence representing the Erlang term.
 * @param {boolean} isLoaderContext A flag indicating if atom mapping should use the loader's cache.
 * @returns {any} The JavaScript representation of the Erlang term.
 * @throws {Error} If the binaryData is not a valid Erlang external term.
 */
function deserializeErlangTerm(binaryData, isLoaderContext) {
  let currentByteOffset = 0;

  // Validate the magic byte at the beginning of the term.
  if (binaryData.readByte(currentByteOffset++) !== ERLANG_EXTERNAL_TERM_MAGIC_BYTE) {
    throw new Error('Malformed Erlang term: initial magic byte not found.');
  }

  /**
   * Recursive helper to read and decode individual term elements.
   * Updates `currentByteOffset` as bytes are consumed.
   * @returns {any} The decoded Erlang term fragment.
   */
  function consumeNextTermElement() {
    const termTagByte = binaryData.readByte(currentByteOffset++);

    switch (termTagByte) {
      case 70: // FLOAT_EXT (new 64-bit float format)
        const decodedFloat = decodeFloat64(binaryData, currentByteOffset);
        currentByteOffset += 8;
        return { type: ATOM_FLOAT, value: decodedFloat };
      case 77: // BIT_BINARY_EXT
        const totalBytes = binaryData.readInt32(currentByteOffset);
        currentByteOffset += 4;
        const remainingBits = binaryData.readByte(currentByteOffset);
        currentByteOffset += 1;
        const rawBinaryData = binaryData.readString(currentByteOffset, totalBytes);
        currentByteOffset += totalBytes;
        return { type: 'bitstring', value: rawBinaryData, length: totalBytes * 8 + remainingBits };
      case 97: // SMALL_INTEGER_EXT (1-byte integer)
        return binaryData.readByte(currentByteOffset++);
      case 98: // INTEGER_EXT (4-byte integer)
        const fourByteInt = binaryData.readInt32(currentByteOffset);
        currentByteOffset += 4;
        return fourByteInt;
      case 100: // ATOM_EXT (UTF-8, up to 255 chars)
        const atomNameLength = binaryData.readByte(currentByteOffset++); // Atom length is 1 byte
        if (atomNameLength === 0) {
            console.warn("Encountered empty atom string.");
            return isLoaderContext ? mapStringToLoadingAtom('') : (typeof strToAtom === 'function' ? strToAtom('') : { type: 'atom_unmapped', value: '' });
        }
        const atomName = binaryData.readString(currentByteOffset, atomNameLength);
        currentByteOffset += atomNameLength;
        if (isLoaderContext) {
          return mapStringToLoadingAtom(atomName);
        }
        // Assuming 'strToAtom' is a globally available function for runtime atom mapping.
        if (typeof strToAtom === 'function') {
          return strToAtom(atomName);
        } else {
          // Fallback mechanism if runtime atom mapping is not set up yet.
          console.warn("Runtime atom mapping (strToAtom) is not defined; returning unmapped atom structure for:", atomName);
          return { type: 'unmapped_atom_value', value: atomName };
        }
      case 103: // PID_EXT
        const pidNodeIdentifier = consumeNextTermElement(); // Node is typically an atom
        const pidIdValue = binaryData.readInt32(currentByteOffset);
        currentByteOffset += 4;
        const pidSerialValue = binaryData.readInt32(currentByteOffset);
        currentByteOffset += 4;
        const pidCreationValue = binaryData.readByte(currentByteOffset);
        currentByteOffset += 1;

        // Assuming 'currentNodeName' is a global or accessible variable representing the local node.
        if (typeof currentNodeName !== 'undefined' && pidNodeIdentifier === currentNodeName) {
          return { type: ATOM_PID_TYPE, value: pidIdValue }; // Local PID
        }
        return { type: ATOM_PID_TYPE, value: [pidNodeIdentifier, pidIdValue, pidSerialValue, pidCreationValue] };
      case 104: // SMALL_TUPLE_EXT (up to 255 elements)
        let tupleFieldCount = binaryData.readByte(currentByteOffset++);
        const tupleData = [];
        for (let i = 0; i < tupleFieldCount; i++) {
          tupleData.push(consumeNextTermElement());
        }
        return tupleData; // Represent Erlang tuples as JavaScript arrays.
      case 106: // NIL_EXT (empty list)
        return ERLANG_NIL_ATOM_IDENTIFIER;
      case 107: // STRING_EXT (list of bytes, up to 65535 chars)
        const charListLength = binaryData.readByte(currentByteOffset++); // Read 1-byte length
        const charListData = binaryData.readString(currentByteOffset, charListLength);
        currentByteOffset += charListLength;
        // Convert JS string back to Erlang-style linked list of character codes.
        return charListData.split('').reduceRight((prevList, char) => ({ value: char.charCodeAt(0), next: prevList }), ERLANG_NIL_ATOM_IDENTIFIER);
      case 108: // LIST_EXT (proper or improper list)
        let listElementCount = binaryData.readInt32(currentByteOffset);
        currentByteOffset += 4;
        const collectedElements = [];
        for (let i = 0; i < listElementCount; i++) {
          collectedElements.push(consumeNextTermElement());
        }
        let listTail = consumeNextTermElement(); // Read the tail, which could be NIL_EXT or another term.

        // Construct the linked list in the correct order.
        let currentListHead = listTail;
        for (let i = collectedElements.length - 1; i >= 0; i--) {
            currentListHead = { value: collectedElements[i], next: currentListHead };
        }
        return currentListHead;
      case 109: // BINARY_EXT
        const binaryByteLength = binaryData.readInt32(currentByteOffset);
        currentByteOffset += 4;
        const binaryContent = binaryData.readString(currentByteOffset, binaryByteLength);
        currentByteOffset += binaryByteLength;
        return binaryContent; // Represent binaries as JavaScript strings (or Uint8Array if preferred).
      default:
        throw new Error(`Unrecognized Erlang term tag: ${termTagByte} at byte offset ${currentByteOffset - 1}.`);
    }
  }

  return consumeNextTermElement();
}