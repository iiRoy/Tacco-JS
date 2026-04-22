'use strict';

class SymbolRepository {
    #nameToIdMapping = new Map();
    #idToNameArray = [];
    #nextIdentifier = 0;

    constructor() {
        this.store("false");
        this.store("true");
    }

    store(symbolText) {
        if (this.#nameToIdMapping.has(symbolText)) {
            return this.#nameToIdMapping.get(symbolText);
        }
        const currentId = this.#nextIdentifier++;
        this.#nameToIdMapping.set(symbolText, currentId);
        this.#idToNameArray[currentId] = symbolText;
        return currentId;
    }

    retrieve(identifier) {
        return this.#idToNameArray[identifier];
    }
}

const systemSymbolTable = new SymbolRepository();

const BOOLEAN_TRUE_SYMBOL = systemSymbolTable.store('true');
const BOOLEAN_FALSE_SYMBOL = systemSymbolTable.store('false');
const ERLANG_MODULE_SYMBOL = systemSymbolTable.store('erlang');
const SELF_PROCESS_SYMBOL = systemSymbolTable.store('self');
const NODE_IDENTIFIER_SYMBOL = systemSymbolTable.store('node');
const OPERATION_SUCCESS_SYMBOL = systemSymbolTable.store('ok');
const ROUND_FUNCTION_SYMBOL = systemSymbolTable.store('round');
const FLOAT_TYPE_SYMBOL = systemSymbolTable.store('float');
const SIZE_FUNCTION_SYMBOL = systemSymbolTable.store('size');
const BYTE_COUNT_FUNCTION_SYMBOL = systemSymbolTable.store('byte_size');
const BIT_COUNT_FUNCTION_SYMBOL = systemSymbolTable.store('bit_size');
const LENGTH_FUNCTION_SYMBOL = systemSymbolTable.store('length');
const ABSOLUTE_VALUE_FUNCTION_SYMBOL = systemSymbolTable.store('abs');
const TRUNCATE_FUNCTION_SYMBOL = systemSymbolTable.store('trunc');
const IS_PORT_PREDICATE_SYMBOL = systemSymbolTable.store('is_port');
const IS_NUMBER_PREDICATE_SYMBOL = systemSymbolTable.store('is_number');
const IS_INTEGER_PREDICATE_SYMBOL = systemSymbolTable.store('is_integer');
const IS_LIST_PREDICATE_SYMBOL = systemSymbolTable.store('is_list');
const IS_TUPLE_PREDICATE_SYMBOL = systemSymbolTable.store('is_tuple');
const IS_ATOM_PREDICATE_SYMBOL = systemSymbolTable.store('is_atom');
const IS_PID_PREDICATE_SYMBOL = systemSymbolTable.store('is_pid');
const IS_BINARY_PREDICATE_SYMBOL = systemSymbolTable.store('is_binary');
const IS_BOOLEAN_PREDICATE_SYMBOL = systemSymbolTable.store('is_boolean');
const TUPLE_SIZE_FUNCTION_SYMBOL = systemSymbolTable.store('tuple_size');
const NOT_OPERATOR_SYMBOL = systemSymbolTable.store('not');
const HEAD_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('hd');
const TAIL_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('tl');
const GET_OPERATION_SYMBOL = systemSymbolTable.store('get');
const ELEMENT_ACCESS_FUNCTION_SYMBOL = systemSymbolTable.store('element');
const AND_OPERATOR_SYMBOL = systemSymbolTable.store('and');
const OR_OPERATOR_SYMBOL = systemSymbolTable.store('or');
const APPLY_FUNCTION_SYMBOL = systemSymbolTable.store('apply');
const YIELD_KEYWORD_SYMBOL = systemSymbolTable.store('yield');
const OS_MODULE_SYMBOL = systemSymbolTable.store('os');
const BITWISE_AND_SYMBOL = systemSymbolTable.store('band');
const BITWISE_SHIFT_RIGHT_SYMBOL = systemSymbolTable.store('bsr');
const BITWISE_SHIFT_LEFT_SYMBOL = systemSymbolTable.store('bsl');
const BITWISE_OR_SYMBOL = systemSymbolTable.store('bor');
const BITWISE_XOR_SYMBOL = systemSymbolTable.store('bxor');

