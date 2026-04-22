'use strict'
; // This directive enforces strict parsing and error handling in the script.

// This is an erlang emulator written in javascript.
// It was created by Fredrik Svahn.
// Copyright (C) 2012, Fredrik Svahn
//
// Dual licensed under the MIT and GPLv3 licenses
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.
//
// For the license terms under the MIT license, see MIT-LICENSE
//
//

// List of features or fixes yet to be implemented or improved:
// TODO list:
// -----------
// binaries, currently implemented as a hack
// ets tables, currently a basic implementation
// file operations, also a basic implementation
// argument checking for BIFs (Built-In Functions)
// distribution (inter-node communication)
// hard coded paths in tester.erl - needs generalization
// net_kernel in browser not aware of connection status
// global in browser not updated about nodedown events from other browsers

// Known issues and bugs:
// -----------
// initial calls sometimes show proc_lib as initial call in i(). - investigation needed
// lists:reverse(a) ==problem with binary matching in lib@3479 - specific bug to fix

/*
// Debugging commands for Erlang shell (example usage, not JS code)
dbg:start(), dbg:tracer(), dbg:tpl(, '_', []).
dbg:p(all, c).
dbg:stop_clear().

dbg:tpl(math, sum, dbg:fun2ms(fun(_) -> return_trace() end)).
*/


var OpcodeNames = [
    'NOP',
    'label/1',
    'func_info/3',
    'int_code_end/0',
    'call/2',
    'call_last/3',
    'call_only/2',
    'call_ext/2',
    'call_ext_last/3',
    'bif0/2',
    'bif1/4',
    'bif2/5',
    'allocate/2',
    'allocate_heap/3',
    'allocate_zero/2',
    'allocate_heap_zero/3',
    'test_heap/2',
    'init/1',
    'deallocate/1',
    'return/0',
    'send/0',
    'remove_message/0',
    'timeout/0',
    'loop_rec/2',
    'loop_rec_end/1',
    'wait/1',
    'wait_timeout/2',
    'm_plus/4',
    'm_minus/4',
    'm_times/4',
    'm_div/4',
    'int_div/4',
    'int_rem/4',
    'int_band/4',
    'int_bor/4',
    'int_bxor/4',
    'int_bsl/4',
    'int_bsr/4',
    'int_bnot/3',
    'is_lt/3',
    'is_ge/3',
    'is_eq/3',
    'is_ne/3',
    'is_eq_exact/3',
    'is_ne_exact/3',
    'is_integer/2',
    'is_float/2',
    'is_number/2',
    'is_atom/2',
    'is_pid/2',
    'is_reference/2',
    'is_port/2',
    'is_nil/2',
    'is_binary/2',
    'is_constant/2',
    'is_list/2',
    'is_nonempty_list/2',
    'is_tuple/2',
    'test_arity/3',
    'select_val/3',
    'select_tuple_arity/3',
    'jump/1',
    'catch/2',
    'catch_end/1',
    'move/2',
    'get_list/3',
    'get_tuple_element/3',
    'set_tuple_element/3',
    'put_string/3',
    'put_list/3',
    'put_tuple/2',
    'put/1',
    'badmatch/1',
    'if_end/0',
    'case_end/1',
    'call_fun/1',
    'make_fun/3',
    'is_function/2',
    'call_ext_only/2',
    'bs_start_match/2',
    'bs_get_integer/5',
    'bs_get_float/5',
    'bs_get_binary/5',
    'bs_skip_bits/4',
    'bs_test_tail/2',
    'bs_save/1',
    'bs_restore/1',
    'bs_init/2',
    'bs_final/2',
    'bs_put_integer/5',
    'bs_put_binary/5',
    'bs_put_float/5',
    'bs_put_string/2',
    'bs_need_buf/1',
    'fclearerror/0',
    'fcheckerror/1',
    'fmove/2',
    'fconv/2',
    'fadd/4',
    'fsub/4',
    'fmul/4',
    'fdiv/4',
    'fnegate/3',
    'make_fun2/1',
    'try/2',
    'try_end/1',
    'try_case/1',
    'try_case_end/1',
    'raise/2',
    'bs_init2/6',
    'bs_bits_to_bytes/3',
    'bs_add/5',
    'apply/1',
    'apply_last/2',
    'is_boolean/2',
    'is_function2/3',
    'bs_start_match2/5',
    'bs_get_integer2/7',
    'bs_get_float2/7',
    'bs_get_binary2/7',
    'bs_skip_bits2/5',
    'bs_test_tail2/3',
    'bs_save2/2',
    'bs_restore2/2',
    'gc_bif1/5',
    'gc_bif2/6',
    'bs_final2/2',
    'bs_bits_to_bytes2/2',
    'put_literal/2',
    'is_bitstr/2',
    'bs_context_to_binary/1',
    'bs_test_unit/3',
    'bs_match_string/4',
    'bs_init_writable/0',
    'bs_append/8',
    'bs_private_append/6',
    'trim/2',
    'bs_init_bits/6',
    'bs_get_utf8/5',
    'bs_skip_utf8/4',
    'bs_get_utf16/5',
    'bs_skip_utf16/4',
    'bs_get_utf32/5',
    'bs_skip_utf32/4',
    'bs_utf8_size/3',
    'bs_put_utf8/3',
    'bs_utf16_size/3',
    'bs_put_utf16/3',
    'bs_put_utf32/3',
    'on_load/0',
    'recv_mark/1',
    'recv_set/1',
    'gc_bif3/7'
]
; // Array of Erlang opcode names.

