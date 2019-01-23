// 转义规则 
// 支持 
// \a \b \n \r \t 
// \xff

// 不支持
// \uffff
// \ddd
// \f \v \0 

function tokenParser(str: string) {
    if (str === '') {
      return [];
    }
  
    const newStr =` ${str} `;
    const tokenArray: Array<string> = [];
    let startSign = -1;
    let start = -1;
    let currentString = "";
    let at = -1;
    let ch = '';
  
    const escape = {
      "a": '\x07',
      "b": '\x08',
      "n": '\n',
      "r": '\r',
      "t": '\t',
    }
  
    function next() {
      if (at <= newStr.length) {
        at += 1;
        ch = newStr.charAt(at);
        return ch;
      }
  
      throw Error('exceed the boundary');
    }
  
    function borderType(char: string) {
      if (char === ' ') {
        return 0;
      } else if (char === '"') {
        return 1;
      } else if (char === '\'') {
        return 2;
      }
  
      return -1;
    }
  
    function getString() {
      tokenArray.push(JSON.stringify(currentString));
      currentString = "";
      startSign = -1;
      start = -1;
    }
  
    function setStart(char: string) {
      startSign = borderType(char);
      start = at;
    }
  
    function addChar(char: string) {
      if (startSign === 0) {
        if (char === "'" || char == "\"" || char === ' ') {
          throw Error(`addChar Error: ch = ${char}, at = ${at}`);
        }
  
        currentString += char;
      } else if (startSign === 1) {
        if (startSign === borderType(char)) {
          throw Error(`addChar Error: ch = ${char}, at = ${at}`);
        }
  
        if (char === "\\") {
          next();  
  
          if (typeof escape[ch] === "string" ) {
            currentString += escape[ch];
          } else if (ch === 'x') {
            let value = "x";
            let xff = 0;
            let flag = true;
  
            if (newStr.length - at - 1 < 2) {
              currentString += value;
            } else {
              for (let i = 0 ; i < 2 ; i++) {
                const char = next();
                value += char;
                const hex = parseInt(char, 16);
                if (hex !== hex) {
                  flag = false;
                } else {
                  xff = xff * 16 + hex;
                }
              }
    
              if (flag) {
                currentString += String.fromCharCode(xff);
              } else {
                currentString += value;
              }
            }
          } else {
            currentString += ch;
          }
        } else {
          currentString += char;
        }
      } else if (startSign == 2) {
        currentString += char;
      } else {
        throw Error(`addChar Error: ch = ${ch}, at = ${at}`);
      }
    }
  
    while(at < newStr.length) {
  
      if (at === -1) {
        next();
        continue;
      }
  
      if (startSign < 0) {
        if (borderType(ch) === 0) {
          setStart(ch);
          next();
        } else {
          throw Error(`error token: at = ${at} ch = ${ch}`);
        }
  
      } else if (startSign === 0) {
        if (at - start == 1) {
          if (borderType(ch) >= 0) {
            setStart(ch);
            next();
          } else {
            addChar(ch);
            next();
          }
        } else {
          if (startSign === borderType(ch)) {
            getString();
            setStart(ch);
            next();
          } else if (borderType(ch) > 0) {
            throw Error(`invlaid char: at = ${at} ch = ${ch}`);
          } else {
            addChar(ch);
            next();
          }
        }
      } else if (startSign === 1 || startSign === 2) {
        if (borderType(ch) === startSign) {
          getString();
          next();
        } else {
          addChar(ch);
          next();
        }
      }
    }
  
    if (startSign === 1 || startSign === 2) {
      throw Error('error token');
    }
  
    return tokenArray;
  }