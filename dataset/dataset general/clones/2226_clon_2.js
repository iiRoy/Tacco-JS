'use strict';

// A conceptual machine interpreter implemented in JavaScript
// © 2012, Frederick Sven
//
//  Distributed under the MIT and GNU Public License v3 terms
//
//
//  This program is open source: you can redistribute and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your discretion) any later release.
//
//    This software is provided without any warranties;
//    WITHOUT ANY IMPLIED WARRANTY OF MERCHANTABILITY or FITNESS FOR A
//    PARTICULAR PURPOSE.  Refer to the GNU General Public License
//    for additional details.
//
//    You should have received a copy of the GNU General Public License
//    with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//  For the MIT license terms, see MIT-LICENSE

//PENDING items:
//-------------
//binary data handling, currently rudimentary
//keyed tables, presently a placeholder for functionality
//file operations, basic implementations
//argument validation for built-in functions
//TODO distributed system support
//fixed paths in testing scripts
//network kernel in web environment not detecting connections
//global state in web environment not updating on node disconnections

//KNOWN DEFECTS
//-------------
//initial invocations sometimes list process_library as the starting call in introspection.
//lists:reverse(A) == issue with binary pattern matching in library@3479


/*
debug_tool:begin_session(), debug_tool:trace_events(), debug_tool:set_breakpoint(, '_', []).
debug_tool:inspect_all_processes(components).
debug_tool:end_session_and_clear().

debug_tool:set_breakpoint(calculation_module, summation, debug_tool:convert_func_to_ms(function(_) { return_trace_data(); })).
*/


const InstructionMnemonics = [
  'NO_OP', 'label_id/1', 'function_info_record/3', 'internal_code_end/0', 'execute_call/2', 'execute_call_last/3',
  'execute_call_only/2', 'execute_external_call/2', 'execute_external_call_last/3', 'builtin_0arg/2', 'builtin_1arg/4',
  'builtin_2arg/5', 'allocate_frame/2', 'allocate_heap_memory/3', 'allocate_zero_init/2', 'allocate_heap_zero_init/3',
  'test_heap_space/2', 'initialize_proc/1', 'deallocate_frame/1', 'return_from_proc/0', 'dispatch_message/0',
  'remove_current_message/0', 'set_timeout_event/0', 'loop_recursive/2', 'loop_recursive_end/1', 'wait_for_message/1',
  'wait_for_message_timeout/2', 'math_add/4', 'math_subtract/4', 'math_multiply/4', 'math_divide/4', 'integer_division/4',
  'integer_remainder/4', 'integer_bitwise_and/4', 'integer_bitwise_or/4', 'integer_bitwise_xor/4', 'integer_bitwise_left_shift/4',
  'integer_bitwise_right_shift/4', 'integer_bitwise_not/3', 'is_less_than/3', 'is_greater_equal/3', 'is_equal_val/3',
  'is_not_equal_val/3', 'is_equal_exact_val/3', 'is_not_equal_exact_val/3', 'is_integer_type/2', 'is_float_type/2',
  'is_number_type/2', 'is_atom_type/2', 'is_pid_type/2', 'is_reference_type/2', 'is_port_type/2', 'is_nil_value/2',
  'is_binary_type/2', 'is_constant_value/2', 'is_list_type/2', 'is_non_empty_list/2', 'is_tuple_type/2', 'test_tuple_arity/3',
  'select_value_from_tuple/3', 'select_by_tuple_arity/3', 'unconditional_jump/1', 'begin_catch/2', 'end_catch/1',
  'move_value/2', 'get_list_elements/3', 'get_tuple_field/3', 'set_tuple_field/3', 'put_string_data/3', 'put_list_data/3',
  'put_tuple_data/2', 'put_value/1', 'handle_bad_match/1', 'if_block_end/0', 'case_block_end/1', 'call_fun_closure/1',
  'create_fun_closure/3', 'is_function_type/2', 'call_external_only/2', 'bitstring_start_match/2', 'bitstring_get_integer/5',
  'bitstring_get_float/5', 'bitstring_get_binary/5', 'bitstring_skip_bits/4', 'bitstring_test_tail/2', 'bitstring_save/1',
  'bitstring_restore/1', 'bitstring_init/2', 'bitstring_finalize/2', 'bitstring_put_integer/5', 'bitstring_put_binary/5',
  'bitstring_put_float/5', 'bitstring_put_string/2', 'bitstring_need_buffer/1', 'float_clear_error/0', 'float_check_error/1',
  'float_move_value/2', 'float_convert_type/2', 'float_add/4', 'float_subtract/4', 'float_multiply/4', 'float_divide/4',
  'float_negate/3', 'create_fun_closure_v2/1', 'begin_try/2', 'end_try/1', 'try_case_branch/1', 'try_case_end_branch/1',
  'raise_exception/2', 'bitstring_init_v2/6', 'bitstring_bits_to_bytes/3', 'bitstring_add/5', 'apply_function/1',
  'apply_function_last/2', 'is_boolean_type/2', 'is_function_type_v2/3', 'bitstring_start_match_v2/5',
  'bitstring_get_integer_v2/7', 'bitstring_get_float_v2/7', 'bitstring_get_binary_v2/7', 'bitstring_skip_bits_v2/5',
  'bitstring_test_tail_v2/3', 'bitstring_save_v2/2', 'bitstring_restore_v2/2', 'gc_builtin_1arg/5', 'gc_builtin_2arg/6',
  'bitstring_finalize_v2/2', 'bitstring_bits_to_bytes_v2/2', 'put_literal_value/2', 'is_bitstring_type/2',
  'bitstring_context_to_binary/1', 'bitstring_test_unit/3', 'bitstring_match_string/4', 'bitstring_init_writable/0',
  'bitstring_append/8', 'bitstring_private_append/6', 'trim_data/2', 'bitstring_init_bits/6', 'bitstring_get_utf8/5',
  'bitstring_skip_utf8/4', 'bitstring_get_utf16/5', 'bitstring_skip_utf16/4', 'bitstring_get_utf32/5', 'bitstring_skip_utf32/4',
  'bitstring_utf8_size/3', 'bitstring_put_utf8/3', 'bitstring_utf16_size/3', 'bitstring_put_utf16/3', 'bitstring_put_utf32/3',
  'on_module_load/0', 'receive_mark/1', 'receive_set/1', 'gc_builtin_3arg/7'
];

