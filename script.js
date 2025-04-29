document.addEventListener('DOMContentLoaded', () => {
    const storiesContainer = document.getElementById('stories-container');
    const postsContainer = document.getElementById('posts-container');
    const formContainer  = document.getElementById('form-container');
    const addBtn         = document.getElementById('add-btn');
    const formPub        = document.getElementById('form-publicacao');
    const idUsuarioPub   = 2;
  
    // Preenche hidden do form de nova publicação
    document.getElementById('idUsuario').value = idUsuarioPub;
  
    // Mostrar / ocultar form de publicação
    addBtn.addEventListener('click', () => formContainer.style.display = 'block');
    window.fecharFormulario = () => formContainer.style.display = 'none';
  

    function carregarStories() {
        fetch('https://back-spider.vercel.app/storys/listarStorys')
          .then(res => res.json())
          .then(stories => {
            storiesContainer.innerHTML = '';
            stories.forEach(story => {
              const el = document.createElement('div');
              el.className = 'story-item';
              el.innerHTML = `
                <img src="${story.imagem}" alt="story">
                <div>${story.descricao.split(' ')[0]}</div>
              `;
              storiesContainer.appendChild(el);
            });
          })
          .catch(console.error);
      }

      carregarStories();

    // Função principal para renderizar o feed
    function exibirPublicacoes() {
      fetch('https://back-spider.vercel.app/publicacoes/listarPublicacoes')
        .then(r => r.json())
        .then(data => {
          postsContainer.innerHTML = '';
          data.forEach(pub => {
            const likes = pub.likes ?? 0; // espera-se que a API retorne uma propriedade "likes"
            const card = document.createElement('div');
            card.className = 'publicacao';
            card.innerHTML = `
              <img src="${pub.imagem}" alt="Post imagem">
              <div class="conteudo">
                <p class="descricao">${pub.descricao}</p>
                <p class="data-local">Data: ${pub.dataPublicacao} | Local: ${pub.local}</p>
  
                <!-- Lista de comentários -->
                <div class="comments-list" id="comments-list-${pub.id}">
                  ${(pub.comentarios || []).map(c =>
                    `<div class="comment-item">${c.descricao}</div>`
                  ).join('')}
                </div>
  
                <!-- Form de comentário -->
                <div class="comment-card" id="comment-form-${pub.id}" style="display:none;">
                  <h4>Comentar Publicação</h4>
                  <form onsubmit="submitComment(event, ${pub.id})">
                    <input type="hidden" id="idUser-comment-${pub.id}" value="1">
                    <label for="descricao-comment-${pub.id}">Comentário</label>
                    <textarea id="descricao-comment-${pub.id}" required>Projeto Fácil, ou muito Fácil...</textarea>
                    <div class="form-buttons">
                      <button type="submit">Enviar</button>
                      <button type="button" onclick="fecharCommentForm(${pub.id})">Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
  
              <div class="actions">
                <button class="like-btn ${likes>0?'liked':''}" data-id="${pub.id}" onclick="curtir(${pub.id})">
                  <span class="heart-icon">♥</span>
                  <span id="like-count-${pub.id}">${likes}</span>
                </button>
                <button class="delete-btn" onclick="deletar(${pub.id})">Excluir</button>
                <button class="comment-btn" onclick="mostrarCommentForm(${pub.id})">Comentar</button>
              </div>
            `;
            postsContainer.appendChild(card);
          });
        })
        .catch(console.error);
    }
  
    // Curte e atualiza contador
    window.curtir = id => {
      fetch(`https://back-spider.vercel.app/publicacoes/likePublicacao/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser: 4 })
      })
      .then(res => res.json())
      .then(data => {
        // assume que data.likes vem no retorno
        const countEl = document.getElementById(`like-count-${id}`);
        const btn     = document.querySelector(`.like-btn[data-id="${id}"]`);
        if (countEl && btn) {
          countEl.textContent = data.likes ?? (+countEl.textContent + 1);
          btn.classList.add('liked');
        }
      })
      .catch(console.error);
    };
  
    // Excluir publicação
    window.deletar = id => {
      fetch(`https://back-spider.vercel.app/publicacoes/deletarPublicacao/${id}`, {
        method: 'DELETE'
      }).then(exibirPublicacoes)
        .catch(console.error);
    };
  
    // Mostrar / fechar form de comentário
    window.mostrarCommentForm = pubId =>
      document.getElementById(`comment-form-${pubId}`).style.display = 'block';
    window.fecharCommentForm = pubId =>
      document.getElementById(`comment-form-${pubId}`).style.display = 'none';
  
    // Enviar comentário e renderizar
    window.submitComment = (e, pubId) => {
      e.preventDefault();
      const idUser    = +document.getElementById(`idUser-comment-${pubId}`).value;
      const descricao = document.getElementById(`descricao-comment-${pubId}`).value;
      fetch(`https://back-spider.vercel.app/publicacoes/commentPublicacao/${pubId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser, descricao })
      })
      .then(res => res.json())
      .then(() => {
        fecharCommentForm(pubId);
        const lista = document.getElementById(`comments-list-${pubId}`);
        const novo  = document.createElement('div');
        novo.className = 'comment-item';
        novo.textContent = descricao;
        lista.appendChild(novo);
      })
      .catch(console.error);
    };
  
    // Nova publicação
    formPub.addEventListener('submit', e => {
      e.preventDefault();
      const novaPub = {
        idUsuario: +document.getElementById('idUsuario').value,
        descricao: document.getElementById('descricao').value,
        dataPublicacao: document.getElementById('dataPublicacao').value,
        imagem: document.getElementById('imagem').value,
        local: document.getElementById('local').value
      };
      fetch('https://back-spider.vercel.app/publicacoes/cadastrarPublicacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaPub)
      })
      .then(() => {
        formPub.reset();
        fecharFormulario();
        exibirPublicacoes();
      })
      .catch(console.error);
    });
  
    // Inicializa feed
    exibirPublicacoes();
  });