var ArityTable = [
    0, 1, 3, 0, 2, 3, 2, 2, 3, 2, 4, 5, 2, 3, 2, 3, 2, 1, 1, 0, 0, 0, 0, 2, 1, 1, 2, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1,
    2, 1, 2, 3, 3, 3, 3, 3, 2, 1, 1, 0, 1, 1, 3, 2, 2, 2, 5, 5, 5, 4, 2, 1, 1, 2, 2, 5, 5, 5, 2,
    1, 0, 1, 2, 2, 4, 4, 4, 4, 3, 1, 2, 1, 1, 1, 2, 6, 3, 5, 1, 2, 2, 3, 5, 7, 7, 7, 5, 3, 2, 2,
    5, 6, 2, 2, 2, 2, 1, 3, 4, 0, 8, 6, 2, 6, 5, 4, 5, 4, 5, 4, 3, 3, 3, 3, 3, 0, 1, 1, 7
]
; // Defines the arity (number of arguments) for each opcode.

var Modules = [
]
; // Array to store loaded Erlang modules.

//
// START OF LOADER CODE
//
// This section handles the initial loading process, specifically atom management.

// The atom table used during initial code load
var h_atom = ( 2 << 27 ) + 1
; // Initialize a unique identifier for atoms, starting from a high value.
var loaderAtomTable = {
}
; // A simple object used as a hash map for atom string to integer mapping.

function loaderStrToAtom ( str ) {
    // Converts a string to an atom, storing it in the loader-specific atom table if new.
    var atom = loaderAtomTable[ str ]
    ; // Check if the atom already exists.
    if ( atom != undefined ) {
        return atom
        ; // Return existing atom if found.
    }
    loaderAtomTable[ str ] = h_atom
    ; // Assign a new unique ID to the atom.
    return h_atom++
    ; // Return the new ID and increment for the next atom.
}

