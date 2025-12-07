import { ImplementationError } from "fibo-common";

/**
 * The Database abstract class is used to create a common database access.
 *
 * Methods to implements are:
 *  - "query" or "__query", used to make a single query to the database
 *  - "getOriginal", used to get the original database element (e.g. mariadb pool)
 */
export default class Database {
  /**
   * Creates a Database instance.
   *
   * This should initiate the database basic characteristics (e.g. connection pool) in the child class.
   */
  constructor(TransactionClass) {
    if (this.constructor == Database) {
      throw new ImplementationError(
        `This class shouldn't be intanciated directly. Please extend it.`
      );
    }

    this.TransactionClass = TransactionClass;
  }

  /**
   * By default, this creates a promise and send them to the __query method.
   *
   * You can ignore it and simply implement this method, or implement __query.
   *
   * @param sql The sql string for the query.
   * @param params The parameters for the sql query.
   * @return A promise that will resolve to the query's result
   */
  query(sql, params) {
    return new Promise((res, rej) => {
      this.__query(res, rej, sql, params);
    });
  }

  /**
   * Should resolve the query and send the result via "res", or reject it with "rej".
   *
   * @param res The promise resolving callback
   * @param rej The promise rejecting callback
   * @param sql The sql string of the query
   * @param params The parameters of the sql query
   *
   * @return None. This method should call "res" or "rej" before its end.
   */
  __query(res, rej, sql, params) {
    throw new ImplementationError(
      'Method "query" or "__query" should be implemented in this class'
    );
  }

  /**
   * Creates a new Transaction object to manage the user's transaction
   *
   * @param None
   * @return A Transaction extending class' instance
   */
  transaction() {
    return new this.TransactionClass(this);
  }

  getOriginal() {
    throw new ImplementationError(
      '"getOriginal" method should be implemented to allow more specific user\'s management'
    );
  }
}
