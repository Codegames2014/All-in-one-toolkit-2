// A simple web worker for Stockfish
let stockfish;

// Universal chess interface (UCI) commands are sent and received as strings
self.onmessage = function (event) {
  const message = event.data;

  // Initialize Stockfish
  if (message.startsWith('import')) {
    const stockfishUrl = message.split(' ')[1];
    importScripts(stockfishUrl);
    
    // Using the wasm engine
    stockfish = new Stockfish();
    stockfish.onmessage = function (event) {
        self.postMessage(event);
    };
    stockfish.postMessage('uci');
    return;
  }

  // Forward other messages to Stockfish
  if(stockfish) {
    stockfish.postMessage(message);
  }
};