// Global atom constants for common Erlang values, used during loading.
var am_true             = loaderStrToAtom('true')
;
var am_false            = loaderStrToAtom('false')
;
var am_erlang           = loaderStrToAtom('erlang')
;
var am_self             = loaderStrToAtom('self')
;
var am_node             = loaderStrToAtom('node')
;
var am_ok               = loaderStrToAtom('ok')
;
var am_round            = loaderStrToAtom('round')
;
var am_float            = loaderStrToAtom('float')
;
var am_size             = loaderStrToAtom('size')
;
var am_byte_size        = loaderStrToAtom('byte_size')
;
var am_bit_size         = loaderStrToAtom('bit_size')
;
var am_length           = loaderStrToAtom('length')
;
var am_abs              = loaderStrToAtom('abs')
;
var am_trunc            = loaderStrToAtom('trunc')
;
var am_is_port          = loaderStrToAtom('is_port')
;
var am_is_number        = loaderStrToAtom('is_number')
;
var am_is_integer       = loaderStrToAtom('is_integer')
;
var am_is_list          = loaderStrToAtom('is_list')
;
var am_is_tuple         = loaderStrToAtom('is_tuple')
;
var am_is_atom          = loaderStrToAtom('is_atom')
;
var am_is_pid           = loaderStrToAtom('is_pid')
;
var am_is_binary        = loaderStrToAtom('is_binary')
;
var am_is_boolean       = loaderStrToAtom('is_boolean')
;
var am_tuple_size       = loaderStrToAtom('tuple_size')
;
var am_not              = loaderStrToAtom('not')
;
var am_hd               = loaderStrToAtom('hd')
;
var am_tl               = loaderStrToAtom('tl')
;
var am_get              = loaderStrToAtom('get')
;
var am_element          = loaderStrToAtom('element')
;
var am_and              = loaderStrToAtom('and')
;
var am_or               = loaderStrToAtom('or')
;
var am_apply            = loaderStrToAtom('apply')
;
var am_yield            = loaderStrToAtom('yield')
;
var am_os               = loaderStrToAtom('os')
;
var am_band             = loaderStrToAtom('band')
;
var am_bsr              = loaderStrToAtom('bsr')
;
var am_bsl              = loaderStrToAtom('bsl')
;
var am_bor              = loaderStrToAtom('bor')
;
var am_bxor             = loaderStrToAtom('bxor')
;

var am_timestamp        = loaderStrToAtom('timestamp')
;
var am_getenv           = loaderStrToAtom('getenv')
;
var am_putenv           = loaderStrToAtom('putenv')
;
var am_ets              = loaderStrToAtom('ets')
;
var am_lists            = loaderStrToAtom('lists')
;
var am_unicode          = loaderStrToAtom('unicode')
;
var am_error_logger     = loaderStrToAtom('error_logger')
;
var am_prim_file        = loaderStrToAtom('prim_file')
;
var am_net_kernel       = loaderStrToAtom('net_kernel')
;
var am_setnode          = loaderStrToAtom('setnode')
;
var am_code             = loaderStrToAtom('code')
;
var am_file             = loaderStrToAtom('file')
;
var am_math             = loaderStrToAtom('math')
;
var am_badarg           = loaderStrToAtom('badarg')
;
var am_badarity         = loaderStrToAtom('badarity')
;

