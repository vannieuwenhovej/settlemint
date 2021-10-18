const { assert, AssertionError, expect } = require('chai');
const utils = require("./helpers/utils");

const TicketFactory = artifacts.require('./TicketFactory.sol');
const TicketManager = artifacts.require('./TicketManager.sol');
const TicketOwnership = artifacts.require('./TicketOwnership.sol');
const FestToken = artifacts.require('./FestToken.sol');


contract('TicketOwnership', (accounts) => {
    let [owner, organizer, alice, bob] = accounts;
    let contract;

    //ran before every function
    before(async () => {
        contract = await TicketOwnership.deployed();
    })

    // describe('deployment', async() => { // container for following tests
    //     it('deploys succesfully', async () => {
    //         const address = contract.address;
    //         assert.notEqual(address, '');
    //         assert.notEqual(address, '0x0');
    //         assert.notEqual(address, null);
    //         assert.notEqual(address, undefined);
    //         console.log(address);
    //     })

    //     it('has a name', async () => {
    //         const name = await contract.name() //this should be returned by the inherited openzeppelin contract
    //         assert.equal(name, 'Ticket');
    //     })

    //     it('has a symbol', async () => {
    //         const symbol = await contract.symbol()
    //         assert.equal(symbol, 'TICKET')
    //     })
        
    //     it('owner is account which deployed contract', async () => {
    //         const result = await contract.owner();
    //         assert.equal(result, accounts[0]);
    //     })

 

    // })

    // describe('Owner', async () => {
    //     it('only owner can set organizer', async () => {
    //         const result = await contract.setOrganizer(organizer);
    //         assert.equal(result.receipt.status, true);
    //         await utils.shouldThrow(contract.setOrganizer(organizer, {from: alice}));
    //         await utils.shouldThrow(contract.setOrganizer(organizer, {from: bob}));
    //     })
    // })

    //ran before every function
    before(async () => {
        // contract = await TicketOwnership.deployed();
        await contract.setOrganizer(organizer);
    })
    
    /*
    describe('Organiser', async () => {
        context('Organizer can adjust ticket supply', async () => {
            it('organiser can set max ticket supply', async () => {
                let result = await contract.maxTicketSupply.call();
                assert(result, 1000);
                await contract.setMaxTicketSupply(500, {from: organizer});
                result = await contract.maxTicketSupply.call();
                assert(result, 500);
                await utils.shouldThrow(contract.setMaxTicketSupply(250, {from: owner}));
                await utils.shouldThrow(contract.setMaxTicketSupply(300, {from: alice}));
            })
            it('only organiser can mint a ticket', async () => {
                const result = await (contract.mint("Normal", 1, 30, {from: organizer}));
                assert.equal(result.receipt.status, true);
                const amount = await contract.totalTicketSupply();
                assert.equal(amount, 1);
                await utils.shouldThrow(contract.mint("Normal", 1, 30, {from: owner}));
                await utils.shouldThrow(contract.mint("Normal", 1, 30, {from: alice}));
                
            })
            it('organizer can mint multiple tickets', async () => {
                await (contract.mint("Normal", 1, 30, {from: organizer}));
                await (contract.mint("Normal", 1, 30, {from: organizer}));
                await (contract.mint("Normal", 3, 30, {from: organizer}));
                const amount = await contract.totalTicketSupply();
                assert.equal(amount, 6);
            })
        })
        context('Organizer can monetize', async () => {
            it('only organizer can change monetization', async () => {
                const result = await contract.setMonetization(3, {from: organizer});
                assert(result.receipt.status, true);
                await utils.shouldThrow(contract.setMonetization(1, {from: alice}));
                await utils.shouldThrow(contract.setMonetization(2, {from: owner}));
            })
            it('monetization cant go out of bounds', async () => {
                await utils.shouldThrow(contract.setMonetization(11, {from: organizer}));
                await utils.shouldThrow(contract.setMonetization(-1, {from: organizer}));
            })
        })
    })
    */

    describe('ticket control', async () => {    
        //ran before every function
        let token;
        before(async () => {
            token = await FestToken.deployed();
            await token.mintTo(organizer, 5000);
            await token.transfer(alice, 1000, {from: organizer});
            contract.setFestTokenAddress(token.address);

            await contract.setOrganizer(organizer);
            await contract.mint("Normal", 10, 10, {from: organizer});
            await contract.mint("Special", 5, 20, {from: organizer});
            await contract.mint("VIP", 1, 50, {from: organizer});
        })
        context('buying from organizer', async () => {
            it('Alice has enough funds', async() => {
                const balanceOfAlice = await token.balanceOf(alice);
                assert.equal(balanceOfAlice.toNumber(), 1000);
            })
            it('alice can buy ticket form organizer', async () => {
                let price = await contract.getPriceOf(0);
                await token.allowance(alice, contract.address); //alow contract to spend
                await token.increaseAllowance(contract.address, price, {from: alice}); //allow contract to spend 
                const result = await contract.buyTicket(0, {from: alice}); //contract spends
                console.log(result);
                assert(result.receipt.status, true);
                const balanceOfAlice = await token.balanceOf(alice);
                const balanceOfOrganizer = await token.balanceOf(organizer);
                assert.equal(balanceOfAlice.toNumber(), 990);
                assert.equal(balanceOfOrganizer.toNumber(), 4010);
            })
        })
    })

})