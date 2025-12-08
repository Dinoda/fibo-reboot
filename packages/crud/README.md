# FIBO CRUD package

## Usage

```js
import { MariaDBDatabase as Database } from 'fibo-database-mariadb';

// You can use any "fibo-database" database, the mariaDB is only used for the example
const database = new Database({
    // Initialization data
    // ...
});

const crudOperations = {
	selectAll: {
		sql: "SELECT * FROM table",
		params: [],

		type: "SELECT", 
		// Optional, "SELECT" is the default type

		validator: zodValidator, 
		// Any zod validator, will validate data after query (and hydration) for SELECT type, before for INSERT and UPDATE

		hydrator: hydrationFunction,
		// (result_of_the_query, given_data, this_operation): HydratedData => {}
	},
	update: {
		sql: "UPDATE table SET name = ?, description = ? WHERE id = ?,
		params: ['name', 'description', 'id'],
		type: "UPDATE",
	},
	insert: {
		sql: "INSERT INTO table (name, description) VALUES (?, ?)",
		params: ['name', 'description'],
		type: 'INSERT',
		// Example hydrator to add the newly added row's id to the data
		hydrator: (insertResult, initialData, operation) => {
			return {
				...initialData,
				id: insertResult.insertId,
			};
		},
	},
	delete: {
		sql: "DELETE FROM table WHERE id = ?",
		params: ['id'],
		type: "DELETE",

		hydrator: whateverFunction, 
		// This hydrator will never be used

		validator: whateverValidator,
		// This validator will never be used
	}
};

// Optional, as all its values are, these are the default values used
const crudOptions = {
	defaultHydrator: (a) => a,
	// This is the default hydrator used for SELECT operations
	
	defaultUpdateHydrator: (a) => a,
	// This is the default hydrator used for UPDATE and INSERT operations
	
	defaultValidator: null,
	// You can add this validator if you want a default validation for all standard operations (SELECT, INSERT and UPDATE, not DELETE)
};

const crud = new CRUD(
	database,
	crudOperations,
	crudOptions
);
```
