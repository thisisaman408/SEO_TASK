import axios from 'axios';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import React, { useState } from 'react';
import { Button, Card, Form, ListGroup, Spinner } from 'react-bootstrap';
import { appId, db } from '../firebase';

const API_URL = '/api/generate';

const stepVariants = {
	hidden: { opacity: 0, x: 50 },
	visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
	exit: { opacity: 0, x: -50 },
};

function Wizard({ user, onError, onArticleSaved }) {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [seedKeyword, setSeedKeyword] = useState('');
	const [generatedKeywords, setGeneratedKeywords] = useState([]);
	const [selectedKeyword, setSelectedKeyword] = useState('');
	const [generatedTitles, setGeneratedTitles] = useState([]);
	const [selectedTitle, setSelectedTitle] = useState('');
	const [generatedOutline, setGeneratedOutline] = useState('');
	const [finalContent, setFinalContent] = useState('');
	const [seoScore, setSeoScore] = useState('');

	const resetWizard = () => {
		setStep(1);
		setLoading(false);
		setSeedKeyword('');
		setGeneratedKeywords([]);
		setSelectedKeyword('');
		setGeneratedTitles([]);
		setSelectedTitle('');
		setGeneratedOutline('');
		setFinalContent('');
		setSeoScore('');
	};

	const saveArticleToFirestore = async (articleData) => {
		if (!user) return;
		const articlesCollectionPath = `/artifacts/${appId}/users/${user.uid}/articles`;
		try {
			await addDoc(collection(db, articlesCollectionPath), {
				...articleData,
				createdAt: serverTimestamp(),
			});
			onArticleSaved();
		} catch (e) {
			console.error('Error adding document to Firestore: ', e);
			onError('Failed to save your article.');
		}
	};

	const handleApiCall = async (action, payload) => {
		setLoading(true);
		onError('');
		try {
			const response = await axios.post(API_URL, { step: action, payload });
			const { data } = response;
			switch (action) {
				case 'keywords':
					setGeneratedKeywords(data.keywords || []);
					break;
				case 'titles':
					setGeneratedTitles(data.titles || []);
					setStep(2);
					break;
				case 'outline':
					setGeneratedOutline(data.outline || '');
					setStep(3);
					break;
				case 'content': {
					const articleData = {
						title: selectedTitle,
						keyword: selectedKeyword,
						outline: generatedOutline,
						content: data.content || '',
						seoScore: data.seo_score || '',
					};
					setFinalContent(articleData.content);
					setSeoScore(articleData.seoScore);
					setStep(4);
					await saveArticleToFirestore(articleData);
					break;
				}
				default:
					break;
			}
		} catch (err) {
			onError('An API error occurred. Please try again.');
			console.error('API Error:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleCopy = (text) => {
		navigator.clipboard.writeText(text);
		alert('Content copied to clipboard!');
	};

	return (
		<Card className="glass-card p-lg-4">
			<Card.Body>
				<AnimatePresence mode="wait">
					{step === 1 && (
						<Motion.div
							key={1}
							variants={stepVariants}
							initial="hidden"
							animate="visible"
							exit="exit">
							<p className="step-indicator">STEP 1: KEYWORD RESEARCH</p>
							<h3 className="mb-3 fw-light">Start with a Seed Keyword</h3>
							<Form
								onSubmit={(e) => {
									e.preventDefault();
									handleApiCall('keywords', { seed_keyword: seedKeyword });
								}}>
								<Form.Control
									type="text"
									placeholder="e.g., 'the future of AI'"
									color="white"
									value={seedKeyword}
									onChange={(e) => setSeedKeyword(e.target.value)}
									required
									// className="custom-placeholder"
								/>
								<Button
									type="submit"
									className="btn-gradient w-100 mt-3"
									disabled={loading}>
									{loading ? (
										<Spinner as="span" animation="border" size="sm" />
									) : (
										'Generate Keywords'
									)}
								</Button>
							</Form>
							{generatedKeywords.length > 0 && !loading && (
								<Motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="mt-4">
									<h5 className="mb-3">Select a Keyword</h5>
									<ListGroup>
										{generatedKeywords.map((kw, i) => (
											<ListGroup.Item
												action
												key={i}
												onClick={() => {
													setSelectedKeyword(kw);
													handleApiCall('titles', { keyword: kw });
												}}>
												{kw}
											</ListGroup.Item>
										))}
									</ListGroup>
								</Motion.div>
							)}
						</Motion.div>
					)}
					{step === 2 && (
						<Motion.div
							key={2}
							variants={stepVariants}
							initial="hidden"
							animate="visible"
							exit="exit">
							<p className="step-indicator">STEP 2: TITLE GENERATION</p>
							<h3 className="mb-3 fw-light">Titles for "{selectedKeyword}"</h3>
							{loading ? (
								<div className="text-center p-5">
									<Spinner animation="border" />
								</div>
							) : (
								<ListGroup>
									{generatedTitles.map((title, i) => (
										<ListGroup.Item
											action
											key={i}
											onClick={() => {
												setSelectedTitle(title);
												handleApiCall('outline', { title });
											}}>
											{title}
										</ListGroup.Item>
									))}
								</ListGroup>
							)}
							<Button
								variant="secondary"
								className="mt-3"
								onClick={() => setStep(1)}>
								Back
							</Button>
						</Motion.div>
					)}
					{step === 3 && (
						<Motion.div
							key={3}
							variants={stepVariants}
							initial="hidden"
							animate="visible"
							exit="exit">
							<p className="step-indicator">STEP 3: TOPIC OUTLINE</p>
							<h3 className="mb-3 fw-light">Outline for "{selectedTitle}"</h3>
							{loading ? (
								<div className="text-center p-5">
									<Spinner animation="border" />
								</div>
							) : (
								<pre>{generatedOutline}</pre>
							)}
							<Button
								className="btn-gradient w-100 mt-3"
								onClick={() =>
									handleApiCall('content', {
										title: selectedTitle,
										keyword: selectedKeyword,
										outline: generatedOutline,
									})
								}
								disabled={loading}>
								{loading ? (
									<Spinner as="span" animation="border" size="sm" />
								) : (
									'Generate Final Content'
								)}
							</Button>
							<Button
								variant="secondary"
								className="mt-2"
								onClick={() => setStep(2)}>
								Back
							</Button>
						</Motion.div>
					)}
					{step === 4 && (
						<Motion.div
							key={4}
							variants={stepVariants}
							initial="hidden"
							animate="visible"
							exit="exit">
							<p className="step-indicator">STEP 4: YOUR ARTICLE</p>
							<h3 className="mb-3 fw-light">Generated Content</h3>
							<p className="text-secondary">
								<strong>Keyword:</strong> {selectedKeyword} |{' '}
								<strong>SEO Score:</strong>{' '}
								<span className="text-success fw-bold">{seoScore}</span>
							</p>
							<p className="pre">{finalContent}</p>
							<Button
								className="btn-gradient mt-3 me-2"
								onClick={() => handleCopy(finalContent)}>
								Copy Content
							</Button>
							<Button
								variant="secondary"
								className="mt-3 float-end"
								onClick={resetWizard}>
								Start New Article
							</Button>
						</Motion.div>
					)}
				</AnimatePresence>
			</Card.Body>
		</Card>
	);
}

export default Wizard;
