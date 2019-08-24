/**
 * png 图片定义
 * 详细说明参考：http://blog.csdn.net/joqian/article/details/8290389
 */

module.exports.blockType = {
	'IHDR': {
		name: 'IHDR',
		cnName: '文件头数据块',
		multi: false,
		optional: false,
		locationLimit: 'first block'
	},
	'cHRM': {
		name: 'cHRM',
		cnName: '基色和白色点数据块',
		multi: false,
		optional: true,
		locationLimit: 'between PLTE and IDAT'
	},
	'gAMA': {
		name: 'gAMA',
		cnName: '图像γ数据块',
		multi: false,
		optional: true,
		locationLimit: 'between PLTE and IDAT'
	},
	'sBIT': {
		name: 'sBIT',
		cnName: '样本有效位数据块',
		multi: false,
		optional: true,
		locationLimit: 'between PLTE and IDAT'
	},
	'PLTE': {
		name: 'PLTE',
		cnName: '调色板数据块',
		multi: false,
		optional: true,
		locationLimit: 'before IDAT'
	},
	'bKGD': {
		name: 'bKGD',
		cnName: '背景颜色数据块',
		multi: false,
		optional: true,
		locationLimit: 'between PLTE and IDAT'
	},
	'hIST': {
		name: 'hIST',
		cnName: '图像直方图数据块',
		multi: false,
		optional: true,
		locationLimit: 'between PLTE and IDAT'
	},
	'tRNS': {
		name: 'cHRM',
		cnName: '图像透明数据块',
		multi: false,
		optional: true,
		locationLimit: 'between PLTE and IDAT'
	},
	'oFFs': {
		name: 'oFFs',
		cnName: '(专用公共数据块)',
		multi: false,
		optional: true,
		locationLimit: 'before IDAT'
	},
	'pHYs': {
		name: 'pHYs',
		cnName: '物理像素尺寸数据块',
		multi: false,
		optional: true,
		locationLimit: 'before IDAT'
	},
	'sCAL': {
		name: 'sCAL',
		cnName: '(专用公共数据块)',
		multi: false,
		optional: true,
		locationLimit: 'before IDAT'
	},
	'IDAT': {
		name: 'IDAT',
		cnName: '图像数据块',
		multi: true,
		optional: false,
		locationLimit: 'concat other IDAT'
	},
	'tIME': {
		name: 'tIME',
		cnName: '图像最后修改时间数据块',
		multi: false,
		optional: true,
		locationLimit: 'unlimit'
	},
	'tEXt': {
		name: 'tEXt',
		cnName: '文本信息数据块',
		multi: true,
		optional: true,
		locationLimit: 'unlimit'
	},
	'zTXt': {
		name: 'zTXt',
		cnName: '压缩文本数据块',
		multi: true,
		optional: true,
		locationLimit: 'unlimit'
	},
	'fRAc': {
		name: 'fRAc',
		cnName: '(专用公共数据块)',
		multi: true,
		optional: true,
		locationLimit: 'unlimit'
	},
	'gIFg': {
		name: 'gIFg',
		cnName: '(专用公共数据块)',
		multi: true,
		optional: true,
		locationLimit: 'unlimit'
	},
	'gIFt': {
		name: 'gIFt',
		cnName: '(专用公共数据块)',
		multi: true,
		optional: true,
		locationLimit: 'unlimit'
	},
	'gIFx': {
		name: 'gIFx',
		cnName: '(专用公共数据块)',
		multi: true,
		optional: true,
		locationLimit: 'unlimit'
	},
	'IEND': {
		name: 'tIME',
		cnName: '图像最后修改时间数据块',
		multi: false,
		optional: false,
		locationLimit: 'last block'
	}
};

// Length (长度)					4字节		指定数据块中数据域的长度，其长度不超过(231－1)字节
// Chunk Type Code (数据块类型码)	4字节		数据块类型码由ASCII字母(A-Z和a-z)组成
// Chunk Data (数据块数据)			可变长度	存储按照Chunk Type Code指定的数据，由Length的值决定
// CRC (循环冗余检测)				4字节		存储用来检测是否有错误的循环冗余码 
module.exports.dataBlockDefine = {
	length: 4,
	chunkTypeCode: 4,
	chunkData: Infinity,
	crc: 4
}

module.exports.headerDefine = {
	'decimal': [137, 80, 78, 71, 13, 10, 26, 10],
	'hex': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
}