const TIMESTAMP_FUNCTION_SYMBOL = systemSymbolTable.store('timestamp');
const GET_ENVIRONMENT_VARIABLE_SYMBOL = systemSymbolTable.store('getenv');
const SET_ENVIRONMENT_VARIABLE_SYMBOL = systemSymbolTable.store('putenv');
const ETS_MODULE_SYMBOL = systemSymbolTable.store('ets');
const LISTS_MODULE_SYMBOL = systemSymbolTable.store('lists');
const UNICODE_MODULE_SYMBOL = systemSymbolTable.store('unicode');
const ERROR_LOGGER_MODULE_SYMBOL = systemSymbolTable.store('error_logger');
const PRIM_FILE_MODULE_SYMBOL = systemSymbolTable.store('prim_file');
const NET_KERNEL_MODULE_SYMBOL = systemSymbolTable.store('net_kernel');
const SET_NODE_FUNCTION_SYMBOL = systemSymbolTable.store('setnode');
const CODE_MODULE_SYMBOL = systemSymbolTable.store('code');
const FILE_MODULE_SYMBOL = systemSymbolTable.store('file');
const MATH_MODULE_SYMBOL = systemSymbolTable.store('math');
const BAD_ARGUMENT_ERROR_SYMBOL = systemSymbolTable.store('badarg');
const BAD_ARITY_ERROR_SYMBOL = systemSymbolTable.store('badarity');

