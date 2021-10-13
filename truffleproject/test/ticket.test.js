const { assert } = require('chai');

const Ticket = artifacts.require('./Ticket.sol');

// require('chai')
//     .use(require('chai-as-promised'))
//     .should();

contract('Ticket', (accounts) => {
    describe('deployment', async() => { // container for following tests
        it('deploys succesfully', async () => {
            contract = await Ticket.deployed();
            const address = contract.address;
            assert.notEqual(address, '');
            console.log(address);
        })
    })
})