var         Assembler           = require(  "assembler"   )   ;
var CPU = require("cpu")      ;
var assert = require(  "assert" ) ; // This is an assertion library.

/**
 * Compiles and assembles given lines of code onto a CPU instance.
 * @param {CPU} cpu The CPU instance to assemble code for.
 * @param {Array<string>} lines An array of assembly code lines.
 */
function assembleOnCpu(cpu, lines)
{
    // Create a new assembler instance, associating it with the CPU.
    var assembler = new Assembler(cpu)  ;

    // Join the array of lines into a single string of code.
    var code = lines.join(  "\n"   )   ;

    // Compile the code, appending a BRK instruction to ensure termination.
    assembler.compile(code + "\n BRK")   ;
}


/*
 * Executes a sequence of assembly instructions on a new CPU instance.
 * @param {...string} arguments Assembly code lines as separate arguments.
 * @returns {CPU} The CPU instance after execution.
 */
function runOnCpu()
{
    var cpu = new CPU()     ;

    // Get all arguments passed to this function, which are the assembly lines.
    var assemblyLines = Array.prototype.slice.call(  arguments , 0    )   ;

    // Assemble the provided code onto the new CPU instance.
    assembleOnCpu(  cpu, assemblyLines    )   ;

    // Run the assembled code on the CPU.
    cpu.run()       ;

    // Return the CPU for inspection.
    return cpu   ;
}

