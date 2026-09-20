(() => {
  const login = document.querySelector('#login-preview');
  const editor = document.querySelector('#editor-preview');
  const openButton = document.querySelector('#show-editor');
  const backButton = document.querySelector('#back-login');

  const showEditor = () => {
    login.hidden = true;
    editor.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const showLogin = () => {
    editor.hidden = true;
    login.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  openButton?.addEventListener('click', showEditor);
  backButton?.addEventListener('click', showLogin);
})();
