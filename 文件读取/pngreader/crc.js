let crc_table = [];
let crc_table_computed = 0;

function make_crc_table(){
    let c, n, k;
    for(n = 0; n < 256; n++){
        c = n;
        for(k = 0; k < 8; k++){
            if(c & 1){
                // 11111111
                // X32+X26+X23+X22+X16+X12+X11+X10+X8+X7+X5+X4+X2+X1+1
                // 1000 0010 0110 0000 1000 1110 1101 10111
                // 1110 1101 1011 1000 1000 0011 0010 0000
                c = 0xedb88320 ^ (c >> 1);
            }else{
                c = c >> 1;
            }
        }
        crc_table[n] = c;
    }
    crc_table_computed = 1;
}
function update_crc(crc, buf, len){
    let c = crc, n;
    if (!crc_table_computed)
        make_crc_table();
    for (n = 0; n < len; n++) {
        c = crc_table[(c ^ buf[n]) & 0xff] ^ (c >> 8);
    }
    return c;
}

function crc(buf, len){
    return update_crc(0xffffffff, buf, len) ^ 0xffffffff;
}

/* This is sort of like the table lookup version (crc32c), but using
a 256-way switch statement instead.
   The expressions for g1, g2, ..., g7 are determined by examining what
the CRC-32 algorithm does to a byte of value 1, 2, 4, 8, 16, 32, 64, and
128, respectively. g6 and g7 are complicated because the rightmost 1-bit
in g0 enters the picture.
   We rely on the compiler to evaluate, at compile time, all the
expressions involving the g's. They are the table values used in
function crc32c above (i.e., g7 = table[1], g6 = table[2], g5 =
table[4], etc.).
   This idea of using a switch statement is a dumb idea if a compiler is
used, because the compiler (GCC anyway) implements the switch statement
with a 256-word label table. Thus the program still has the load from a
table, and it is larger than crc32c by the three words of instructions
used at each case statement (two instructions to load the constant, plus
a branch). However, since each case statement has the same amount of
code (three words), the label table could be avoided if the program were
coded in assembly language. But it would still have poor I-cache
performance.
   At any rate, when compiled to Cyclops with GCC, this function
executes 6 + 19n instructions, where n is the number of bytes in the
input message. The 19 includes 2 loads and 3 branches (per byte), not
counting the one GCC generates to check that the switch argument doesn't
exceed 255 (it can't exceed 255). */
function crc32f(message) {
   let i;
   let byte, crc, c;
   const g0 = 0xEDB88320;
   const g1 = g0>>1, g2 = g0>>2, g3 = g0>>3,
      g4 = g0>>4, g5 = g0>>5, g6 = (g0>>6)^g0,
      g7 = ((g0>>6)^g0)>>1;

   i = 0;
   crc = 0xFFFFFFFF;
   while ((byte = message[i]) != 0) {   // Get next byte.
      crc = crc ^ byte;
      switch(crc & 0xFF) {
         case   0: c = 0;                        break;
         case   1: c =                      g7;  break;
         case   2: c =                   g6;     break;
         case   3: c =                   g6^g7;  break;
         case   4: c =                g5;        break;
         case   5: c =                g5^   g7;  break;
         case   6: c =                g5^g6;     break;
         case   7: c =                g5^g6^g7;  break;
         case   8: c =             g4;           break;
         case   9: c =             g4^      g7;  break;
         case  10: c =             g4^   g6;     break;
         case  11: c =             g4^   g6^g7;  break;
         case  12: c =             g4^g5;        break;
         case  13: c =             g4^g5^   g7;  break;
         case  14: c =             g4^g5^g6;     break;
         case  15: c =             g4^g5^g6^g7;  break;

         case  16: c =          g3;              break;
         case  17: c =          g3^         g7;  break;
         case  18: c =          g3^      g6;     break;
         case  19: c =          g3^      g6^g7;  break;
         case  20: c =          g3^   g5;        break;
         case  21: c =          g3^   g5^   g7;  break;
         case  22: c =          g3^   g5^g6;     break;
         case  23: c =          g3^   g5^g6^g7;  break;
         case  24: c =          g3^g4;           break;
         case  25: c =          g3^g4^      g7;  break;
         case  26: c =          g3^g4^   g6;     break;
         case  27: c =          g3^g4^   g6^g7;  break;
         case  28: c =          g3^g4^g5;        break;
         case  29: c =          g3^g4^g5^   g7;  break;
         case  30: c =          g3^g4^g5^g6;     break;
         case  31: c =          g3^g4^g5^g6^g7;  break;

         case  32: c =       g2;                 break;
         case  33: c =       g2^            g7;  break;
         case  34: c =       g2^         g6;     break;
         case  35: c =       g2^         g6^g7;  break;
         case  36: c =       g2^      g5;        break;
         case  37: c =       g2^      g5^   g7;  break;
         case  38: c =       g2^      g5^g6;     break;
         case  39: c =       g2^      g5^g6^g7;  break;
         case  40: c =       g2^   g4;           break;
         case  41: c =       g2^   g4^      g7;  break;
         case  42: c =       g2^   g4^   g6;     break;
         case  43: c =       g2^   g4^   g6^g7;  break;
         case  44: c =       g2^   g4^g5;        break;
         case  45: c =       g2^   g4^g5^   g7;  break;
         case  46: c =       g2^   g4^g5^g6;     break;
         case  47: c =       g2^   g4^g5^g6^g7;  break;

         case  48: c =       g2^g3;              break;
         case  49: c =       g2^g3^         g7;  break;
         case  50: c =       g2^g3^      g6;     break;
         case  51: c =       g2^g3^      g6^g7;  break;
         case  52: c =       g2^g3^   g5;        break;
         case  53: c =       g2^g3^   g5^   g7;  break;
         case  54: c =       g2^g3^   g5^g6;     break;
         case  55: c =       g2^g3^   g5^g6^g7;  break;
         case  56: c =       g2^g3^g4;           break;
         case  57: c =       g2^g3^g4^      g7;  break;
         case  58: c =       g2^g3^g4^   g6;     break;
         case  59: c =       g2^g3^g4^   g6^g7;  break;
         case  60: c =       g2^g3^g4^g5;        break;
         case  61: c =       g2^g3^g4^g5^   g7;  break;
         case  62: c =       g2^g3^g4^g5^g6;     break;
         case  63: c =       g2^g3^g4^g5^g6^g7;  break;

         case  64: c =    g1;                    break;
         case  65: c =    g1^               g7;  break;
         case  66: c =    g1^            g6;     break;
         case  67: c =    g1^            g6^g7;  break;
         case  68: c =    g1^         g5;        break;
         case  69: c =    g1^         g5^   g7;  break;
         case  70: c =    g1^         g5^g6;     break;
         case  71: c =    g1^         g5^g6^g7;  break;
         case  72: c =    g1^      g4;           break;
         case  73: c =    g1^      g4^      g7;  break;
         case  74: c =    g1^      g4^   g6;     break;
         case  75: c =    g1^      g4^   g6^g7;  break;
         case  76: c =    g1^      g4^g5;        break;
         case  77: c =    g1^      g4^g5^   g7;  break;
         case  78: c =    g1^      g4^g5^g6;     break;
         case  79: c =    g1^      g4^g5^g6^g7;  break;

         case  80: c =    g1^   g3;              break;
         case  81: c =    g1^   g3^         g7;  break;
         case  82: c =    g1^   g3^      g6;     break;
         case  83: c =    g1^   g3^      g6^g7;  break;
         case  84: c =    g1^   g3^   g5;        break;
         case  85: c =    g1^   g3^   g5^   g7;  break;
         case  86: c =    g1^   g3^   g5^g6;     break;
         case  87: c =    g1^   g3^   g5^g6^g7;  break;
         case  88: c =    g1^   g3^g4;           break;
         case  89: c =    g1^   g3^g4^      g7;  break;
         case  90: c =    g1^   g3^g4^   g6;     break;
         case  91: c =    g1^   g3^g4^   g6^g7;  break;
         case  92: c =    g1^   g3^g4^g5;        break;
         case  93: c =    g1^   g3^g4^g5^   g7;  break;
         case  94: c =    g1^   g3^g4^g5^g6;     break;
         case  95: c =    g1^   g3^g4^g5^g6^g7;  break;

         case  96: c =    g1^g2;                 break;
         case  97: c =    g1^g2^            g7;  break;
         case  98: c =    g1^g2^         g6;     break;
         case  99: c =    g1^g2^         g6^g7;  break;
         case 100: c =    g1^g2^      g5;        break;
         case 101: c =    g1^g2^      g5^   g7;  break;
         case 102: c =    g1^g2^      g5^g6;     break;
         case 103: c =    g1^g2^      g5^g6^g7;  break;
         case 104: c =    g1^g2^   g4;           break;
         case 105: c =    g1^g2^   g4^      g7;  break;
         case 106: c =    g1^g2^   g4^   g6;     break;
         case 107: c =    g1^g2^   g4^   g6^g7;  break;
         case 108: c =    g1^g2^   g4^g5;        break;
         case 109: c =    g1^g2^   g4^g5^   g7;  break;
         case 110: c =    g1^g2^   g4^g5^g6;     break;
         case 111: c =    g1^g2^   g4^g5^g6^g7;  break;

         case 112: c =    g1^g2^g3;              break;
         case 113: c =    g1^g2^g3^         g7;  break;
         case 114: c =    g1^g2^g3^      g6;     break;
         case 115: c =    g1^g2^g3^      g6^g7;  break;
         case 116: c =    g1^g2^g3^   g5;        break;
         case 117: c =    g1^g2^g3^   g5^   g7;  break;
         case 118: c =    g1^g2^g3^   g5^g6;     break;
         case 119: c =    g1^g2^g3^   g5^g6^g7;  break;
         case 120: c =    g1^g2^g3^g4;           break;
         case 121: c =    g1^g2^g3^g4^      g7;  break;
         case 122: c =    g1^g2^g3^g4^   g6;     break;
         case 123: c =    g1^g2^g3^g4^   g6^g7;  break;
         case 124: c =    g1^g2^g3^g4^g5;        break;
         case 125: c =    g1^g2^g3^g4^g5^   g7;  break;
         case 126: c =    g1^g2^g3^g4^g5^g6;     break;
         case 127: c =    g1^g2^g3^g4^g5^g6^g7;  break;

         case 128: c = g0;                       break;
         case 129: c = g0^                  g7;  break;
         case 130: c = g0^               g6;     break;
         case 131: c = g0^               g6^g7;  break;
         case 132: c = g0^            g5;        break;
         case 133: c = g0^            g5^   g7;  break;
         case 134: c = g0^            g5^g6;     break;
         case 135: c = g0^            g5^g6^g7;  break;
         case 136: c = g0^         g4;           break;
         case 137: c = g0^         g4^      g7;  break;
         case 138: c = g0^         g4^   g6;     break;
         case 139: c = g0^         g4^   g6^g7;  break;
         case 140: c = g0^         g4^g5;        break;
         case 141: c = g0^         g4^g5^   g7;  break;
         case 142: c = g0^         g4^g5^g6;     break;
         case 143: c = g0^         g4^g5^g6^g7;  break;

         case 144: c = g0^      g3;              break;
         case 145: c = g0^      g3^         g7;  break;
         case 146: c = g0^      g3^      g6;     break;
         case 147: c = g0^      g3^      g6^g7;  break;
         case 148: c = g0^      g3^   g5;        break;
         case 149: c = g0^      g3^   g5^   g7;  break;
         case 150: c = g0^      g3^   g5^g6;     break;
         case 151: c = g0^      g3^   g5^g6^g7;  break;
         case 152: c = g0^      g3^g4;           break;
         case 153: c = g0^      g3^g4^      g7;  break;
         case 154: c = g0^      g3^g4^   g6;     break;
         case 155: c = g0^      g3^g4^   g6^g7;  break;
         case 156: c = g0^      g3^g4^g5;        break;
         case 157: c = g0^      g3^g4^g5^   g7;  break;
         case 158: c = g0^      g3^g4^g5^g6;     break;
         case 159: c = g0^      g3^g4^g5^g6^g7;  break;

         case 160: c = g0^   g2;                 break;
         case 161: c = g0^   g2^            g7;  break;
         case 162: c = g0^   g2^         g6;     break;
         case 163: c = g0^   g2^         g6^g7;  break;
         case 164: c = g0^   g2^      g5;        break;
         case 165: c = g0^   g2^      g5^   g7;  break;
         case 166: c = g0^   g2^      g5^g6;     break;
         case 167: c = g0^   g2^      g5^g6^g7;  break;
         case 168: c = g0^   g2^   g4;           break;
         case 169: c = g0^   g2^   g4^      g7;  break;
         case 170: c = g0^   g2^   g4^   g6;     break;
         case 171: c = g0^   g2^   g4^   g6^g7;  break;
         case 172: c = g0^   g2^   g4^g5;        break;
         case 173: c = g0^   g2^   g4^g5^   g7;  break;
         case 174: c = g0^   g2^   g4^g5^g6;     break;
         case 175: c = g0^   g2^   g4^g5^g6^g7;  break;

         case 176: c = g0^   g2^g3;              break;
         case 177: c = g0^   g2^g3^         g7;  break;
         case 178: c = g0^   g2^g3^      g6;     break;
         case 179: c = g0^   g2^g3^      g6^g7;  break;
         case 180: c = g0^   g2^g3^   g5;        break;
         case 181: c = g0^   g2^g3^   g5^   g7;  break;
         case 182: c = g0^   g2^g3^   g5^g6;     break;
         case 183: c = g0^   g2^g3^   g5^g6^g7;  break;
         case 184: c = g0^   g2^g3^g4;           break;
         case 185: c = g0^   g2^g3^g4^      g7;  break;
         case 186: c = g0^   g2^g3^g4^   g6;     break;
         case 187: c = g0^   g2^g3^g4^   g6^g7;  break;
         case 188: c = g0^   g2^g3^g4^g5;        break;
         case 189: c = g0^   g2^g3^g4^g5^   g7;  break;
         case 190: c = g0^   g2^g3^g4^g5^g6;     break;
         case 191: c = g0^   g2^g3^g4^g5^g6^g7;  break;

         case 192: c = g0^g1;                   break;
         case 193: c = g0^g1^               g7;  break;
         case 194: c = g0^g1^            g6;     break;
         case 195: c = g0^g1^            g6^g7;  break;
         case 196: c = g0^g1^         g5;        break;
         case 197: c = g0^g1^         g5^   g7;  break;
         case 198: c = g0^g1^         g5^g6;     break;
         case 199: c = g0^g1^         g5^g6^g7;  break;
         case 200: c = g0^g1^      g4;           break;
         case 201: c = g0^g1^      g4^      g7;  break;
         case 202: c = g0^g1^      g4^   g6;     break;
         case 203: c = g0^g1^      g4^   g6^g7;  break;
         case 204: c = g0^g1^      g4^g5;        break;
         case 205: c = g0^g1^      g4^g5^   g7;  break;
         case 206: c = g0^g1^      g4^g5^g6;     break;
         case 207: c = g0^g1^      g4^g5^g6^g7;  break;

         case 208: c = g0^g1^   g3;              break;
         case 209: c = g0^g1^   g3^         g7;  break;
         case 210: c = g0^g1^   g3^      g6;     break;
         case 211: c = g0^g1^   g3^      g6^g7;  break;
         case 212: c = g0^g1^   g3^   g5;        break;
         case 213: c = g0^g1^   g3^   g5^   g7;  break;
         case 214: c = g0^g1^   g3^   g5^g6;     break;
         case 215: c = g0^g1^   g3^   g5^g6^g7;  break;
         case 216: c = g0^g1^   g3^g4;           break;
         case 217: c = g0^g1^   g3^g4^      g7;  break;
         case 218: c = g0^g1^   g3^g4^   g6;     break;
         case 219: c = g0^g1^   g3^g4^   g6^g7;  break;
         case 220: c = g0^g1^   g3^g4^g5;        break;
         case 221: c = g0^g1^   g3^g4^g5^   g7;  break;
         case 222: c = g0^g1^   g3^g4^g5^g6;     break;
         case 223: c = g0^g1^   g3^g4^g5^g6^g7;  break;

         case 224: c = g0^g1^g2;                 break;
         case 225: c = g0^g1^g2^            g7;  break;
         case 226: c = g0^g1^g2^         g6;     break;
         case 227: c = g0^g1^g2^         g6^g7;  break;
         case 228: c = g0^g1^g2^      g5;        break;
         case 229: c = g0^g1^g2^      g5^   g7;  break;
         case 230: c = g0^g1^g2^      g5^g6;     break;
         case 231: c = g0^g1^g2^      g5^g6^g7;  break;
         case 232: c = g0^g1^g2^   g4;           break;
         case 233: c = g0^g1^g2^   g4^      g7;  break;
         case 234: c = g0^g1^g2^   g4^   g6;     break;
         case 235: c = g0^g1^g2^   g4^   g6^g7;  break;
         case 236: c = g0^g1^g2^   g4^g5;        break;
         case 237: c = g0^g1^g2^   g4^g5^   g7;  break;
         case 238: c = g0^g1^g2^   g4^g5^g6;     break;
         case 239: c = g0^g1^g2^   g4^g5^g6^g7;  break;

         case 240: c = g0^g1^g2^g3;              break;
         case 241: c = g0^g1^g2^g3^         g7;  break;
         case 242: c = g0^g1^g2^g3^      g6;     break;
         case 243: c = g0^g1^g2^g3^      g6^g7;  break;
         case 244: c = g0^g1^g2^g3^   g5;        break;
         case 245: c = g0^g1^g2^g3^   g5^   g7;  break;
         case 246: c = g0^g1^g2^g3^   g5^g6;     break;
         case 247: c = g0^g1^g2^g3^   g5^g6^g7;  break;
         case 248: c = g0^g1^g2^g3^g4;           break;
         case 249: c = g0^g1^g2^g3^g4^      g7;  break;
         case 250: c = g0^g1^g2^g3^g4^   g6;     break;
         case 251: c = g0^g1^g2^g3^g4^   g6^g7;  break;
         case 252: c = g0^g1^g2^g3^g4^g5;        break;
         case 253: c = g0^g1^g2^g3^g4^g5^   g7;  break;
         case 254: c = g0^g1^g2^g3^g4^g5^g6;     break;
         case 255: c = g0^g1^g2^g3^g4^g5^g6^g7;  break;
      } // end switch

      crc = (crc >> 8) ^ c;
      i = i + 1;
   }
   return ~crc;
}
/* This is sort of like the table lookup version (crc32c), but using
a 16-way switch statement instead.
   When compiled to Cyclops with GCC, this function executes in 6 + 38n
instructions, where n is the number of bytes in the input message. The
38 instructions per byte include 3 loads and 5 branches (not good). It
is actually 6 branches if you count the unnecessary one that GCC
generates because it isn't smart enough to know that the switch argument
cannot exceed 15. */
function crc32e(message) {
   let i, j;
   let byte, crc, c;
   const g0 = 0xEDB88320, g1 = g0 >> 1, g2 = g0 >> 2, g3 = g0 >> 3;

   i = 0;
   crc = 0xFFFFFFFF;
   while ((byte = message[i]) != 0) {   // Get next byte.
      crc = crc ^ byte;
      for (j = 1; j >= 0; j--) {        // Do two times.
         switch(crc & 0xF) {
         case  0: c = 0;                  break;
         case  1: c =                g3;  break;
         case  2: c =           g2;       break;
         case  3: c =           g2 ^ g3;  break;
         case  4: c =      g1;            break;
         case  5: c =      g1 ^      g3;  break;
         case  6: c =      g1 ^ g2;       break;
         case  7: c =      g1 ^ g2 ^ g3;  break;
         case  8: c = g0;                 break;
         case  9: c = g0 ^           g3;  break;
         case 10: c = g0 ^      g2;       break;
         case 11: c = g0 ^      g2 ^ g3;  break;
         case 12: c = g0 ^ g1;            break;
         case 13: c = g0 ^ g1 ^      g3;  break;
         case 14: c = g0 ^ g1 ^ g2;       break;
         case 15: c = g0 ^ g1 ^ g2 ^ g3;  break;
         }
         crc = (crc >> 4) ^ c;
      }
      i = i + 1;
   }
   return ~crc;
}
// ---------------------------- crc32cx --------------------------------

