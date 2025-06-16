import { doc, getDoc } from 'firebase/firestore';
import { motion as Motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { appId, db } from '../firebase';

function ArticleDetail({ user }) {
	const { articleId } = useParams();
	const [article, setArticle] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchArticle = async () => {
			if (!user || !articleId) return;
			setLoading(true);
			const docPath = `/artifacts/${appId}/users/${user.uid}/articles/${articleId}`;
			try {
				const docSnap = await getDoc(doc(db, docPath));
				if (docSnap.exists()) {
					setArticle({ id: docSnap.id, ...docSnap.data() });
				} else {
					setError('Article not found.');
				}
			} catch (err) {
				console.error('Error fetching document:', err);
				setError('Failed to load the article.');
			} finally {
				setLoading(false);
			}
		};

		fetchArticle();
	}, [articleId, user]);

	const handleCopy = (text) => {
		navigator.clipboard.writeText(text);
		alert('Content copied to clipboard!');
	};

	const handleDownload = (content, keyword) => {
		const element = document.createElement('a');
		const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
		element.href = URL.createObjectURL(file);
		element.download = `${keyword.replace(/\s+/g, '-')}-content.txt`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};

	if (loading) {
		return (
			<div className="text-center py-5">
				<Spinner animation="border" variant="light" />
			</div>
		);
	}

	if (error) {
		return (
			<Container className="text-center py-5">
				<p className="text-danger">{error}</p>
				<Link to="/">
					<Button variant="secondary">Back to Dashboard</Button>
				</Link>
			</Container>
		);
	}

	return (
		<Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<Card className="glass-card">
				<Card.Header className="p-4 border-0">
					<Motion.div
						initial={{ x: -20, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}>
						<p className="step-indicator mb-2">SAVED ARTICLE</p>
						<h2>{article.title}</h2>
						<p className="text-secondary mb-0">
							<strong>Keyword:</strong> {article.keyword} |{' '}
							<strong>SEO Score:</strong>{' '}
							<span className="text-success fw-bold">{article.seoScore}</span>
						</p>
					</Motion.div>
				</Card.Header>
				<Card.Body className="p-4">
					<Motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.4 }}>
						<pre>{article.content}</pre>
						<div className="mt-4">
							<Button
								className="btn-gradient me-2"
								onClick={() => handleCopy(article.content)}>
								Copy Content
							</Button>
							<Button
								variant="secondary"
								onClick={() =>
									handleDownload(article.content, article.keyword)
								}>
								Download as .txt
							</Button>
							<Link to="/" className="float-end">
								<Button variant="secondary">Back to Dashboard</Button>
							</Link>
						</div>
					</Motion.div>
				</Card.Body>
			</Card>
		</Motion.div>
	);
}

export default ArticleDetail;
