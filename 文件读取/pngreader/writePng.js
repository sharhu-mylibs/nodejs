const fs = require('fs');

const zlib = require('zlib');

const {crc, crc32cx, crc32c} = require('./crc.js');

let buf = [
		0x49, 0x48, 0x44, 0x52,
		//块数据块  开始
		0x00, 0x00, 0x09, 0x46,//宽
		0x00, 0x00, 0x09, 0x8d,//高
		0x08, //bitDepth
		0x02, //colorType
		0x00, //compressionMethod
		0x00, //filterMethod
		0x00, //interlaceMethod
		// 数据块结束
	]
// should be
// 6b b6 e0 f2
let mbuf = Buffer.from(buf);
let value = crc(mbuf, mbuf.length);
console.log(value)
console.log(value.toString(16));