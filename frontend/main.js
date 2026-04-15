const loginIcon = document.getElementById('loginIcon');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const outputText = document.getElementById('outputText');

const token = localStorage.getItem('authToken');
let sessionId = localStorage.getItem('sessionId') || '';

const guestUploadCount = Number(localStorage.getItem('guestUploadCount') || '0');
if (!token && guestUploadCount >= 1) {
  window.location.href = '/login-page';
}

loginIcon.addEventListener('click', () => {
  window.location.href = '/login-page';
});

convertBtn.addEventListener('click', async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    outputText.textContent = 'Please choose a document first.';
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (sessionId) headers['X-Session-Id'] = sessionId;

  outputText.textContent = 'Converting...';

  try {
    const res = await fetch('/convert-doc', {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      outputText.textContent = data.detail || 'Conversion failed.';
      if (res.status === 401) {
        window.location.href = '/login-page';
      }
      return;
    }

    sessionId = data.session_id;
    localStorage.setItem('sessionId', sessionId);

    if (!token) {
      localStorage.setItem('guestUploadCount', String(data.used_guest_uploads || 1));
    }

    outputText.textContent = data.converted_output || 'No converted text returned.';
  } catch (err) {
    outputText.textContent = `Error: ${err.message}`;
  }
});
