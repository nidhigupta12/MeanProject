contract Agreement {

    struct File {
        string name;
        bytes32 hash;
    }

    enum State {
		AGREEMENT_CREATED,
		ISSUED_LC,
		ACCEPT_LC,
		LODGEMENT_CREATED,
		ACCEPT_LODGEMENT_ADVISORY,
		ACCEPT_LODGEMENT_ISSUING
    }

    event onContractCreated(uint timestamp, address sender, address receiver, uint state,string poNumberinContract, string name, bytes32 hash, uint fileCount);
	event onIssueLc(uint timestamp, address sender, address receiver, uint state,string lcNumberinContract, string poNumberinContract);
    event onAccept(uint timestamp, address sender, address receiver, uint state,string lcNumberinContract);
    event oncreateLodgement(uint timestamp, address sender, address receiver, uint state,string lcNumberinContract, string name, bytes32 hash, uint fileCount);
    event onAcceptLodgementPres(uint timestamp, address sender, address receiver, uint state,string lcNumberinContract);
    event onAcceptLodgementIsu(uint timestamp, address sender, address receiver, uint state,string lcNumberinContract);

    address public sender;
    address public receiver;

    uint public signedCount;
    uint public fileCount;
    string public lcNumberinContract;
	string public poNumberinContract;
	string public invoiceNumberInContract;
    State public state;


    mapping(uint => address) public signedList;
    mapping(uint => File) files;

	 /* DROP 1
	1 Create Agreement (Creating and transmitting LC equivalent) - Issuing Bank
	Input Parameters
	   LC Number
	   Hash of File Uploaded
	Output Parameters
	   Timestamp IST
	   Address Sender
	   Address Receiver
	   Step of Workflow */
    function Agreement(uint timestamp, address from, address to,string poNumber, string name, bytes32 hash) public {
        state = State.AGREEMENT_CREATED;
		poNumberinContract=poNumber;
        fileCount = 0;
        signedCount = 0;
        sender = from;
        receiver = to;
        File memory file = File(name, hash);
        var fileId = fileCount++;
		files[fileId] = file;
        onContractCreated(timestamp, sender, receiver, uint(state),poNumberinContract, name, hash, fileCount);
    }

	/* DROP 1
	2. Issuing Bank to issue LC
	Input Parameters
	   LC Number
	   PO Number
	Output Parameters
	   Timestamp IST
	   Address Sender
	   Address Receiver
	   Step of Workflow */
	function issuingBankToIssueLc(uint timestamp, address from, address to,string lcNumber,string poNumber) {
        state = State.ISSUED_LC;
		sender=from;
		poNumberinContract=poNumber;
		receiver=to;
		lcNumberinContract=lcNumber;
        onIssueLc(timestamp, sender, receiver, uint(state),lcNumberinContract,poNumberinContract);

    }


	/* DROP 1,2 - Generic function created for any kind of acceptance and will require state as a parameter

	3. Advising Bank - Accept LC
	Input Parameters
	   LC Number
	Output Parameters
	   Timestamp IST
	   Address Sender
	   Address Receiver
	   Step of Workflow

	 5. Advising Bank to Accept and forward lodgement
	Input Parameters
	   LC Number
	Output Parameters
	   Timestamp IST
	   Address Sender
	   Address Receiver
	   Step of Workflow

	6. Accept Lodgement Documents - Issuing Bank
	Input Parameters
	   LC Number
	Output Parameters
	   Timestamp IST
	   Address Sender
	   Address Receiver
	   Step of Workflow
	   */
    function acceptLCByAdvBank(uint timestamp, address from, address to, uint new_state,string lcNumber) {
        state = State(new_state);
        sender = from;
        receiver = to;
        var signedId = signedCount++;
        signedList[signedId] = receiver;
     	lcNumberinContract=lcNumber;
        onAccept(timestamp, sender, receiver, uint(state),lcNumberinContract);
    }

        function acceptLodgementByPresBank(uint timestamp, address from, address to, uint new_state,string lcNumber) {
        state = State(new_state);
        sender = from;
        receiver = to;
        var signedId = signedCount++;
        signedList[signedId] = receiver;
     	lcNumberinContract=lcNumber;
        onAcceptLodgementPres(timestamp, sender, receiver, uint(state),lcNumberinContract);
    }

        function acceptLodgementByIsuBank(uint timestamp, address from, address to, uint new_state,string lcNumber) {
        state = State(new_state);
        sender = from;
        receiver = to;
        var signedId = signedCount++;
        signedList[signedId] = receiver;
     	lcNumberinContract=lcNumber;
        onAcceptLodgementIsu(timestamp, sender, receiver, uint(state),lcNumberinContract);
    }


	/* DROP 2
	4. Beneficiary to Create Lodgment
	Input Parameters
		LC Number
		Hash of File Uploaded
		Invoice number
	Output Parameters
		Timestamp IST
		Address Sender
		Address Receiver
		Step of Workflow */
    function createLodgement(uint timestamp, address from, address to,string lcNumber, string name, bytes32 hash,string invoiceNumber) {
        state = State.LODGEMENT_CREATED;
		sender=from;
		receiver=to;
		lcNumberinContract=lcNumber;
		invoiceNumberInContract=invoiceNumber;
        File memory file = File(name, hash);
        var fileId = fileCount++;
		files[fileId] = file;

        oncreateLodgement(timestamp, sender, receiver, uint(state),lcNumberinContract,name, hash, fileCount);

    }



}
