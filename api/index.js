module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ status: 'ok', message: 'Safepay backend is running!' });
};


