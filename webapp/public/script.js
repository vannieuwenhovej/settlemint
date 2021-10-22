const rpcURL = 'HTTP://127.0.0.1:8545';

const web3 = new Web3(rpcURL);

var userAccount;

var TOKEN_ADDRESS = "0x45134D1a3da15a4f1F71e96a1ad2c9b3beE0Ac6c";
var TICKET_ADDRESS = "0x4F747b75d46D0BE502B76254CE8c091CA25e79AF";

document.addEventListener("DOMContentLoaded", async function(event) {
        //Log in user if user clicks connect
        document.querySelector("#connectMetaMask").addEventListener('click', logIn);

        await logIn();
          
        // Now you can start your app & access web3 freely:
        initalizeWeb3()
});


async function logIn(){
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.ethereum !== 'undefined') {
        //MetaMask is installed
        ethereum.request({ method: 'eth_requestAccounts' });
        web3js = new Web3(web3.currentProvider);
        await setAccount();
        console.log("Connected account: " + userAccount);
        // detect Metamask account change
        window.ethereum.on('accountsChanged', function (accounts) {
            userAccount = accounts[0].toLowerCase();
            loadUserData();
        });
    } else {
        //MetaMask not installed
        if(confirm("Please install MetaMask to use app: https://metamask.io/download")){
            window.open("https://metamask.io/download");
        }
        console.log("Please install MetaMask to connect and use app: https://metamask.io/download");
    }
}



async function setAccount(){
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    userAccount = accounts[0].toLowerCase();
    
    setNotification("info", "", "Connected to " + userAccount);
}   


async function initalizeWeb3(){
    var usersTicketAmount;
    var usersTokenBalance;

    tokenContract = new web3js.eth.Contract(FestTokenABI, TOKEN_ADDRESS);
    ticketContract = new web3js.eth.Contract(TicketOwnershipABI, TICKET_ADDRESS);

    console.log(FestTokenABI);
    console.log(TicketOwnershipABI);

    // ownerOfContract(tokenContract).then(function (res){
    //     console.log(res);
    // })

    // ownerOfContract(ticketContract).then(function (res){
    //     console.log(res);
    // })

    loadApp();

    owner(ticketContract).then(function (res) {
        console.log("owner ticket contract: " + res);
    })
    owner(tokenContract).then(function (res) {
        console.log("owner token contract: " + res);
        console.log("and me: " + userAccount);
    })
}

function loadApp(){
    loadUserData();
    document.querySelector("#btnBuyTicket").addEventListener('click', buyTicket);
    console.log("ready to start app");
}


/**
 * @dev try to buy ticket on click of button
 */
function buyTicket(){
    var type = document.querySelector('select#ticketTypes').value;
    console.log("buying " + type);
    buyTicketViaContract(type, 1)
}

/**
 * @dev load all user data from blockchain
 */
function loadUserData(){
    getTokenBalance().then(function (res) {
        document.querySelector("span#tokenAmount").innerHTML = res;
    })
    ticketsLeft().then(function (res) {
        document.querySelector("span#ticketsLeft").innerHTML = res;
    })
    maxTicketSupply().then(function (res) {
        document.querySelector("span#ticketMaxSupply").innerHTML = res;
    })
    setTicketsOwned();
    setTicketOptions();
}

/**
 * @dev load amount of tickets user owns
 */
function setTicketsOwned(){
    getTicketAmount().then(function (res) {
        if (res == 1){
            res = res + " ticket";
        } else{
            res = res + " tickets";
        }
        document.querySelector("span#ticketAmount").innerHTML = res;
    })
}

/**
 * @dev set option for type and price
 */
function setTicketOptions(){
    document.querySelector('select#ticketTypes').innerHTML = '';
    defaultPriceOf("Normal").then(function (res) {
        injectTicketOption("Normal", res);
    })
    defaultPriceOf("Special").then(function (res) {
        injectTicketOption("Special", res);
    })
    defaultPriceOf("VIP").then(function (res) {
        injectTicketOption("VIP", res);
    })
}
/**
 * @dev injects an option for a type and price
*/
function injectTicketOption(type, price){
    var select = document.querySelector('select#ticketTypes');
    var option = document.createElement('option');
    option.id = "option#" + type.toLowerCase() + "Option";
    option.value = type;
    //if price is 0, type is unavailable.
    if(price > 0){
        option.innerHTML = `${type} (${price} FEST)`;
        option.disabled = false;
    } else{
        option.innerHTML = `${type} Unavailable`;
        option.disabled = true;
    }
    select.appendChild(option);
}

/**
 * @dev display a notification
 * @param {"info", "success", "error"} type 
 */
function setNotification(type, title, message){
    let notif = document.querySelector('#notification');
    notif.innerHTML = "";
    let div = document.createElement('div');
    let strong = document.createElement('strong');
    let span = document.createElement('span');
    let color;
    switch(type){
        case "info":
            color = "blue"
            break;
        case "success":
            color = "green";
            break;
        case "error":
            color = "red";
            break;
    }
    
    span.className = "block sm:inline ml-2"
    strong.className = "font-bold";
    div.className = "border px-4 py-3 rounded relative";
    div.classList.add(`bg-${color}-100`);
    div.classList.add(`border-${color}-400`);
    div.classList.add(`text-${color}-700`);

    div.role = "alert";
    strong.innerText = title;
    span.innerText = message;
    div.appendChild(strong);
    div.appendChild(span);
    notif.appendChild(div);
    notif.style.visibility = "visible";
    //errors should not dissapear
    if(type !== "error"){
        setTimeout(
          function() {
            div.style.visibility='hidden';
          }, 5000);
    }
}

/**************************************
 * Call function to contracts:
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

/**
 * @dev Gets price, approves contract to spend and buys ticket(s) if approved
 */
async function buyTicketViaContract(type, amount){
    defaultPriceOf(type).then(function (price) {
        approveContractToSpend(price*amount).then(function (approved){
            console.log("letsog");
            if(approved.status == true){
                ticketContract.methods.buyTicketFromOrganizer(type, amount).send({from: userAccount, gas:300000}).then(function (res){
                    setNotification("success", "Succesfully", `bought ${amount} ${type} tickets.`);
                    console.log(`succesfully bought ${amount} ${type} tickets.`);
                    loadUserData();
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