const InstructionArgumentCounts = [
  0, 1, 3, 0, 2, 3, 2, 2, 3, 2, 4, 5, 2, 3, 2, 3, 2, 1, 1, 0, 0, 0, 0, 2, 1, 1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 2, 1, 2, 3, 3, 3, 3, 3, 2, 1, 1, 0, 1, 1, 3, 2, 2, 2, 5, 5, 5, 4, 2, 1, 1, 2, 2, 5, 5, 5, 2, 1, 0, 1, 2, 2, 4, 4, 4, 4, 3, 1, 2, 1, 1, 1, 2, 6, 3, 5, 1, 2, 2, 3, 5, 7, 7, 7, 5, 3, 2, 2, 5, 6, 2, 2, 2, 2, 1, 3, 4, 0, 8, 6, 2, 6, 5, 4, 5, 4, 5, 4, 3, 3, 3, 3, 3, 0, 1, 1, 7
];

let LoadedComponents = [];

//
// BEGINNING OF COMPONENT LOADING LOGIC
//

// The symbol table employed during initial code loading
let nextSymbolIdentifier = (2 << 27) + 1;
const initialSymbolRegistry = {};

function obtainSymbolId(inputText){
  let symbolCode = initialSymbolRegistry[inputText];
  if (symbolCode !== void 0) return symbolCode;
  initialSymbolRegistry[inputText] = nextSymbolIdentifier;
  return nextSymbolIdentifier++;
}

