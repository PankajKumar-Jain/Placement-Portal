class CustomAPIError extends Error {
  constructor(message) {
    super(message);
    this.success = false;
  }
}

module.exports = CustomAPIError;
