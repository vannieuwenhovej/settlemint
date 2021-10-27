# Hi SettleMint, 
I'm excited to show you my solution for the assignment. I have worked hard with **Solidity** and **TailwindCSS** in these 3 weeks to deliver a smooth and functional application showcasing all the requirements set up in the assignment.  
I was unable to  compose a Docker container where I could execute truffle console and automate commands.
That's why I have documented in detail how to set up the environment and put a lot of effort into error handling in case of unexpected behaviour. Besides a Docker compose file every other requirement is present. Enjoy the project!
Installation takes around 8 minutes.
![image2](https://user-images.githubusercontent.com/51959960/138946845-f77348a7-1f02-4eae-9bee-abfe3a4e41a6.png)

# 1.0 Installation & Setup
> The installation in this documentation is done on a Windows machine.

First we will set up Ganache CLI for running a local Ethereum environment. Afterwards we run Truffle console to get the one-time setup done like setting the Organizer. This setup only happens once at deployment.
At last we set up a simple local web server to host the TailwindCSS web app and connect with the smart contracts.
### 1.1 Installing dependencies
- Make a new directory:
`PS C:\> mkdir settlemint-demo`
`PS C:\> cd settlemint-demo`
- Clone the Git repository:
`PS C:\settlemint-demo> git clone https://github.com/vannieuwenhovej/settlemint.git`
- enter settlemint/truffleproject:
`PS C:\settlemint-demo> cd settlemint\truffleproject`
- install the dependencies:
`PS C:\settlemint-demo\settlemint\truffleproject> npm install`
- go to the webapp folder:
`PS C:\settlemint-demo\settlemint\truffleproject> cd ../webapp`
- install the dependencies here as well:
`PS C:\settlemint-demo\settlemint\webapp> npm install`

### 1.2 Running Ganache-cli
- Next up open a new terminal for running Ganache in the background
`PS C:\settlemint-demo\settlemint\truffleproject>`
> Since I had problems running the command as global command I used the project's node_modules directory to run the command. I did this  as follow:
> 
`PS C:\settlemint-demo\settlemint\truffleproject>.\node_modules\.bin\ganache-cli -q`
Now Ganache CLI is running on 127.0.0.1:8545 and uses 10 accounts on the network. The -q is used to not echo any updates and events.
You should be seeing:
`Listening on 127.0.0.1:8545`
Let this terminal window run in the background.

### 1.3 Migrating contracts and Initializing front end 
- We're going to use Truffle to deploy the contracts and set up the one-time initalisation.
- Enter a new terminal window and type:
`PS C:\settlemint-demo\settlemint\truffleproject> .\node_modules\.bin\truffle migrate`
This should result in the total deployment of `3` contratcs and an estimated final cost of around `0.13 ETH`.
- We need the contract addresses in order for the webapp to interact with them.
-- Scroll to find the contract address of TicketOwnership and copy it.
-- Next, go to `webapp/public/script.js` and open the .js file in an editor of choice.
-- At to top of `script.js` there is a variable called `TICKET_ADDRESS`, set the address you just copied as the 			  value of this variable. 
- We need to do the same for FestToken. Copy the address of the FestToken contract in the output of `truffle migrate` and set as the value of `TOKEN_ADDRESS` at the top of the `script.js` file.
- Now we can close the .js editor but not yet the terminal.
- 
### 1.4 (Optional) Running the tests
- There are tests in this project. Check if they succeed with running the following command:
`PS C:\settlemint-demo\settlemint\truffleproject> .\node_modules\.bin\truffle test`
- This runs a variety of tests for the FestToken and TicketOwnership funtionality of the smart contracts. Note that the tests are divided as in the context of Primary market and Secondary market.

### 1.5 Initializing one-time setup
- Now we initalize the required steps to interact with the smart contracts.
- Enter truffle console:
`PS C:\settlemint-demo\settlemint\truffleproject> .\node_modules\.bin\truffle console`
`truffle(development)>`
- Get the contracts:
`truffle(development)> let ticket = await TicketOwnership.deployed()`
`truffle(development)> let token = await FestToken.deployed()`
- Set the tokens contract address in the ticket's contract:
`truffle(development)> ticket.setFestTokenAddress(token.address);`
--> should print a succesful transaction
- Set the organizer for the festival. For ease of use as a demo, let's pick ourselves, the deployer of the contracts:
`truffle(development)> ticket.setOrganizer(accounts[0]);`
--> should print a succesful transaction
- Next we can set the prices of different 'ticket types'. We can implement as many ticket types as we want on the smart contracts but the ones defined in the frontend web app are 'Normal', 'Special' and 'VIP'.
- Since we, the owner of the contracts are the Organizer as well, we can set the default prices of these tickets.
- Let's go ahead and set some prices.
- `truffle(development)> ticket.setDefaultPriceFor("Normal", 100);`
- `truffle(development)> ticket.setDefaultPriceFor("Special", 300);`
- `truffle(development)> ticket.setDefaultPriceFor("VIP", 500);`
Now the tickets are set!

Ofcourse we need some FEST tokens in our accounts to buy a ticket.
We can print FEST to an address. Let's mint 1000 FEST (or a different amount) to the first 4 addresses:
- `truffle(development)>   token.mintTo(accounts[0], 1000);`
- `truffle(development)>   token.mintTo(accounts[1], 1000);`
- `truffle(development)>   token.mintTo(accounts[2], 1000);`
- `truffle(development)>   token.mintTo(accounts[3], 1000);`
- `truffle(development)>   token.mintTo(accounts[4], 1000);`
- exit the truffle console by typing `.exit` enter.

### 1.6 Initializing Local HTTP Host and MetaMask:
- If you haven't already installed MetaMask, please install it for your browser: https://metamask.io/download.html
- If our webapp is just ran statically from a file, we can't interact with it through MetaMask. Therefore our webapp has to be hosted on a HTPP web server in order to interact with the plugin.
- An easy node module is `http-server` to run an index file fast on localhost.
- In this tutorial I am using the VS Code plugin:  `ritwickdey.liveserver`. If you're using  VS Code you can install it from the marketplace by searching for its name in the extensions marketplace. After installing this plugin, all you have to do is right-click in index.html and click 'Open with Live Server'. 
- If you installed `http-server` you can use the `http-server index.html` command. For specifying the port and more visit the quick docs: https://www.npmjs.com/package/http-server
![image](https://user-images.githubusercontent.com/51959960/138946774-2387e718-0b47-460f-83ff-419660966381.png)

### 1.7 Adding the accounts to MetaMask:
- When MetaMask is open click the networks list and click on Localhost 8545.
- Our open Ganache terminal displays accounts where we have sent FEST to, to the first addresses.
- In MetaMask, Add an account by clicking on your accounts tab and clicking "Import account".
- Next copy the first private key from the Ganache accounts list and import it.
- To test the secondary marketplace funtionality throught the webapp I recommend to import the second account as well to trade tickets.

### 1.8 Ready to go!
- Now you can buy tickets via the web app from the organizer. Test out the functionality and try to sell a ticket on the marketplace for an increased price and buying the same ticket from a different account.

# 2.0 How it works
## 2.1 Organizer & Owner
Upon deployment of the smart contracts, the owner sets an Organizer. This could be the owner himself as well. The organizer can mint free tickets to an address and can set the default prices of tickets. The organizer can set a monetization fee which is calculated on the price. A 5% fee on a 200 FEST resale trade would result in 200 FEST going to the seller and 10 FEST going to the Organizer. The buyer pays 210 FEST.
## 2.2 Secondary market
The owner of a ticket can put a ticket for resale. The ticket gets approved for resale but is still owned by the seller. The moment a buyer accepts this order the ticket is changed of owner. If monetization is set, a fee is calculated for the organizer. With regards to time for this assignment and to not go over board I kept the front end simple with just an input for ID and ticket. 
**The IDs given to tickets are corresponding to their position in the array.** So if you buy the first ticket of the event, it will be ticket with ID 0. Try beginning with 0 in the input field for selling and see if you're the owner.
## 2.3 Standards & Interfaces
The standard for the FEST token is ERC20 since it is the most interoperable and popular interface for creating tokens on Ethereum. Ticket uses the ERC721Enumerable interface by openzeppelin and allows for safe functionality as well as interoperability. 
## 2.4 Supply
The supply for the FEST token is not capped. Initially the owner can mint tokens to the organizer or any other address. The burden is on the organizer (or the owner) to distribute and sell tokens. The max supply for tickets is 1000 and is set at deployment as a parameter for the constructor of the contract. However the organizer can still change the supply later on if he wishes to do so.

# 3.0 Assignment (copy)

The assignment is crafted in such a way we can evaluate concretely if you (at this time) have the skills we are looking for since it is an accurate example of a ticket that might be assigned to you in our first week.

There are hardly any guidelines and for good reason. It allows us to learn a lot about you; how you take on this assignment more; how you deliver the completed assignment; and how you handle the uncertainty of working with new technologies. The goal is to really figure out how you will tackle an assignment once you are part of the team.

You have 3 weeks to accomplish the assignment below. If your assignment convinces us, you will be invited for the last step of the application process: an interview with a few of your future team members and management. If your assignment doesn't meet our standards, your hiring process ends here. In both cases, you will receive feedback on your assignment.

Enough said, good luck with the assignment!


### Assignment:

1.	Create a non-fungible token that represents tickets for a festival and a fungible currency token using the chain technology of your choice (Solidity, Chaincode, Cordapp, ...)
	
	- There are maximum 1000 tickets

	- You can buy tickets from the organizer at a fixed price in the currency token

	- You can buy for and sell tickets to others, but the price can never be higher than 110% of the previous sale

	- Add a monetization option for the organizer in the secondary market sales

2.	Create a small web app to show the current state (supply, what the accounts own, balances) and buttons to demonstrate the different functions.
	

### Minimal requirements:

- Include a docker-compose file to spin up the infrastructure needed to run the app

- Documentation is everything, explain what happens and how to run/deploy


### Delivery:

- Send me a Github/GitLab/… link to the source code and docs
