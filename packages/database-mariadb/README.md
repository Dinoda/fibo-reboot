# FIBO Database for MariaDB

## Install

## Usage

### Initialisation

Simple usage:

```js
import 'dotenv/config';

import { MariaDBDatabase as Database } from 'fibo-database-mariadb';

const database = new Database({
	host: process.env.DATABASE_HOST,
	database: process.env.DATABASE,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	connectionLimit: 5 // Optional
});

const result = await database.query('SELECT * FROM users');
```

### Query-ing

General query usage:

```js 
await database.query("SELECT * FROM users");
const insertResult = await database.query("INSERT INTO users (name, password) VALUES (?, ?)", ['MyName', 'MyPasswordHashed']);
const myName = await database.query("SELECT * FROM users WHERE name = 'MyName'");
```

Transaction usage: 

```js
// Creates and starts a new transaction
const transaction = database.transaction();

// You can set a new timeout, the transaction automatically fail after 10 seconds by default (10000ms timeout)
transaction.setTimeout(20_000);

// Is usually the same as the database's query operation
await transaction.query(...);

try {
    await transaction.query(...);
} catch (err) {
    // In case of error, fail the whole transaction
    transaction.failure();
}

// If no error occured, commit
transaction.commit();

if (transaction.finishedSuccessfully()) {
    // If the transaction didn't fail, either by catching the error and calling "failure" or a timeout
}
```


