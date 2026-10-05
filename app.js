(() => {
  const search = document.querySelector('#search');
  if (!search) return;
  const rows = [...document.querySelectorAll('.project')];
  const buttons = [...document.querySelectorAll('[data-filter]')];
  let filter = 'all';
  const update = () => {
    const query = search.value.trim().toLowerCase();
    let shown = 0;
    for (const row of rows) {
      const visible = (filter === 'all' || row.dataset.kind === filter) && row.dataset.name.includes(query);
      row.hidden = !visible;
      if (visible) shown++;
    }
    document.querySelector('#empty').hidden = shown > 0;
    document.querySelector('#result-count').textContent = `Showing ${shown} of ${rows.length} projects`;
  };
  for (const button of buttons) button.addEventListener('click', () => {
    filter = button.dataset.filter;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    update();
  });
  search.addEventListener('input', update);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
      event.preventDefault(); search.focus();
    }
  });
})();
