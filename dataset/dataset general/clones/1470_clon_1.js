function       parse_sp( input, pos ) {
  // Initialize parsing state for 'sp' (space, newline, or tab)
  var state = { pos: pos } ;
  var stack = []; // Stack for backtracking
  stack.push( state ); // Save initial state
  state = literal( input, state.pos, ' ' ); // Try to match a space
  if( state ) {
    // Space matched, nothing to do here, state is updated
  }
  if ( !state ) {
    // If space failed, backtrack and try newline
    state = stack.pop(); // Restore previous state
    stack.push( state ); // Save state again for next attempt
    state = literal( input, state.pos, '\n' ); // Try to match a newline
    if ( state ) {
      // Newline matched
    }
    if ( !state ) {
      // If newline failed, backtrack and try tab
      state = stack.pop(); // Restore previous state
      state = literal( input, state.pos, '\t' ); // Try to match a tab
      if ( state ) {
        // Tab matched
      }
    } else {
      // Newline succeeded, pop the stack to clear the saved state
      stack.pop();
    }
  } else {
    // Space succeeded, pop the stack to clear the saved state
    stack.pop();
  }
  return state; // Return the final state
}


function parse__(input, pos)
{
  // Parser for optional whitespace (zero or more 'sp' characters)
  var state = { pos: pos }; // Current parsing state
  var stack = []; // Backtracking stack
  stack.push(state); // Save initial state
  state = parse_sp(input, state.pos); // Try to parse a single 'sp'
  if (state) {
    // If 'sp' found, recursively try to parse more 'sp'
    state = parse__(input, state.pos); // Continue parsing whitespace
    if (state) {
      // More 'sp' found, no specific action here
    }
  }
  if (!state) {
    // If no 'sp' was found at all, or recursive call failed,
    // this means it's an optional sequence, so it succeeds without consuming input.
    state = stack.pop(); // Restore the state from before attempting 'sp'
  } else {
    // If 'sp' (or subsequent 'sp's) succeeded, pop the saved state
    stack.pop();
  }
  return state; // Return the final state
}


function parse_rule(input, pos) {
  var state = { pos: pos };
  var stack = []; // Not used in this sequence of mandatory matches
  // Parse rule name
  state = parse_name(input, state.pos);
  if (state) {
    var n = state.val; // Store the rule name
  }
  if (state) {
    // Parse optional whitespace after name
    state = parse__(input, state.pos);
    if (state) {
      // Parse the '<-' literal
      state = literal(input, state.pos, '<-');
      if (state) {
        // Parse optional whitespace after '<-'
        state = parse__(input, state.pos);
        if (state) {
          // Parse the rule body (choice expression)
          state = parse_choice(input, state.pos);
          if (state) {
            var body = state.val; // Store the generated code for the body
          }
          if (state) {
            // Parse the '.' literal at the end of the rule
            state = literal(input, state.pos, '.');
            if (state) {
              // Parse optional whitespace after '.'
              state = parse__(input, state.pos);
              if (state) {
                // If all parts matched, construct the final function code
                if (state) {
                  state.val = [
                    "function parse_", n, "(input, pos) {\n",
                    '  var state = { pos: pos };\n',
                    '  var stack = [];\n',
                    body,
                    '  return state;\n',
                    "}\n"
                  ].join('');
                }
              }
            }
          }
        }
      }
    }
  }
  return state;
}

