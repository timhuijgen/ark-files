
module.exports = class BinaryParser {

    constructor(data) {
        this.buffer = new Buffer(data);
    }

    /**
     * @param {string} property
     * @returns {*}
     */
    getProperty(property, format = 'ase') {
        let propertyOffset = this.buffer.indexOf(property);

        // Return false if there is none
        if(propertyOffset === -1) { return false; }

        let offset = propertyOffset + property.length;

        // Skip the first null byte
        offset += 1;

        // Get the length of the property type
        let propertyTypeLength = this.buffer.readUInt32LE(offset);

        offset += 4;
        // Read the actual property type
        let propertyType = this.buffer.toString('utf8', offset, offset + propertyTypeLength -1 );
        offset += propertyTypeLength -1;

        if(propertyType === 'ArrayProperty'){
            // Skip index and null bytes
            offset += 1;
        } else {
            // Skip index and null bytes
        offset += 10;
        }

        switch(propertyType.replace(/\0[\s\S]*$/g,'')) {
            case 'ArrayProperty':
                return BinaryParser.getArrayProperty(offset, this.buffer, format);
            case 'StrProperty':
                return BinaryParser.trim(
                    BinaryParser.getStringProperty(offset, this.buffer, format).value
                );
            case 'IntProperty':
                return BinaryParser.getIntProperty(offset, this.buffer);
            case 'UInt16Property':
                return BinaryParser.getUInt16Property(offset, this.buffer);
            case 'UInt32Property':
                return BinaryParser.getUInt32Property(offset, this.buffer);
            case 'UInt64Property':
                return BinaryParser.getUInt64Property(offset, this.buffer);
        }
    }

    /**
     * Get steam ID from ark player file, 17 numbers.
     * @returns {number}
     */
    getSteamId() {
        let identifier = 'UniqueNetIdRepl',
            idOffset = this.buffer.indexOf(identifier);
        if (idOffset === -1) { return idOffset; }

        let start = idOffset + identifier.length + 9,
            end = start + 17;

        return parseInt(this.buffer.toString('utf8', start, end));
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {string}
     */
    static getStringProperty(offset, buffer, format = 'ase') {
        if (format === 'asa') {
            let propertyLength = buffer.readInt32LE(offset);
           
            // Start of the string property
            offset += 4;

            if (propertyLength <= 0) {
                // If we're here we have found a malformed or differently encoded string (possibly utf-16)
                // At this point we're at the start the string value. We know that these strangely encoded strings
                // end is three null bytes, followed by a non-null byte for the size of the next string.

                // Find the next sequence of double null butes followed by a non-null byte
                const nextNullOffset = buffer.indexOf('\0\0\0', offset);
                const stringSize = nextNullOffset - offset;

                if (nextNullOffset === -1) {
                    return {
                        value: '',
                        length: 1
                    };
                } else {
                    const stringified = buffer.toString('utf16le', offset, offset + stringSize + 1);

                    console.warn(`Malformed string found. Best attempt: ${stringified}`);

                    return {
                        value: stringified,
                        length: stringSize + 3 // +3 for the terminating null bytes
                    };
                }
                
            }
            
            return {
                value: buffer.toString('utf8', offset, offset + propertyLength - 1), // Exclude null terminator
                length: propertyLength
            }
        } else {
            // ASE format: [4-byte length][string data]
            let propertyLength = buffer.readInt32LE(offset);
            offset += 4;

            return {
                value: buffer.toString('utf8', offset, offset + propertyLength),
                length: propertyLength
            }
        }
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Array}
     */
    static getArrayProperty(offset, buffer, format = 'ase') {
        let arr = [];
        const potentiallyRootArraySize = buffer.readUInt32LE(offset);

        // Move to the size of the subarray type 
        offset += 4;
        const subArrayTypeLength = buffer.readUInt32LE(offset) - 1;

        // Move to the start of the subarray property name
        offset += 4;

        let propertySubtype = buffer.toString('utf8', offset, offset + subArrayTypeLength);
        offset += subArrayTypeLength;

        // Unsure what these bytes are but this the the beginning of two bytes. The first appears to be the
        // size of the string property. Unsure what the second one is.
        offset+= 5;
        
        const potentialCompleteTextLength = buffer.readUInt32LE(offset);

        // Move to the second unknown byte
        offset += 1;
        const unkownByteValue = buffer.readUInt32LE(offset);

        // Move to the start of the array length
        offset += 4;

        // Read the array length
        let subArraySize = buffer.readUInt32LE(offset);

        offset += 4;

        // Loop for array length
        for(let i = 0; i < subArraySize; i++) {
            // Placeholder for value
            let value;

            // Switch the array type
            switch(propertySubtype.replace(/\0[\s\S]*$/g,'')) {
                case 'StrProperty':
                    const parsed = BinaryParser.getStringProperty(offset, buffer, format);
                    value = parsed.value;

                    // Add the length of the value as extra offset
                    offset += parsed.length-1;
                    break;
                case 'IntProperty':
                    value = BinaryParser.getIntProperty(offset, buffer);
                    break;
                case 'UInt16Property':
                    value = BinaryParser.getUInt16Property(offset, buffer);
                    break;
                case 'UInt32Property':
                    value = BinaryParser.getUInt32Property(offset, buffer);
                    break;
                case 'UInt64Property':
                    value = BinaryParser.getUInt64Property(offset, buffer);
                    break;
            }

            // Offset for the property
            offset += 5;

            // Trim and push to the array
            arr.push(BinaryParser.trim(value));
        }
        
        return arr;
    }

    /**
     *
     * @param {number} offset
     * @param {Buffer} buffer
     */
    static getIntProperty(offset, buffer) {
        return buffer.readInt32LE(offset);
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Number}
     */
    static getUInt16Property(offset, buffer) {
        return buffer.readUInt16LE(offset);
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Number}
     */
    static getUInt32Property(offset, buffer) {
        return buffer.readUInt32LE(offset);
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Number}
     */
    static getUInt64Property(offset, buffer) {
        return buffer.readUInt32LE(offset, true);
    }

    /**
     * Trim \u0000 and other whitespace from string
     * @param {string} value
     * @returns {string}
     */
static trim(value) {
    return value.replace(/[\x00-\x1F\x7F]+/g, '').trim();
}


};