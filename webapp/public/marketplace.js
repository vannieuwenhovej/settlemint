document.addEventListener("DOMContentLoaded", async function(event) {
    //Load the price of the ticket ID in the input field on change of ID
    document.querySelector(".marketplace.buy")
    .querySelector(".ticketId").addEventListener("change",
        loadResalePriceOfTicket
    );
      
});

function sellResaleTicket(){
    let ticketIdInput = document.querySelector(".marketplace.sell")
    .querySelector(".ticketId");
    let ticketPriceInput = document.querySelector(".marketplace.sell")
    .querySelector(".ticketprice");
    console.log(ticketIdInput.value + " for " + ticketPriceInput.value)
}

function buyResaleTicket(){
    let id = document.querySelector(".marketplace.buy")
    .querySelector(".ticketId").value;
    let ticketPriceInput = document.querySelector(".marketplace.buy")
    .querySelector(".ticketprice");
}

/**
 * @dev loads the price of ticket ID to buy into the input field
 */
async function loadResalePriceOfTicket(){
    let id = document.querySelector(".marketplace.buy")
    .querySelector(".ticketId").value;
    try{
        let price = await resalePriceOf(id);
        document.querySelector(".marketplace.buy")
        .querySelector(".ticketprice").value = price;
    } catch(error){
        //if user typed unexisting ticket ID
        if(id!==''){
            setNotification("error", "Oops!", `Ticket ${id} doesn't exist.`, 3000);
        }
        document.querySelector(".marketplace.buy")
        .querySelector(".ticketprice").value = "";
    }


}
