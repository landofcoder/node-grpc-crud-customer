const PROTO_PATH = "./customers.proto";

var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	arrays: true
});

var customersProto = grpc.loadPackageDefinition(packageDefinition);

const { v4: uuidv4 } = require("uuid");

const server = new grpc.Server();
const customers = [
	{
		id: "a68b823c-7ca6-44bc-b721-fb4d5312cafc",
		name: "John Bolton",
		email: "johnbolton@gmail.com",
		phone: "123456781",
		age: 23,
		address: "Address 1",
		country: "VN"
	},
	{
		id: "34415c7c-f82d-4e44-88ca-ae2a1aaa92b7",
		name: "Mary Anne",
		email: "maryanne@gmail.com",
		phone: "123456782",
		age: 45,
		address: "Address 2",
		country: "US"
	}
];

server.addService(customersProto.CustomerService.service, {
	getAll: (_, callback) => {
		callback(null, { customers });
	},
	filterCustomers: (call, callback) => {
		let customer = customers;

		if(call.request.email){
			customer = customer.find(n => n.email == call.request.email);
		}
		
		if(call.request.phone){
			customer = customer.find(n => n.phone == call.request.phone);
		}

		if(call.request.name){
			customer = customer.find(n => n.name == call.request.name);
		}

		if(call.request.country){
			customer = customer.find(n => n.country == call.request.country);
		}
		
		if (customer) {
			callback(null, customer);
		} else {
			callback({
				code: grpc.status.NOT_FOUND,
				details: "Not found"
			});
		}
	},
	get: (call, callback) => {
		let customer = customers.find(n => n.id == call.request.id);

		if (customer) {
			callback(null, customer);
		} else {
			callback({
				code: grpc.status.NOT_FOUND,
				details: "Not found"
			});
		}
	},

	insert: (call, callback) => {
		let customer = call.request;
		
		customer.id = uuidv4();
		customers.push(customer);
		callback(null, customer);
	},

	update: (call, callback) => {
		let existingCustomer = customers.find(n => n.id == call.request.id);

		if (existingCustomer) {
			existingCustomer.name = call.request.name;
			existingCustomer.email = call.request.email;
			existingCustomer.phone = call.request.phone;
			existingCustomer.age = call.request.age;
			existingCustomer.address = call.request.address;
			existingCustomer.country = call.request.country;
			callback(null, existingCustomer);
		} else {
			callback({
				code: grpc.status.NOT_FOUND,
				details: "Not found"
			});
		}
	},

	remove: (call, callback) => {
		let existingCustomerIndex = customers.findIndex(
			n => n.id == call.request.id
		);

		if (existingCustomerIndex != -1) {
			customers.splice(existingCustomerIndex, 1);
			callback(null, {});
		} else {
			callback({
				code: grpc.status.NOT_FOUND,
				details: "Not found"
			});
		}
	}
});

server.bind("127.0.0.1:30043", grpc.ServerCredentials.createInsecure());
console.log("Server running at http://127.0.0.1:30043");
server.start();
