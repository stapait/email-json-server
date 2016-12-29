const net = require('net');
const credentialsData = require('../data/credentials.json');
const smtpUtils = require('../src/smtp_utils');
const InvalidEmailException = require('./exceptions').InvalidEmailException;

const SMTP_PORT = 2500;

var emails = {};

function Email() {
}

var server = net.createServer(function (socket) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort
  emails[socket.name] = new Email(socket.name);

  socket.write('220 SMTP server ready\r\n');

  var completeData = '';

  socket.on('data', function (data) {
    if (data.toString().trim().length == 0) {
      handleClientData(socket, removeLineBreak(data.toString()));
    }

    completeData += data.toString();
    if (completeData.endsWith('\n')) {
      handleClientData(socket, removeLineBreak(completeData));
      completeData = '';
    }
  });

  socket.on('close', function (data) {
    delete emails[socket.name];
    console.log('Client disconnected\n');
  });
});

server.on('connection', function (data) {
  console.log('Client connected\n');
});

server.on('error', function (err) {
  console.log(`Some error has happened ${err}\n`);
});

server.listen(SMTP_PORT, '127.0.0.1');
console.log(`SMTP server listening on port ${SMTP_PORT}`);

function removeLineBreak(data) {
  return data.replace(/(\r\n|\n|\r)/gm, '');
}

function handleClientData(socket, data) {
  if (data.trim().length == 0) {
    return;
  }

  console.log(`Received command: ${data}`);

  var response = handleCommand(socket, data);
  sendServerResponse(socket, response);
}

function handleCommand(socket, command) {
  var uppercaseCommand = command.toUpperCase();

  if (uppercaseCommand.startsWith('HELO')) {
    return processHelo(command);
  } else if (uppercaseCommand.startsWith('EHLO')) {
    return processEhlo(command);
  } else if (uppercaseCommand.startsWith('DATA')) {
    return processData(socket, command);
  } else if (uppercaseCommand.startsWith('MAIL FROM:')) {
    return processMailFrom(socket, command);
  } else if (uppercaseCommand.startsWith('RCPT TO:')) {
    return processRcptTo(socket, command);
  }  

  return processDefaultCommand(command);
}

function getFormattedCommand(code, command, response) {
  if (code && command && response) {
    return `${code} ${command} ${response}`;
  } else if (code && command) {
    return `${code} ${command}`;
  } else if (code && response) {
    return `${code} ${response}`;
  }
}

function sendServerResponse(socket, response) {
  console.log('sending response: ' + response + "\n");
  socket.write(response + '\r\n');
}

function processHelo(data) {
  var commands = data.split(' ');
  var command = commands[0];
  var server = commands[1];

  return getFormattedCommand(250, command, server);
}

function processEhlo(data) {
  var commands = data.split(' ');
  var command = commands[0];
  var server = commands[1];

  return getFormattedCommand(250, command, server);
}

function processMailFrom(socket, data) {
  let commands = data.split(':');  
  let command = commands[0];
  let emailData = commands[1]
  let mailFrom;
  
  try {
    console.log(typeof email);
    mailFrom = smtpUtils.extractEmail(emailData);
  } catch (err) {
    if (err instanceof InvalidEmailException) {
      return getFormattedCommand(503, 'BAD');  
    }
  }

  emails[socket.name].mailFrom = mailFrom;

  return getFormattedCommand(250, 'OK');
}

function processRcptTo(socket, data) {
  let commands = data.split(':');  
  let command = commands[0];
  let emailData = commands[1]
  let rcptTo;
  
  try {
    console.log(typeof email);
    rcptTo = smtpUtils.extractEmail(emailData);
  } catch (err) {
    if (err instanceof InvalidEmailException) {
      return getFormattedCommand(503, 'BAD');  
    }
  }

  emails[socket.name].rcptTo = rcptTo;

  return getFormattedCommand(250, 'OK');
}

function processDefaultCommand(data) {
  return getFormattedCommand(250, 'OK');
}

function processData(socket, data) {
  return getFormattedCommand(354, 'Start mail input; end with <CRLF>.<CRLF>');
}
