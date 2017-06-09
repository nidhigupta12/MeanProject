<h2>Trade Finance Application using Blockchain for KOTAK</h2>

<div> Pre- requisite for the project </div>
<ul>
<li>Running MongoDb Instance</li>
<li>Running Ethereum Instance</li>
<li>Running IPSF instance</li>
</ul>

<b>To Install Locally</b>

<div>
1. Get the code from Git
<GIT url goes here>
</div>
<div class = "bullet">
2. cd to folder
</div>
<div class = "bullet">
3. Install Dependecies
   npm install
</div>
<div class = "bullet">
4. Running the Application
node app.js

Installing pre requisites-
--------------- mongoDB-----------------------
4.1. Setup the mongodb path in your env variables(OPTIONAL)
C:\Program Files\MongoDB\Server\3.0\bin\


4.2. Run MongoDB - providing the db path {C:\mongodb_data}
>mongod.exe --dbpath <YOUR MONGO DB PATH>

</div>
-------------------------IPSF--------------------------------
<div class = "bullet">
Install IPFS
</div>
<div class = "bullet">
Start IPFS Daemon
ipfs daemon
</div>
<div class = "bullet">
Let IPFS connect with global peers - Another command window
ipfs swarm peers
</div>
<div class = "bullet">
In a new file Allow CORS request to IPFS - for dev ONLY

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://localhost:3000\"]"
</div>

-----------------------Ethereum Setup-------------------------
<div class = "bullet">
Installing geth
// Geth instructions goes here
</div>