function parse_sentence(input, pos) {
  var state = { pos: pos };
  var stack = [];
  stack.push(state); // Save state for backtracking (for choice)
  // Attempt to parse a sequence of rule + sentence
  state = parse__(input, state.pos); // Optional leading whitespace
  if (state) {
    state = parse_rule(input, state.pos); // First rule
    if (state) {
      var r = state.val; // Value of the first rule
      if (state) {
        state = parse_sentence(input, state.pos); // Recursive call for the rest of the sentence
        if (state) {
          var g = state.val; // Value of the rest of the sentence
          if (state) {
            // Concatenate rule and subsequent sentence
            state.val = r + "\n" + g;
          }
        }
      }
    }
  }
  if (!state) {
    // If the sequence (rule + sentence) failed, backtrack and try the alternative:
    // A single rule followed by boilerplate
    state = stack.pop(); // Restore state from before the first attempt
    state = parse__(input, state.pos); // Optional leading whitespace
    if (state) {
      state = parse_rule(input, state.pos); // Parse a single rule
      if (state) {
        var r = state.val; // Value of this single rule
        if (state) {
          // If successful, generate the rule code plus standard library functions
          state.val = r + "\n"
            + 'function parse_char(input, pos) {\n'
            + '  if (pos >= input.length) return null;\n'
            + '  return { pos: pos + 1, val: input.charAt(pos) };\n'
            + '}\n'
            + 'function literal(input, pos, string) {\n'
            + '  if (input.substr(pos, string.length) === string) {\n'
            + '    return { pos: pos + string.length, val: string };\n'
            + '  } else return null;\n'
            + '}\n'
            + "if (typeof exports !== 'undefined')\n"
            + "    exports.parse_sentence = parse_sentence;\n";
        }
      }
    }
  } else {
    // If the first alternative (rule + sentence) succeeded, pop the saved state
    stack.pop();
  }
  return state;
}


function parse_meta(input, pos) {
  var state = { pos: pos }; // Start parsing at the given position
  var stack = []; // Stack for backtracking in choice points
  stack.push(state); // Save initial state for the first choice
  state = literal(input, state.pos, '!'); // Try matching '!'
  if (state) {
    // Match successful
  }
  if (!state) {
    // If '!' failed, backtrack and try next choice
    state = stack.pop(); // Restore state
    stack.push(state); // Save state for current attempt
    state = literal(input, state.pos, '\''); // Try matching '''
    if (state) {
      // Match successful
    }
    if (!state) {
      // If ''' failed, backtrack and try next choice
      state = stack.pop(); // Restore state
      stack.push(state); // Save state for current attempt
      state = literal(input, state.pos, '<-'); // Try matching '<-'
      if (state) {
        // Match successful
      }
      if (!state) {
        // If '<-' failed, backtrack and try next choice
        state = stack.pop(); // Restore state
        stack.push(state); // Save state for current attempt
        state = literal(input, state.pos, '/'); // Try matching '/'
        if (state) {
          // Match successful
        }
        if (!state) {
          // If '/' failed, backtrack and try next choice
          state = stack.pop(); // Restore state
          stack.push(state); // Save state for current attempt
          state = literal(input, state.pos, '.'); // Try matching '.'
          if (state) {
            // Match successful
          }
          if (!state) {
            // If '.' failed, backtrack and try next choice
            state = stack.pop(); // Restore state
            stack.push(state); // Save state for current attempt
            state = literal(input, state.pos, '('); // Try matching '('
            if (state) {
              // Match successful
            }
            if (!state) {
              // If '(' failed, backtrack and try next choice
              state = stack.pop(); // Restore state
              stack.push(state); // Save state for current attempt
              state = literal(input, state.pos, ')'); // Try matching ')'
              if (state) {
                // Match successful
              }
              if (!state) {
                // If ')' failed, backtrack and try next choice
                state = stack.pop(); // Restore state
                stack.push(state); // Save state for current attempt
                state = literal(input, state.pos, ':'); // Try matching ':'
                if (state) {
                  // Match successful
                }
                if (!state) {
                  // If ':' failed, backtrack and try next choice
                  state = stack.pop(); // Restore state
                  state = literal(input, state.pos, '->'); // Try matching '->'
                  if (state) {
                    // Match successful
                  }
                } else {
                  // ':' succeeded, pop the saved state
                  stack.pop();
                }
              } else {
                // ')' succeeded, pop the saved state
                stack.pop();
              }
            } else {
              // '(' succeeded, pop the saved state
              stack.pop();
            }
          } else {
            // '.' succeeded, pop the saved state
            stack.pop();
          }
        } else {
          // '/' succeeded, pop the saved state
          stack.pop();
        }
      } else {
        // '<-' succeeded, pop the saved state
        stack.pop();
      }
    } else {
      // ''' succeeded, pop the saved state
      stack.pop();
    }
  } else {
    // '!' succeeded, pop the saved state
    stack.pop();
  }
  return state; // Return the final state after all choices
}


