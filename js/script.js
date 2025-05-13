 const produtos = [
    { id: 1, nome: "Camiseta Azul", preco: 49.90, imagem: "img/br-11134207-7r98o-lqxlu6s7ds1n31.webp" },
    { id: 2, nome: "Tênis Running", preco: 299.00, imagem: "img/022147IKA1.webp" },
    { id: 3, nome: "Relógio Moderno", preco: 399.90, imagem: "img/relogio_rolex_sky_dweller_oyster_perpetual_231_1_ccc543213d5515f17611fc761d552605.webp" },
    { id: 4, nome: "Boné Estiloso", preco: 89.99, imagem: "img/3414329-800-auto.webp" },
    { id: 5, nome: "Camisa preta basica", preco: 89.99, imagem: "img/camisa preta.webp" },
    { id: 6, nome: "Nike dunk", preco: 149.90, imagem: "img/tenis.png" },
    { id: 7, nome: "Air Pods", preco: 499.90, imagem: "img/fone.png" },
    
  ];

  // Salva a lista COMPLETA de produtos no localStorage (para a página carrinho.html usar)
  localStorage.setItem('meusProdutos', JSON.stringify(produtos));

  // Tenta carregar o carrinho do localStorage, se não existir, começa como um objeto vazio {}
  let carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || {};

  // Função para formatar números como moeda brasileira (BRL)
  function formataPreco(valor) {
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Função para renderizar os cards de produto na página principal
  function renderProdutos() {
      const container = document.getElementById('produtos');
      // Verifica se o elemento container existe antes de tentar usá-lo
      if (!container) {
          console.error("Elemento com ID 'produtos' não encontrado na página.");
          return;
      }
      container.innerHTML = ''; // Limpa o container antes de adicionar novos produtos
      produtos.forEach(prod => {
          const card = document.createElement('div');
          card.className = 'produto'; // Aplica a classe CSS para estilização
          // Define o HTML interno do card do produto
          card.innerHTML = `
              <img src="${prod.imagem}" alt="${prod.nome}" />
              <div class="produto-name">${prod.nome}</div>
              <div class="produto-preco">${formataPreco(prod.preco)}</div>
              <button class="adicionar" onclick="adicionarAoCarrinho(${prod.id})">Adicionar</button>
          `;
          container.appendChild(card); // Adiciona o card ao container na página
      });
  }

  // Função para SALVAR o estado atual do carrinho no localStorage
  function salvarCarrinho() {
      // Converte o objeto 'carrinho' para uma string JSON e salva
      localStorage.setItem('meuCarrinho', JSON.stringify(carrinho));
      // Após salvar, atualiza o contador visual (badge) no ícone do carrinho
      atualizarBadgeCarrinho();
  }

  // Função para ATUALIZAR o contador (badge) no ícone do carrinho no header
  function atualizarBadgeCarrinho() {
      const badge = document.getElementById('cart-badge');
      // Se o elemento badge não for encontrado na página atual, interrompe a função
      if (!badge) return;

      const ids = Object.keys(carrinho); // Pega todas as chaves (IDs dos produtos) do carrinho
      let totalItens = 0;
      // Itera sobre os IDs e soma as quantidades de cada produto
      ids.forEach(id => {
          totalItens += carrinho[id]; // Soma a quantidade do produto atual
      });
      // Alternativa: para contar apenas produtos DIFERENTES, usar: const totalItens = ids.length;

      // Se houver itens no carrinho, mostra o badge com a quantidade
      if (totalItens > 0) {
          badge.textContent = totalItens; // Define o texto do badge
          badge.style.display = 'inline-block'; // Torna o badge visível
      } else {
          // Se não houver itens, esconde o badge
          badge.style.display = 'none';
      }
  }

  // Função chamada quando o botão "Adicionar" de um produto é clicado
  function adicionarAoCarrinho(id) {
      // Verifica se o produto já existe no carrinho
      if (carrinho[id]) {
          // Se sim, incrementa a quantidade
          carrinho[id]++;
      } else {
          // Se não, adiciona o produto ao carrinho com quantidade 1
          carrinho[id] = 1;
      }
      // Salva o estado atualizado do carrinho no localStorage (isso também atualiza o badge)
      salvarCarrinho();

      // Opcional: Mostrar uma confirmação rápida para o usuário
      // alert('Produto adicionado ao carrinho!');
      // Ou usar uma notificação mais sutil se preferir
  }

  // --- Inicialização quando a página carrega ---

  // 1. Renderiza a lista de produtos na tela
  renderProdutos();

  // 2. Atualiza o badge do carrinho com a quantidade de itens carregada do localStorage
  atualizarBadgeCarrinho();