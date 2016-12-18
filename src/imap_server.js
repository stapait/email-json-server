var net = require('net');
var credentialsData = require('../data/credentials.json');

const PORT = 1400;

var serverSocket;

var server = net.createServer(function (socket) {
  serverSocket = socket;
  serverSocket.write('* OK IMAP server ready\r\n');

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
console.log(`IMAP server listening on port ${PORT}`);

function removeLineBreak(data) {
  return data.replace(/(\r\n|\n|\r)/gm, "");
}

function handleClientData(data) {
  if (data.trim().length == 0) {
    return;
  }

  var commands = data.split(' ');
  var tag = commands[0];
  var command = commands[1];
  var params = commands.slice(2);

  console.log(`Received command: ${data}`);

  var response = handleCommand(tag, command, params);
  sendServerResponse(response);
}

function handleCommand(tag, command, params) {
  var uppercaseCommand = command.toUpperCase();

  if (uppercaseCommand === "LOGIN") {
    return processLogin(tag, command, params);
  } else if (uppercaseCommand == "SELECT") {
    return processSelect(tag, command, params);
  }

  return getFormattedCommand(tag, command, 'OK');
}

function getFormattedCommand(tag, command, response) {
  if (response === 'NO') {
    return `${tag} ${response} ${command} failed`;
  } else {
    return `${tag} ${response} ${command} completed`;
  }
}

function sendServerResponse(response) {
  console.log('sending response: ' + response + "\n");
  serverSocket.write(response + '\r\n');
}

function processLogin(tag, command, params) {
  var username = params[0];
  var password = params[1];
  var authOK = false;

  credentialsData.users.forEach((user) => {
    if ((user.user === username) && (user.password === password)) {
      authOK = true;
      return;
    }
  });

  if (authOK) {
    return getFormattedCommand(tag, command, 'OK');
  } else {
    return getFormattedCommand(tag, command, 'NO');
  }
}

function processSelect(tag, command, params) {
  return getFormattedCommand(tag, command, 'OK');
}