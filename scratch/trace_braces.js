const fs = require('fs');
const content = fs.readFileSync('src/app/builder/page.js', 'utf8');

const stack = [];
const lines = content.split('\n');

for (let lineNum = 0; lineNum < lines.length; lineNum++) {
  const line = lines[lineNum];
  for (let colNum = 0; colNum < line.length; colNum++) {
    const char = line[colNum];
    if (char === '{') {
      stack.push({ lineNum: lineNum + 1, colNum: colNum + 1, text: line.trim() });
    } else if (char === '}') {
      if (stack.length > 0) stack.pop();
    }
  }
  
  // Print stack if we are near the end of the file
  if (lineNum >= lines.length - 20) {
    console.log(`Line ${lineNum + 1}: Stack size = ${stack.length}`);
    stack.forEach((item, idx) => {
      console.log(`  [${idx}] Line ${item.lineNum}: ${item.text}`);
    });
  }
}
