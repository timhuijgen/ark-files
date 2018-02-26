/**
 * Credits to Zachary Knight (https://github.com/knightzac19)
 * For the parse functions
 */

/**
 * Exports
 * @type {{getString: getString, getStringArray: getStringArray, getInt: getInt, getUInt16: getUInt16, getUInt32: getUInt32, time: time, getPlayerId: getPlayerId, getSteamId: getSteamId}}
 */
module.exports = {
    getString: getString,
    getStringArray: getStringArray,
    getInt: getInt,
    getUInt16: getUInt16,
    getUInt32: getUInt32,
    time: time,
    getPlayerId: getPlayerId,
    getSteamId: getSteamId
};

/**
 * Current unix time
 * @returns {number}
 */
function time() {
    return new Date().getTime() / 1000 | 0;
}

function getPlayerId(data) {
    return getUInt64('PlayerDataID', data);
}

function getSteamId(data) {
    data = new Buffer(data);
    let type = 'UniqueNetIdRepl';
    let bytes1 = data.indexOf(type);
    if (bytes1 === -1) {
        return false;
    }
    let start = bytes1 + type.length + 9;
    let end = start + 17;
    return parseInt(data.slice(start, end));
}

/**
 * @param search
 * @param data
 * @returns {string}
 */
function getString(search, data) {
    let type = "StrProperty";
    data = new Buffer(data);
    let bytes1 = data.indexOf(search);
    if(bytes1 === -1)
    {
        return false;
    }
    let num = data.indexOf(type, bytes1);
    let mid = data.readUInt8(num + type.length + 1, true);
    let midlength = mid - (num + type.length + 12 === 255 ? 6 : 5);
    let start = num + type.length + 13;
    return data.toString('utf8', start, start + midlength);
}


/**
 * Get string array values from data
 * @param {string} property
 * @param {string} data
 * @returns {Array}
 */
function getStringArray(property, data) {
    // Create Buffer
    let buffer = new Buffer(data),
        arr = [],
        // Get the offset of the property entry
        searchOffset = buffer.indexOf(property);

    // Return empty array if there is none
    if(searchOffset === -1) { return arr; }

    // Get the offset of StrProperty after the property, and add 12 for the length of StrProperty
    let arrayPropTypeOffset = buffer.indexOf('StrProperty', searchOffset) + 12,
        // Read the array length
        arrayLength = buffer.readUInt8(arrayPropTypeOffset);

    // Initial offset for loop plus 4 for the UInt8
    let offset = arrayPropTypeOffset + 4;
    // Loop for array length
    for(let i = 0; i < arrayLength; i++) {
        // Read the size of the string
        let strSize = buffer.readUInt8(offset);
        // Offset for the UInt8
        offset += 4;
        // Read the string for the specified length
        let str = buffer.toString('utf8', offset, offset + strSize);
        // Offset the string length for the next iteration
        offset += strSize;
        // Push the item & trim hex zero's from the string
        arr.push(str.replace(/\0[\s\S]*$/g,''));
    }

    return arr;
}

function getInt(search, data) {
    let type = "IntProperty";
    data = new Buffer(data);
    let bytes1 = data.indexOf(search);
    if(bytes1 === -1)
    {
        return false;
    }
    let bytes2 = data.indexOf(type, bytes1);
    let end = bytes2 + type.length + 9;
    return data.readUIntLE(end, 4);
}

function getUInt16(search, data) {
    let type = "UInt16Property";
    data = new Buffer(data);
    let bytes1 = data.indexOf(search);
    if(bytes1 === -1)
    {
        return false;
    }
    let bytes2 = data.indexOf(type, bytes1);
    let end = bytes2 + type.length + 9;
    return data.readUInt16LE(end, true);
}

function getUInt32(search, data) {
    let type = "UInt32Property";
    data = new Buffer(data);
    let bytes1 = data.indexOf(search);
    if(bytes1 === -1)
    {
        return false;
    }
    let bytes2 = data.indexOf(type, bytes1);
    let end = bytes2 + type.length + 9;
    return data.readUInt32LE(end, true);
}

function getUInt64(search, data) {
    let type = "UInt64Property";
    data = new Buffer(data);
    let bytes1 = data.indexOf(search);
    if(bytes1 === -1)
    {
        return false;
    }
    let bytes2 = data.indexOf(type, bytes1);
    let end = bytes2 + type.length + 9;
    return data.readUInt32LE(end, true);
}

