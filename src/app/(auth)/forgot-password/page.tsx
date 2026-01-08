'use client';

import { useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const isReset = Boolean(token);

	const [email, setEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setIsSubmitting(true);

		try {
			if (isReset) {
				if (newPassword !== confirmPassword) {
					setError('Passwords do not match');
					setIsSubmitting(false);
					return;
				}
				const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ newPassword, token }),
				});
				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(data?.message || 'Password change failed');
				}
				setSuccess('Password changed successfully. You can now sign in.');
				setNewPassword('');
				setConfirmPassword('');
			} else {
				const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email }),
				});
				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(data?.message || 'Request failed');
				}
				setSuccess('A reset link has been sent to your email.');
				setEmail('');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Request failed');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/50 to-indigo-100/50 rounded-full filter blur-3xl" />
			</div>

			<div className="relative w-full max-w-md">
				<div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
					<div className="flex justify-center mb-6">
						<div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
					</div>

					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-slate-800">
							{isReset ? 'Reset Password' : 'Forgot Password'}
						</h1>
						<p className="text-slate-500 mt-2 text-sm">
							{isReset ? 'Enter a new password for your account' : 'Enter your email to receive a reset link'}
						</p>
					</div>

					{error && (
						<div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
							<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{error}
						</div>
					)}

					{success && (
						<div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-3">
							<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							{success}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{isReset ? (
							<>
								<div>
									<label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
											<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
										</div>
										<input
											id="newPassword"
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											required
											className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
											placeholder="••••••••"
										/>
									</div>
								</div>
								<div>
									<label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
											<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
										</div>
										<input
											id="confirmPassword"
											type="password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
											className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
											placeholder="••••••••"
										/>
									</div>
								</div>
							</>
						) : (
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
										<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</div>
									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
										placeholder="you@example.com"
									/>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? (
								<span className="flex items-center justify-center gap-2">
									<span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
									{isReset ? 'Changing...' : 'Sending...'}
								</span>
							) : (
								isReset ? 'Change Password' : 'Send Reset Link'
							)}
						</button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-slate-500 text-sm">
							Remembered your password?{' '}
							<Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign in</Link>
						</p>
					</div>
				</div>

				<p className="text-center mt-6 text-slate-400 text-xs">© 2024 Your Company. All rights reserved.</p>
			</div>
		</div>
	);
}
