import { parse as argparse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import { parse as mdparse, toMd } from "npm:md-2-json@2.0.0";

const args = argparse(Deno.args, {
  boolean: [
    // instructions for this script
    "help",

    // output json
    "j",
    "json",

    // output markdown
    "m",
    "markdown",
  ],
  string: [
    // compiler options
    "options",

    // output options
    "output",
    "o",
  ],
});

const commandName = `md2json`;

const usageMessage = `
Usage: ${commandName} [OPTIONS] [-o OUTPUT-FILE] [MARKDOWN-FILE]
Convert a markdown file to json

Options:
  --help              Show this help message

  -j, --json          Convert to json (default)
  -m, --markdown      Convert json to markdown
  -o, --output NAME   Write output to NAME

  Examples:
  ${commandName} -j README.md
  ${commandName} -m a.json
  ${commandName} -o README.json README.md
  cat README.md | ${commandName}
`;

// parse args
const help = args.help;
const readStdin = args._.length == 0;
const outputFilename = args.output || args.o;

let outputJSON = args.json || args.j;
let outputMD = args.markdown || args.m;
let compileStr = "";

if (help) {
  console.log(usageMessage);
  Deno.exit();
}

if (readStdin) {
  const decoder = new TextDecoder();
  for await (const chunk of Deno.stdin.readable) {
    const textChunk = decoder.decode(chunk);
    compileStr += textChunk;
  }
} else {
  const inputFilename = args._.at(0);

  compileStr = await Deno.readTextFile(inputFilename);
}

let result = "";

// only one output type
if (outputMD) {
  result = toMd(JSON.parse(compileStr));
} else {
  result = JSON.stringify(mdparse(compileStr));
}

if (outputFilename) {
  try {
    Deno.writeTextFileSync(outputFilename, result);
  } catch (e) {
    console.log(result);
  }
} else {
  console.log(result);
}
