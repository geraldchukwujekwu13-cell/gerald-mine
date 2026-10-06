const products = [
	{ id: 'field-jacket', name: 'The Field Jacket', detail: 'Organic cotton · Olive', price: 248, category: 'Outerwear', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=82' },
	{ id: 'everyday-overshirt', name: 'Everyday Overshirt', detail: 'Heavyweight twill · Charcoal', price: 168, category: 'Essentials', tag: 'New color', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=82' },
	{ id: 'merino-crew', name: 'Merino Crewneck', detail: 'Extra-fine merino · Oat', price: 188, category: 'Essentials', tag: '', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=82' },
	{ id: 'weekender', name: 'The Weekender', detail: 'Italian leather · Dark brown', price: 395, category: 'Accessories', tag: 'Made in Italy', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=82' },
	{ id: 'wool-topcoat', name: 'Wool Topcoat', detail: 'Recycled wool · Black', price: 425, category: 'Outerwear', tag: 'Limited run', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=82' },
	{ id: 'relaxed-trouser', name: 'Relaxed Trouser', detail: 'Italian cotton · Stone', price: 178, category: 'Essentials', tag: '', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=82' },
	{ id: 'leather-belt', name: 'Everyday Leather Belt', detail: 'Full-grain leather · Black', price: 95, category: 'Accessories', tag: '', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=82' },
	{ id: 'weekend-knit', name: 'Weekend Knit Polo', detail: 'Linen-cotton blend · Ecru', price: 158, category: 'Essentials', tag: 'Just arrived', image: 'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=900&q=82' }
];

const storageKeys = {
	accounts: 'forme-accounts-v1',
	session: 'forme-session-v1',
	cart: 'forme-cart-v1',
	newsletter: 'forme-newsletter-v1'
};

const main = document.querySelector('#app-main');
const toast = document.querySelector('.toast');
let activeFilter = 'All';
let accountMode = 'create';
let toastTimer;

function readStorage(key, fallback) {
	try {
		const value = localStorage.getItem(key);
		return value === null ? fallback : JSON.parse(value);
	} catch {
		return fallback;
	}
}

function writeStorage(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		showToast('Your browser could not save this change. Check its storage settings.');
		return false;
	}
}

function money(amount) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function showToast(message) {
	window.clearTimeout(toastTimer);
	toast.textContent = message;
	toast.classList.add('is-visible');
	toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

function renderProducts() {
	const grid = document.querySelector('.product-grid');
	if (!grid) return;
	const visibleProducts = activeFilter === 'All' ? products : products.filter(product => product.category === activeFilter);
	grid.innerHTML = visibleProducts.map(product => `
		<article class="product-card">
			<div class="product-image-wrap">
				<img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
				${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
				<button class="quick-add" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to bag">Add to bag <span aria-hidden="true">+</span></button>
			</div>
			<div class="product-info">
				<div><h3 class="product-name">${product.name}</h3><p class="product-detail">${product.detail}</p></div>
				<span class="product-price">${money(product.price)}</span>
			</div>
		</article>`).join('');
}

function getCart() {
	const cart = readStorage(storageKeys.cart, []);
	return Array.isArray(cart) ? cart.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
}

function updateCart() {
	const cart = getCart();
	const quantity = cart.reduce((total, item) => total + item.quantity, 0);
	const total = cart.reduce((sum, item) => sum + products.find(product => product.id === item.id).price * item.quantity, 0);
	document.querySelector('.cart-count').textContent = quantity;
	document.querySelector('.drawer-count').textContent = `(${quantity})`;
	document.querySelector('.cart-total').textContent = money(total);

	const cartItems = document.querySelector('.cart-items');
	const checkout = document.querySelector('.checkout-button');
	checkout.disabled = cart.length === 0;
	cartItems.innerHTML = cart.length ? cart.map(item => {
		const product = products.find(entry => entry.id === item.id);
		return `<article class="cart-line">
			<img src="${product.image}" alt="" loading="lazy">
			<div class="cart-line-info"><strong>${product.name}</strong><span>${product.detail}</span>
				<div class="quantity-controls"><button type="button" data-quantity="-1" data-product-id="${product.id}" aria-label="Remove one ${product.name}">−</button><span>${item.quantity}</span><button type="button" data-quantity="1" data-product-id="${product.id}" aria-label="Add one ${product.name}">+</button></div>
			</div>
			<span class="cart-line-price">${money(product.price * item.quantity)}</span>
			<button class="remove-item" type="button" data-remove-item="${product.id}" aria-label="Remove ${product.name}" title="Remove item">×</button>
		</article>`;
	}).join('') : '<p class="cart-empty">Your bag is taking a quiet moment.</p>';
}

function changeCart(productId, amount) {
	const cart = getCart();
	const entry = cart.find(item => item.id === productId);
	if (!entry && amount > 0) cart.push({ id: productId, quantity: amount });
	else if (entry) entry.quantity += amount;
	const nextCart = cart.filter(item => item.quantity > 0);
	if (writeStorage(storageKeys.cart, nextCart)) updateCart();
}

function openCart() {
	const overlay = document.querySelector('#cart-overlay');
	updateCart();
	overlay.hidden = false;
	document.body.classList.add('drawer-open');
	overlay.querySelector('.close-drawer').focus();
}

function closeCart() {
	document.querySelector('#cart-overlay').hidden = true;
	document.body.classList.remove('drawer-open');
}

function getCurrentAccount() {
	const email = readStorage(storageKeys.session, '');
	const accounts = readStorage(storageKeys.accounts, {});
	return email && accounts[email] ? { email, ...accounts[email] } : null;
}

function updateAccountButton() {
	const account = getCurrentAccount();
	const button = document.querySelector('.account-link');
	button.textContent = account ? `Hi, ${account.name.split(' ')[0]}` : 'Account';
	button.setAttribute('aria-label', account ? `Account for ${account.name}` : 'Open account');
}

function renderAccountPage() {
	const account = getCurrentAccount();
	const isSignIn = accountMode === 'sign-in';
	const title = account ? `Good to have you back, ${account.name.split(' ')[0]}.` : isSignIn ? 'Welcome back.' : 'A place of your own.';
	const intro = account ? 'Your FORMÉ account is ready whenever you are.' : isSignIn ? 'Sign in to pick up right where you left off.' : 'Create an account to keep your details close and your next good thing closer.';
	const form = account ? '' : `<form class="account-form" id="account-form" novalidate>
		${isSignIn ? '' : '<label class="field-label">Full name<input name="name" type="text" autocomplete="name" minlength="2" maxlength="70" required></label>'}
		<label class="field-label">Email address<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
		<label class="field-label">Password<input name="password" type="password" autocomplete="${isSignIn ? 'current-password' : 'new-password'}" minlength="10" required></label>
		<p class="account-message" id="account-message" aria-live="polite"></p>
		<button class="button account-submit" type="submit"><span>${isSignIn ? 'Sign in' : 'Create account'}</span><span aria-hidden="true">↗</span></button>
	</form>
	${isSignIn ? '<p class="account-switch">New to FORMÉ? <button type="button" data-account-mode="create">Create an account</button></p>' : '<p class="account-switch">Already have an account? <button type="button" data-account-mode="sign-in">Sign in</button></p>'}`;

	main.innerHTML = `<section class="account-page" aria-labelledby="account-title">
		<div class="account-visual"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=85" alt="A considered look from the FORMÉ collection"><div class="account-visual-copy"><p>Good things, kept close</p><span>Wear well. Live well.</span></div></div>
		<div class="account-panel"><div class="account-form-wrap">
			<p class="account-kicker">The FORMÉ account</p><h1 id="account-title"></h1><p class="account-intro">${intro}</p>
			${account ? '<div class="account-welcome"><strong></strong><p>Your account is saved in this browser. You will stay signed in on this device.</p></div><button class="account-logout" type="button" data-sign-out>Sign out</button>' : form}
			<a class="account-back" href="#shop">← Back to the collection</a>
		</div></div>
	</section>`;
	main.querySelector('#account-title').textContent = title;
	if (account) main.querySelector('.account-welcome strong').textContent = account.email;
}

function navigateToAccount() {
	accountMode = 'create';
	if (location.hash !== '#account') location.hash = 'account';
	else renderAccountPage();
}

function renderRoute() {
	if (location.hash === '#account') {
		renderAccountPage();
		return;
	}
	if (!document.querySelector('.product-grid')) {
		location.reload();
		return;
	}
	renderProducts();
}

function bytesToHex(bytes) {
	return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
	if (!window.crypto?.subtle || !window.isSecureContext) throw new Error('secure-context');
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
	const result = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 210000, hash: 'SHA-256' }, key, 256);
	return bytesToHex(result);
}

document.addEventListener('click', event => {
	const addButton = event.target.closest('[data-add-to-cart]');
	if (addButton) {
		changeCart(addButton.dataset.addToCart, 1);
		showToast(`${products.find(product => product.id === addButton.dataset.addToCart).name} added to your bag.`);
		return;
	}

	const filterButton = event.target.closest('[data-filter]');
	if (filterButton) {
		activeFilter = filterButton.dataset.filter;
		document.querySelectorAll('[data-filter]').forEach(button => button.classList.toggle('is-selected', button === filterButton));
		renderProducts();
		return;
	}

	const categoryLink = event.target.closest('[data-category-link]');
	if (categoryLink) {
		activeFilter = categoryLink.dataset.categoryLink;
		document.querySelectorAll('[data-filter]').forEach(button => button.classList.toggle('is-selected', button.dataset.filter === activeFilter));
		renderProducts();
		document.querySelector('#collection').scrollIntoView({ behavior: 'smooth' });
	}

	const quantityButton = event.target.closest('[data-quantity]');
	if (quantityButton) changeCart(quantityButton.dataset.productId, Number(quantityButton.dataset.quantity));

	const removeButton = event.target.closest('[data-remove-item]');
	if (removeButton) {
		writeStorage(storageKeys.cart, getCart().filter(item => item.id !== removeButton.dataset.removeItem));
		updateCart();
	}

	if (event.target.closest('.cart-button')) openCart();
	if (event.target.closest('.close-drawer, .overlay-scrim')) closeCart();
	if (event.target.closest('[data-open-account]')) navigateToAccount();

	const modeButton = event.target.closest('[data-account-mode]');
	if (modeButton) {
		accountMode = modeButton.dataset.accountMode;
		renderAccountPage();
		document.querySelector('#account-form input')?.focus();
	}

	if (event.target.closest('[data-sign-out]')) {
		localStorage.removeItem(storageKeys.session);
		updateAccountButton();
		renderAccountPage();
		showToast('You have been signed out.');
	}

	if (event.target.closest('.checkout-button') && !event.target.closest('.checkout-button').disabled) {
		closeCart();
		if (!getCurrentAccount()) {
			navigateToAccount();
			showToast('Create an account or sign in to continue.');
		} else {
			showToast('Your bag is ready. Checkout will be available soon.');
		}
	}

	const menuButton = event.target.closest('.menu-toggle');
	if (menuButton) {
		const navigation = document.querySelector('.main-nav');
		const isOpen = navigation.classList.toggle('is-open');
		menuButton.setAttribute('aria-expanded', String(isOpen));
		menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
	}

	if (event.target.closest('.main-nav a')) {
		document.querySelector('.main-nav').classList.remove('is-open');
		document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
	}
});

document.addEventListener('submit', async event => {
	if (event.target.id === 'newsletter-form') {
		event.preventDefault();
		const emailInput = event.target.querySelector('input');
		const email = emailInput.value.trim().toLowerCase();
		const subscribers = readStorage(storageKeys.newsletter, []);
		if (!subscribers.includes(email)) subscribers.push(email);
		if (writeStorage(storageKeys.newsletter, subscribers)) {
			document.querySelector('#newsletter-note').textContent = 'You are on the list. Look out for a note from us.';
			event.target.reset();
		}
		return;
	}

	if (event.target.id !== 'account-form') return;
	event.preventDefault();
	const form = event.target;
	const message = form.querySelector('.account-message');
	if (!form.reportValidity()) return;

	const email = form.elements.email.value.trim().toLowerCase();
	const password = form.elements.password.value;
	const accounts = readStorage(storageKeys.accounts, {});
	const submit = form.querySelector('.account-submit');
	submit.disabled = true;
	message.classList.remove('is-success');
	message.textContent = 'One moment...';

	try {
		if (accountMode === 'create') {
			if (password.length < 10) throw new Error('Choose a password with at least 10 characters.');
			if (accounts[email]) throw new Error('An account already exists for this email. Sign in instead.');
			const name = form.elements.name.value.trim();
			if (name.length < 2) throw new Error('Enter your name to create an account.');
			const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
			const passwordHash = await hashPassword(password, salt);
			accounts[email] = { name, salt, passwordHash, createdAt: new Date().toISOString() };
			if (!writeStorage(storageKeys.accounts, accounts) || !writeStorage(storageKeys.session, email)) return;
			updateAccountButton();
			renderAccountPage();
			showToast('Your FORMÉ account is ready.');
		} else {
			const account = accounts[email];
			if (!account) throw new Error('No account found for this email. Check it or create an account.');
			const passwordHash = await hashPassword(password, account.salt);
			if (passwordHash !== account.passwordHash) throw new Error('That password does not match this account.');
			if (!writeStorage(storageKeys.session, email)) return;
			updateAccountButton();
			renderAccountPage();
			showToast('You are signed in.');
		}
	} catch (error) {
		submit.disabled = false;
		message.textContent = error.message === 'secure-context'
			? 'Account security needs a secure browser context. Open this site on localhost or HTTPS.'
			: error.message;
	}
});

document.addEventListener('keydown', event => {
	if (event.key === 'Escape' && !document.querySelector('#cart-overlay').hidden) closeCart();
});

window.addEventListener('hashchange', renderRoute);
renderProducts();
updateCart();
updateAccountButton();
