'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const COOKIE_KEY = 'cpm-cookie-consent';

type ConsentState = {
	essential: boolean;
	analytics: boolean;
};

function getStoredConsent(): ConsentState | null {
	if (typeof window === 'undefined') return null;
	try {
		const stored = localStorage.getItem(COOKIE_KEY);
		return stored ? JSON.parse(stored) : null;
	} catch {
		return null;
	}
}

function storeConsent(consent: ConsentState) {
	localStorage.setItem(COOKIE_KEY, JSON.stringify(consent));
}

export function CookieConsent() {
	const [visible, setVisible] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [analytics, setAnalytics] = useState(false);

	useEffect(() => {
		const stored = getStoredConsent();
		if (!stored) {
			setVisible(true);
		}
	}, []);

	function handleAccept() {
		storeConsent({ essential: true, analytics: true });
		setVisible(false);
		setShowModal(false);
	}

	function handleOptOut() {
		storeConsent({ essential: true, analytics: false });
		setVisible(false);
		setShowModal(false);
	}

	function handleConfirm() {
		storeConsent({ essential: true, analytics });
		setVisible(false);
		setShowModal(false);
	}

	if (!visible) return null;

	return (
		<>
			{/* Small banner — bottom right */}
			{!showModal && (
				<div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-border bg-card p-4 shadow-lg animate-fade-in">
					<p className="text-sm text-foreground">
						We use cookies to collect data and improve our services.{' '}
						<a href="/privacy" className="underline hover:text-primary">
							Learn more
						</a>
					</p>
					<div className="mt-3 flex items-center gap-2">
						<Button size="sm" variant="outline" onClick={handleAccept}>
							Accept
						</Button>
						<Button size="sm" variant="ghost" onClick={handleOptOut}>
							Opt out
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setShowModal(true)}
						>
							Privacy settings
						</Button>
					</div>
				</div>
			)}

			{/* Privacy Settings modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-background/80 backdrop-blur-sm"
						onClick={() => setShowModal(false)}
					/>

					{/* Modal */}
					<div className="relative z-10 w-full max-w-lg rounded-lg border border-border bg-card shadow-xl animate-fade-in">
						{/* Header */}
						<div className="flex items-center justify-between border-b border-border px-6 py-4">
							<h2 className="text-lg font-semibold text-foreground">Privacy Settings</h2>
							<button
								onClick={() => setShowModal(false)}
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<X className="size-4" />
							</button>
						</div>

						{/* Content */}
						<div className="px-6 py-5 space-y-6">
							{/* Essential */}
							<div className="flex gap-4">
								<Switch checked disabled className="mt-0.5 data-[state=checked]:bg-primary" />
								<div className="flex-1">
									<p className="text-sm font-medium text-foreground">Essential</p>
									<p className="text-sm text-muted-foreground mt-1">
										These technologies are necessary for CodePromptMaker to function.{' '}
										<a href="/privacy/essential" className="underline hover:text-primary">
											Learn more
										</a>
									</p>
								</div>
							</div>

							{/* Analytics and Marketing */}
							<div className="flex gap-4">
								<Switch
									checked={analytics}
									onCheckedChange={setAnalytics}
									className="mt-0.5 data-[state=checked]:bg-primary"
								/>
								<div className="flex-1">
									<p className="text-sm font-medium text-foreground">Analytics and Marketing</p>
									<p className="text-sm text-muted-foreground mt-1">
										By opting in to sharing telemetry data, CodePromptMaker can analyze
										usage patterns to enhance user experience and use it for marketing
										and advertising purposes.{' '}
										<a href="/privacy/analytics" className="underline hover:text-primary">
											Learn more
										</a>
									</p>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
							<Button variant="ghost" onClick={() => setShowModal(false)}>
								Cancel
							</Button>
							<Button onClick={handleConfirm}>
								Confirm
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
