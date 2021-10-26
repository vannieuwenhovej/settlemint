document.addEventListener("DOMContentLoaded", async function(event) {
    //Load the price of the ticket ID in the input field on change of ID
    document.querySelector(".marketplace.buy")
    .querySelector(".ticketId").addEventListener("change",
        loadResalePriceOfTicketToBuy
    );
    document.querySelector(".marketplace.sell")
    .querySelector(".ticketId").addEventListener("change",
        checkTicketIdForResale
    );
      
});

/**
 * @dev Try & approve ticket for resale
 */
async function sellResaleTicket(){
    let id = document.querySelector(".marketplace.sell")
    .querySelector(".ticketId").value;
    let price = document.querySelector(".marketplace.sell")
    .querySelector(".ticketprice").value;
    if(id == ''){
        setNotification('error', '', 'Please enter ID of ticket', 3000);
    }
    else if(price == ''){
        setNotification('error', '', 'Please enter a price', 3000);
    }
    else{ // all inputs have been filled
        try{
            let approved = await approveTicketContractToReceiveTicket(id);
            if(approved){ 
                try{
                    let result = await tryApproveTicketSellOrder(id, price);
                    if(result.status === true){
                        try{
                            let price = await resalePriceOf(id);
                            setNotification("success", "Approved!", `Ticket ${id} is on resale for ${price}`);
                        } catch(error){
                            setNotification("error", "Error on retrieving price:", error);
                        }
                    } else{
                        setNotification("error", "Not approved", `Ticket ${id} was not approved for resale for ${price}`);
                    }
                    clearPriceValueIn('sell');
                    clearIdValueIn('sell');
                } catch(error){
                    setNotification("error", `Failed approving resale.`, error);
                    clearPriceValueIn('sell');
                    clearIdValueIn('sell');
                }
            } 
            else{ //contract not approved to receive ticket
                setNotification('error', 'Error', 'Contract not approved to receive ticket.');

            }
        } catch(error){
            setNotification('error', 'Failed approving contract', error);
        }
    }
}

async function tryToBuyResaleTicket(){
    let id = document.querySelector(".marketplace.buy")
    .querySelector(".ticketId").value;
    let price = document.querySelector(".marketplace.buy")
    .querySelector(".ticketprice").value;
    if(id == ''){
        setNotification('error', '', 'Please enter ID of ticket', 3000);
    }
    try{
        let approved = await approveContractToSpend(price);
        if(approved){
            try{
                let result = await buyResaleTicket(id);
                if(result.status === true){
                    setNotification('success', 'Successfully', `bought Ticket ${id}!`, 5000);
                    loadUserData();
                } else{
                    setNotification('error', '', `could not buy Ticket ${id}`, 3000);
                }
                clearPriceValueIn('buy');
                clearIdValueIn('buy');
            } catch(error){
                setNotification('error', `Error buying Ticket ${id}`, error);
            }
        }
    } catch(error){
        setNotification('error', `Error buying Ticket ${id}`, error);
        clearPriceValueIn('buy');
        clearIdValueIn('buy');
    }
}

/**
 * @dev loads the price of ticket ID to buy into the input field
 */
async function loadResalePriceOfTicketToBuy(){
    let id = document.querySelector(".marketplace.buy")
    .querySelector(".ticketId").value;
    
    //if user typed a ticket ID
    if(id!==''){
        try{
            let owner = await ownerOf(id);
            let approved = await isTicketOnResale(id);
            //if user is not ticket owner
            if(owner.toLowerCase() !== userAccount.toLowerCase()){
                //if ticket is approved for resale
                if(approved){
                    //then try to fill price
                    try{
                        let price = await resalePriceOf(id);
                        document.querySelector(".marketplace.buy")
                        .querySelector(".ticketprice").value = price;
                    } catch(error){
                        setNotification("error", "Oops!", `Ticket ${id} doesn't exist.`, 3000);
                        clearPriceValueIn("buy");
                        clearIdValueIn("buy");
                    }
                //else ticket not approved
                } else{
                    setNotification("info", "Oops!", `Ticket ${id} is not for sale.`, 3000);
                    clearPriceValueIn("buy");
                    clearIdValueIn("buy");
                }
            //user is owner of ticket
            } else{
                setNotification("info", "Oops!", `You already own ticket ${id}.`, 3000);
                clearPriceValueIn("buy");
                clearIdValueIn("buy");
            }
        //failed retrieving owner or approvance
        } catch(error){
            setNotification("error", "Oops!", `Ticket ${id} doesn't exist.`, 3000);
            clearPriceValueIn("buy");
            clearIdValueIn("buy");
        }
    //user typed no ID
    } else{
        clearPriceValueIn("buy");
    }
}

/**
 * @dev loads the current price of ticket ID to sell into the input field
 */
 async function checkTicketIdForResale(){
    let id = document.querySelector(".marketplace.sell")
    .querySelector(".ticketId").value;
    
    //if user typed a ticket ID
    if(id!==''){
        //try getting owner
        try{
            let owner = await ownerOf(id);
            //user is owner of ticket
            if(owner.toLowerCase() === userAccount.toLowerCase()){
                try{
                    //try getting current price
                    let price = await resalePriceOf(id);
                    document.querySelector(".marketplace.sell")
                    .querySelector(".ticketprice").value = price;
                } catch(err){
                    //else load no price
                    setNotification("info", "No price set,", `set a price to sell ticket ${id}.`, 3000);
                    clearPriceValueIn("sell");
                }
            } else{
                setNotification("error", "Oops!", `You're not the owner of ticket ${id}.`, 3000);
                clearPriceValueIn("sell");
                clearIdValueIn("sell");
            }
        } catch(error){
            setNotification("error", "Oops!", `Ticket ${id} doesn't exist.`, 3000);
            clearPriceValueIn("sell");
            clearIdValueIn("sell");
        }
    //User typed no ID
    } else{
        clearPriceValueIn("sell");
    }
}

/**
 * @dev Approve TicketContract to receive ticket
 */
async function approveTicketContractToReceiveTicket(ticketId){
    try{
        let result = await approve(ticketId);
        return result;
    } catch(error){
        setNotification('error', 'Failed approving ticket', error);
        clearPriceValueIn("sell");
        clearIdValueIn("sell");
    }
    return false;
}

/**
 * Clears price input
 * @param {buy, sell} side (compliant with HTML class)
 */
function clearPriceValueIn(side){
    document.querySelector(`.marketplace.${side}`)
    .querySelector(".ticketprice").value = "";
}


/**
 * Clears ID input
 * @param {buy, sell} side (compliant with HTML class)
 */
 function clearIdValueIn(side){
    document.querySelector(`.marketplace.${side}`)
    .querySelector(".ticketId").value = "";
}

function clearAllInput(){
    clearPriceValueIn('buy');
    clearIdValueIn('buy');  
    clearPriceValueIn('sell');
    clearIdValueIn('sell');  
}