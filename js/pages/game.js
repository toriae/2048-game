export default async function gamePage() {
  const page = document.createElement('div');
  page.className = 'game-page';

  page.innerHTML = `
    <div class="game-container">
      <iframe
        src="source/game/snack.html"
        class="game-iframe"
        title="贪吃蛇游戏"
        sandbox="allow-scripts allow-same-origin"
        allowfullscreen
      ></iframe>
    </div>
  `;

  return page;
}