var am_delete_object    = loaderStrToAtom('delete_object')
;
var am_new              = loaderStrToAtom('new')
;
var am_delete           = loaderStrToAtom('delete')
; // This appears twice, possibly a copy-paste error or intentional.
var am_delete           = loaderStrToAtom('delete')
;
var am_select_delete    = loaderStrToAtom('select_delete')
;
var am_select           = loaderStrToAtom('select')
;
var am_insert           = loaderStrToAtom('insert')
;
var am_lookup           = loaderStrToAtom('lookup')
;
var am_lookup_element   = loaderStrToAtom('lookup_element')
;
var am_slot             = loaderStrToAtom('slot')
;
var am_first            = loaderStrToAtom('first')
;
var am_next             = loaderStrToAtom('next')
;
var am_all              = loaderStrToAtom('all')
;
var am_info             = loaderStrToAtom('info')
;
var am_match            = loaderStrToAtom('match')
;
var am_match_object     = loaderStrToAtom('match_object')
;
var am_member           = loaderStrToAtom('member')
;
var am_keysearch        = loaderStrToAtom('keysearch')
;
var am_keyfind          = loaderStrToAtom('keyfind')
;
var am_keymember        = loaderStrToAtom('keymember')
;
var am_reverse          = loaderStrToAtom('reverse')
;
var am_bin_is_7bit      = loaderStrToAtom('bin_is_7bit')
;
var am_characters_to_binary = loaderStrToAtom('characters_to_binary')
;
var am_characters_to_list = loaderStrToAtom('characters_to_list')
;
var am_warning_map      = loaderStrToAtom('warning_map')
;
var am_dflag_unicode_io = loaderStrToAtom('dflag_unicode_io')
;
var am_internal_native2name = loaderStrToAtom('internal_native2name')
;
var am_internal_name2native = loaderStrToAtom('internal_name2native')
;
var am_get_chunk        = loaderStrToAtom('get_chunk')
;
var am_native_name_encoding = loaderStrToAtom('native_name_encoding')
;
var am_log10            = loaderStrToAtom('log10')
;
var am_log              = loaderStrToAtom('log')
;
var am_now              = loaderStrToAtom('now')
;
var am_date             = loaderStrToAtom('date')
;
var am_universaltime_to_localtime = loaderStrToAtom('universaltime_to_localtime')
;
var am_localtime        = loaderStrToAtom('localtime')
;
var am_time             = loaderStrToAtom('time')
;
var am_universaltime_to_localtime = loaderStrToAtom('universaltime_to_localtime')
; // Another duplicate.
var am_statistics       = loaderStrToAtom('statistics')
;
var am_div              = loaderStrToAtom('div')
;
var am_rem              = loaderStrToAtom('rem')
;
var am_group_leader     = loaderStrToAtom('group_leader')
; // Duplicate.
var am_group_leader     = loaderStrToAtom('group_leader')
;
var am_garbage_collect  = loaderStrToAtom('garbage_collect')
;
var am_cancel_timer     = loaderStrToAtom('cancel_timer')
;
var am_memory           = loaderStrToAtom('memory')
;
var am_registered       = loaderStrToAtom('registered')
;
var am_processes        = loaderStrToAtom('processes')
;
var am_list_to_pid      = loaderStrToAtom('list_to_pid')
;
var am_pid_to_list      = loaderStrToAtom('pid_to_list')
;
var am_port_to_list     = loaderStrToAtom('port_to_list')
;
var am_fun_to_list      = loaderStrToAtom('fun_to_list')
;
var am_fun_info         = loaderStrToAtom('fun_info')
;
var am_register         = loaderStrToAtom('register')
;
var am_unregister       = loaderStrToAtom('unregister')
;
var am_list_to_float    = loaderStrToAtom('list_to_float')
;
var am_float_to_list    = loaderStrToAtom('float_to_list')
;
var am_make_tuple       = loaderStrToAtom('make_tuple')
;
var am_whereis          = loaderStrToAtom('whereis')
;
var am_self             = loaderStrToAtom('self')
; // Duplicate.
var am_process_info     = loaderStrToAtom('process_info')
;
var am_process_display  = loaderStrToAtom('process_display')
;
var am_is_alive         = loaderStrToAtom('is_alive')
;
var am_process_flag     = loaderStrToAtom('process_flag')
;
var am_get_module_info  = loaderStrToAtom('get_module_info')
; // Duplicate.
var am_get_module_info  = loaderStrToAtom('get_module_info')
;
var am_system_info      = loaderStrToAtom('system_info')
;
var am_pre_loaded       = loaderStrToAtom('pre_loaded')
;
var am_module_loaded    = loaderStrToAtom('module_loaded')
;
var am_load_module      = loaderStrToAtom('load_module')
;
var am_function_exported = loaderStrToAtom('function_exported')
;
var am_make_ref         = loaderStrToAtom('make_ref')
;
var am_iolist_size      = loaderStrToAtom('iolist_size')
;
var am_list_to_integer  = loaderStrToAtom('list_to_integer')
;
var am_integer_to_list  = loaderStrToAtom('integer_to_list')
;
var am_iolist_to_binary = loaderStrToAtom('iolist_to_binary')
;
var am_nodes            = loaderStrToAtom('nodes')
;
var am_open_port        = loaderStrToAtom('open_port')
;
var am_port_command     = loaderStrToAtom('port_command')
;
var am_port_control     = loaderStrToAtom('port_control')
;
var am_port_connect     = loaderStrToAtom('port_connect')
;
var am_port_close       = loaderStrToAtom('port_close')
;
var am_monitor          = loaderStrToAtom('monitor')
;
var am_demonitor        = loaderStrToAtom('demonitor')
;
var am_is_process_alive = loaderStrToAtom('is_process_alive')
;
var am_link             = loaderStrToAtom('link')
;
var am_unlink           = loaderStrToAtom('unlink')
;
var am_display          = loaderStrToAtom('display')
;
var am_bump_reductions  = loaderStrToAtom('bump_reductions')
;
var am_get_stacktrace   = loaderStrToAtom('get_stacktrace')
;
var am_exit             = loaderStrToAtom('exit')
;
var am_error            = loaderStrToAtom('error')
;
var am_throw            = loaderStrToAtom('throw')
;
var am_raise            = loaderStrToAtom('raise')
;
var am_atom_to_list     = loaderStrToAtom('atom_to_list')
;
var am_term_to_binary   = loaderStrToAtom('term_to_binary')
;
var am_binary_to_term   = loaderStrToAtom('binary_to_term')
;
var am_setelement       = loaderStrToAtom('setelement')
;
var am_list_to_tuple    = loaderStrToAtom('list_to_tuple')
;
var am_tuple_to_list    = loaderStrToAtom('tuple_to_list')
;
var am_list_to_binary   = loaderStrToAtom('list_to_binary')
;
var am_ref_to_list      = loaderStrToAtom('ref_to_list')
;
var am_send             = loaderStrToAtom('send')
;
var am_send_after       = loaderStrToAtom('send_after')
;
var am_list_to_atom     = loaderStrToAtom('list_to_atom')
;
var am_binary_to_list   = loaderStrToAtom('binary_to_list')
;
var am_phash            = loaderStrToAtom('phash')
;
var am_put              = loaderStrToAtom('put')
;
var am_get              = loaderStrToAtom('get')
; // Duplicate.
var am_get              = loaderStrToAtom('get')
;
var am_erase            = loaderStrToAtom('erase')
;
var am_make_fun         = loaderStrToAtom('make_fun')
;
var am_spawn_opt        = loaderStrToAtom('spawn_opt')
;
var am_spawn            = loaderStrToAtom('spawn')
;
var am_spawn_link       = loaderStrToAtom('spawn_link')
;
var am_nonode_nohost    = loaderStrToAtom('nonode@nohost')
;
var am_pid              = loaderStrToAtom('pid')
;
var am_eval             = loaderStrToAtom('eval')
;
var am_get              = loaderStrToAtom('get')
; // Duplicate.
var am_set              = loaderStrToAtom('set')
;
var am_call             = loaderStrToAtom('call')
;
var am_js               = loaderStrToAtom('js')
;
var am_browserl_dist    = loaderStrToAtom('browserl_dist')
;
var am_listen           = loaderStrToAtom('listen')
;
var am_accept           = loaderStrToAtom('accept')
;
var am_childspecs       = loaderStrToAtom('childspecs')
;
var am_re               = loaderStrToAtom('re')
;
var am_run              = loaderStrToAtom('run')
;

