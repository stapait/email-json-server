function InvalidEmailException(message) {
  this.message = message;
  this.name = 'InvalidEmailException';
}

module.exports = {
  InvalidEmailException: InvalidEmailException
}