/* This is crc32b modified to load the message a fullword at a time.
It assumes the message is word aligned and consists of an integral
number of words before the 0-byte that marks the end of the message.
   This works only on a little-endian machine.
   Not counting the table setup (which would probably be a separate
function), this function should be doable in 3 + 22w instructions, where
w is the number of fullwords in the input message. This is equivalent to
3 + 5.5n instructions, where n is the number of bytes. 1.25 of those 5.5
instructions are loads.
   This is Exercise 1 in the text. C.f. Christopher Dannemiller,
who got it from Linux Source base,
www.gelato.unsw.edu.au/lxr/source/lib/crc32.c, lines 105-111. */

function crc32cx(message) {
   let j;
   let byte, crc, mask, word;
   let table = [];

   /* Set up the table, if necessary. */

   if (table[1] == 0) {
      for (byte = 0; byte <= 255; byte++) {
         crc = byte;
         for (j = 7; j >= 0; j--) {    // Do eight times.
            mask = -(crc & 1);
            crc = (crc >> 1) ^ (0xEDB88320 & mask);
         }
         table[byte] = crc;
      }
   }

   /* Through with table setup, now calculate the CRC. */

   crc = 0xFFFFFFFF;
   while (((word = message) & 0xFF) != 0) {
      crc = crc ^ word;
      crc = (crc >> 8) ^ table[crc & 0xFF];
      crc = (crc >> 8) ^ table[crc & 0xFF];
      crc = (crc >> 8) ^ table[crc & 0xFF];
      crc = (crc >> 8) ^ table[crc & 0xFF];
      message = message + 4;
   }
   return ~crc;
}
// ----------------------------- crc32c --------------------------------

