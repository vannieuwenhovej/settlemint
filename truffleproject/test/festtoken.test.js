const { assert } = require('chai');

const FestToken = artifacts.require('./FestToken.sol');

contract('FestToken', (accounts) => {
    let contract;

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
            console.log(address);
        })
        
        it("should have 1 million as total supply", async () => {
            let totalSupply = await contract.totalSupply();
            assert(totalSupply.toNumber(), 1000000);
        })
    })

});