const express=require('express');
const Web3=require('web3');
const handlebars=require('handlebars');

const app = express();

app.set('view engine', 'handlebars');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}


app.get('/', (req, res) =>{ 
	res.render("index.hbs");
});

//Take the certificate ID to get Certificate Details
app.get('/certificate', (req, res) =>{ 
	res.render("certificate.hbs");
});

//get Transaction using id and get the certificate from it
app.get("/certificate_details",(req,res)=>
{
	var id=req.query.id;

	//get the certificate
	web3.eth.getTransaction(id,(err,transaction)=>
	{
		//convert Hex to Ascii
		var Ob=web3.toAscii(transaction.input).slice(2);
		
		//Create Java Object from the string retrieved
		var details=JSON.parse(Ob);

		//Adding the public key of Signing Authority
		details.from=transaction.from;

		res.render("certificate_details.hbs",details);
	});
});


//UI to enter details to create new certificate
app.get("/generate",(req,res)=>
{
	res.render("generate.hbs");
});

//create new certificate by sending new transaction
app.get("/post_new",(req,res)=>
{
	var name=req.query.name;
	var organisation=req.query.organisation;
	var details=req.query.details;
	
	//creating an object with details
	var data={
		name,
		organisation,
		details,
	};
	
	//Convert the object to string
	var dataString=JSON.stringify(data);

	//send 0 ether to self, with JSON string as input
	web3.eth.sendTransaction({
		from:web3.eth.accounts[0],
		to:web3.eth.accounts[1],
		value:"0",
		data:dataString
	},(err,transaction)=>
	{

		//once the transaction complete, show the user the transaction id
		//which is going to be the certificate ID of that certificate
		var certficate={
			id:transaction
		}
		res.render("success.hbs",certficate);
	});

});

//Start the application
app.listen(3000, () => console.log('App listening on port 3000!'));