// Special character atoms for operators
var am_sign_minus       = loaderStrToAtom('-')
;
var am_sign_equal_exact = loaderStrToAtom('=:=')
;
var am_sign_not_equal_exact = loaderStrToAtom('=/=')
;
var am_sign_equal       = loaderStrToAtom('==')
;
var am_sign_gt          = loaderStrToAtom('>')
;
var am_sign_lt          = loaderStrToAtom('<')
;
var am_sign_gte         = loaderStrToAtom('>=')
;
var am_sign_lte         = loaderStrToAtom('=<')
;
var am_sign_not_equal   = loaderStrToAtom('/=')
;
var am_sign_assign      = loaderStrToAtom('=')
;
var am_sign_plus        = loaderStrToAtom('+')
;
var am_sign_minus       = loaderStrToAtom('-')
; // Duplicate.
var am_sign_multiply    = loaderStrToAtom('*')
;
var am_sign_divide      = loaderStrToAtom('/')
;
var am_sign_exclamation = loaderStrToAtom('!')
;
var am_sign_plusplus    = loaderStrToAtom('++')
;
var am_sign_minusminus  = loaderStrToAtom('--')
;


// Polyfill for Date.now() for older browsers, e.g., Internet Explorer.
if ( ! Date.now ) {
    Date.now = function () {
        return +new Date
        ; // Returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
    }
}

