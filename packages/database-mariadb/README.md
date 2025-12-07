# FIBO Database for MariaDB

## Install

## Usage 

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

database.query('SELECT * FROM users');
```


