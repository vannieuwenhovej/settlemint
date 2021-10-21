const { assert } = require('chai');

const FestToken = artifacts.require('./FestToken.sol');

contract('FestToken', (accounts) => {
    let contract;
    let [owner, organizer, alice, bob] = accounts;

    //ran before every function
    before(async () => {
        contract = await FestToken.deployed();
    })

    
    describe('deployment', async() => { // container for following tests
        it('deploys succesfully', async () => {
            const address = contract.address;
            assert.notEqual(address, '');
            assert.notEqual(address, '0x0');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
        it('returns correct to isOwner()', async () => {
            const result3 = await contract.isOwner({from: owner});
            assert.isTrue(result3);
            const result4 = await contract.isOwner({from: alice});
            assert.isFalse(result4);
        })
        it("should have 0 as total supply", async () => {
            let totalSupply = await contract.totalSupply();
            assert.equal(totalSupply.toNumber(), 0);
        })
    })

    describe('ERC20 functionality', async () => {
        before(async () => {
        })
        it('able to mint tokens to user', async () => {
            await contract.mintTo(organizer, 10000);
            const balance = await contract.balanceOf(organizer);
            assert.equal(balance, 10000);
        })
        it('should have 10000 as total supply', async () => {
            let totalSupply = await contract.totalSupply();
            assert.equal(totalSupply.toNumber(), 10000);
        })
    })

});