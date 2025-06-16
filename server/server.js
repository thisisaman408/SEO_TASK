const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate', (req, res) => {
	const { step, payload } = req.body;
	const pythonExecutable = '/opt/venv/bin/python';

	const pythonProcess = spawn(pythonExecutable, [
		path.join(__dirname, 'llm_handler.py'),
		step,
		JSON.stringify(payload),
	]);

	let dataToSend = '';
	let errorToSend = '';

	pythonProcess.stdout.on('data', (data) => {
		dataToSend += data.toString();
	});

	pythonProcess.stderr.on('data', (data) => {
		errorToSend += data.toString();
		console.error(`Python Script Error: ${data}`);
	});

	pythonProcess.on('close', (code) => {
		if (code !== 0) {
			console.error(`Python script exited with code ${code}`);
			return res.status(500).json({
				error: 'Python script failed.',
				details: errorToSend,
			});
		}
		try {
			res.json(JSON.parse(dataToSend));
		} catch (error) {
			console.error('Failed to parse Python script output:', error);
			res.status(500).json({
				error: 'Failed to parse the Python script output.',
				rawData: dataToSend,
			});
		}
	});
});

app.listen(port, () => {
	console.log(`Server is connected on http://localhost:${port}`);
});
