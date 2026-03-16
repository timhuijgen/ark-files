const ArkFiles = require('../src/ArkFilesData');
const ArkBinaryFormats = require('../src/ArkBinaryFormats')
const arkFiles = new ArkFiles('test/assets/asa', null, ArkBinaryFormats.ASA);
const chai = require('chai');
const expect = chai.expect;

const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

describe('Players', () => {
  it('gets players', () => {
    const players = arkFiles.getPlayers();

    expect(players).to.have.lengthOf(1);
    expect(players[0].FileCreated).to.match(timestampRegex);
    expect(players[0].FileUpdated).to.match(timestampRegex);

    const { FileCreated, FileUpdated, ...playerData } = players[0];
    expect(playerData).to.deep.equal({
      Tribe: false,
      PlayerName: 'Chuck Finley',
      Level: 49665,
      TotalEngramPoints: 2952704,
      CharacterName: 'Giga',
      TribeId: false,
      EosId: '00028acaa47a4fd886c64adf4ed87d48',
      PlayerId: 2584517376,
    });
  });
});

// describe('tribes', () => {
//     it('gets tribes', () => {
//         const tribes = arkFiles.getTribes();

//         expect(tribes).to.deep.equal([]);
//     });
// });
