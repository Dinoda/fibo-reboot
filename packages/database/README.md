# database

## Install

## Usage

This is used to create a FIBO type database interaction.

```js
import { Database } from 'fibo-database';

export default class MariaDBDatabase extends Database {
    constructor(host, port, database, user, password) {
        ...
        this.database = ...
    }

    __query(res, rej, sql, params) {
        this.database.query...
    }
}
```

It is mostly used through the use of a specific database module (e.g. "fibo-database-mariadb").
