import { writeFile } from 'node:fs/promises';

const backend = process.env.BACKEND_URL || 'http://localhost:8080';
const content = `window.BACKEND_URL = ${JSON.stringify(backend)};\n`;

await writeFile(new URL('./config.js', import.meta.url), content, 'utf8');
console.log('[build-config] Wrote config.js with BACKEND_URL =', backend);


