import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Button,
	Col,
	Container,
	Navbar,
	Row,
	Spinner,
} from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import ArticleDetail from './components/ArticleDetail';
import Auth from './components/Auth';
import SavedArticles from './components/SavedArticles';
import Wizard from './components/Wizard';
import { appId, auth, db } from './firebase';

const AppNavbar = ({ user, setUser }) => {
	const handleSignOut = async () => {
		try {
			await signOut(auth);
			setUser(null);
		} catch (e) {
			console.error('Sign Out Error:', e);
		}
	};
	return (
		<Navbar expand="lg" className="navbar-custom sticky-top">
			<Container>
				<Navbar.Brand href="/" className="fw-bold">
					🚀 SEO Scientist
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse className="justify-content-end">
					<Navbar.Text className="me-3">
						<span className="text-secondary">Signed in as:</span>{' '}
						<span className="text-white">{user.displayName || user.email}</span>
					</Navbar.Text>
					<Button variant="secondary" size="sm" onClick={handleSignOut}>
						Logout
					</Button>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

const Dashboard = ({ user, error, setError, savedArticles }) => (
	<Container className="py-5">
		{error && (
			<Alert variant="danger" onClose={() => setError('')} dismissible>
				{error}
			</Alert>
		)}
		<Row>
			<Col lg={7} md={12} className="mb-4 mb-lg-0">
				<Wizard user={user} onError={setError} onArticleSaved={() => {}} />
			</Col>
			<Col lg={5} md={12}>
				<SavedArticles
					articles={savedArticles}
					user={user}
					onError={setError}
				/>
			</Col>
		</Row>
	</Container>
);

function App() {
	const [user, setUser] = useState(null);
	const [savedArticles, setSavedArticles] = useState([]);
	const [isAuthReady, setIsAuthReady] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setIsAuthReady(true);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!user) {
			setSavedArticles([]);
			return;
		}
		const articlesCollectionPath = `/artifacts/${appId}/users/${user.uid}/articles`;
		const q = query(
			collection(db, articlesCollectionPath),
			orderBy('createdAt', 'desc')
		);

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const articles = [];
				querySnapshot.forEach((doc) => {
					articles.push({ id: doc.id, ...doc.data() });
				});
				setSavedArticles(articles);
			},
			(err) => {
				console.error('Firestore onSnapshot error:', err);
				setError('Could not load saved articles.');
			}
		);

		return () => unsubscribe();
	}, [user]);

	if (!isAuthReady) {
		return (
			<div className="d-flex justify-content-center align-items-center vh-100">
				<Spinner animation="border" variant="light" />
				<p className="ms-3 mb-0">Initializing...</p>
			</div>
		);
	}

	if (!user) {
		return <Auth setUser={setUser} onError={setError} error={error} />;
	}

	return (
		<div className="main-container">
			<AppNavbar user={user} setUser={setUser} />
			<main className="flex-grow-1">
				<Routes>
					<Route
						path="/"
						element={
							<Dashboard
								user={user}
								error={error}
								setError={setError}
								savedArticles={savedArticles}
							/>
						}
					/>
					<Route
						path="/article/:articleId"
						element={
							<Container className="py-5">
								<ArticleDetail user={user} />
							</Container>
						}
					/>
				</Routes>
			</main>
		</div>
	);
}

export default App;
