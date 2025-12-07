import { ImplementationError } from "fibo-common";

/**
 * Abstract transaction class used to ensure a correct transaction with committed or rolled-back result.
 */
export default class Transaction {
  /**
   *
   */
  constructor(database) {
    if (this.constructor == Transaction) {
      throw new ImplementationError(
        `This class shouldn't be intanciated directly. Please extend it.`
      );
    }

    this.database = database;
    this.finished = null;
    this.timeout = setTimeout(() => {
      this.failure();
    }, 10000);
  }

  /**
   * Set a new timeout for this transaction, replacing the timeout initiated when the transaction was created.
   */
  setTimeout(newTimeout) {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.failure();
    }, newTimeout);
  }

  /**
   * Fail the transaction, executing a rollback on the transaction.
   */
  failure() {
    if (this.finished === null) {
      this.__failure();
      this.finished = false;
    }
  }

  /**
   * Fails the transaction, this method should be implemented in the child class.
   *
   * This should rollback the modification of the transaction.
   */
  __failure() {
    throw new ImplementationError(
      `Method "failure" or "__failure" should be implemented in this class`
    );
  }

  /**
   * Commit the transaction, commiting the changes to the database.
   */
  commit() {
    if (this.finished === null) {
      this.__commit();
      this.finished = true;
    }
  }

  /**
   * Commit the transaction, this method should be implemented in the child class.
   *
   * Commits the transaction to the database.
   */
  __commit() {
    throw new ImplementationError(
      `Method "commit" or "__commit" should be implemented in this class`
    );
  }

  /**
   * This method echos the Database method.
   *
   * The only difference is that this is not to end the connection yet.
   */
  query(sql, params) {
    return new Promise((res, rej) => {
      this.__query(res, rej, sql, params);
    });
  }

  /**
   * This method echos the Database method.
   */
  __query(res, rej, sql, params) {
    throw new ImplementationError(
      'Method "query" or "__query" should be implemented in this class'
    );
  }

  /**
   * Returns the resulting status.
   *
   * @return Null if the transaction is not finished yet. If finished, returns a boolean, true if the result has been committed, false if it has been rolled-back.
   */
  successfulFinish() {
    return this.finished;
  }
}