const DELETE_OBJECT_FUNCTION_SYMBOL = systemSymbolTable.store('delete_object');
const NEW_OPERATION_SYMBOL = systemSymbolTable.store('new');
const DELETE_OPERATION_SYMBOL = systemSymbolTable.store('delete');
const SELECT_DELETE_OPERATION_SYMBOL = systemSymbolTable.store('select_delete');
const SELECT_OPERATION_SYMBOL = systemSymbolTable.store('select');
const INSERT_OPERATION_SYMBOL = systemSymbolTable.store('insert');
const LOOKUP_OPERATION_SYMBOL = systemSymbolTable.store('lookup');
const LOOKUP_ELEMENT_OPERATION_SYMBOL = systemSymbolTable.store('lookup_element');
const SLOT_ACCESS_SYMBOL = systemSymbolTable.store('slot');
const FIRST_ELEMENT_SYMBOL = systemSymbolTable.store('first');
const NEXT_ELEMENT_SYMBOL = systemSymbolTable.store('next');
const ALL_ELEMENTS_SYMBOL = systemSymbolTable.store('all');
const INFO_FUNCTION_SYMBOL = systemSymbolTable.store('info');
const MATCH_FUNCTION_SYMBOL = systemSymbolTable.store('match');
const MATCH_OBJECT_FUNCTION_SYMBOL = systemSymbolTable.store('match_object');
const MEMBER_PREDICATE_SYMBOL = systemSymbolTable.store('member');
const KEY_SEARCH_FUNCTION_SYMBOL = systemSymbolTable.store('keysearch');
const KEY_FIND_FUNCTION_SYMBOL = systemSymbolTable.store('keyfind');
const KEY_MEMBER_PREDICATE_SYMBOL = systemSymbolTable.store('keymember');
const REVERSE_FUNCTION_SYMBOL = systemSymbolTable.store('reverse');
const BIN_IS_7BIT_PREDICATE_SYMBOL = systemSymbolTable.store('bin_is_7bit');
const CHARACTERS_TO_BINARY_SYMBOL = systemSymbolTable.store('characters_to_binary');
const CHARACTERS_TO_LIST_SYMBOL = systemSymbolTable.store('characters_to_list');
const WARNING_MAP_SYMBOL = systemSymbolTable.store('warning_map');
const DFLAG_UNICODE_IO_SYMBOL = systemSymbolTable.store('dflag_unicode_io');
const INTERNAL_NATIVE2NAME_SYMBOL = systemSymbolTable.store('internal_native2name');
const INTERNAL_NAME2NATIVE_SYMBOL = systemSymbolTable.store('internal_name2native');
const GET_CHUNK_FUNCTION_SYMBOL = systemSymbolTable.store('get_chunk');
const NATIVE_NAME_ENCODING_SYMBOL = systemSymbolTable.store('native_name_encoding');
const LOG10_FUNCTION_SYMBOL = systemSymbolTable.store('log10');
const LOG_FUNCTION_SYMBOL = systemSymbolTable.store('log');
const NOW_FUNCTION_SYMBOL = systemSymbolTable.store('now');
const DATE_FUNCTION_SYMBOL = systemSymbolTable.store('date');
const UNIVERSALTIME_TO_LOCALTIME_SYMBOL = systemSymbolTable.store('universaltime_to_localtime');
const LOCALTIME_FUNCTION_SYMBOL = systemSymbolTable.store('localtime');
const TIME_FUNCTION_SYMBOL = systemSymbolTable.store('time');
const STATISTICS_FUNCTION_SYMBOL = systemSymbolTable.store('statistics');
const INTEGER_DIVISION_SYMBOL = systemSymbolTable.store('div');
const REMAINDER_SYMBOL = systemSymbolTable.store('rem');
const GROUP_LEADER_FUNCTION_SYMBOL = systemSymbolTable.store('group_leader');
const GARBAGE_COLLECT_FUNCTION_SYMBOL = systemSymbolTable.store('garbage_collect');
const CANCEL_TIMER_FUNCTION_SYMBOL = systemSymbolTable.store('cancel_timer');
const MEMORY_FUNCTION_SYMBOL = systemSymbolTable.store('memory');
const REGISTERED_PROCESSES_SYMBOL = systemSymbolTable.store('registered');
const PROCESSES_LIST_SYMBOL = systemSymbolTable.store('processes');
const LIST_TO_PID_FUNCTION_SYMBOL = systemSymbolTable.store('list_to_pid');
const PID_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('pid_to_list');
const PORT_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('port_to_list');
const FUNCTION_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('fun_to_list');
const FUNCTION_INFO_FUNCTION_SYMBOL = systemSymbolTable.store('fun_info');
const REGISTER_FUNCTION_SYMBOL = systemSymbolTable.store('register');
const UNREGISTER_FUNCTION_SYMBOL = systemSymbolTable.store('unregister');
const LIST_TO_FLOAT_FUNCTION_SYMBOL = systemSymbolTable.store('list_to_float');
const FLOAT_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('float_to_list');
const MAKE_TUPLE_FUNCTION_SYMBOL = systemSymbolTable.store('make_tuple');
const WHEREIS_FUNCTION_SYMBOL = systemSymbolTable.store('whereis');
const PROCESS_INFO_FUNCTION_SYMBOL = systemSymbolTable.store('process_info');
const PROCESS_DISPLAY_FUNCTION_SYMBOL = systemSymbolTable.store('process_display');
const IS_ALIVE_PREDICATE_SYMBOL = systemSymbolTable.store('is_alive');
const PROCESS_FLAG_FUNCTION_SYMBOL = systemSymbolTable.store('process_flag');
const GET_MODULE_INFO_FUNCTION_SYMBOL = systemSymbolTable.store('get_module_info');
const SYSTEM_INFO_FUNCTION_SYMBOL = systemSymbolTable.store('system_info');
const PRE_LOADED_MODULES_SYMBOL = systemSymbolTable.store('pre_loaded');
const MODULE_LOADED_SYMBOL = systemSymbolTable.store('module_loaded');
const LOAD_MODULE_FUNCTION_SYMBOL = systemSymbolTable.store('load_module');
const FUNCTION_EXPORTED_PREDICATE_SYMBOL = systemSymbolTable.store('function_exported');
const MAKE_REFERENCE_FUNCTION_SYMBOL = systemSymbolTable.store('make_ref');
const IO_LIST_SIZE_FUNCTION_SYMBOL = systemSymbolTable.store('iolist_size');
const LIST_TO_INTEGER_FUNCTION_SYMBOL = systemSymbolTable.store('list_to_integer');
const INTEGER_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('integer_to_list');
const IO_LIST_TO_BINARY_FUNCTION_SYMBOL = systemSymbolTable.store('iolist_to_binary');
const NODES_FUNCTION_SYMBOL = systemSymbolTable.store('nodes');
const OPEN_PORT_FUNCTION_SYMBOL = systemSymbolTable.store('open_port');
const PORT_COMMAND_FUNCTION_SYMBOL = systemSymbolTable.store('port_command');
const PORT_CONTROL_FUNCTION_SYMBOL = systemSymbolTable.store('port_control');
const PORT_CONNECT_FUNCTION_SYMBOL = systemSymbolTable.store('port_connect');
const PORT_CLOSE_FUNCTION_SYMBOL = systemSymbolTable.store('port_close');
const MONITOR_FUNCTION_SYMBOL = systemSymbolTable.store('monitor');
const DEMONITOR_FUNCTION_SYMBOL = systemSymbolTable.store('demonitor');
const IS_PROCESS_ALIVE_PREDICATE_SYMBOL = systemSymbolTable.store('is_process_alive');
const LINK_FUNCTION_SYMBOL = systemSymbolTable.store('link');
const UNLINK_FUNCTION_SYMBOL = systemSymbolTable.store('unlink');
const DISPLAY_FUNCTION_SYMBOL = systemSymbolTable.store('display');
const BUMP_REDUCTIONS_FUNCTION_SYMBOL = systemSymbolTable.store('bump_reductions');
const GET_STACKTRACE_FUNCTION_SYMBOL = systemSymbolTable.store('get_stacktrace');
const EXIT_FUNCTION_SYMBOL = systemSymbolTable.store('exit');
const ERROR_TYPE_SYMBOL = systemSymbolTable.store('error');
const THROW_FUNCTION_SYMBOL = systemSymbolTable.store('throw');
const RAISE_FUNCTION_SYMBOL = systemSymbolTable.store('raise');
const ATOM_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('atom_to_list');
const TERM_TO_BINARY_FUNCTION_SYMBOL = systemSymbolTable.store('term_to_binary');
const BINARY_TO_TERM_FUNCTION_SYMBOL = systemSymbolTable.store('binary_to_term');
const SET_ELEMENT_FUNCTION_SYMBOL = systemSymbolTable.store('setelement');
const LIST_TO_TUPLE_FUNCTION_SYMBOL = systemSymbolTable.store('list_to_tuple');
const TUPLE_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('tuple_to_list');
const LIST_TO_BINARY_FUNCTION_SYMBOL = systemSymbolTable.store('list_to_binary');
const REF_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('ref_to_list');
const SEND_MESSAGE_FUNCTION_SYMBOL = systemSymbolTable.store('send');
const SEND_AFTER_FUNCTION_SYMBOL = systemSymbolTable.store('send_after');
const LIST_TO_ATOM_FUNCTION_SYMBOL = systemSymbolTable.store('list_to_atom');
const BINARY_TO_LIST_FUNCTION_SYMBOL = systemSymbolTable.store('binary_to_list');
const PHASH_FUNCTION_SYMBOL = systemSymbolTable.store('phash');
const PUT_OPERATION_SYMBOL = systemSymbolTable.store('put');
const ERASE_OPERATION_SYMBOL = systemSymbolTable.store('erase');
const MAKE_FUNCTION_SYMBOL = systemSymbolTable.store('make_fun');
const SPAWN_OPT_FUNCTION_SYMBOL = systemSymbolTable.store('spawn_opt');
const SPAWN_FUNCTION_SYMBOL = systemSymbolTable.store('spawn');
const SPAWN_LINK_FUNCTION_SYMBOL = systemSymbolTable.store('spawn_link');
const NONODE_NOHOST_SYMBOL = systemSymbolTable.store('nonode@nohost');
const PID_TYPE_SYMBOL = systemSymbolTable.store('pid');
const EVAL_FUNCTION_SYMBOL = systemSymbolTable.store('eval');
const SET_FUNCTION_SYMBOL = systemSymbolTable.store('set');
const CALL_FUNCTION_SYMBOL = systemSymbolTable.store('call');
const JS_MODULE_SYMBOL = systemSymbolTable.store('js');
const BROWSERL_DIST_MODULE_SYMBOL = systemSymbolTable.store('browserl_dist');
const LISTEN_FUNCTION_SYMBOL = systemSymbolTable.store('listen');
const ACCEPT_FUNCTION_SYMBOL = systemSymbolTable.store('accept');
const CHILD_SPECS_SYMBOL = systemSymbolTable.store('childspecs');
const RE_MODULE_SYMBOL = systemSymbolTable.store('re');
const RUN_FUNCTION_SYMBOL = systemSymbolTable.store('run');

