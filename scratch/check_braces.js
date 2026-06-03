const fs = require('fs');
const content = fs.readFileSync('src/app/builder/page.js', 'utf8');

const stack = [];
const lines = content.split('\n');

for (let lineNum = 0; lineNum < lines.length; lineNum++) {
  const line = lines[lineNum];
  for (let colNum = 0; colNum < line.length; colNum++) {
    const char = line[colNum];
    if (char === '{') {
      stack.push({ lineNum: lineNum + 1, colNum: colNum + 1, snippet: line.substring(Math.max(0, colNum - 10), Math.min(line.length, colNum + 30)) });
    } else if (char === '}') {
      if (stack.length === 0) {
        console.log(`Error: Extra closing brace at Line ${lineNum + 1}, Col ${colNum + 1}`);
      } else {
        stack.pop();
      }
    }
  }
}

console.log(`Unclosed braces stack size: ${stack.length}`);
if (stack.length > 0) {
  console.log("Unclosed braces details:");
  stack.forEach((item, idx) => {
    console.log(`[${idx}] Line ${item.lineNum}, Col ${item.colNum}: ... ${item.snippet.trim()} ...`);
  });
}
