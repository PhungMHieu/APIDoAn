// Initialize MongoDB for Account Service
db = db.getSiblingDB('account_db');

// Create collections
db.createCollection('users');

// Insert sample users
db.users.insertMany([
  {
    _id: ObjectId(),
    username: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    balance: 5000.00,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    username: 'jane_smith', 
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    balance: 3200.50,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    username: 'admin_user',
    email: 'admin@myfinance.com',
    firstName: 'Admin',
    lastName: 'User',
    balance: 10000.00,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

print('MongoDB initialization completed successfully!');