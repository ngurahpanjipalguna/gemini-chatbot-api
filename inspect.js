import * as genai from '@google/genai';

console.log('🔍 Exported keys dari @google/genai:');
console.log(Object.keys(genai));

console.log('\n📦 Full detail (2 level):');
console.dir(genai, { depth: 2 });
