# crud

## Usage 

```js
const crud = new CRUD(database, {
    select: {
        sql: 'SELECT * FROM table',
        type: CRUD.TYPE_SELECT, // Is already the value by default
    },
    update: {
        sql: 'UPDATE table SET name = :name, description = :description WHERE id = :id',
        params: ['name', 'description', 'id'],
        type: CRUD.TYPE_UDPATE,
    },
});
```
