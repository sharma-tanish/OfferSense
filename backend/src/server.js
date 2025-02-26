const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const routes = require('./routes');
const otpService = require('./otp_service');

app.use(express.json());
app.use('/', routes);
app.use('/otp', otpService);

// Add CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Update with your frontend URL
  credentials: true
}));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});