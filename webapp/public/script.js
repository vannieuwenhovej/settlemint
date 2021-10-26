const rpcURL = 'HTTP://127.0.0.1:8545';

const web3 = new Web3(rpcURL);

var userAccount;

var TOKEN_ADDRESS = "0x72f62bF33A5F9bB5839beDB7293E263b44Af1F9E";
var TICKET_ADDRESS = "0x2dC2c0492778E073Cb99BaE1AAE140f6DF5bc99a";

document.addEventListener("DOMContentLoaded", async function(event) {
        //Log in user if user clicks connect
        // document.querySelector("#connectMetaMask").addEventListener('click', setAccount);

        //access web3:
        initalizeWeb3()
        // await logIn();
          
});

function logIn(){
    loadUserData();
}

async function setAccount(){
        try{
            //get connected account
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0].toLowerCase();
            setNotification("info", "", "Connected to " + userAccount);
            logIn();
        } catch (error){
            setNotification("loading", "Please", "Connect with a valid account.");
            console.log(userAccount);
        }
        clearAllInput();   
}   

function metaMaskInstalled(){
    return typeof window.ethereum !== 'undefined';
}

async function initalizeWeb3(){
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (metaMaskInstalled()) {
        //MetaMask is installed
        web3js = new Web3(web3.currentProvider);
        //if client is still connected to RPC URL
        web3js.eth.net.isListening().then((s) => {
            //detect Metamask account change
            window.ethereum.on('accountsChanged', async function (accounts) {
                //account changed: set new account then load user data
                await setAccount();
            });
            
            //Initialize contract connection
            tokenContract = new web3js.eth.Contract(FestTokenABI, TOKEN_ADDRESS);
            ticketContract = new web3js.eth.Contract(TicketOwnershipABI, TICKET_ADDRESS);
            console.log(tokenContract);
            console.log(ticketContract);
            console.log(FestTokenABI);
            console.log(TicketOwnershipABI);
            
    
            if(userAccount === undefined){
                setNotification("loading", "", "Connect with an account")
                setAccount();
            }
    
            if(userAccount !== undefined){
                owner(ticketContract).then(function (res) {
                    console.log("owner ticket contract: " + res);
                })
                owner(tokenContract).then(function (res) {
                    console.log("owner token contract: " + res);
                    console.log("and you are: " + userAccount);
                })
            }
            //load App
            loadApp();
            
            //client lost connection or unable to connect to node
        }).catch((e) => {
            setNotification('error', 'Unable to connect', 'to node or maintain connectivity');
            console.log('Lost connection to the node, reconnecting');
        })
        
    //User has no MetaMask
    } else {
        setNotification("loading", "No MetaMask", "Please install MetaMask.");
        //MetaMask not installed
        if(confirm("Please install MetaMask to use app: https://metamask.io/download")){
            window.open("https://metamask.io/download");
        }
        console.log("Please install MetaMask to connect and use app: https://metamask.io/download");
    }
}


function loadApp(){
    
    loadAppData();
    document.querySelector("#btnBuyTicket").addEventListener('click', buyTicket);
    document.querySelector("#btnSellResaleTicket").addEventListener('click', sellResaleTicket);
    document.querySelector("#btnBuyResaleTicket").addEventListener('click', tryToBuyResaleTicket);
   
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
    try{
        getTokenBalance().then(function (res) {
        document.querySelector("span#tokenAmount").innerHTML = res;
        setTicketsOwned();
    })
    } catch(error){
        setNotification('error', 'Failed', 'retrieving user data from contract')
    }
}

/**
 * @dev load all general app data from blockchain
 */
function loadAppData(){
    setTicketOptions();
    ticketsLeft().then(function (res) {
        document.querySelector("span#ticketsLeft").innerHTML = res;
    })
    maxTicketSupply().then(function (res) {
        document.querySelector("span#ticketMaxSupply").innerHTML = res;
    })
}

function loadData(){
    loadAppData();
    loadUserData();
}

/**
 * @dev load amount of tickets user owns
 */
function setTicketsOwned(){
    getTicketAmount().then(function (res) {
        if (res == 1){
            res = `${res} ticket`;
        } else{
            res = `${res} tickets`;
        }
        document.querySelector("span#ticketAmount").innerHTML = res;
    })
}

/**
 * @dev set options for ticket types and prices
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
 * @param {"info", "success", "error", "loading"} type
 * @param time not set for error & loading messages by default
 */
function setNotification(type, title, message, time = 7000){
    let notif = document.querySelector('#notification');
    clearNotification();
    let div = document.createElement('div');
    let strong = document.createElement('strong');
    let span = document.createElement('span');
    let color;
    switch(type){
        case "loading":
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
    
    //classes compliant with tailwindcss v2.2.17
    span.className = "block sm:inline ml-2"
    strong.className = "font-bold";
    div.className = "border px-4 py-3 rounded relative";
    div.classList.add(`bg-${color}-100`);
    div.classList.add(`border-${color}-400`);
    div.classList.add(`text-${color}-700`);

    div.setAttribute("role", "alert");
    strong.innerText = title;
    span.innerText = message;
    div.appendChild(strong);
    div.appendChild(span);
    notif.appendChild(div);
    notif.style.visibility = "visible";

    //errors and loading messages should not dissapear unless time is specified
    if((type !== "error" && type !== "loading") || time !== 7000){
        setTimeout(
          function() {
            div.style.visibility='hidden';
          }, time);
    }
}

function clearNotification(){
    let notif = document.querySelector('#notification');
    notif.innerHTML = "";
}