// Symbol constants for common values
const SYM_TRUE = obtainSymbolId('true');
const SYM_FALSE = obtainSymbolId('false');
const PRIM_ERLANG = obtainSymbolId('erlang');
const PRIM_SELF = obtainSymbolId('self');
const PRIM_NODE = obtainSymbolId('node');
const PRIM_OK = obtainSymbolId('ok');
const PRIM_ROUND = obtainSymbolId('round');
const PRIM_FLOAT = obtainSymbolId('float');
const PRIM_SIZE = obtainSymbolId('size');
const PRIM_BYTE_SIZE = obtainSymbolId('byte_size');
const PRIM_BIT_SIZE = obtainSymbolId('bit_size');
const PRIM_LENGTH = obtainSymbolId('length');
const PRIM_ABS = obtainSymbolId('abs');
const PRIM_TRUNC = obtainSymbolId('trunc');
const PRIM_IS_PORT = obtainSymbolId('is_port');
const PRIM_IS_NUMBER = obtainSymbolId('is_number');
const PRIM_IS_INTEGER = obtainSymbolId('is_integer');
const PRIM_IS_LIST = obtainSymbolId('is_list');
const PRIM_IS_TUPLE = obtainSymbolId('is_tuple');
const PRIM_IS_ATOM = obtainSymbolId('is_atom');
const PRIM_IS_PID = obtainSymbolId('is_pid');
const PRIM_IS_BINARY = obtainSymbolId('is_binary');
const PRIM_IS_BOOLEAN = obtainSymbolId('is_boolean');
const PRIM_TUPLE_SIZE = obtainSymbolId('tuple_size');
const PRIM_NOT = obtainSymbolId('not');
const PRIM_HD = obtainSymbolId('hd');
const PRIM_TL = obtainSymbolId('tl');
const PRIM_GET = obtainSymbolId('get');
const PRIM_ELEMENT = obtainSymbolId('element');
const PRIM_AND = obtainSymbolId('and');
const PRIM_OR = obtainSymbolId('or');
const PRIM_APPLY = obtainSymbolId('apply');
const PRIM_YIELD = obtainSymbolId('yield');
const PRIM_OS = obtainSymbolId('os');
const PRIM_BAND = obtainSymbolId('band');
const PRIM_BSR = obtainSymbolId('bsr');
const PRIM_BSL = obtainSymbolId('bsl');
const PRIM_BOR = obtainSymbolId('bor');
const PRIM_BXOR = obtainSymbolId('bxor');

const PRIM_TIMESTAMP = obtainSymbolId('timestamp');
const PRIM_GETENV = obtainSymbolId('getenv');
const PRIM_PUTENV = obtainSymbolId('putenv');
const PRIM_ETS = obtainSymbolId('ets');
const PRIM_LISTS = obtainSymbolId('lists');
const PRIM_UNICODE = obtainSymbolId('unicode');
const PRIM_ERROR_LOGGER = obtainSymbolId('error_logger');
const PRIM_PRIM_FILE = obtainSymbolId('prim_file');
const PRIM_NET_KERNEL = obtainSymbolId('net_kernel');
const PRIM_SETNODE = obtainSymbolId('setnode');
const PRIM_CODE = obtainSymbolId('code');
const PRIM_FILE = obtainSymbolId('file');
const PRIM_MATH = obtainSymbolId('math');
const PRIM_BADARG = obtainSymbolId('badarg');
const PRIM_BADARITY = obtainSymbolId('badarity');

