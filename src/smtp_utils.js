const InvalidEmailException = require('./exceptions').InvalidEmailException;

function extractEmail(data) {
  const regex = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;  

  if (regex.test(data)) {
    var match = regex.exec(data);
    return match[0];
  }

  throw(new InvalidEmailException('Invalid email'));  
}

module.exports = {
  extractEmail: extractEmail,
  InvalidEmailException: InvalidEmailException
}