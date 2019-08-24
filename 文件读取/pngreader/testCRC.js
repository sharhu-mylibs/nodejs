

// x32 + x26 + x23 + x22 + x16 + x12 + x11 + x10 + x8 + x7 + x5 + x4 + x2 + x + 1
const CRC32 = "1110 1101 1011 1000 1000 0011 0010 0000 1".replace(/\s+/g, '').split('').reverse().join('');
// 100000100110000010001110110110111

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
let bufBin = [];
buf.map((item)=>{
	bufBin.push(item.toString(2));
});
var data = bufBin.join('');
// 1001001100100010001001010010001001100011000100110001101100010000
console.log(data);