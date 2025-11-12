import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;
const base = '/optimus-ai-and-robotics';

app.use(base, express.static(path.join(process.cwd(), 'dist')));

// Fallback route: serve index.html for paths under the base
app.get('*', (req, res) => {
  if (req.path.startsWith(base)) {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(port, () => {
  console.log(`Serving dist at http://localhost:${port}${base}`);
});
