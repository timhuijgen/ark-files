const ArkFiles = require('../src/ArkFilesData');
const arkFiles = new ArkFiles('test/assets/');
const chai = require('chai');
const expect = chai.expect;

describe('Players', () => {
    it('gets players', () => {
        expect(arkFiles.getPlayers()).to.deep.equal([{
            Tribe: false,
            PlayerName: 'TimmeY',
            Level: 300,
            TotalEngramPoints: 10000,
            CharacterName: 'Timmey',
            TribeId: false,
            SteamId: 76561198123343260,
            PlayerId: 145285114,
            FileCreated: '2018-02-21 09:37:10',
            FileUpdated: '2018-02-21 09:37:10'
        }]);
    });
});

describe('tribes', () => {
    it('gets tribes', () => {
        expect(arkFiles.getTribes()).to.deep.equal([{
            Players: [],
            Name: 'The Dino Police',
            OwnerId: 529159650,
            Id: 1632026172,
            TribeLogs:
                ['Day 93, 09:26:13: <RichColor Color="0, 1, 1, 1">Jarno was added to the Tribe!</>',
                    'Day 93, 10:45:15: <RichColor Color="0, 1, 1, 1">Remco was added to the Tribe by Jarno!</>',
                    'Day 93, 11:48:28: <RichColor Color="1, 0, 0, 1">Tribemember Remco - Lvl 26 was killed by a Raptor - Lvl 360!</>',
                    'Day 93, 11:53:40: <RichColor Color="1, 0, 0, 1">Tribemember Jarno - Lvl 44 was killed by a Raptor - Lvl 360!</>',
                    'Day 93, 16:23:49: <RichColor Color="0, 1, 0, 1">Jarno Tamed a Pteranodon - Lvl 149 (Pteranodon)!</>'],
            TribeMemberNames: ['Jarno', 'Remco'],
            FileCreated: '2018-02-19 16:08:32',
            FileUpdated: '2018-02-19 16:08:32'
        }]);
    });
});