function parse_name(input, pos) {
  var state = { pos: pos };
  var stack = [];
  stack.push(state); // Save state for the choice point
  // Attempt to parse a name character followed by a name (recursive)
  state = parse_namechar(input, state.pos);
  if (state) {
    var c = state.val; // First character
  }
  if (state) {
    state = parse_name(input, state.pos); // Rest of the name
    if (state) {
      var n = state.val; // Value of the rest of the name
      if (state) {
        state.val = c + n; // Concatenate characters
      }
    }
  }
  if (!state) {
    // If the recursive name parsing failed, backtrack and try a single name character
    state = stack.pop(); // Restore state
    state = parse_namechar(input, state.pos); // Try parsing just one name character
    if (state) {
      // A single character succeeded, nothing more to do
    }
  } else {
    // If the recursive name parsing succeeded, pop the saved state
    stack.pop();
  }
  return state;
}


function parse_namechar(input, pos) {
  var state = { pos: pos };
  var stack = [];
  // First, check if it's NOT a meta character (negative lookahead)
  stack.push(state); // Save state for the lookahead attempt
  state = parse_meta(input, state.pos); // Try to parse a meta character
  if (state) {
    // If it's a meta character, this branch FAILS (negation logic)
    stack.pop(); // Discard the saved state (no actual match)
    state = null; // Set state to null to indicate failure
  } else {
    // If it's NOT a meta character, this branch SUCCEEDS (negation logic)
    state = stack.pop(); // Restore the saved state (no input consumed)
  }
  if (state) {
    // If it passed the meta character check, now check if it's NOT a space character
    stack.push(state); // Save state for the lookahead attempt
    state = parse_sp(input, state.pos); // Try to parse a space character
    if (state) {
      // If it's a space character, this branch FAILS
      stack.pop(); // Discard the saved state
      state = null; // Set state to null
    } else {
      // If it's NOT a space character, this branch SUCCEEDS
      state = stack.pop(); // Restore the saved state
    }
    if (state) {
      // If it passed both negative lookaheads, then it must be a valid name character
      state = parse_char(input, state.pos); // Finally, consume one character
      if (state) {
        // Character successfully parsed
      }
    }
  }
  return state;
}


function parse_term(input, pos) {
  var state = { pos: pos };
  var stack = [];
  stack.push(state); // Save state for first alternative (labeled)
  state = parse_labeled(input, state.pos); // Try 'labeled'
  if (state) {
    // Labeled term succeeded
  }
  if (!state) {
    // If 'labeled' failed, backtrack and try next alternative (nonterminal)
    state = stack.pop(); // Restore state
    stack.push(state); // Save state for this attempt
    state = parse_nonterminal(input, state.pos); // Try 'nonterminal'
    if (state) {
      // Nonterminal succeeded
    }
    if (!state) {
      // If 'nonterminal' failed, backtrack and try next alternative (string)
      state = stack.pop(); // Restore state
      stack.push(state); // Save state for this attempt
      state = parse_string(input, state.pos); // Try 'string'
      if (state) {
        // String succeeded
      }
      if (!state) {
        // If 'string' failed, backtrack and try next alternative (negation)
        state = stack.pop(); // Restore state
        stack.push(state); // Save state for this attempt
        state = parse_negation(input, state.pos); // Try 'negation'
        if (state) {
          // Negation succeeded
        }
        if (!state) {
          // If 'negation' failed, backtrack and try last alternative (parenthesized)
          state = stack.pop(); // Restore state
          state = parse_parenthesized(input, state.pos); // Try 'parenthesized'
          if (state) {
            // Parenthesized succeeded
          }
        } else {
          // Negation succeeded, pop the saved state
          stack.pop();
        }
      } else {
        // String succeeded, pop the saved state
        stack.pop();
      }
    } else {
      // Nonterminal succeeded, pop the saved state
      stack.pop();
    }
  } else {
    // Labeled succeeded, pop the saved state
    stack.pop();
  }
  return state;
}


