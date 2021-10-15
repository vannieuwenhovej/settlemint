const { assert } = require('chai');

const Ticket = artifacts.require('./TicketFactory.sol');

// require('chai')
//     .use(require('chai-as-promised'))
//     .should();

contract('Ticket', (accounts) => {
    let contract;

    //ran before every function
    before(async () => {
        contract = await Ticket.deployed();
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

        it('has a name', async () => {
            const name = await contract.name() //this should be returned by the inherited openzeppelin contract
            assert.equal(name, 'Ticket');
        })

        it('has a symbol', async () => {
            const symbol = await contract.symbol()
            assert.equal(symbol, 'TICKET')
        })

    })

    // describe("minting", async() => {
    //     it('creates a new token', async () => {
    //         const result = await contract.mint("Normal", 10, 100);
    //         const totalTickets = await
    //     })
    // })
})