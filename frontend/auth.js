const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authMessage = document.getElementById('authMessage');
const toggleAuth = document.getElementById('toggleAuth');

let mode = 'login';

function refreshMode() {
  authTitle.textContent = mode === 'login' ? 'Login' : 'Sign Up';
  toggleAuth.textContent = mode === 'login'
    ? 'Need an account? Sign up'
    : 'Already have an account? Login';
}

refreshMode();

toggleAuth.addEventListener('click', () => {
  mode = mode === 'login' ? 'signup' : 'login';
  authMessage.textContent = '';
  refreshMode();
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) return;

  try {
    if (mode === 'signup') {
      const registerRes = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        authMessage.textContent = registerData.detail || 'Signup failed';
        return;
      }
    }

    const loginRes = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      authMessage.textContent = loginData.detail || 'Login failed';
      return;
    }

    localStorage.setItem('authToken', loginData.access_token);
    localStorage.setItem('guestUploadCount', '0');
    authMessage.textContent = 'Success! Redirecting...';
    window.location.href = '/';
  } catch (err) {
    authMessage.textContent = `Error: ${err.message}`;
  }
});