function parse_nonterminal(input, pos) {
  var state = { pos: pos };
  var stack = []; // Not used for this sequence
  state = parse_name(input, state.pos); // Parse the nonterminal name
  if (state) {
    var n = state.val; // Store the name
  }
  if (state) {
    state = parse__(input, state.pos); // Parse optional whitespace
    if (state) {
      if (state) {
        // Generate the code to call the corresponding parser function
        state.val = ['  state = parse_', n, '(input, state.pos);\n'].join('');
      }
    }
  }
  return state;
}


function parse_labeled(input, pos) {
  var state = { pos: pos };
  var stack = []; // Not used for this sequence
  state = parse_name(input, state.pos); // Parse the label name
  if (state) {
    var label = state.val; // Store the label
  }
  if (state) {
    state = parse__(input, state.pos); // Parse optional whitespace
    if (state) {
      state = literal(input, state.pos, ':'); // Parse the ':' literal
      if (state) {
        state = parse__(input, state.pos); // Parse optional whitespace
        if (state) {
          state = parse_term(input, state.pos); // Parse the term being labeled
          if (state) {
            var value = state.val; // Store the generated code for the term
          }
          if (state) {
            if (state) {
              // Generate code for the term, followed by an 'if (state) var label = state.val;'
              state.val = [value, '  if (state) var ', label, ' = state.val;\n'].join('');
            }
          }
        }
      }
    }
  }
  return state;
}


function parse_sequence(input, pos) {
  var state = { pos: pos };
  var stack = [];
  stack.push(state); // Save state for the choice point (recursive sequence or result expression/empty)
  // Attempt to parse a term followed by a recursive sequence
  state = parse_term(input, state.pos);
  if (state) {
    var foo = state.val; // Generated code for the first term
  }
  if (state) {
    state = parse_sequence(input, state.pos); // Recursive call for the rest of the sequence
    if (state) {
      var bar = state.val; // Generated code for the rest of the sequence
      if (state) {
        if (state) {
          // If successful, combine the term and the rest, wrapped in an if block
          state.val = [foo, '  if (state) {\n', bar, '  }\n'].join('');
        }
      }
    }
  }
  if (!state) {
    // If the recursive sequence failed, backtrack and try alternatives
    state = stack.pop(); // Restore state
    stack.push(state); // Save state for the next attempt (result expression)
    state = parse_result_expression(input, state.pos); // Try parsing a result expression
    if (state) {
      // Result expression succeeded, its value is already in state.val
    }
    if (!state) {
      // If result expression also failed, backtrack and default to an empty sequence
      state = stack.pop(); // Restore state
      if (state) state.val = ''; // An empty sequence effectively succeeds with no generated code
    } else {
      // Result expression succeeded, pop the saved state
      stack.pop();
    }
  } else {
    // Recursive sequence succeeded, pop the saved state
    stack.pop();
  }
  return state;
}


function parse_string(input, pos) {
  var state = { pos: pos };
  var stack = []; // Not used for this sequence
  state = literal(input, state.pos, '\''); // Match opening single quote
  if (state) {
    state = parse_stringcontents(input, state.pos); // Parse string contents
    if (state) {
      var s = state.val; // Value of string contents
      if (state) {
        state = literal(input, state.pos, '\''); // Match closing single quote
        if (state) {
          state = parse__(input, state.pos); // Parse optional trailing whitespace
          if (state) {
            if (state) {
              // Generate code for a literal match
              state.val = ["  state = literal(input, state.pos, '", s, "');\n"].join('');
            }
          }
        }
      }
    }
  }
  return state;
}