// Common interface for extracting data from an Uint8Array, array or a string.
// These prototypes extend built-in types for easier byte-level manipulation.

if ( window.Uint8Array ) {
    Uint8Array.prototype.getString = function ( pos, len ) {
        var s = ''
        , i
        ;
        for ( i = 0 ; i < len ; i++ ) {
            s += String.fromCharCode( this[ pos + i ] )
            ; // Concatenate characters from byte codes.
        }
        return s
        ;
    }

    Uint8Array.prototype.getZeroTerminatedString = function ( pos, maxlen ) {
        var s = ''
        , c
        , i = 0
        ;
        while ( i < maxlen ) {
            c = this[ pos + ( i++ ) ]
            ; // Get character code.
            if ( c == 0 ) {
                break
                ; // Stop at null terminator.
            }
            s += String.fromCharCode( c )
            ;
        }
        return s
        ;
    }

    Uint8Array.prototype.getByte = function ( pos ) {
        return this[ pos ]
        ; // Returns the byte at the specified position.
    }

    Uint8Array.prototype.getInt32 = function ( pos ) {
        // Reads a 32-bit integer from the array, assuming big-endian byte order.
        return ( this[ pos ] << 24 ) + ( this[ pos + 1 ] << 16 ) + ( this[ pos + 2 ] << 8 ) + this[ pos + 3 ]
        ;
    }
}

// Array prototype extensions for similar functionality.
Array.prototype.getString = function ( pos, len ) {
    var s = ''
    , i
    ;
    for ( i = 0 ; i < len ; i++ ) {
        s += String.fromCharCode( this[ pos + i ] )
        ;
    }
    return s
    ;
}

Array.prototype.getZeroTerminatedString = function ( pos, maxlen ) {
    var s = ''
    , c
    , i = 0
    ;
    while ( i < maxlen ) {
        c = this[ pos + ( i++ ) ]
        ;
        if ( c == 0 ) {
            break
            ;
        }
        s += String.fromCharCode( c )
        ;
    }
    return s
    ;
}

Array.prototype.getByte = function ( pos ) {
    return this[ pos ]
    ;
}

Array.prototype.getInt32 = function ( pos ) {
    return ( this[ pos ] << 24 ) + ( this[ pos + 1 ] << 16 ) + ( this[ pos + 2 ] << 8 ) + this[ pos + 3 ]
    ;
}

Array.prototype.subarray = function ( start, end ) {
    // slice does not seem to work for konqueror, so a manual loop is used.
    var i
    , sa = new Array( end - start )
    ;
    for ( i = start ; i < end ; i++ ) {
        sa[ i - start ] = this[ i ]
        ;
    }
    return sa
    ;
}

// String prototype extensions for byte-level access, treating characters as bytes.
String.prototype.getZeroTerminatedString = function ( pos, maxlen ) {
    var s = ''
    , c
    , i = 0
    ;
    while ( i < maxlen ) {
        c = this.charCodeAt( pos + ( i++ ) )
        ; // Get character code.
        if ( c == 0 ) {
            break
            ;
        }
        s += String.fromCharCode( c )
        ;
    }
    return s
    ;
}

String.prototype.getByte = function ( pos ) {
    return this.charCodeAt( pos ) & 255
    ; // Get char code and mask to 8 bits.
}

String.prototype.getInt32 = function ( pos ) {
    return ( this.getByte( pos ) << 24 ) + ( this.getByte( pos + 1 ) << 16 ) +
           ( this.getByte( pos + 2 ) << 8 ) + this.getByte( pos + 3 )
    ;
}

