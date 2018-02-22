const ArkFiles = require('../ArkFilesData');
const arkFiles = new ArkFiles('test/assets/');
const chai = require('chai');

let expect = chai.expect;

describe('Players', () => {
    it('gets players', () => {
        expect(arkFiles.getPlayers()).to.deep.equal([{
            Tribe: undefined,
            PlayerName: 'TimmeY',
            Level: 300,
            TotalEngramPoints: 10000,
            CharacterName: 'Timmey',
            TribeId: undefined,
            SteamId: 76561198123343260,
            PlayerId: 145285114,
            FileCreated: '2018-02-21 09:37:10',
            FileUpdated: '2018-02-21 09:37:10'
        }]);
    });
});

