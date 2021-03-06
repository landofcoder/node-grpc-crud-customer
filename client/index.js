const client = require("./client");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
	client.getAll(null, (err, data) => {
		if (!err) {
			console.log("All customers: ", data);
			res.render("customers", {
				results: data.customers
			});
		}
	});
});

app.post("/filter", (req, res) => {
	if(!req.body.name && !req.body.email && !req.body.phone && !req.body.country){
		res.redirect("/");
	}else {
		client.filterCustomers({
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			country: req.body.country
		}, (err, data) => {
			if (!err) {
				console.log("Found customers: ", data);
				res.render("customers", {
					results: data.customers
				});
			}
		});
	}
});

app.post("/save", (req, res) => {
	let newCustomer = {
		name: req.body.name,
		email: req.body.email,
		phone: req.body.phone,
		age: req.body.age,
		address: req.body.address,
		country: req.body.country
	};

	client.insert(newCustomer, (err, data) => {
		if (err) throw err;

		console.log("Customer created successfully", data);
		res.redirect("/");
	});
});

app.post("/update", (req, res) => {
	const updateCustomer = {
		id: req.body.id,
		name: req.body.name,
		email: req.body.email,
		phone: req.body.phone,
		age: req.body.age,
		address: req.body.address,
		country: req.body.country
	};

	client.update(updateCustomer, (err, data) => {
		if (err) throw err;

		console.log("Customer updated successfully", data);
		res.redirect("/");
	});
});

app.post("/remove", (req, res) => {
	client.remove({ id: req.body.customer_id }, (err, _) => {
		if (err) throw err;

		console.log("Customer removed successfully");
		res.redirect("/");
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log("Server running at port %d", PORT);
});