String.prototype.getString = function ( pos, len ) {
    var s = ''
    , i
    ;
    for ( i = 0 ; i < len ; i++ ) {
        s += String.fromCharCode( this.getByte( pos + i ) )
        ;
    }
    return s
    ;
}

String.prototype.subarray = function ( start, end ) {
    var s = [
    ]
    , i
    ;
    for ( i = start ; i < end ; i++ ) {
        s.push( this.getByte( i ) )
        ;
    }
    return s
    ;
}

// Not using Float64Array since typed arrays are not available on all targets.
// This function converts a byte array representation to a JavaScript float (double-precision).
function arrayToFloat ( a, pos ) {
    var sign          = a.getInt32( pos ) >> 31
    ; // Extract the sign bit.
    var exponent      = ( ( a.getInt32( pos ) >> 20 ) & ( ( 1 << 11 ) - 1 ) )
    ; // Extract 11-bit exponent.
    var fractionUpper = a.getInt32( pos ) & ( ( 1 << 20 ) - 1 )
    ; // Extract upper 20 bits of mantissa.
    var fractionLower = a.getInt32( pos + 4 )
    ; // Extract lower 32 bits of mantissa.
    var fraction      = fractionUpper * 0x100000000 + Math.abs( fractionLower )
    ; // Combine mantissa parts.
    var num
    ;
    if ( exponent == 0 ) {
        num = Math.pow( 2, exponent - 1023 ) * ( Math.abs( fraction / ( 4503599627370496 / 2 ) ) )
        ; // Denormalized number calculation (1 bsl 51).
    } else {
        num = Math.pow( 2, exponent - 1023 ) * ( 1 + Math.abs( fraction / 4503599627370496 ) )
        ; // Normalized number calculation (1 bsl 52).
    }
    if ( sign == -1 ) {
        num = -num
        ; // Apply sign.
    }
//  debugln1('arrayToFloat:'+sign+':'+exponent+':'+fraction+':'+num); // Debugging line.
    return num
    ;
}

// Converts a JavaScript number (float) to an 8-byte array representation (IEEE 754 double-precision).
function floatToArray ( n, bits ) {
    // TODO: handle 32 bits if `bits` parameter is used for single-precision floats.
    var s = ( n < 0 ) ? 1 : 0
    ; // Determine sign bit.
    var e = 0
    , m = 0
    ; // Exponent and mantissa placeholders.
    n = Math.abs( n )
    ; // Work with absolute value for exponent/mantissa calculation.
    if ( n != 0 ) {
        while ( n >= 2 ) {
            e++
            ;
            n /= 2
            ;
        }
        while ( n < 1 ) {
            e--
            ;
            n *= 2
            ;
        }
    } else {
        e = -1023
        ;
        n = 1
        ;
    } // Handle zero and denormalized numbers (TODO: refine denormalized handling).
//  console.log("exponent: "+(e+1023)+" mantissa: "+(n-1)*0x10000000000000); //1 bsl 52
    var lower32bits  = ( n - 1 ) * 4503599627370496 & 0xffffffff
    ; // Shift mantissa 52 bits and mask out lowest 32.
    var higher32bits = ( ( n - 1 ) * Math.pow( 2, 20 ) ) & 0xfffff | ( Math.abs( e + 1023 ) << 20 ) | ( s << 31 )
    ; // Combine upper mantissa, exponent, and sign.
    return [
        higher32bits >>> 24, ( higher32bits >>> 16 ) & 0xff, ( higher32bits >>> 8 ) & 0xff, higher32bits & 0xff,
        lower32bits >>> 24, ( lower32bits >>> 16 ) & 0xff, ( lower32bits >>> 8 ) & 0xff, lower32bits & 0xff
    ]
    ; // Return 8 bytes.
}