const MINUS_SIGN_SYMBOL = systemSymbolTable.store('-');
const EQUAL_EXACT_SIGN_SYMBOL = systemSymbolTable.store('=:=');
const NOT_EQUAL_EXACT_SIGN_SYMBOL = systemSymbolTable.store('=/=');
const EQUAL_SIGN_SYMBOL = systemSymbolTable.store('==');
const GREATER_THAN_SIGN_SYMBOL = systemSymbolTable.store('>');
const LESS_THAN_SIGN_SYMBOL = systemSymbolTable.store('<');
const GREATER_THAN_OR_EQUAL_SIGN_SYMBOL = systemSymbolTable.store('>=');
const LESS_THAN_OR_EQUAL_SIGN_SYMBOL = systemSymbolTable.store('=<');
const NOT_EQUAL_SIGN_SYMBOL = systemSymbolTable.store('/=');
const ASSIGNMENT_SIGN_SYMBOL = systemSymbolTable.store('=');
const PLUS_SIGN_SYMBOL = systemSymbolTable.store('+');
const MULTIPLY_SIGN_SYMBOL = systemSymbolTable.store('*');
const DIVIDE_SIGN_SYMBOL = systemSymbolTable.store('/');
const EXCLAMATION_SIGN_SYMBOL = systemSymbolTable.store('!');
const CONCATENATE_SIGN_SYMBOL = systemSymbolTable.store('++');
const DIFFERENCE_SIGN_SYMBOL = systemSymbolTable.store('--');

