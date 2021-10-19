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
        await contract.setDefaultPriceFor("Normal", 10, {from: organizer});
        await contract.setDefaultPriceFor("Special", 20, {from: organizer});
        await contract.setDefaultPriceFor("VIP", 50, {from: organizer});
    })
    
    
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
            it('only organiser can mint a ticket for free', async () => {
                const result = await (contract.mintForFree("Normal", 1, {from: organizer}));
                assert.equal(result.receipt.status, true);
                const amount = await contract.totalTicketSupply();
                assert.equal(amount, 1);
                await utils.shouldThrow(contract.mintForFree("Normal", 1, {from: owner}));
                await utils.shouldThrow(contract.mintForFree("Normal", 1, {from: alice}));
                
            })
            it('organizer can mint multiple tickets for free', async () => {
                await (contract.mintForFree("Normal", 3, {from: organizer}));
                const amount = await contract.totalTicketSupply();
                assert.equal(amount, 4);
            })
            it('ticket supply check', async () => {
                await contract.setMaxTicketSupply(1000, {from: organizer});
                await (contract.mintForFree("Special", 3, {from: organizer}));
                const ticketsLeft = await contract.ticketsLeft();
                assert.equal(ticketsLeft.toNumber(), 993);
                await utils.shouldThrow(contract.setMaxTicketSupply(5, {from: organizer}));
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
})

//Second test from scratch
contract('TicketOwnership', (accounts) => {
    let [owner, organizer, alice, bob] = accounts;
    let contract;

    //ran before every function
    before(async () => {
        contract = await TicketOwnership.deployed();
    })
    
    describe('ticket control: primary market', async () => {    
        //ran before every function
        let token;
        before(async () => {
            token = await FestToken.deployed();
            console.log("Token contract at " + token.address);
            await token.mintTo(organizer, 5000);
            await token.transfer(alice, 1000, {from: organizer}); //4000
            await token.transfer(bob, 5, {from: organizer}); //3995
            await contract.setFestTokenAddress(token.address);

            await contract.setOrganizer(organizer);
        })
        context('buying from organizer', async () => {
            it('Organiser sets default price', async() => {
                await contract.setDefaultPriceFor("Normal", 10, {from: organizer});
                let price = await contract.defaultPriceOf("Normal");
                assert.equal(price, 10);
            })
            it('Alice has enough funds', async() => {
                const balanceOfAlice = await token.balanceOf(alice);
                assert.equal(balanceOfAlice.toNumber(), 1000);
            })
            it('Alice has not yet tickets', async() => {
                const aliceTickets = await contract.balanceOf(alice);
                assert.equal(aliceTickets.toNumber(), 0);
            })
            it('Alice can buy ticket form organizer', async () => {
                let price = await contract.defaultPriceOf("Normal");
                console.log(price);
                await token.approve(contract.address, price, {from: alice}) //approve contract to spend {price} 
                const result = await contract.buyTicketFromOrganizer("Normal", 1, {from: alice}); //contract spends
                assert(result.receipt.status, true);
            })
            it('Alice and organizers balance updated', async() => {
                const balanceOfAlice = await token.balanceOf(alice);
                const balanceOfOrganizer = await token.balanceOf(organizer);
                assert.equal(balanceOfAlice.toNumber(), 990);
                assert.equal(balanceOfOrganizer.toNumber(), 4005);
            })
            it('Alice has bought 1 ticket', async() => {
                const aliceTickets = await contract.balanceOf(alice);
                assert.equal(aliceTickets.toNumber(), 1);
            })
            it('Ticket supply is 1', async() => {
                const ticketSupply = await contract.totalTicketSupply();
                assert.equal(ticketSupply.toNumber(), 1);
            })
            it('9999 tickets left', async() => {
                const ticketsLeft = await contract.ticketsLeft();
                assert.equal(ticketsLeft.toNumber(), 999);
            })
            it('Bob has no tickets', async() => {
                const bobsTickets = await contract.balanceOf(bob);
                assert.equal(bobsTickets.toNumber(), 0);
            })
            it('Bob has insufficient funds', async() => {
                let price = await contract.defaultPriceOf("Normal");
                const balanceOfBob = await token.balanceOf(bob);
                assert.equal(balanceOfBob.toNumber(), 5);
                assert.isTrue(balanceOfBob.toNumber() < price);
            })
            it('Bob cant buy ticket', async() => {
                let price = await contract.defaultPriceOf("Normal");
                await token.approve(contract.address, price, {from: bob}) //approve contract to spend {price} 
                await utils.shouldThrow(contract.buyTicketFromOrganizer("Normal", 1, {from: bob})); //contract spends
            })
        })
    })

})

//Third test from scratch
contract('TicketOwnership', (accounts) => {
    let [owner, organizer, alice, bob] = accounts;
    let contract;

    //ran before every function
    before(async () => {
        contract = await TicketOwnership.deployed();
    })
    
    describe('ticket control: secondary market', async () => {    
        //ran before every function
        let token;
        before(async () => {
            token = await FestToken.deployed();
            console.log("Token contract at " + token.address);
            await contract.setOrganizer(organizer);
            await token.mintTo(organizer, 5000);
            await token.transfer(alice, 1000, {from: organizer}); //4000
            await token.transfer(bob, 1000, {from: organizer}); //3995
            await contract.setFestTokenAddress(token.address);
            await contract.setDefaultPriceFor("Normal", 20, {from: organizer});
        })
        context('buying from organizer', async () => {
            it('Alice bought ticket from organizer', async () => {
                let price = await contract.defaultPriceOf("Normal");
                await token.approve(contract.address, price, {from: alice}) //approve contract to spend {price} 
                const result = await contract.buyTicketFromOrganizer("Normal", 1, {from: alice}); //contract spends
                assert(result.receipt.status, true);
                
                const aliceTickets = await contract.balanceOf(alice);
                assert.equal(aliceTickets.toNumber(), 1);
                
                const aliceOwner = await contract.ownerOf(0);
                assert.equal(aliceOwner, alice);
            })
            it('Organiser sets 2% monetization', async() => {
                const result = await contract.setMonetization(2, {from: organizer});
                assert.equal(result.receipt.status, true);
            })
            it('Alice sets ticket for resale', async() => {
                const result = await contract.tryApproveTicketSellOrder(0, 22, {from: alice});
                const result2 = await contract.approve(contract.address, 0, {from: alice}); //approve contract to receive ticket
                const result3 = await contract.getApproved(0, {from: alice});
                assert.equal(result.receipt.status, true);
                assert.equal(result2.receipt.status, true);
                assert.equal(result3, contract.address);
            })
            it('Bob buys Alices ticket from resale', async() => {
                await token.approve(contract.address, 25, {from: bob}) //approve contract to spend {price} 
                const result = await contract.buyResaleTicket(0, {from: bob});
                assert.equal(result.receipt.status, true);
            })
            it('Alices and bobs balances are updated', async() => {
                const bBalance = await contract.balanceOf(bob);
                const aBalance = await contract.balanceOf(alice); 
                assert.equal(bBalance, 1);
                assert.equal(aBalance, 0);
            })
        })
    })

})