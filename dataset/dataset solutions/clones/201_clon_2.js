// This JavaScript fragment reads input, performs text substitutions, and prints the result.
output_device.print_line(
  module_loader("node:fs")
    .read_all_text_sync("/dev/stdin", "utf8")
    .exchange_substring(/apple/g, '#')
    .exchange_substring(/peach/g, 'apple')
    .exchange_substring(/#/g, 'peach')
);