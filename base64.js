class Base64 {
	constructor() {
		if(!(this instanceof Base64)){
			return new Base64(...arguments);
		}
		this.BASECODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	}

	UTF16ToUTF8(str){
		var utf8 = [];
		for(var i = 0, len = str.length; i < len; i++){
			var char = str[i];
			var charCode = char.charCodeAt(0);
			if(charCode <= 0x7f){
				// 0xxxxxxx 有效位7位，即charCode的二进制应该最大为 111 1111，
				// 不管位数多少这个前面应该都是0，如一个字节，则应该是 0111 111
				// 2个字节应该是 0000 0000 0111 1111，依此类推
				utf8.push(String.fromCharCode(charCode));
			}else if(charCode <= 0x7ff){
				// 110xxxxx 10xxxxxx 有效位11位
				var transformCode = charCode & 0x7ff;
				var code1 = (transformCode >> 6) | 0xc0;
				var code2 = (transformCode & 0x3f) | 0x80;
				utf8.push(String.fromCharCode(code1), String.fromCharCode(code2));
			}else if(charCode <= 0xffff){
				// 1110xxxx 10xxxxxx 10xxxxxx 有效位是16位
				var transformCode = charCode & 0xffff;
				var code1 = (transformCode >> 12) | 0xe0;
				var code2 = (transformCode >> 6 & 0x3f) | 0x80;
				var code3 = (transformCode & 0x3f) | 0x80;
				utf8.push(String.fromCharCode(code1), String.fromCharCode(code2), String.fromCharCode(code3));
			}else if(charCode <= 0x1fffff){
				// 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx 有效位是21位
				var transformCode = charCode & 0x1fffff;
				var code1 = transformCode >> 18 | 0xf0;
				var code2 = transformCode >> 12 & 0x1ff;
				var code3 = transformCode >> 6 & 0x3f;
				var code4 = transformCode & 0x3f;
				utf8.push(String.fromCharCode(code1), String.fromCharCode(code2), String.fromCharCode(code3), String.fromCharCode(code4));
			}else if(charCode <= 0x3ffffff){
				// 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 有效位26位
				var transformCode = charCode & 0x3ffffff;
				var code1 = transformCode >> 24 | 0xf8;
				var code2 = (transformCode >> 18 & 0x3f) | 0x80;
				var code3 = (transformCode >> 12 & 0x3f) | 0x80;
				var code4 = transformCode >> 6 & 0x3f | 0x80;
				var code5 = transformCode & 0x3f;
				utf8.push(String.fromCharCode(code1), String.fromCharCode(code2), String.fromCharCode(code3), String.fromCharCode(code4), String.fromCharCode(code5));
			}else if(charCode <= 0x7fffffff){
				// 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 6字节，有效位31位
				var transformCode = charCode & 0x7fffffff;
				var code1 = transformCode >> 30 | 0xfc;
				var code2 = (transformCode >> 24 & 0x3f) | 0x80;
				var code3 = (transformCode >> 18 & 0x3f) | 0x80;
				var code4 = (transformCode >> 12 & 0x3f) | 0x80;
				var code5 = (transformCode >> 6 & 0x3f) | 0x80;
				var code5 = transformCode & 0x3f;
				utf8.push(String.fromCharCode(code1), String.fromCharCode(code2), String.fromCharCode(code3), String.fromCharCode(code4), String.fromCharCode(code5), String.fromCharCode(code6));
			}
		}

		return utf8.join('');
	}

	UTF8ToUTF16(str){
		var utf16 = [];
		for(var i = 0, len = str.length; i < len;){
			var code = str.charCodeAt(i++);
			if(((code >> 7) & 0xff) === 0x0){
				// 0xxxxxxx, 单字节，asii标准码
				utf16.push(String.fromCharCode(code));
			}else if(((code >> 5) & 0xf) === 0x6){
				// 110xxxxx 10xxxxxx 2字节
				var code1 = code & 0x1f;
				var code2 = str.charCodeAt(i++);
				var code2 = code2 & 0x3f;

				code = (code1 << 6) | code2;
				
			}else if(((code >> 4) & 0xf) === 0xe){
				// 1110xxxx 10xxxxxx 10xxxxxx 3字节
				var code1 = code & 0xf;
				var code2 = str.charCodeAt(i++);
				var code2 = code2 & 0x3f;
				var code3 = str.charCodeAt(i++);
				code3 = code3 & 0x3f;
				code = ((code1 << 12) | (code2 << 6)) | code3;
			}else if(((code >> 3) & 0x1f) === 0x1e){
				// 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
				var code1 = code & 0x7;
				var code2 = str.charCodeAt(i++);
				var code2 = code2 & 0x3f;
				var code3 = str.charCodeAt(i++);
				code3 = code3 & 0x3f;
				var code4 = str.charCodeAt(i++);
				code4 = code4 & 0x3f;
				code = ((code1 << 18) | (code2 << 12)) | (code3 << 6) | code4;
			}else if(((code >> 2) & 0x3f) === 0x3e){
				// 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
				var code1 = code & 0x3;
				var code2 = str.charCodeAt(i++);
				var code2 = code2 & 0x3f;
				var code3 = str.charCodeAt(i++);
				code3 = code3 & 0x3f;
				var code4 = str.charCodeAt(i++);
				code4 = code4 & 0x3f;
				var code5 = str.charCodeAt(i++);
				code5 = code5 & 0x3f;
				code = ((code1 << 24) | (code2 << 18)) | (code3 << 12) | (code4 << 6) | code5;
			}else if(((code >> 1) & 0x3f) === 0x7e){
				// 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
				var code1 = code & 0x1;
				var code2 = str.charCodeAt(i++);
				var code2 = code2 & 0x3f;
				var code3 = str.charCodeAt(i++);
				code3 = code3 & 0x3f;
				var code4 = str.charCodeAt(i++);
				code4 = code4 & 0x3f;
				var code5 = str.charCodeAt(i++);
				code5 = code5 & 0x3f;
				var code6 = str.charCodeAt(i++);
				code6 = code6 & 0x3f;
				code = ((code1 << 30) | (code2 << 24)) | (code3 << 18) | (code4 << 12) | (code5 << 6) | code6;
			}

			utf16.push(String.fromCharCode(code));
		}

		return utf16.join('');
	}

	encode(str){
		let encodedArr = [];
		str = this.UTF16ToUTF8(str);
		for(var i = 0, len = str.length; i < len;){
			var char1 = str[i++];
			var char1Code = char1.charCodeAt(0);
			// 截取前6个字符，作为base64的第一个字符索引
			// xxxx xxxx >> 2 -> 00 xx xxxx
			var base1Index = (char1Code >> 2);
			encodedArr.push(this.BASECODE[base1Index]);
			// xxxx xxxx << 6 -> xx xxxx xx00 0000
			// xx xxxx xx00 0000 & 1100 0000(0xc0) ->  xx00 0000 >> 2 -> xx00 00
			// 截取后面2个字符作为下一个base64字符的开始
			var base2Index = ((char1Code << 6) & 0xc0) >> 2;
			// 如果只有一个字符，那就后面填0；
			if(i === len){
				// 获取第一个字符截取后2位的base64字符
				encodedArr.push(this.BASECODE[base2Index]);
				// 不足24位的填充==作为base64的填充
				encodedArr.push('==');
				break;
			}
			// 2个以上字符
			var char2 = str[i++];
			var char2Code = char2.charCodeAt(0);
			// xxxx xxxx >> 4 -> 0000 xxxx | 00yy 0000 -> 00yy xxxx
			// 拼接第一个字符的后2位与第二个字符的前四位
			base2Index = base2Index | (char2Code >> 4);
			// 第二个base64字符
			encodedArr.push(this.BASECODE[base2Index]);
			// xxxx xxxx << 4 -> xxxx xxxx 0000 & 1111 0000 -> 0000 xxxx 0000 >> 2 -> 0000 00xx xx00
			var base3Index = ((char2Code << 4 & 0xf0) >> 2);
			if(i === len){
				encodedArr.push(this.BASECODE[base3Index]);
				encodedArr.push('=');
				break;
			}
			// 3个以上字符
			var char3 = str[i++];
			var char3Code = char3.charCodeAt(0);
			// 第三个base64字符是：第2个字符的后4位 拼接 第3个字符的前2位
			// xxxx xxxx >> 6 -> 0000 00xx | 0000 00xx xx00 -> 00xx xxxx
			base3Index = (base3Index | (char3Code >> 6));
			encodedArr.push(this.BASECODE[base3Index]);
			// xxxx xxxx & 0011 1111 -> 00xx xxxx
			var base4Index = char3Code & 0x3f;
			encodedArr.push(this.BASECODE[base4Index]);
		}

		return encodedArr.join('');
	}
	// 需要注意的是：
	// 1、每个base64的前2位都是0，这是因为我们在表达一个字节的最小单位是8位。
	// 2、虽然base64只需要6位即可表示全部，但是并不代表存储的是6位，而应该是前面2位补0。
	// 3、注意到上面这2点，对于后面的位移操作非常有用
	decode(str){
		var decodeArr = [];
		for(var i = 0, len = str.length; i < len;){
			var code1Index = this.BASECODE.indexOf(str[i++]);
			var code2Index = this.BASECODE.indexOf(str[i++]);
			var code3Index = this.BASECODE.indexOf(str[i++]);
			var code4Index = this.BASECODE.indexOf(str[i++]);
			// 第一个字符：第一个base64前6位 + 第二个base64前4位(最前面2位是0，所以要右移4位)
			var code1 = ((code1Index & 0x3f) << 2) | (code2Index >> 4);
			decodeArr.push(String.fromCharCode(code1));
			// 如果第三个base64索引存在，表明当前字符不是单字符，也即第三base64不是填充符“=”。
			if(code3Index !== -1){
				// xxxx xxxx << 4 -> xxxx xxxx 0000 & 1111 0000 -> xxxx 0000
				// 取后6位，实际这个index就只有6位是有效的。
				code3Index = code3Index & 0x3f;
				// 第二个字符：第二个base64的后四位 + 第三个base64的前4位
				//	(因为最前的2位是0，必须左移4位)	  (因为最前面2位都是0，必须右移4位)
				var code2 = ((code2Index << 4) & 0xf0) | (code3Index >> 2);
				decodeArr.push(String.fromCharCode(code2));
			}
			
			if(code4Index !== -1){
				// 过滤后6位
				code4Index = code4Index & 0x3f;
				// xxxx xxxx << 6 -> xx xxxx xx00 0000 & 0xc0
				var code3 = ((code3Index << 6) & 0xc0) | code4Index; 
				decodeArr.push(String.fromCharCode(code3));
			}
		}

		return this.UTF8ToUTF16(decodeArr.join(''));
	}
}

var mBase64 = new Base64();
var encodeStr = mBase64.encode('你');
console.log(encodeStr);
console.log(mBase64.decode(encodeStr))

