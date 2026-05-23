const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/requisition', require('./routes/requisition'));
app.use('/api/shifts', require('./routes/shifts'));

app.get('/', (req, res) => {
  res.json({ message: 'Patisserie Manager API is running 🥐' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
