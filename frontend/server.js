const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle all routes by serving index.html
// This allows React Router to handle routing on the client side
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