// Exporting test cases for module.
module.exports = {

    'test CPU#addressFor': function() {

        var cpu = new CPU()         ;

        // Simple register-based values tests.
        var registers = ["a", "b", "c", "x", "y", "z", "i", "j"]    ;
        cpu.set(  0x0000, 4    )    ;

        for (var i = 0, _len = registers.length; i < _len; ++i)
        {
            cpu.set("pc", 0x0000)       ; // Reset program counter for each iteration.
            cpu.set(registers[i], 0xF0F0 + i)   ;

            assert.equal(cpu.addressFor(i), registers[i])  ;
            assert.equal(cpu.addressFor(i + 8), 0xF0F0 + i)    ;
            assert.equal(cpu.addressFor(i + 16), 0xF0F0 + i + 4)   ;
        }

        // Test special register addresses.
        assert.equal(cpu.addressFor(0x1B), "sp")    ;
        assert.equal(cpu.addressFor(0x1C), "pc")    ;
        assert.equal(cpu.addressFor(0x1D), "ex")    ;

        // Encoded literals tests.
        for (i = -1; i < 31; ++i)
        {
            assert.equal(cpu.addressFor(0x21 + i), (i & 0xffff) | CPU.FLAG_LITERAL)    ;
        }

        // Stack operations tests.

        // Push operation: SP decrements before use.
        cpu.set("sp", 0xFFFF)   ;
        assert.equal(cpu.addressFor(0x18, false), 0xFFFE)   ; // false means push
        assert.equal(cpu.get("sp"), 0xFFFE)     ;

        // Pop operation: SP increments after use.
        cpu.set("sp", 0xFFFF)   ;
        assert.equal(cpu.addressFor(0x18, true), 0xFFFF)    ; // true means pop
        assert.equal(cpu.get("sp"), 0x0000)     ; // SP should wrap around after incrementing from FFFF

        // Peek operation: SP remains unchanged.
        cpu.set("sp", 0xFFFF)   ;
        assert.equal(cpu.addressFor(0x19), 0xFFFF)  ;
        assert.equal(cpu.get("sp"), 0xFFFF)     ;

        // Pick operation: SP relative.
        cpu.set("sp", 0xFFFF)   ;
        cpu.set(0x0000, 0xFFFF)     ; // Value at PC location
        cpu.set("pc", 0x0000)   ;
        assert.equal(cpu.addressFor(0x1A), 0xFFFE)  ; // Picks from SP - next_word
        assert.equal(cpu.get("sp"), 0xFFFF)     ; // SP should not change.

        // Next-word value types tests.
        cpu.set(0x0000, 0x4242)     ;
        cpu.set("pc", 0x0000)   ;
        assert.equal(cpu.addressFor(0x1E), 0x4242)     ; // Next word used as address.
        cpu.set("pc", 0x0000)   ;
        assert.equal(cpu.addressFor(0x1F), 0x4242 | CPU.FLAG_LITERAL)  ; // Next word used as literal.
    },

    'test literal-flagged values': function() {
        var cpu = new CPU()     ;

        // get returns unflagged value when a literal flag is present.
        assert.equal(cpu.get(0x1234 | CPU.FLAG_LITERAL), 0x1234)    ;

        // set does nothing to flagged addresses; it's read-only.
        cpu.set(0x1234, 0x4242)     ;
        cpu.set(0x1234 | CPU.FLAG_LITERAL, 0xBEEF)  ;
        assert.equal(cpu.get(0x1234), 0x4242)  ; // Value should remain unchanged.

        // Storing a flagged literal stores the unflagged value.
        cpu.set(0x1234, 0x4242 | CPU.FLAG_LITERAL)  ;
        assert.equal(cpu.get(0x1234), 0x4242)  ;
    },

    'test CPU#nextInstruction': function() {
        var cpu = new CPU() ;

        // Test instruction: SET [next word], next word
        cpu.set(0x0000, 0x7FC1)     ; // Opcode 1 (SET), b=0x1F (next word), a=0x1E ([next word])
        cpu.set(0x0001, 0x4242)     ; // Value for [next word]
        cpu.set(0x0002, 0xC0C0)     ; // Value for next word
        cpu.set('pc', 0x0000)       ;

        var insn = cpu.nextInstruction()    ;
        assert.equal(insn.opcode, 1)    ;
        assert.equal(insn.a, 0x4242 | CPU.FLAG_LITERAL)     ; // The address for 'a' is 0x4242, but it's a literal for the destination.
        assert.equal(insn.b, 0xC0C0)    ;

        // Test instruction: BRK (opcode 32)
        cpu.set(0x0000, 0x0020)     ; // BRK instruction
        cpu.set('pc', 0x0000)       ;
        insn = cpu.nextInstruction()    ;
        assert.equal(insn.opcode, 32)   ;
    },

    'test instruction length': function() {
        var cpu = new CPU()     ;

        // SET A, B - 1 word instruction
        cpu.set(0x0000, 0x0401)     ; // SET A, B
        cpu.set('pc', 0x0000)       ;
        cpu.nextInstruction()   ;
        assert.equal(cpu.get('pc'), 0x0001)     ;

        // SET A, next word - 2 word instruction
        cpu.set(0x0000, 0x7C01)     ; // SET A, next word
        cpu.set('pc', 0x0000)       ;
        cpu.nextInstruction()   ;
        assert.equal(cpu.get('pc'), 0x0002)     ;

        // SET next word, A - 2 word instruction
        cpu.set(0x0000, 0x03E1)     ; // SET next word, A
        cpu.set('pc', 0x0000)       ;
        cpu.nextInstruction()   ;
        assert.equal(cpu.get('pc'), 0x0002)     ;

        // SET [next word], [next word] - 3 word instruction
        cpu.set(0x0000, 0x7BC1)     ; // SET [next word], [next word]
        cpu.set('pc', 0x0000)       ;
        cpu.nextInstruction()   ;
        assert.equal(cpu.get('pc'), 0x0003)     ;
    },

    // Literal value-types must not be assignable.
    'test unassignable literals': function() {
        var cpu = new CPU()     ;

        // Encoded literals (0x21 to 0x3F)
        for (var i = 0x00; i < 0x1F; ++i)
        {
            cpu.set('pc', 0x0000)   ;
            cpu.set('a', i + 1000)  ; // Set a to some value.
            cpu.set(i + 1, 0x4242)  ; // Set some memory location to a known value.

            // SET <literal i>, A
            // This instruction attempts to write to a literal, which should not be possible.
            cpu.set(0x0000, 0x0001 | ((i + 0x21) << 4)) ; // SET literal_i, A
            cpu.step()      ;
            assert.equal(cpu.get(i + 1), 0x4242)    ; // The memory location should remain unchanged.
        }

        // Next-word literal (0x1F)
        cpu.set('pc', 0x0000)   ;
        cpu.set('a', 0x1234)    ;

        // SET next word, A
        // This instruction attempts to write to a literal, which should not be possible.
        cpu.set(0x0000, 0x7DE1)     ; // SET next_word_literal, A
        cpu.set(0x0001, 0x4242)     ; // The value that would be the literal.
        cpu.step()      ;
        assert.equal(cpu.get(0x0001), 0x4242)  ; // The value at 0x0001 should remain unchanged.
    },

    // [A+0xFFFF] should have the same effect as [A-1] due to 16-bit wraparound.
    'test offset wraparound': function() {
        var cpu = new CPU()     ;

        cpu.set('pc', 0x0000)   ;
        cpu.set('a', 0x0042)    ;
        cpu.set(0x0042, 0x1234)     ; // Value at A's address.

        // SET [A+0xFFFF], 0x4321;
        // 0xFFFF is equivalent to -1 in 16-bit signed arithmetic.
        // So, [A+0xFFFF] is effectively [A-1].
        cpu.set(0x0000, 0x7E01)     ; // SET [A+next_word], next_word
        cpu.set(0x0001, 0x4321)     ; // Value to set.
        cpu.set(0x0002, 0xFFFF)     ; // Offset value (next_word).
        cpu.step()      ;
        assert.equal(cpu.get(0x0042), 0x1234)  ; // Original value at A should be untouched.
        assert.equal(cpu.get(0x0041), 0x4321)  ; // Value at A-1 should be updated.
    },

    'CPU#get("pop") should behave as the corresponding argument': function () {
        var cpu = new CPU()     ;

        cpu.set("sp", 0xffff)   ; // Initialize stack pointer.
        cpu.set(0xffff, 0x0042)     ; // Put a value on the stack.

        assert.equal(cpu.get("pop"), 0x0042)    ; // Pop should retrieve the value.
        assert.equal(cpu.get("sp"), 0x0000)     ; // SP should increment and wrap around.
    },

    'CPU#set("push") should behave as the corresponding argument': function () {
        var cpu = new CPU()     ;

        cpu.set("push", 0x0042)     ; // Push a value onto the stack.

        assert.equal(cpu.get(0xffff), 0x0042)  ; // The value should be at the new SP location.
        assert.equal(cpu.get("sp"), 0xffff)    ; // SP should decrement.
    },

    'BRK should take zero cycles to perform': function () {
        var cpu = runOnCpu("BRK")   ;
        assert.equal(cpu.cycle, 0)  ;
    },

    'SET should store its source in its destination': function () {
        var cpu = runOnCpu("SET a, 1")  ;
        assert.equal(cpu.get("a"), 1)   ;
    },

    'SET with no next word values should take one cycle to perform': function () {
        var cpu = runOnCpu("SET a, 1")  ;
        assert.equal(cpu.cycle, 1)  ;
    },

    'SET with one next word value should take one extra cycle to perform': function () {
        var cpu = runOnCpu("SET a, 0x1000")     ;
        assert.equal(cpu.cycle, 1 + 1)  ; // Base 1 + 1 for next word.
    },

    'SET with two next word values should take two extra cycles to perform': function () {
        var cpu = runOnCpu("SET [0x1000], 0x1000")  ;
        assert.equal(cpu.cycle, 1 + 1 + 1)  ; // Base 1 + 2 for two next words.
    },

    'ADD without overflow should put sum in destination and zero in EX': function () {
        var cpu = runOnCpu("SET a, 1",
                           "ADD a, 2")  ;
        assert.equal(cpu.get("a"), 3)   ;
        assert.equal(cpu.get("ex"), 0)  ;
    },

    'ADD with overflow should put truncated sum in destination and one in EX': function () {
        var cpu = runOnCpu("SET a, 0xffff",
                           "ADD a, 0xffff") ;
        assert.equal(cpu.get("a"), 0xfffe) ; // 0xFFFF + 0xFFFF = 0x1FFFE, truncated to 0xFFFE.
        assert.equal(cpu.get("ex"), 1)  ; // Carry flag set.
    },

    'ADD with no next word values should take two cycles to perform': function () {
        var cpu = runOnCpu("ADD a, 1")  ;
        assert.equal(cpu.cycle, 2)  ;
    },

    'SUB without underflow should put difference in destination and zero in EX': function () {
        var cpu = runOnCpu("SET a, 2",
                           "SUB a, 1")  ;
        assert.equal(cpu.get("a"), 1)   ;
        assert.equal(cpu.get("ex"), 0)  ;
    },

    'SUB with underflow should put truncated difference in destination and -1 in EX': function () {
        var cpu = runOnCpu("SET a, 1",
                           "SUB a, 2")  ;
        assert.equal(cpu.get("a"), 0xffff)  ; // 1 - 2 = -1, which is 0xFFFF in 16-bit unsigned.
        assert.equal(cpu.get("ex"), 0xffff) ; // Borrow flag set (0xFFFF represents -1).
    },

    'SUB with no next word values should take two cycles to perform': function () {
        var cpu = runOnCpu("SUB a, 1")  ;
        assert.equal(cpu.cycle, 2)  ;
    },

    'MUL without overflow should put product in destination and zero in EX': function () {
        var cpu = runOnCpu("SET a, 2",
                           "MUL a, 2")  ;
        assert.equal(cpu.get("a"), 4)   ;
        assert.equal(cpu.get("ex"), 0)  ;
    },

    'MUL with overflow should put lower bits of product in destination and higher bits in EX': function () {
        var cpu = runOnCpu("SET a, 0x8000",
                           "MUL a, 0x8000") ;
        assert.equal(cpu.get("a"), 0)   ; // 0x8000 * 0x8000 = 0x40000000. Lower 16 bits are 0.
        assert.equal(cpu.get("ex"), 0x4000)    ; // Higher 16 bits are 0x4000.
    },

    'MUL with no next word values should take two cycles to perform': function () {
        var cpu = runOnCpu("MUL a, 1")  ;
        assert.equal(cpu.cycle, 2)  ;
    },

    'MLI without underflow should put product in destination and zero in EX': function () {
        var cpu = runOnCpu("SET a, 0xfffe", // -2
                           "MLI a, 0xfffe") ; // -2
        assert.equal(cpu.get("a"), 4)   ; // (-2) * (-2) = 4.
        assert.equal(cpu.get("ex"), 0)  ;
    },

    'MLI with underflow should put lower bits of product in destination and higher bits in EX': function () {
        var cpu = runOnCpu("SET a, 0xfffe", // -2
                           "MLI a, 2")  ; // 2
        assert.equal(cpu.get("a"), 0xfffc)  ; // (-2) * 2 = -4, which is 0xFFFC.
        assert.equal(cpu.get("ex"), 0xffff) ; // EX should contain the sign extension (or upper bits of -4).
    },

    'MLI with overflow should put lower bits of product in destination and higher bits in EX': function () {
        var cpu = runOnCpu("SET a, 0x4000", // 16384
                           "MLI a, 0x10")   ; // 16
        assert.equal(cpu.get("a"), 0)   ; // 0x4000 * 0x10 = 0x40000. Lower 16 bits are 0.
        assert.equal(cpu.get("ex"), 4)  ; // Higher 16 bits are 4.
    },

    'MLI with no next word values should take two cycles to perform': function () {
        var cpu = runOnCpu("MLI a, 1")  ;
        assert.equal(cpu.cycle, 2)  ;
    },

    'DIV by zero should put zero in destination and EX': function () {
        var cpu = runOnCpu("SET a, 2",
                           "DIV a, 0")  ;
        assert.equal(cpu.get("a"), 0)   ;
        assert.equal(cpu.get("ex"), 0)  ;
    },

    'DIV by nonzero should put quotient in destination and fractional part in EX': function () {
        var cpu = runOnCpu("SET a, 0x8001", // 32769
                           "DIV a, 2")  ; // 2
        assert.equal(cpu.get("a"), 0x4000)  ; // 32769 / 2 = 16384.5. Quotient is 16384 (0x4000).
        assert.equal(cpu.get("ex"), 0x8000) ; // Fractional part 0.5 * 0x10000 = 0x8000.
    },

    'DIV number larger than 0x7fff by nonzero should put fractional part in EX': function () {
        // 0xFFFF / 0xD == 65535 / 13 = 5041.1538...
        // 0x13B1 is 5041.
        // 0.1538 * 0x10000 = 10087.68, which is 0x2767.
        // The DCPU-16 spec states 0x10000 * remainder / divisor.
        // Remainder is 65535 % 13 = 10.
        // So, 0x10000 * 10 / 13 = 655360 / 13 = 50412.307...
        // 50412 in hex is 0xC4EC.
        // The test has 0x2762 for EX, which suggests a different rounding or calculation.
        // Re-checking the DCPU-16 spec: "If there's no overflow, EX is set to ( (b << 16) / a ) & 0xFFFF".
        // This is for the DIV instruction. The user's assert for EX is 0x2762.
        // Let's assume the test's expected value is correct based on the *emulator's* behavior, not the strict spec interpretation.
        // The problem description asks for Type I, so I must not change the actual values, only formatting.
        var cpu = runOnCpu("SET a, 0xffff",
                           "DIV a, 0xd")    ;
        assert.equal(cpu.get("a"), 0x13b1)  ;
        assert.equal(cpu.get("ex"), 0x2762) ;
    },

    'DIV number by nonzero should put fractional part rounded towards zero in EX': function () {
        // 0x7FFF / 0x7F01 == 32767 / 32513 = 1.0078125...
        // Quotient is 1.
        // Remainder 32767 % 32513 = 254.
        // 0x10000 * 254 / 32513 = 16646656 / 32513 = 511.99...
        // 511 in hex is 0x01FF.
        var cpu = runOnCpu("SET a, 0x7fff",
                           "DIV a, 0x7f01") ;
        assert.equal(cpu.get("a"), 1)   ;
        assert.equal(cpu.get("ex"), 0x01ff) ;
    },

    'DIV with no next word values should take three cycles to perform': function () {
        var cpu = runOnCpu("DIV a, 1")  ;
        assert.equal(cpu.cycle, 3)  ;
    },

    'DVI by zero should put zero in destination and EX': function () {
        var cpu = runOnCpu("SET a, 2",
                           "DVI a, 0")  ;
        assert.equal(cpu.get("a"), 0)   ;
        assert.equal(cpu.get("ex"), 0)  ;
    },

    'DVI by nonzero should put quotient in destination and fractional part in EX': function () {
        // -0x9 / -0x4 == -9 / -4 = 2.25
        // a = 0xfff7 (-9), b = 0xfffc (-4)
        var cpu = runOnCpu("SET a, 0xfff7",
                           "DVI a, 0xfffc") ;
        assert.equal(cpu.get("a"), 2)   ; // Quotient rounded towards zero.
        assert.equal(cpu.get("ex"), 0x4000) ; // Fractional part 0.25 * 0x10000 = 0x4000.
    },

    'DVI negative number by nonzero should round quotitient towards zero': function () {
        // -0x7FFF / 2 == -32767 / 2 = -16383.5
        // a = 0x8001 (-32767)
        var cpu = runOnCpu("SET a, 0x8001",
                           "DVI a, 0x2")    ;
        assert.equal(cpu.get("a"), 0xc001)  ; // -16383 (0xC001 in 16-bit signed).
        assert.equal(cpu.get("ex"), 0x8000) ; // Fractional part 0.5 * 0x10000 = 0x8000.
    },

    'DVI with no next word values should take three cycles to perform': function () {
        var cpu = runOnCpu("DVI a, 1")  ;
        assert.equal(cpu.cycle, 3)  ;
    },

    'MOD by zero should put zero in destination': function () {
        var cpu = runOnCpu("SET a, 2",
                           "MOD a, 0")  ;
        assert.equal(cpu.get("a"), 0)   ;
    },

    'MOD by nonzero should put modulus in destination': function () {
        var cpu = runOnCpu("SET a, 7",
                           "MOD a, 2")  ;
        assert.equal(cpu.get("a"), 1)   ; // 7 % 2 = 1.
    },

    'MOD with no next word values should take three cycles to perform': function () {
        var cpu = runOnCpu("MOD a, 1")  ;
        assert.equal(cpu.cycle, 3)  ;
    },

    'MDI by zero should put zero in destination': function () {
        var cpu = runOnCpu("SET a, 2",
                           "MDI a, 0")  ;
        assert.equal(cpu.get("a"), 0)   ;
    },

    'MDI by nonzero should put modulus in destination': function () {
        // -7 % 2 = -1
        var cpu = runOnCpu("SET a, 0xfff9", // -7
                           "MDI a, 2")  ;
        assert.equal(cpu.get("a"), 0xffff)  ; // -1 (0xFFFF).
    },

    'MDI with no next word values should take three cycles to perform': function () {
        var cpu = runOnCpu("MDI a, 1")  ;
        assert.equal(cpu.cycle, 3)  ;
    },

    'AND should put bitwise and in destination': function () {
        var cpu = runOnCpu("SET a, 0x0fff",
                           "AND a, 0xffF0") ;
        assert.equal(cpu.get("a"), 0x0ff0)  ; // 0x0FFF & 0xFFF0 = 0x0FF0.
    },

    'AND with no next word values should take one cycle to perform': function () {
        var cpu = runOnCpu("AND a, 1")  ;
        assert.equal(cpu.cycle, 1)  ;
    },

    'BOR should put bitwise or in destination': function () {
        var cpu = runOnCpu("SET a, 0xf000",
                           "BOR a, 0x000f") ;
        assert.equal(cpu.get("a"), 0xf00f)  ; // 0xF000 | 0x000F = 0xF00F.
    },

    'BOR with no next word values should take one cycle to perform': function () {
        var cpu = runOnCpu("BOR a, 1")  ;
        assert.equal(cpu.cycle, 1)  ;
    },

    'XOR should put bitwise exclusive or in destination': function () {
        var cpu = runOnCpu("SET a, 0xfff0",
                           "XOR a, 0x0fff") ;
        assert.equal(cpu.get("a"), 0xf00f)  ; // 0xFFF0 ^ 0x0FFF = 0xF00F.
    },

    'XOR with no next word values should take one cycle to perform': function () {
        var cpu = runOnCpu("XOR a, 1")  ;
        assert.equal(cpu.cycle, 1)  ;
    },

    'SHR should shift bits right while zero padding and put bits shifted out of the result in EX': function () {
        var cpu = runOnCpu("SET a, 0xffff",
                           "SHR a, 8")  ;
        assert.equal(cpu.get("a"), 0x00ff)  ; // 0xFFFF >> 8 = 0x00FF.
        assert.equal(cpu.get("ex"), 0xff00) ; // Bits shifted out: 0xFF.
    },

    'SHR with no next word values should take one cycle to perform': function () {
        var cpu = runOnCpu("SHR a, 1")  ;
        assert.equal(cpu.cycle, 1)  ;
    },

    'ASR should shift bits right while sign extending positive numbers and put bits shifted out of the result in EX': function () {
        var cpu = runOnCpu("SET a, 0x7fff", // Positive number.
                           "ASR a, 8")  ;
        assert.equal(cpu.get("a"), 0x007f)  ; // 0x7FFF >> 8 (arithmetic) = 0x007F.
        assert.equal(cpu.get("ex"), 0xff00) ; // Bits shifted out.
    },

    'ASR should shift bits right while sign extending negative numbers and put bits shifted out of the result in EX': function () {
        var cpu = runOnCpu("SET a, 0xffff", // Negative number (-1).
                           "ASR a, 8")  ;
        assert.equal(cpu.get("a"), 0xffff)  ; // -1 >> 8 (arithmetic) = -1.
        assert.equal(cpu.get("ex"), 0xff00) ; // Bits shifted out.
    },

    'ASR with no next word values should take one cycle to perform': function () {
        var cpu = runOnCpu("ASR a, 1")  ;
        assert.equal(cpu.cycle, 1)  ;
    },

    'SHL should shift bits left and put bits shifted out of the result in EX': function () {
        var cpu = runOnCpu("SET a, 0xffff",
                           "SHL a, 8")  ;
        assert.equal(cpu.get("a"), 0xff00)  ; // 0xFFFF << 8 = 0xFFFF00. Truncated to 0xFF00.
        assert.equal(cpu.get("ex"), 0x00ff) ; // Bits shifted out: 0xFF.
    },

    'SHL with no next word values should take one cycle to perform': function () {
        var cpu = runOnCpu("SHL a, 1")  ;
        assert.equal(cpu.cycle, 1)  ;
    },

    'IFB should proceed to the following instruction when bitwise and of its values is nonzero': function () {
        var cpu = runOnCpu("IFB 6, 3", // 6 (0110) & 3 (0011) = 2 (0010), which is nonzero.
                           "SET x, 1")  ;
        assert.equal(cpu.get("x"), 1)   ; // SET x, 1 should execute.
    },

    'IFB with a true condition and one next word value should take three cycles to perform not including its next instruction': function () {
        var cpu = runOnCpu("IFB 6, 3", // Condition is true.
                           "SET x, 1")  ;
        assert.equal(cpu.cycle, (2 + 1) + 1)   ; // IFB (2 cycles) + SET (1 cycle) + next_word_for_IFB (1 cycle)
                                                // The original comment says "not including its next instruction",
                                                // but the assert adds 1, implying SET x,1 is counted.
                                                // Let's stick to the numerical value.
    },

    'IFB should skip the following instruction when bitwise and of its values is zero': function () {
        var cpu = runOnCpu("IFB 4, 3", // 4 (0100) & 3 (0011) = 0 (0000), which is zero.
                           "SET x, 1")  ;
        assert.equal(cpu.get("x"), 0)   ; // SET x, 1 should be skipped.
    },

    'IFB with a false condition and one next word value should take three cycles to perform plus one for each skipped instruction': function () {
        // (2 cycles for IFB itself) + (1 cycle for next word) + (1 cycle for skipping the next instruction)
        // Total 4 cycles.
        // The test for this is missing the actual assert. It ends abruptly.
        // I will assume the prompt means "generate Type I clone of the *provided* code",
        // even if the provided code is incomplete.
        // So, I'll just format the line as is.
    }
};