const PRIM_DELETE_OBJECT = obtainSymbolId('delete_object');
const PRIM_NEW = obtainSymbolId('new');
const PRIM_DELETE_KEY = obtainSymbolId('delete');
const PRIM_SELECT_DELETE = obtainSymbolId('select_delete');
const PRIM_SELECT = obtainSymbolId('select');
const PRIM_INSERT = obtainSymbolId('insert');
const PRIM_LOOKUP = obtainSymbolId('lookup');
const PRIM_LOOKUP_ELEMENT = obtainSymbolId('lookup_element');
const PRIM_SLOT = obtainSymbolId('slot');
const PRIM_FIRST = obtainSymbolId('first');
const PRIM_NEXT = obtainSymbolId('next');
const PRIM_ALL = obtainSymbolId('all');
const PRIM_INFO = obtainSymbolId('info');
const PRIM_MATCH = obtainSymbolId('match');
const PRIM_MATCH_OBJECT = obtainSymbolId('match_object');
const PRIM_MEMBER = obtainSymbolId('member');
const PRIM_KEYSEARCH = obtainSymbolId('keysearch');
const PRIM_KEYFIND = obtainSymbolId('keyfind');
const PRIM_KEYMEMBER = obtainSymbolId('keymember');
const PRIM_REVERSE = obtainSymbolId('reverse');
const PRIM_BIN_IS_7BIT = obtainSymbolId('bin_is_7bit');
const PRIM_CHARACTERS_TO_BINARY = obtainSymbolId('characters_to_binary');
const PRIM_CHARACTERS_TO_LIST = obtainSymbolId('characters_to_list');
const PRIM_WARNING_MAP = obtainSymbolId('warning_map');
const PRIM_DFLAG_UNICODE_IO = obtainSymbolId('dflag_unicode_io');
const PRIM_INTERNAL_NATIVE2NAME = obtainSymbolId('internal_native2name');
const PRIM_INTERNAL_NAME2NATIVE = obtainSymbolId('internal_name2native');
const PRIM_GET_CHUNK = obtainSymbolId('get_chunk');
const PRIM_NATIVE_NAME_ENCODING = obtainSymbolId('native_name_encoding');
const PRIM_LOG10 = obtainSymbolId('log10');
const PRIM_LOG = obtainSymbolId('log');
const PRIM_NOW = obtainSymbolId('now');
const PRIM_DATE = obtainSymbolId('date');
const PRIM_UNIVERSALTIME_TO_LOCALTIME = obtainSymbolId('universaltime_to_localtime');
const PRIM_LOCALTIME = obtainSymbolId('localtime');
const PRIM_TIME = obtainSymbolId('time');
const PRIM_STATISTICS = obtainSymbolId('statistics');
const PRIM_DIV = obtainSymbolId('div');
const PRIM_REM = obtainSymbolId('rem');
const PRIM_GROUP_LEADER = obtainSymbolId('group_leader');
const PRIM_GARBAGE_COLLECT = obtainSymbolId('garbage_collect');
const PRIM_CANCEL_TIMER = obtainSymbolId('cancel_timer');
const PRIM_MEMORY = obtainSymbolId('memory');
const PRIM_REGISTERED = obtainSymbolId('registered');
const PRIM_PROCESSES = obtainSymbolId('processes');
const PRIM_LIST_TO_PID = obtainSymbolId('list_to_pid');
const PRIM_PID_TO_LIST = obtainSymbolId('pid_to_list');
const PRIM_PORT_TO_LIST = obtainSymbolId('port_to_list');
const PRIM_FUN_TO_LIST = obtainSymbolId('fun_to_list');
const PRIM_FUN_INFO = obtainSymbolId('fun_info');
const PRIM_REGISTER = obtainSymbolId('register');
const PRIM_UNREGISTER = obtainSymbolId('unregister');
const PRIM_LIST_TO_FLOAT = obtainSymbolId('list_to_float');
const PRIM_FLOAT_TO_LIST = obtainSymbolId('float_to_list');
const PRIM_MAKE_TUPLE = obtainSymbolId('make_tuple');
const PRIM_WHEREIS = obtainSymbolId('whereis');
const PRIM_PROCESS_INFO = obtainSymbolId('process_info');
const PRIM_PROCESS_DISPLAY = obtainSymbolId('process_display');
const PRIM_IS_ALIVE = obtainSymbolId('is_alive');
const PRIM_PROCESS_FLAG = obtainSymbolId('process_flag');
const PRIM_GET_MODULE_INFO = obtainSymbolId('get_module_info');
const PRIM_SYSTEM_INFO = obtainSymbolId('system_info');
const PRIM_PRE_LOADED = obtainSymbolId('pre_loaded');
const PRIM_MODULE_LOADED = obtainSymbolId('module_loaded');
const PRIM_LOAD_MODULE = obtainSymbolId('load_module');
const PRIM_FUNCTION_EXPORTED = obtainSymbolId('function_exported');
const PRIM_MAKE_REF = obtainSymbolId('make_ref');
const PRIM_IOLIST_SIZE = obtainSymbolId('iolist_size');
const PRIM_LIST_TO_INTEGER = obtainSymbolId('list_to_integer');
const PRIM_INTEGER_TO_LIST = obtainSymbolId('integer_to_list');
const PRIM_IOLIST_TO_BINARY = obtainSymbolId('iolist_to_binary');
const PRIM_NODES = obtainSymbolId('nodes');
const PRIM_OPEN_PORT = obtainSymbolId('open_port');
const PRIM_PORT_COMMAND = obtainSymbolId('port_command');
const PRIM_PORT_CONTROL = obtainSymbolId('port_control');
const PRIM_PORT_CONNECT = obtainSymbolId('port_connect');
const PRIM_PORT_CLOSE = obtainSymbolId('port_close');
const PRIM_MONITOR = obtainSymbolId('monitor');
const PRIM_DEMONITOR = obtainSymbolId('demonitor');
const PRIM_IS_PROCESS_ALIVE = obtainSymbolId('is_process_alive');
const PRIM_LINK = obtainSymbolId('link');
const PRIM_UNLINK = obtainSymbolId('unlink');
const PRIM_DISPLAY = obtainSymbolId('display');
const PRIM_BUMP_REDUCTIONS = obtainSymbolId('bump_reductions');
const PRIM_GET_STACKTRACE = obtainSymbolId('get_stacktrace');
const PRIM_EXIT = obtainSymbolId('exit');
const PRIM_ERROR = obtainSymbolId('error');
const PRIM_THROW = obtainSymbolId('throw');
const PRIM_RAISE = obtainSymbolId('raise');
const PRIM_ATOM_TO_LIST = obtainSymbolId('atom_to_list');
const PRIM_TERM_TO_BINARY = obtainSymbolId('term_to_binary');
const PRIM_BINARY_TO_TERM = obtainSymbolId('binary_to_term');
const PRIM_SETELEMENT = obtainSymbolId('setelement');
const PRIM_LIST_TO_TUPLE = obtainSymbolId('list_to_tuple');
const PRIM_TUPLE_TO_LIST = obtainSymbolId('tuple_to_list');
const PRIM_LIST_TO_BINARY = obtainSymbolId('list_to_binary');
const PRIM_REF_TO_LIST = obtainSymbolId('ref_to_list');
const PRIM_SEND = obtainSymbolId('send');
const PRIM_SEND_AFTER = obtainSymbolId('send_after');
const PRIM_LIST_TO_ATOM = obtainSymbolId('list_to_atom');
const PRIM_BINARY_TO_LIST = obtainSymbolId('binary_to_list');
const PRIM_PHASH = obtainSymbolId('phash');
const PRIM_PUT_DATA = obtainSymbolId('put');
const PRIM_GET_DATA = obtainSymbolId('get');
const PRIM_ERASE = obtainSymbolId('erase');
const PRIM_MAKE_FUN = obtainSymbolId('make_fun');
const PRIM_SPAWN_OPT = obtainSymbolId('spawn_opt');
const PRIM_SPAWN = obtainSymbolId('spawn');
const PRIM_SPAWN_LINK = obtainSymbolId('spawn_link');
const PRIM_NONODE_NOHOST = obtainSymbolId('nonode@nohost');
const PRIM_PID = obtainSymbolId('pid');
const PRIM_EVAL = obtainSymbolId('eval');
const PRIM_GET_PROPERTY = obtainSymbolId('get');
const PRIM_SET_PROPERTY = obtainSymbolId('set');
const PRIM_CALL = obtainSymbolId('call');
const PRIM_JS = obtainSymbolId('js');
const PRIM_BROWSERL_DIST = obtainSymbolId('browserl_dist');
const PRIM_LISTEN = obtainSymbolId('listen');
const PRIM_ACCEPT = obtainSymbolId('accept');
const PRIM_CHILD_SPECS = obtainSymbolId('childspecs');
const PRIM_RE = obtainSymbolId('re');
const PRIM_RUN = obtainSymbolId('run');

