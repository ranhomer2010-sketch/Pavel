(() => {
  const login = document.querySelector('#login-preview');
  const editor = document.querySelector('#editor-preview');
  const openButton = document.querySelector('#show-editor');
  const backButton = document.querySelector('#back-login');
  const editorHeading = editor?.querySelector('h1');
  const loginHeading = login?.querySelector('h1');

  const showEditor = () => {
    login.hidden = true;
    editor.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    editorHeading?.setAttribute('tabindex', '-1');
    editorHeading?.focus();
  };

  const showLogin = () => {
    editor.hidden = true;
    login.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    loginHeading?.focus();
  };

  openButton?.addEventListener('click', showEditor);
  backButton?.addEventListener('click', showLogin);
})();