/* This is derived from crc32b but does table lookup. First the table
itself is calculated, if it has not yet been set up.
Not counting the table setup (which would probably be a separate
function), when compiled to Cyclops with GCC, this function executes in
7 + 13n instructions, where n is the number of bytes in the input
message. It should be doable in 4 + 9n instructions. In any case, two
of the 13 or 9 instrucions are load byte.
   This is Figure 14-7 in the text. */

function crc32c(message) {
   let i, j;
   let byte, crc, mask;
   let table = [];

   /* Set up the table, if necessary. */
   // X32+X26+X23+X22+X16+X12+X11+X10+X8+X7+X5+X4+X2+X1+1
   // 1111 1111 1111 1111 
   // 1111 1111 1111 0111
   if (table[1] == 0) {
      for (byte = 0; byte <= 255; byte++) {
         crc = byte;
         for (j = 7; j >= 0; j--) {    // Do eight times.
            mask = -(crc & 1);
            crc = (crc >> 1) ^ (0xEDB88320 & mask);
         }
         table[byte] = crc;
      }
   }

   /* Through with table setup, now calculate the CRC. */

   i = 0;
   crc = 0xFFFFFFFF;
   while ((byte = message[i]) != 0) {
      crc = (crc >> 8) ^ table[(crc ^ byte) & 0xFF];
      i = i + 1;
   }
   return ~crc;
}


module.exports = {
    crc,
    crc32cx,
    crc32c,
    crc32e,
    crc32f
};