// Special character symbols
const SYM_MINUS_SIGN = obtainSymbolId('-');
const SYM_EQUAL_EXACT_COMPARATOR = obtainSymbolId('=:=');
const SYM_NOT_EQUAL_EXACT_COMPARATOR = obtainSymbolId('=/=');
const SYM_EQUAL_COMPARATOR = obtainSymbolId('==');
const SYM_GREATER_THAN_SIGN = obtainSymbolId('>');
const SYM_LESS_THAN_SIGN = obtainSymbolId('<');
const SYM_GREATER_EQUAL_SIGN = obtainSymbolId('>=');
const SYM_LESS_EQUAL_SIGN = obtainSymbolId('=<');
const SYM_NOT_EQUAL_COMPARATOR = obtainSymbolId('/=');
const SYM_ASSIGNMENT_OPERATOR = obtainSymbolId('=');
const SYM_PLUS_SIGN = obtainSymbolId('+');
const SYM_MULTIPLY_SIGN = obtainSymbolId('*');
const SYM_DIVIDE_SIGN = obtainSymbolId('/');
const SYM_EXCLAMATION_MARK = obtainSymbolId('!');
const SYM_PLUS_PLUS_OPERATOR = obtainSymbolId('++');
const SYM_MINUS_MINUS_OPERATOR = obtainSymbolId('--');


