import { Transaction } from "fibo-database";

export default class MariaDBTransaction extends Transaction {
  constructor(database) {
    super(database);

    this.connection = this.database.getOriginal().getConnection();

    this.connection.beginTransaction();
  }

  __query(res, rej, sql, params) {
    this.connection
      .query(sql, params)
      .then(result => {
        res(result);
      })
      .catch(err => {
        rej(err);
      });
  }

  __commit() {
    this.connection.commit().finally(() => {
      this.connection.end();
    });
  }

  __failure() {
    this.connection.rollback().finally(() => {
      this.connection.end();
    });
  }
}
