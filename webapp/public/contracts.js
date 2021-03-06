
/**************************************
 * Call functions to contracts:
 **************************************/

 function ownerOfContract(contract){
    return contract.methods.isOwner().call();
}

function owner(contract){
    return contract.methods.owner().call();
}

function getTokenBalance(){
    return tokenContract.methods.balanceOf(userAccount).call();
}

function getTicketAmount(){
    return ticketContract.methods.balanceOf(userAccount).call();
}

function ticketsLeft(){
    return ticketContract.methods.ticketsLeft().call();
}

function defaultPriceOf(type){
    return ticketContract.methods.defaultPriceOf(type).call();
}

function maxTicketSupply(){
    return ticketContract.methods.maxTicketSupply().call();
}

function resalePriceOf(_id){
    return ticketContract.methods.resalePriceOf(_id).call();
}

function ownerOf(_id){
    return ticketContract.methods.ownerOf(_id).call();
}

function tryApproveTicketSellOrder(_id, _price){
    return ticketContract.methods.tryApproveTicketSellOrder(_id, _price).send({from: userAccount, gas: 300000}).then(function (res){
        return res;
    })
}

function isTicketOnResale(_id){
    return ticketContract.methods.isTicketOnResale(_id).call();
}

function approve(_id){
    return ticketContract.methods.approve(TICKET_ADDRESS, _id).send({from:userAccount, gas: 300000}).then( function (res){
        return res;
    })
}

/**
 * @dev Gets price, approves contract to spend amount, and buys ticket(s) if approved
 */
async function buyTicketViaContract(type, amount){
    defaultPriceOf(type).then(function (price) {
        approveContractToSpend(price*amount).then(function (approved){
            console.log("letsog");
            if(approved.status == true){
                ticketContract.methods.buyTicketFromOrganizer(type, amount).send({from: userAccount, gas:300000}).then(function (res){
                    setNotification("success", "Succesfully", `bought ${amount} ${type} ticket.`, 10000);
                    console.log(`succesfully bought ${amount} ${type} ticket.`);
                    loadData();
                }).catch(function (err) {
                    setNotification("error", `Failed buying ${amount} ${type} ticket:`, err);
                    console.log(err);
                    return err;
                })
            } else{
                setNotification("error", `Failed approving spending:`, approved);
                console.log(approved);
                console.log(`failed buying ${amount} ${type} tickets.`);
                return;
            }
        })
    })
}

function approveContractToSpend(amount){
    console.log(userAccount);
    return tokenContract.methods.approve(TICKET_ADDRESS, amount).send({from: userAccount, gas:300000}).on('receipt', function(receipt){
        return receipt.status;
    }).catch(function (err){
        return err;
    });
}

function mint(){
    tokenContract.methods.mintTo(userAccount, 10000).call().then(function(res){
        getTokenBalance().then(function (res) {
            console.log(res);
        })
        return res;
    }).catch(function(err) {
        setNotification("error", "Could not mint", err);
        console.log(err);
        return err;
    });
}

function buyResaleTicket(_id){
    return ticketContract.methods.buyResaleTicket(_id).send({from: userAccount, gas:300000}).on('receipt', function (receipt){
        return receipt;
    }).catch(function (err){
        setNotification("error", "Could not buy ticket", err);
        return err;
    })
}