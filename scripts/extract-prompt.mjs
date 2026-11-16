import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/ahamm/.gemini/antigravity/brain/9746d667-3d8b-4946-a55a-2e58de4e0be0/.system_generated/logs/transcript_full.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (line.includes('"step_index":1355') || line.includes('"step_index": 1355')) {
    const data = JSON.parse(line);
    fs.writeFileSync('C:/Users/ahamm/.gemini/antigravity/brain/9746d667-3d8b-4946-a55a-2e58de4e0be0/extracted_prompt.txt', data.content, 'utf8');
    console.log('Saved! Length:', data.content.length);
    process.exit(0);
  }
});