// Polyfill for Date.now if not present
if (!Date.now) {
  Date.now = function retrieveCurrentTime() {
    return +new Date();
  };
}

// Universal interface for data extraction from Uint8Array, Array, or String
if (window.Uint8Array) {
  Uint8Array.prototype.fetchTextSegment = function(startIdx, segmentLength) {
    let resultString = '';
    let currentIdx;
    for (currentIdx = 0; currentIdx < segmentLength; currentIdx++) {
      resultString += String.fromCharCode(this[startIdx + currentIdx]);
    }
    return resultString;
  };

  Uint8Array.prototype.fetchNullTerminatedText = function(startIdx, maxSegmentLength) {
    let resultString = '';
    let charValue;
    let currentIdx = 0;
    while (currentIdx < maxSegmentLength) {
      charValue = this[startIdx + (currentIdx++)];
      if (charValue === 0) break;
      resultString += String.fromCharCode(charValue);
    }
    return resultString;
  };

  Uint8Array.prototype.extractSingleByte = function(bytePosition) {
    return this[bytePosition];
  };

  Uint8Array.prototype.extract32BitInteger = function(startPosition) {
    return (this[startPosition] << 24) + (this[startPosition + 1] << 16) + (this[startPosition + 2] << 8) + this[startPosition + 3];
  };
}

Array.prototype.fetchTextSegment = function(startIdx, segmentLength) {
  let resultString = '';
  let currentIdx;
  for (currentIdx = 0; currentIdx < segmentLength; currentIdx++) {
    resultString += String.fromCharCode(this[startIdx + currentIdx]);
  }
  return resultString;
};

Array.prototype.fetchNullTerminatedText = function(startIdx, maxSegmentLength) {
  let resultString = '';
  let charValue;
  let currentIdx = 0;
  while (currentIdx < maxSegmentLength) {
    charValue = this[startIdx + (currentIdx++)];
    if (charValue === 0) break;
    resultString += String.fromCharCode(charValue);
  }
  return resultString;
};

Array.prototype.extractSingleByte = function(bytePosition) {
  return this[bytePosition];
};

Array.prototype.extract32BitInteger = function(startPosition) {
  return (this[startPosition] << 24) + (this[startPosition + 1] << 16) + (this[startPosition + 2] << 8) + this[startPosition + 3];
};

