import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion as Motion } from 'framer-motion';
import React from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';
import { auth } from '../firebase';

function Auth({ onError, error }) {
	const handleGoogleSignIn = async () => {
		const provider = new GoogleAuthProvider();
		onError('');
		try {
			await signInWithPopup(auth, provider);
		} catch (error) {
			console.error('Google Sign-In Error:', error);
			onError(`Sign-In Failed: ${error.message}`);
		}
	};

	return (
		<div
			className="d-flex justify-content-center align-items-center"
			style={{ minHeight: '100vh' }}>
			<Motion.div
				initial={{ opacity: 0, scale: 0.9, y: -20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.5, ease: 'easeOut' }}>
				<Card className="glass-card text-center" style={{ width: '420px' }}>
					<Card.Body className="p-5">
						<Motion.h1
							className="mb-3 fw-bold step-indicator"
							style={{ fontSize: '2rem', letterSpacing: '2px' }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}>
							SEO SCIENTIST
						</Motion.h1>
						<Card.Text className="text-secondary mb-4">
							Unlock the power of AI to generate high-quality, SEO-optimized
							content in seconds.
						</Card.Text>

						{error && (
							<Alert variant="danger" className="mt-3 text-start">
								{error}
							</Alert>
						)}

						<Motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								onClick={handleGoogleSignIn}
								className="btn-gradient w-100 mt-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									fill="currentColor"
									className="bi bi-google me-2"
									viewBox="0 0 16 16">
									<path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
								</svg>
								Sign In With Google
							</Button>
						</Motion.div>
					</Card.Body>
				</Card>
			</Motion.div>
		</div>
	);
}

export default Auth;