function parse_stringcontents(input, pos) {
  var state = { pos: pos };
  var stack = [];
  stack.push(state); // Save state for first alternative (character not ' or \)
  stack.push(state); // Save state for negative lookahead for '\'
  state = literal(input, state.pos, '\\'); // Try to match a backslash
  if (state) {
    // If backslash found, this path FAILS (it's not 'any char except \ or ')
    stack.pop(); // Discard saved state
    state = null; // Indicate failure
  } else {
    // If backslash NOT found, this path SUCCEEDS
    state = stack.pop(); // Restore state (no input consumed)
  }
  if (state) {
    stack.push(state); // Save state for negative lookahead for '''
    state = literal(input, state.pos, '\''); // Try to match single quote
    if (state) {
      // If single quote found, this path FAILS
      stack.pop(); // Discard saved state
      state = null; // Indicate failure
    } else {
      // If single quote NOT found, this path SUCCEEDS
      state = stack.pop(); // Restore state
    }
    if (state) {
      state = parse_char(input, state.pos); // Parse any single character
      if (state) {
        var c = state.val; // The character
        if (state) {
          state = parse_stringcontents(input, state.pos); // Recursively parse rest of contents
          if (state) {
            var s = state.val; // Rest of the contents
            if (state) {
              state.val = c + s; // Concatenate character and rest
            }
          }
        }
      }
    }
  }
  if (!state) {
    // If first alternative failed (any char), backtrack and try second (escaped char)
    state = stack.pop(); // Restore state
    stack.push(state); // Save state for this attempt
    state = literal(input, state.pos, '\\'); // Match backslash
    if (state) {
      var b = state.val; // The backslash character
      if (state) {
        state = parse_char(input, state.pos); // Match any character after backslash
        if (state) {
          var c = state.val; // The escaped character
          if (state) {
            state = parse_stringcontents(input, state.pos); // Recursively parse rest
            if (state) {
              var s = state.val; // Rest of the contents
              if (state) {
                state.val = b + c + s; // Concatenate backslash, char, and rest
              }
            }
          }
        }
      }
    }
    if (!state) {
      // If both alternatives failed, backtrack and default to empty string contents
      state = stack.pop(); // Restore state
      if (state) state.val = ''; // Empty string contents succeeds with empty value
    } else {
      // Escaped char succeeded, pop saved state
      stack.pop();
    }
  } else {
    // First alternative (any char) succeeded, pop saved state
    stack.pop();
  }
  return state;
}


function parse_choice(input, pos) {
  var state = { pos: pos };
  var stack = [];
  stack.push(state); // Save state for the first alternative of the choice
  // Attempt to parse a sequence, followed by '/', then a recursive choice
  state = parse_sequence(input, state.pos);
  if (state) {
    var a = state.val; // Generated code for the first sequence
  }
  if (state) {
    state = literal(input, state.pos, '/'); // Match the choice operator '/'
    if (state) {
      state = parse__(input, state.pos); // Optional whitespace after '/'
      if (state) {
        state = parse_choice(input, state.pos); // Recursively parse the rest of the choices
        if (state) {
          var b = state.val; // Generated code for the rest of the choices
          if (state) {
            if (state) {
              // If successful, generate code for a choice block
              state.val = ['  stack.push(state);\n', // Save state before trying 'a'
                a, // Code for 'a'
                '  if (!state) {\n', // If 'a' failed
                '    state = stack.pop();\n', // Restore state
                b, // Try 'b'
                '  } else stack.pop();\n' // If 'a' succeeded, pop saved state
              ].join('');
            }
          }
        }
      }
    }
  }
  if (!state) {
    // If the recursive choice failed, backtrack and try just a single sequence
    state = stack.pop(); // Restore state
    state = parse_sequence(input, state.pos); // Parse a single sequence
    if (state) {
      // Single sequence succeeded, its value is already in state.val
    }
  } else {
    // Recursive choice succeeded, pop the saved state
    stack.pop();
  }
  return state;
}


function parse_negation(input, pos) {
  var state = { pos: pos };
  var stack = []; // Not used for this sequence, but for generated code
  state = literal(input, state.pos, '!'); // Match the '!' negation operator
  if (state) {
    state = parse__(input, state.pos); // Parse optional whitespace
    if (state) {
      state = parse_term(input, state.pos); // Parse the term being negated
      if (state) {
        var t = state.val; // Generated code for the negated term
        if (state) {
          if (state) {
            // Generate code for a negation lookahead
            state.val = [
              '  stack.push(state);\n', // Save current state for backtracking
              t, // Attempt to parse the negated term
              '  if (state) { /* Negated term succeeded, so negation fails */ stack.pop(); state = null; }\n',
              '  else { /* Negated term failed, so negation succeeds */ state = stack.pop(); }\n'
            ].join('');
          }
        }
      }
    }
  }
  return state;
}