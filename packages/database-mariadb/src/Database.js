import { Database } from "fibo-database";
import mariadb from "mariadb";
import Transaction from "./Transaction.js";

export default class MariaDBDatabase extends Database {
  constructor(options) {
    super(Transaction);

    this.pool = mariadb.createPool({
      ...options
    });
  }

  __query(res, rej, sql, params) {
    this.pool.getConnection().then(conn => {
      conn
        .query(sql, params)
        .then(result => {
          res(result);
        })
        .catch(err => {
          rej(err);
        })
        .finally(() => {
          conn.end();
        });
    });
  }

  getOriginal() {
    return this.pool;
  }
}
