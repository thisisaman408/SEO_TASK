import { deleteDoc, doc } from 'firebase/firestore';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import React from 'react';
import { Button, Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { appId, db } from '../firebase';

const SavedArticles = ({ articles, user, onError }) => {
	const handleDeleteArticle = async (e, articleId) => {
		e.preventDefault();
		e.stopPropagation();
		if (!user) {
			onError('You must log in to delete articles');
			return;
		}
		const docPath = `/artifacts/${appId}/users/${user.uid}/articles/${articleId}`;
		try {
			await deleteDoc(doc(db, docPath));
		} catch (err) {
			console.error('Error deleting document: ', err);
			onError('Failed to delete the article.');
		}
	};
	return (
		<Card className="glass-card">
			<Card.Header as="h5" className="border-0 pt-3 px-4">
				Saved Articles
			</Card.Header>
			<Card.Body>
				{articles.length > 0 ? (
					<ListGroup variant="flush">
						<AnimatePresence>
							{articles.map((article) => (
								<Motion.div
									key={article.id}
									layout
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}>
									<Link
										to={`/article/${article.id}`}
										style={{ textDecoration: 'none' }}>
										<ListGroup.Item
											action
											className="d-flex justify-content-between align-items-start p-3">
											<div className="ms-2 me-auto">
												<div className="fw-bold text-white text-hover-secondary">
													{article.title}
												</div>
												<small className="text-secondary">
													Keyword: {article.keyword}
												</small>
											</div>
											<Button
												variant="danger"
												size="sm"
												onClick={(e) => handleDeleteArticle(e, article.id)}>
												Delete
											</Button>
										</ListGroup.Item>
									</Link>
								</Motion.div>
							))}
						</AnimatePresence>
					</ListGroup>
				) : (
					<p className="text-secondary px-3">
						No articles saved yet. Generated content will automatically appear
						here.
					</p>
				)}
			</Card.Body>
		</Card>
	);
};

export default SavedArticles;
