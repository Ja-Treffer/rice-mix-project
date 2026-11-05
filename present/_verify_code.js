const fs = require('fs');
const crypto = require('crypto');

const p = 'E:/hardness/ricemix/present/appendix/2_source_code/demo_source_listing.txt';
const b = fs.readFileSync(p);
console.log('UTF-8 BOM:', (b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) ? 'yes' : 'no');
const s = b.toString('utf8');
const L = s.split('\n');
console.log('total lines:', L.length);
console.log('line 2 :', L[1]);
console.log('line 41:', L[40]);
console.log('CRLF   :', s.includes('\r\n'));

const a = fs.readFileSync('E:/hardness/ricemix/demo/demo.ino');
const c = fs.readFileSync('E:/hardness/ricemix/present/appendix/2_source_code/demo_code.ino');
console.log('ino identical:', a.equals(c),
  '| sha1', crypto.createHash('sha1').update(a).digest('hex').slice(0, 12));