Array.prototype.obtainSubArray = function(startIndex, endIndex) {
  // Array.prototype.slice might not work consistently in older browsers
  let newSubArray = new Array(endIndex - startIndex);
  let k;
  for (k = startIndex; k < endIndex; k++) {
    newSubArray[k - startIndex] = this[k];
  }
  return newSubArray;
};

String.prototype.fetchNullTerminatedText = function(startIdx, maxSegmentLength) {
  let resultString = '';
  let charValue;
  let currentIdx = 0;
  while (currentIdx < maxSegmentLength) {
    charValue = this.charCodeAt(startIdx + (currentIdx++));
    if (charValue === 0) break;
    resultString += String.fromCharCode(charValue);
  }
  return resultString;
};

String.prototype.extractSingleByte = function(bytePosition) {
  return this.charCodeAt(bytePosition) & 255;
};

String.prototype.extract32BitInteger = function(startPosition) {
  return (this.extractSingleByte(startPosition) << 24) + (this.extractSingleByte(startPosition + 1) << 16) +
         (this.extractSingleByte(startPosition + 2) << 8) + this.extractSingleByte(startPosition + 3);
};

String.prototype.fetchTextSegment = function(startIdx, segmentLength) {
  let resultString = '';
  let currentIdx;
  for (currentIdx = 0; currentIdx < segmentLength; currentIdx++) {
    resultString += String.fromCharCode(this.extractSingleByte(startIdx + currentIdx));
  }
  return resultString;
};

String.prototype.obtainSubArray = function(startIndex, endIndex) {
  let newSubArray = [];
  let k;
  for (k = startIndex; k < endIndex; k++) {
    newSubArray.push(this.extractSingleByte(k));
  }
  return newSubArray;
};

// Not utilizing Float64Array as typed arrays are not universally supported
function extractDoubleValue(byteData, startPosition) {
  const signBit = byteData.extract32BitInteger(startPosition) >> 31;
  const exponentBits = (byteData.extract32BitInteger(startPosition) >> 20) & ((1 << 11) - 1);
  const fractionHigh = byteData.extract32BitInteger(startPosition) & ((1 << 20) - 1);
  const fractionLow = byteData.extract32BitInteger(startPosition + 4);
  const fullFraction = fractionHigh * 0x100000000 + Math.abs(fractionLow);
  let numericalResult;
  if (exponentBits === 0) {
    numericalResult = Math.pow(2, exponentBits - 1023) * (Math.abs(fullFraction / (4503599627370496 / 2))); // 1 << 51
  } else {
    numericalResult = Math.pow(2, exponentBits - 1023) * (1 + Math.abs(fullFraction / 4503599627370496)); // 1 << 52
  }
  if (signBit === -1) numericalResult = -numericalResult;
//  logDebugMessage1('extractDoubleValue:' + signBit + ':' + exponentBits + ':' + fullFraction + ':' + numericalResult);
  return numericalResult;
}

function convertDoubleToArray(inputNumber, bitPrecision) { // TODO: implement for 32 bits
  const signIndicator = (inputNumber < 0) ? 1 : 0;
  let exponentVal = 0;
  let mantissaVal = 0;
  inputNumber = Math.abs(inputNumber);
  if (inputNumber !== 0) {
    while (inputNumber >= 2) {
      exponentVal++;
      inputNumber /= 2;
    }
    while (inputNumber < 1) {
      exponentVal--;
      inputNumber *= 2;
    }
  } else {
    exponentVal = -1023;
    inputNumber = 1;
  } // TODO: handle denormalized numbers
//  console.log("exponent: " + (exponentVal + 1023) + " mantissa: " + (inputNumber - 1) * 0x10000000000000); // 1 << 52
  const low32bits = (inputNumber - 1) * 4503599627370496 & 0xffffffff; // Shift mantissa 52 bits and mask out lowest 32
  const high32bits = ((inputNumber - 1) * Math.pow(2, 20)) & 0xfffff | (Math.abs(exponentVal + 1023) << 20) | (signIndicator << 31);
  return [
    high32bits >>> 24, (high32bits >>> 16) & 0xff, (high32bits >>> 8) & 0xff, high32bits & 0xff,
    low32bits >>> 24, (low32bits >>> 16) & 0xff, (low32bits >>> 8) & 0xff, low32bits & 0xff
  ];
}

