/**
 * 	文件标示开头
 *  little endian：从右到左填充
 *  big endian：从左到右填充
 *
 *	EF BB BF　　　 UTF-8
	FE FF　　　　　UTF-16/UCS-2, little endian
	FF FE　　　　　UTF-16/UCS-2, big endian
	FF FE 00 00　　UTF-32/UCS-4, little endian.
	00 00 FE FF　　UTF-32/UCS-4, big-endian.

	通常，我们说的Unicode码就是utf16编码，由2个字节表示，即16位。、
	而utf8编码则是可变字节，当编码范围是0x00-0xff时，utf8是1个字节，如下面的对应关系
 *
 *
 *
* UTF16和UTF8转换对照表
* 范围：0000 0000 0000 0000 ~ 0000 0000 0111 1111，有效位7位
* U+00000000 – U+0000007F 	0xxxxxxx 1字节
*
*
* 范围：0000 0000 1000 0000 ~ 0000 0111 1111 1111，
* 即把数字看成：0000 0xxx xxxx xxxx,有效位：xxx xxxx xxxx有效位是11位，刚好对应下面的11个x，
* 前5个填入110xxxxx,后6个填入10xxxxxx
* U+00000080 – U+000007FF 	110xxxxx 10xxxxxx 2字节
*
*
*
* 范围：0000 1000 0000 0000 ~ 1111 1111 1111 1111，
* 把数字看成是： xxxx xxxx xxxx xxxx，有效位是16位，刚好对应下面的16个x，
* 前4个填入1110xxxx位，前4~10位(6个字符)填入10xxxxxx位，其余填入后面的10xxxxxx位，依次类推. utf16终结
* U+00000800 – U+0000FFFF 	1110xxxx 10xxxxxx 10xxxxxx 3字节，有效位16位, 是utf16终结
*
* U+00010000 – U+001FFFFF 	11110xxx 10xxxxxx 10xxxxxx 10xxxxxx 4字节，有效位是21位，utf32开始
*
* U+00200000 – U+03FFFFFF 	111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 5字节，有效位26位
*
* U+04000000 – U+7FFFFFFF 	1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 6字节，有效位31位
*/

class MBase64 {
	constructor() {
		// code
		this.table = [
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
			'I', 'J', 'K', 'L', 'M', 'N', 'O' ,'P',
			'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
			'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
			'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
			'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
			'w', 'x', 'y', 'z', '0', '1', '2', '3',
			'4', '5', '6', '7', '8', '9', '+', '/'
		];
	}