// Decodes an Erlang External Term Format (ETF) byte array into a JavaScript representation.
function arrayToTerm ( a, loading ) {
    var pos = 1
    ; // Start reading after the initial version byte.
    if ( a[ 0 ] != 131 ) {
        throw 'not a valid term ' + a.charCodeAt( 0 )
        ; // ETF version magic number is 131.
    }
    return decode( a, 1 )
    ; // Begin recursive decoding.

    function decode () {
        switch ( a[ pos++ ] ) {
            case 70:
                // FLOAT_EXT (new float format)
                var num = arrayToFloat( a, pos )
                ;
                pos += 8
                ; // Floats are 8 bytes.
                return { type: am_float, value: num }
                ;
            case 77:
                // BINARY_EXT (bitstring/binary)
                var byte_len          = bytesToInteger( a, pos, 4 )
                ; // Length of data in bytes.
                var bits_in_last_byte = bytesToInteger( a, pos + 4, 1 )
                ; // Number of bits in the last byte.
                pos += 4 + byte_len + 1
                ; // Move past length fields and data.
                return {
                    type: 'bitstring', value: a.getString( pos - byte_len, byte_len + 1 ),
                    len: byte_len * 8 + bits_in_last_byte
                }
                ;
            case 97:
                // SMALL_INTEGER_EXT (1-byte integer)
                return bytesToInteger( a, pos++, 1 )
                ;
            case 98:
                // INTEGER_EXT (4-byte integer)
                pos += 4
                ;
                return bytesToInteger( a, pos - 4, 4 )
                ;
            case 100:
                // ATOM_EXT (atom)
                var len  = bytesToInteger( a, pos, 2 )
                ; // Atom name length.
                pos += len + 2
                ; // Move past length and atom name.
                var atom = a.getString( pos - len, len )
                ; // Extract atom string.
                if ( loading ) {
                    return loaderStrToAtom( atom )
                    ; // Use loader's atom table during initial load.
                }
                return strToAtom( atom )
                ; // Use regular atom table otherwise.
            case 103:
                // PID_EXT (process identifier)
                var node     = decode()
                ; // Node atom.
                var id       = bytesToInteger( a, pos, 4 )
                ;
                pos += 4
                ;
                var serial   = bytesToInteger( a, pos, 4 )
                ;
                pos += 4
                ;
                var creation = bytesToInteger( a, pos, 1 )
                ;
                pos += 1
                ;
                if ( node == node_name ) {
                    return { type: am_pid, value: id }
                    ; // Local PID.
                }
                return { type: am_pid, value: [ node, id, serial, creation ] }
                ; // Remote PID.
            case 104:
                // SMALL_TUPLE_EXT (tuple with up to 255 elements)
                var len = bytesToInteger( a, pos, 1 )
                ; // Number of elements.
                var tp  = [
                ]
                ; // JavaScript array to represent tuple.
                pos += 1
                ;
                while ( len-- ) {
                    tp.push( decode() )
                    ; // Decode each element.
                }
                return tp
                ;
            case 106:
                // NIL_EXT (empty list)
                return 2 << 27
                ; // Placeholder for Erlang empty list.
            case 107:
                // STRING_EXT (list of characters)
                var len = bytesToInteger( a, pos, 2 )
                ; // String length.
                pos += len + 2
                ;
                return strToList( a.getString( pos - len, len ) )
                ; // Convert string to Erlang list representation.
            case 108:
                // LIST_EXT (non-empty list)
                var len  = bytesToInteger( a, pos, 4 )
                ; // Number of elements in list.
                var next = 2 << 27
                ; // Tail of the list, initially nil.
                pos += 4
                ;
                while ( len-- ) {
                    var el = decode()
                    ; // Decode element.
                    next   = { value: el, next: next }
                    ; // Prepend to list structure.
                }
                if ( a[ pos ] != 106 ) {
                    return listReverse( next, decode() )
                    ; // If tail is not NIL_EXT, decode it.
                }
                pos++
                ; // Consume the NIL_EXT tag.
                return listReverse( next, 2 << 27 )
                ; // Reverse the list (built in reverse order) and append nil.
            case 109:
                // BINARY_EXT (binary)
                var len = bytesToInteger( a, pos, 4 )
                ; // Length of binary data.
                pos += 4 + len
                ;
                return a.getString( pos - len, len )
                ; // Return binary data as a string (or Uint8Array, depending on context).
        }
    }
}