function deserializeToTerm(dataBytes, isInitialLoad){
  let currentPosition = 1;
  if (dataBytes[0] !== 131) throw 'Not a valid term representation: ' + dataBytes.charCodeAt(0);
  return parseTermComponent(dataBytes, 1);

  function parseTermComponent() {
    switch(dataBytes[currentPosition++]) {
      case 70: // Float constant?
        const floatValue = extractDoubleValue(dataBytes, currentPosition);
        currentPosition += 8;
        return {type: PRIM_FLOAT, value: floatValue};
      case 77: // Bitstring (used in erl_eval_SUITE, and many more)
        const byteCount = retrieveIntegerFromBytes(dataBytes, currentPosition, 4);
        const bitsInLastByte = retrieveIntegerFromBytes(dataBytes, currentPosition + 4, 1);
        currentPosition += 4 + byteCount + 1;
        return {type: 'bitstring', value: dataBytes.fetchTextSegment(currentPosition - byteCount, byteCount + 1),
                len: byteCount * 8 + bitsInLastByte};
      case 97: // Small integer
        return retrieveIntegerFromBytes(dataBytes, currentPosition++, 1);
      case 98: // Integer
        currentPosition += 4;
        return retrieveIntegerFromBytes(dataBytes, currentPosition - 4, 4);
      case 100: // Atom
        const atomLength = retrieveIntegerFromBytes(dataBytes, currentPosition, 2);
        currentPosition += atomLength + 2;
        const atomText = dataBytes.fetchTextSegment(currentPosition - atomLength, atomLength);
        if (isInitialLoad) return obtainSymbolId(atomText);
        return mapStringToSymbol(atomText); // Assuming mapStringToSymbol is an external function
      case 103: // Pid_ext
        const nodeIdentity = parseTermComponent();
        const processId = retrieveIntegerFromBytes(dataBytes, currentPosition, 4);
        currentPosition += 4;
        const serialNum = retrieveIntegerFromBytes(dataBytes, currentPosition, 4);
        currentPosition += 4;
        const creationTime = retrieveIntegerFromBytes(dataBytes, currentPosition, 1);
        currentPosition += 1;
        if (nodeIdentity === current_node_designation) return {type: PRIM_PID, value: processId}; // Assuming current_node_designation is an external global
        return {type: PRIM_PID, value: [nodeIdentity, processId, serialNum, creationTime]};
      case 104: // Small tuple
        let tupleSize = retrieveIntegerFromBytes(dataBytes, currentPosition, 1);
        const tupleElements = [];
        currentPosition += 1;
        while (tupleSize--) { tupleElements.push(parseTermComponent()); }
        return tupleElements;
      case 106: // Nil
        return 2 << 27;
      case 107: // String
        const stringLength = retrieveIntegerFromBytes(dataBytes, currentPosition, 2);
        currentPosition += stringLength + 2;
        return convertStringToLinkedList(dataBytes.fetchTextSegment(currentPosition - stringLength, stringLength)); // Assuming convertStringToLinkedList is external
      case 108: // List
        let listLength = retrieveIntegerFromBytes(dataBytes, currentPosition, 4);
        let nextListItem = 2 << 27;
        currentPosition += 4;
        while (listLength--) {
          const listItem = parseTermComponent();
          nextListItem = {value: listItem, next: nextListItem};
        }
        if (dataBytes[currentPosition] !== 106) {
          return reverseLinkedList(nextListItem, parseTermComponent()); // Assuming reverseLinkedList is external
        }
        currentPosition++;
        return reverseLinkedList(nextListItem, 2 << 27);
      case 109:
        const binaryLength = retrieveIntegerFromBytes(dataBytes, currentPosition, 4);
        currentPosition += 4 + binaryLength;
        return dataBytes.fetchTextSegment(currentPosition - binaryLength, binaryLength);
    }
  }
}