class ErlangProcessIdentifier {
    constructor(nodeNameIdentifier, localIdValue, serialNumber, creationValue) {
        this.nodeId = nodeNameIdentifier;
        this.localId = localIdValue;
        this.serial = serialNumber;
        this.creation = creationValue;
    }
}

class ErlangBitstringValue {
    constructor(octetData, bitsInFinalOctet) {
        this.octetSequence = octetData;
        this.finalOctetBitCount = bitsInFinalOctet;
    }
}

class OctetBufferInterpreter {
    #sourceBytes;
    #currentPosition = 0;
    #dataViewAccessor;

    constructor(inputBytes) {
        if (inputBytes instanceof Uint8Array) {
            this.#sourceBytes = inputBytes;
        } else if (Array.isArray(inputBytes)) {
            this.#sourceBytes = new Uint8Array(inputBytes);
        } else if (typeof inputBytes === 'string') {
            const tempArray = new Uint8Array(inputBytes.length);
            for (let i = 0; i < inputBytes.length; i++) {
                tempArray[i] = inputBytes.charCodeAt(i) & 0xFF;
            }
            this.#sourceBytes = tempArray;
        } else {
            throw new Error("Unsupported input type for OctetBufferInterpreter.");
        }
        this.#dataViewAccessor = new DataView(this.#sourceBytes.buffer, this.#sourceBytes.byteOffset, this.#sourceBytes.byteLength);
    }

    readSingleOctet() {
        if (this.#currentPosition >= this.#sourceBytes.length) {
            throw new Error("Octet buffer exhausted.");
        }
        return this.#sourceBytes[this.#currentPosition++];
    }

    readUnsigned16BitInteger() {
        const value = this.#dataViewAccessor.getUint16(this.#currentPosition, false); // Big-endian
        this.#currentPosition += 2;
        return value;
    }

    readSigned32BitInteger() {
        const value = this.#dataViewAccessor.getInt32(this.#currentPosition, false); // Big-endian
        this.#currentPosition += 4;
        return value;
    }

    readUnsigned32BitInteger() {
        const value = this.#dataViewAccessor.getUint32(this.#currentPosition, false); // Big-endian
        this.#currentPosition += 4;
        return value;
    }

    readDoublePrecisionFloat() {
        const value = this.#dataViewAccessor.getFloat64(this.#currentPosition, false); // Big-endian
        this.#currentPosition += 8;
        return value;
    }