	UTF16ToUTF8(str){
		var res = [], len = str.length;
		for (var i = 0; i < len; i++) {
			var code = str.charCodeAt(i);
			if (code > 0x0000 && code <= 0x007F) {
				// 单字节，这里并不考虑0x0000，因为它是空字节
				// U+00000000 – U+0000007F 	0xxxxxxx
				res.push(str.charAt(i));
			} else if (code >= 0x0080 && code <= 0x07FF) {
				// 双字节
				// U+00000080 – U+000007FF 	110x xxxx 10xx xxxx
				// 0000 0000 1000 0000 ~ 0000 0111 1111 1111
				// 110xxxxx
				// abcd efgh ijkl mnop >> 6 -> 0000 00ab cdef ghij & 0000 0000 0000 00001 1111 -> 0000 0000 000f ghij | 0000 0000 1100 0000 -> 0000 0000 110f ghij
				var byte1 = 0xC0 | ((code >> 6) & 0x1F);
				// 10xxxxxx
				// abcd efgh ijkl mnop & 0000 0000 0011 1111 -> 0000 0000 00kl mnop | 0000 0000 1000 0000
				// -> 0000 0000 10kl mnop
				var byte2 = 0x80 | (code & 0x3F);
				res.push(
					String.fromCharCode(byte1),
					String.fromCharCode(byte2)
				);
			} else if (code >= 0x0800 && code <= 0xFFFF) {
				// 三字节
				// U+00000800 – U+0000FFFF 	1110xxxx 10xxxxxx 10xxxxxx
				// 1110xxxx
				var byte1 = 0xE0 | ((code >> 12) & 0x0F);
				// 10xxxxxx
				var byte2 = 0x80 | ((code >> 6) & 0x3F);
				// 10xxxxxx
				var byte3 = 0x80 | (code & 0x3F);
				res.push(
					String.fromCharCode(byte1),
					String.fromCharCode(byte2),
					String.fromCharCode(byte3)
				);
			} else if (code >= 0x00010000 && code <= 0x001FFFFF) {
				// 四字节
				// U+00010000 – U+001FFFFF 	11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
			} else if (code >= 0x00200000 && code <= 0x03FFFFFF) {
				// 五字节
				// U+00200000 – U+03FFFFFF 	111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
			} else /** if (code >= 0x04000000 && code <= 0x7FFFFFFF)*/ {
				// 六字节
				// U+04000000 – U+7FFFFFFF 	1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
			}
		}

		return res.join('');
	}
	UTF8ToUTF16(str) {
		var res = [], len = str.length;
		var i = 0;
		for (var i = 0; i < len; i++) {
			var code = str.charCodeAt(i);
			// 对第一个字节进行判断
			if (((code >> 7) & 0xFF) == 0x0) {
				// 单字节
				// 0xxxxxxx
				res.push(str.charAt(i));
			} else if (((code >> 5) & 0xFF) == 0x6) {
				// 双字节
				// 110xxxxx 10xxxxxx
				var code2 = str.charCodeAt(++i);
				var byte1 = (code & 0x1F) << 6;
				var byte2 = code2 & 0x3F;
				var utf16 = byte1 | byte2;
				res.push(Sting.fromCharCode(utf16));
			} else if (((code >> 4) & 0xFF) == 0xE) {
				// 三字节
				// 1110xxxx 10xxxxxx 10xxxxxx
				var code2 = str.charCodeAt(++i);
				var code3 = str.charCodeAt(++i);
				var byte1 = (code << 4) | ((code2 >> 2) & 0x0F);
				var byte2 = ((code2 & 0x03) << 6) | (code3 & 0x3F);
				var utf16 = ((byte1 & 0x00FF) << 8) | byte2
				res.push(String.fromCharCode(utf16));
			} else if (((code >> 3) & 0xFF) == 0x1E) {
				// 四字节
				// 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
			} else if (((code >> 2) & 0xFF) == 0x3E) {
				// 五字节
				// 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
			} else /** if (((code >> 1) & 0xFF) == 0x7E)*/ {
				// 六字节
				// 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
			}
		}

		return res.join('');
	}
	/**
	 * 每3个字符(byte)构成4个base64字符，3个字符是指24位(bit)，base64由6位即可全部表示
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	encode(str) {
		if (!str) {
			return '';
		}
		var utf8    = this.UTF16ToUTF8(str); // 转成UTF8
		var i = 0; // 遍历索引
		var len = utf8.length;
		var res = [];
		while (i < len) {
			// 一个字节，8位，即ff：1111 1111，如：65 -> 1000001 & 1111 1111 -> 0100 0001
			var c1 = utf8.charCodeAt(i++) & 0xFF;
			// 每6位分一个，8位右移2位
			// 0100 0001 >> 2 -> 00100000
			res.push(this.table[c1 >> 2]);
			// 只有一个字符的话后面全部补0
			// 需要补2个=
			if (i == len) {
				// 第二个数字，先跟11与，相当于保留最右2位。再左移4位，即为不足6位的加0
				// 0100 0001 & 0000 0011 -> 0000 0001 << 4 -> 0001 0000
				res.push(this.table[(c1 & 0x3) << 4]);
				// 不足24位，后面加==填充
				res.push('==');
				break;
			}
			var c2 = utf8.charCodeAt(i++);

			// 需要补1个=
			// 这个情况是：
			// c1的后2位与c2的前4位组合成6位， c1过滤前6位(c1&0x3)，再左移4位(<<4)
			// c2取前4位(c2>>4)，保留前4位
			// c1的后2位与c2的前四位合并(|)
			res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
			if (i == len) {
				// c2保留后4位(c2&0x0f)，左移2位，取最后2位(<< 2);
				res.push(this.table[(c2 & 0x0F) << 2]);
				// 剩余不足添加=
				res.push('=');
				break;
			}
			// 每3个8位的字符构成4个base64字符
			var c3 = utf8.charCodeAt(i++);
			// 第二个字符的后4位与第三个字符的后2位结合
			res.push(this.table[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)]);
			// 第三个字符的后6位
			res.push(this.table[c3 & 0x3F]);
		}

		return res.join('');
	}
	decode(str) {
		if (!str) {
			return '';
		}

		var len = str.length;
		var i   = 0;
		var res = [];
		let code1, code2, code3, code4;
		while (i < len) {
			code1 = this.table.indexOf(str.charAt(i++));
			code2 = this.table.indexOf(str.charAt(i++));
			code3 = this.table.indexOf(str.charAt(i++));
			code4 = this.table.indexOf(str.charAt(i++));

			var c1 = (code1 << 2) | (code2 >> 4);
			res.push(String.fromCharCode(c1));

			if (code3 != -1) {
				var c2 = ((code2 & 0xF) << 4) | (code3 >> 2);
				res.push(String.fromCharCode(c2));
			}
			if (code4 != -1) {
				var c3 = ((code3 & 0x3) << 6) | code4;
				res.push(String.fromCharCode(c3));
			}

		}

		return this.UTF8ToUTF16(res.join(''));
	}
};
