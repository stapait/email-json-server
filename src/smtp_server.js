var net = require('net');
var credentialsData = require('../data/credentials.json');

const PORT = 2500;

var serverSocket;

var server = net.createServer(function (socket) {
  serverSocket = socket;
  serverSocket.write('220 SMTP server\r\n');

  var completeData = '';

  serverSocket.on('data', function (data) {
    if (data.toString().trim().length == 0) {
      handleClientData(removeLineBreak(data.toString()));
    }

    completeData += data.toString();
    if (completeData.endsWith('\n')) {
      handleClientData(removeLineBreak(completeData));
      completeData = '';
    }
  });

  serverSocket.on('close', function (data) {
    console.log('Client disconnected\n');
  });
});

server.on('connection', function (data) {
  console.log('Client connected\n');
});

server.on('error', function (err) {
  console.log(`Some error has happened ${err}\n`);
});

server.listen(PORT, '127.0.0.1');
console.log(`SMTP server listening on port ${PORT}`);

function removeLineBreak(data) {
  return data.replace(/(\r\n|\n|\r)/gm, "");
}

function handleClientData(data) {
  if (data.trim().length == 0) {
    return;
  }

  var commands = data.split(' ');
  var command = commands[0];
  var params = commands.slice(1);

  console.log(`Received command: ${data}`);

  var response = handleCommand(command, params);
  sendServerResponse(response);
}

function handleCommand(command, params) {
  var uppercaseCommand = command.toUpperCase();

  if (uppercaseCommand === 'HELO') {
    return processHelo(command, params);
  } else if (uppercaseCommand === 'EHLO') {
    return processEhlo(command, params);
  } else if (uppercaseCommand === 'DATA') {
    return processData(command);
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

function sendServerResponse(response) {
  console.log('sending response: ' + response + "\n");
  serverSocket.write(response + '\r\n');
}

function processHelo(command, params) {
  var server = params[0];
  return getFormattedCommand(250, command, server);
}

function processEhlo(command, params) {
  var server = params[0];
  return getFormattedCommand(250, command, server);
}

function processDefaultCommand(command) {
  return getFormattedCommand(250, 'OK');
}

function processData(command) {
  return getFormattedCommand(354, 'Start mail input; end with <CRLF>.<CRLF>');
}