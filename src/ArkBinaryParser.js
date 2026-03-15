const ArkBinaryFormats = require('./ArkBinaryFormats');

module.exports = class BinaryParser {

    constructor(data, format = ArkBinaryFormats.ASE) {
        this.buffer = new Buffer(data);
        this.format = format;
    }

    /**
     * @param {string} property
     * @returns {*}
     */
    getProperty(property, format = ArkBinaryFormats.ASE) {
        let propertyOffset = this.buffer.indexOf(property);

        // Return false if there is none
        if(propertyOffset === -1) { return false; }

        let offset = propertyOffset + property.length;

        // Skip the first null byte
        offset += 1;

        // Get the length of the property type
        let propertyTypeLength = this.buffer.readUInt32LE(offset);

        offset += 4;

        let propertyLengthOffset = -1;

        // If the format is ASA, there is a -1 length offset;
        if(format === ArkBinaryFormats.ASA) {
            propertyLengthOffset = -2;
        }

        // Read the actual property type
        let propertyType = this.buffer.toString('utf8', offset, offset + propertyTypeLength + propertyLengthOffset);
        offset += propertyTypeLength + propertyLengthOffset;

        if(format === ArkBinaryFormats.ASA) {
            if(propertyType === 'ArrayProperty') {
                // Skip index and null bytes
                offset += 1;
            } else {
                // Skip index and null bytes
                offset += 10;
            }
        } else {
            offset += 9;
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
     * 
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
     * Get EOS ID from ASA ark player file and defaults to the filename if not found.
     *
     * @return {string} EOS ID
     */
    getEosId() {
        const eosIdOffset = this.buffer.indexOf('RedpointEOS');

        if (eosIdOffset !== -1) {
            // EOSID is stored as 16 bytes after "RedpointEOS\0\0"
            const eosIdStart = eosIdOffset + 'RedpointEOS'.length + 2; // +2 for the null bytes
            const eosIdBytes = this.buffer.subarray(eosIdStart, eosIdStart + 16);
            
            return  eosIdBytes.toString('hex');
        } else {
            // Fallback: extract from filename
            return  path.basename(file, '.arkprofile');
        }
    }

    /**
     * Get platform identifier based on the format.
     * 
     * If the format is ASE, it returns the Steam ID as a number
     * 
     * If the format is ASA, it returns the EOS ID as a string
     *
     * @return {string | number} Platform identifier (Steam ID or EOS ID)
     */
    getPlatformIdentifier(){
        if(this.format === ArkBinaryFormat.ASE){
            return this.getSteamId();
        } else if(this.format === ArkBinaryFormat.ASA) {
            return this.getEosId();
        }
        
    }


    /**
     * Get string property from buffer
     * 
     * Handles both UTF-8 and UTF-16 encoded strings as well as ASA and ASE formats which have different offset patterns.
     *
     * @param {*} offset
     * @param {*} buffer
     * @param {*} [format=ArkBinaryFormats.ASE]
     * @return {{value: string, number: number}} Value is the parsed string, length is the total byte length before parsing
     * to correctly handle offset in calling function.
     */
    static getStringProperty(offset, buffer, format = ArkBinaryFormats.ASE) {
        let propertyLength = buffer.readInt32LE(offset);
           
        // Start of the string property
        offset += 4;

        if (format === ArkBinaryFormats.ASA) {
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
            return {
                value: buffer.toString('utf8', offset, offset + propertyLength-1),
                length: propertyLength-1
            }
        }
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Array}
     */
    static getArrayProperty(offset, buffer, format = ArkBinaryFormats.ASE) {
        if (format === ArkBinaryFormats.ASE) {
            return BinaryParser.handleASEArrayProperty(offset, buffer);
        } else {
            return BinaryParser.handleAsaArrayProperty(offset, buffer);
        }
    }

    static handleASEArrayProperty(offset, buffer){
        let arr = [],
        propertySubtypeLength = buffer.readInt32LE(offset);
        offset += 4;

        let propertySubtype = buffer.toString('utf8', offset, offset + propertySubtypeLength);
        offset += propertySubtypeLength;

        // Read the array length
        let arrayLength = buffer.readUInt32LE(offset);
        offset += 4;

        // Loop for array length
        for(let i = 0; i < arrayLength; i++) {
            // Placeholder for value
            let value;
            // Switch the array type
            switch(propertySubtype.replace(/\0[\s\S]*$/g,'')) {
                case 'StrProperty':
                    value = BinaryParser.getStringProperty(offset, buffer).value;
                    // Add the length of the value as extra offset
                    offset += value.length;
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
            offset += 4;
            // Trim and push to the array
            arr.push(BinaryParser.trim(value));
        }

        return arr;
    }

    static handleAsaArrayProperty(offset, buffer) {
        let arr = [];

        const arrayRootSize = buffer.readUInt32LE(offset);

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
        
        const expectedArrayLength = buffer.readUInt32LE(offset);

        // Move to the second unknown byte
        offset += 1;
        const unknownByteValue = buffer.readUInt32LE(offset);

        // Move to the start of the array length
        offset += 4;

        let subArraySize = buffer.readUInt32LE(offset);

        // Move to the start of the array values. This byte should be proceeding value length.
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