    readFixedSizeString(length) {
        if (this.#currentPosition + length > this.#sourceBytes.length) {
            throw new Error("Cannot read string, buffer too short.");
        }
        const startIdx = this.#currentPosition;
        this.#currentPosition += length;
        return String.fromCharCode(...this.#sourceBytes.subarray(startIdx, this.#currentPosition));
    }

    readOctetSpan(length) {
        if (this.#currentPosition + length > this.#sourceBytes.length) {
            throw new Error("Cannot read octet span, buffer too short.");
        }
        const startIdx = this.#currentPosition;
        this.#currentPosition += length;
        return this.#sourceBytes.subarray(startIdx, this.#currentPosition);
    }

    advancePosition(count) {
        this.#currentPosition += count;
        if (this.#currentPosition > this.#sourceBytes.length) {
            throw new Error("Attempted to advance past buffer end.");
        }
    }
}

const EXTERNAL_TERM_MAGIC = 131;
const FLOAT_TAG = 70;
const BIT_BINARY_TAG = 77;
const SMALL_INTEGER_TAG = 97;
const INTEGER_TAG = 98;
const ATOM_TAG = 100;
const PID_TAG = 103;
const SMALL_TUPLE_TAG = 104;
const NIL_TAG = 106;
const STRING_TAG = 107;
const LIST_TAG = 108;
const BINARY_TAG = 109;

function decodeErlangExternalData(inputBuffer, atomRepository = systemSymbolTable, localNodeName = null) {
    const interpreter = new OctetBufferInterpreter(inputBuffer);

    if (interpreter.readSingleOctet() !== EXTERNAL_TERM_MAGIC) {
        throw new Error("Input is not a valid Erlang external term format.");
    }

    const termTypeHandlers = {
        [FLOAT_TAG]: () => {
            return interpreter.readDoublePrecisionFloat();
        },
        [BIT_BINARY_TAG]: () => {
            const byteLength = interpreter.readUnsigned32BitInteger();
            const bitsInLast = interpreter.readSingleOctet();
            const byteData = interpreter.readOctetSpan(byteLength);
            return new ErlangBitstringValue(byteData, bitsInLast);
        },
        [SMALL_INTEGER_TAG]: () => {
            return interpreter.readSingleOctet();
        },
        [INTEGER_TAG]: () => {
            return interpreter.readSigned32BitInteger();
        },
        [ATOM_TAG]: () => {
            const length = interpreter.readUnsigned16BitInteger();
            const atomString = interpreter.readFixedSizeString(length);
            return atomRepository.store(atomString);
        },
        [PID_TAG]: () => {
            const nodeSymbolId = parseNextTerm();
            const pidId = interpreter.readUnsigned32BitInteger();
            const pidSerial = interpreter.readUnsigned32BitInteger();
            const pidCreation = interpreter.readSingleOctet();
            const resolvedNode = atomRepository.retrieve(nodeSymbolId);
            if (localNodeName && resolvedNode === localNodeName) {
                // Special handling for local PIDs if needed, e.g., return simpler representation
                // For Type IV, returning the full object is distinct enough.
            }
            return new ErlangProcessIdentifier(nodeSymbolId, pidId, pidSerial, pidCreation);
        },
        [SMALL_TUPLE_TAG]: () => {
            const arity = interpreter.readSingleOctet();
            const elements = [];
            for (let i = 0; i < arity; i++) {
                elements.push(parseNextTerm());
            }
            return elements; // JS array represents Erlang tuple
        },
        [NIL_TAG]: () => {
            return atomRepository.store('[]'); // Erlang empty list as an atom or a specific constant
        },
        [STRING_TAG]: () => {
            const length = interpreter.readUnsigned16BitInteger();
            const jsString = interpreter.readFixedSizeString(length);
            return Array.from(jsString).map(char => char.charCodeAt(0)); // Erlang string is list of integers
        },
        [LIST_TAG]: () => {
            const length = interpreter.readUnsigned32BitInteger();
            const elements = [];
            for (let i = 0; i < length; i++) {
                elements.push(parseNextTerm());
            }
            if (interpreter.readSingleOctet() !== NIL_TAG) {
                throw new Error("List terminator (NIL_EXT) expected but not found.");
            }
            return elements; // JS array represents Erlang list
        },
        [BINARY_TAG]: () => {
            const length = interpreter.readUnsigned32BitInteger();
            return interpreter.readFixedSizeString(length); // Represent binary as JS string or Uint8Array
        }
    };

    function parseNextTerm() {
        const tagByte = interpreter.readSingleOctet();
        const handler = termTypeHandlers[tagByte];
        if (!handler) {
            throw new Error(`Unknown Erlang term tag: ${tagByte}`);
        }
        return handler();
    }

    return parseNextTerm();
}

if (!Date.now) {
    Date.now = function() {
        return new Date().getTime();
    };
}