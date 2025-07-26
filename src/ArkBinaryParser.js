
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

        let offset = propertyOffset + property.length + 1;
        // Get the length of the property type
        let propertyTypeLength = this.buffer.readUInt32LE(offset);
        offset += 4;
        // Read the actual property type
        let propertyType = this.buffer.toString('utf8', offset, offset + propertyTypeLength);
        offset += propertyTypeLength;

        // Skip size and index
        offset += 8;

        switch(propertyType.replace(/\0[\s\S]*$/g,'')) {
            case 'ArrayProperty':
                return BinaryParser.getArrayProperty(offset, this.buffer);
            case 'StrProperty':
                return BinaryParser.trim(
                    BinaryParser.getStringProperty(offset, this.buffer, format)
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
            // ASA format: [1 null byte][1-byte length][3 null bytes][string data + null terminator]
            offset += 1; // Skip the first null byte

            let stringLength = buffer[offset]; // Get string length (includes null terminator)
            offset += 1;
            
            offset += 3; // Skip 3 null bytes
            return buffer.toString('utf8', offset, offset + stringLength - 1); // Exclude null terminator
        } else {
            // ASE format: [4-byte length][string data]
            let propertyLength = buffer.readInt32LE(offset);
            offset += 4;
            return buffer.toString('utf8', offset, offset + propertyLength);
        }
    }

    /**
     * @param {number} offset
     * @param {Buffer} buffer
     * @returns {Array}
     */
    static getArrayProperty(offset, buffer) {
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
                    value = BinaryParser.getStringProperty(offset, buffer);
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