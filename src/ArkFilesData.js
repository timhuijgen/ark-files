/**
 * Imports
 */
const util = require('./util');
const fs = require('fs');
const path = require('path');
const ArkBinaryParser = require('./ArkBinaryParser');

/**
 * ArkFilesData class
 */
class ArkFilesData {

    /**
     * Constructor
     * @param {string} arkServerDir
     * @param {Number} refreshInterval
     */
    constructor(arkServerDir, refreshInterval = (60 * 5)) {
        this.arkFilesDir = path.join(arkServerDir, "ShooterGame", "Saved", "SavedArks");
        this.refreshInterval = refreshInterval;
        this.cache = {};
        this.cacheTime = 0;
    }

    /**
     * Returns an array of players
     * @returns {player[]}
     */
    getPlayers() {
        this._validateCache();
        return this.cache.players;
    }

    /**
     * Returns an array of tribes
     * @returns {tribe[]}
     */
    getTribes() {
        this._validateCache();
        return this.cache.tribes;
    }

    /**
     * Attach players to the tribe
     * @param tribe
     * @param players[]
     * @returns {tribe}
     * @private
     */
    _attachPlayersToTribe(tribe, players) {
        tribe.Players = players.filter(player => player.TribeId === tribe.Id);
        return tribe;
    }

    /**
     * Attach a tribe to the player
     * @param player
     * @param tribes[]
     * @returns {player}
     * @private
     */
    _attachTribeToPlayer(player, tribes) {
        player.Tribe = tribes.find(tribe => tribe.Id === player.TribeId) || false;
        return player;
    }

    /**
     * Checks if the cache is invalid and fetches new data if needed
     * @private
     */
    _validateCache() {
        if (this.cacheTime + this.refreshInterval < util.time()) {
            console.log('Fetching new player & tribe data from ark files');
            this.cacheTime = util.time();
            this.cache = this._fetch();
        }
    }

    /**
     * Handles the main process of getting all tribes and players
     * @returns {{players[], tribes[]}}
     * @private
     */
    _fetch() {
        let files = this._getFiles(),
            data = {
                players: files.filter(ArkFilesData._filterArkProfiles).map(player => this._playerFactory(player)),
                tribes: files.filter(ArkFilesData._filterArkTribes).map(tribe => this._tribeFactory(tribe))
            };

        return {
            players: data.players.map(player => this._attachTribeToPlayer(player, data.tribes)),
            tribes: data.tribes.map(tribe => this._attachPlayersToTribe(tribe, data.players))
        }
    }

    /**
     * Read the ark files dir and return an array of files
     * @returns []
     * @private
     */
    _getFiles() {
        return fs.readdirSync(this.arkFilesDir);
    }

    /**
     * Evaluates if a file is an arkprofile file
     * @param file
     * @returns {boolean}
     * @private
     */
    static _filterArkProfiles(file) {
        return new RegExp("^.*\\.arkprofile").test(file);
    }

    /**
     * Evaluates if a file is an arktribe file
     * @param file
     * @returns {boolean}
     * @private
     */
    static _filterArkTribes(file) {
        return new RegExp("^.*\\.arktribe").test(file);
    }

    /**
     * Read the contents of a file
     * @param file
     * @returns {Buffer}
     * @private
     */
    _readFile(file) {
        return fs.readFileSync(path.join(this.arkFilesDir, path.basename(file)));
    }

    /**
     * Create new Player object
     *
     * @param file
     * @returns {{
     * Tribe: Tribe|false,
     * PlayerName: string,
     * Level: Number,
     * TotalEngramPoints: Number,
     * CharacterName: string,
     * TribeId: Number|false,
     * SteamId: Number,
     * PlayerId: Number,
     * FileCreated: string,
     * FileUpdated: string
     * }}
     * @private
     */
    _playerFactory(file) {
        let data = this._readFile(file),
            fileData = fs.statSync(path.join(this.arkFilesDir, file)),
            binaryParser = new ArkBinaryParser(data);

        return {
            Tribe: false,
            PlayerName: binaryParser.getProperty('PlayerName'),
            Level: binaryParser.getProperty('CharacterStatusComponent_ExtraCharacterLevel') + 1,
            TotalEngramPoints: binaryParser.getProperty('PlayerState_TotalEngramPoints'),
            CharacterName: binaryParser.getProperty('PlayerCharacterName'),
            TribeId: binaryParser.getProperty('TribeID'),
            SteamId: binaryParser.getSteamId(),
            PlayerId: binaryParser.getProperty('PlayerDataID'),
            FileCreated: util.formatTime(fileData.birthtime),
            FileUpdated: util.formatTime(fileData.mtime)
        };
    }

    /**
     * Create new tribe object
     *
     * @param file
     * @returns {{
     * Players: Array,
     * Name: string,
     * OwnerId: Number,
     * Id: Number,
     * TribeLogs: string[],
     * TribeMemberNames: string[],
     * FileCreated: string,
     * FileUpdated: string
     * }}
     * @private
     */
    _tribeFactory(file) {
        let data = this._readFile(file),
            fileData = fs.statSync(path.join(this.arkFilesDir, file)),
            binaryParser = new ArkBinaryParser(data);

        return {
            Players: [],
            Name: binaryParser.getProperty('TribeName'),
            OwnerId: binaryParser.getProperty('OwnerPlayerDataID'),
            Id: binaryParser.getProperty('TribeID'),
            TribeLogs: binaryParser.getProperty('TribeLog'),
            TribeMemberNames: binaryParser.getProperty('MembersPlayerName'),
            FileCreated: util.formatTime(fileData.birthtime),
            FileUpdated: util.formatTime(fileData.mtime)
        };
    }
}

/**
 * Export
 * @type {ArkFilesData}
 */
module.exports = ArkFilesData;