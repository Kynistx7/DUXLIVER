// Pega a lista de TODOS os produtos e o carrinho do localStorage
    const todosProdutos = JSON.parse(localStorage.getItem('meusProdutos')) || [];
    let carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || {};

    const containerItens = document.getElementById('itens-do-carrinho');
    const mensagemVazio = document.getElementById('carrinho-vazio-mensagem');
    const resumoCarrinho = document.getElementById('resumo-carrinho');
    const totalCarrinhoEl = document.getElementById('total-carrinho');

    function formataPreco(valor) {
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function salvarCarrinho() {
        localStorage.setItem('meuCarrinho', JSON.stringify(carrinho));
    }

    function calcularTotal() {
        let total = 0;
        const ids = Object.keys(carrinho);
        ids.forEach(id => {
            const produto = todosProdutos.find(p => p.id == id);
            if (produto) {
                total += produto.preco * carrinho[id];
            }
        });
        return total;
    }

    function renderizarCarrinho() {
      containerItens.innerHTML = ''; // Limpa a lista atual
      const idsCarrinho = Object.keys(carrinho);

      if (idsCarrinho.length === 0) {
        mensagemVazio.style.display = 'block';
        resumoCarrinho.style.display = 'none';
      } else {
        mensagemVazio.style.display = 'none';
        resumoCarrinho.style.display = 'block';

        idsCarrinho.forEach(id => {
          const produto = todosProdutos.find(p => p.id == id);
          const quantidade = carrinho[id];

          if (!produto) {
              console.warn(`Produto com ID ${id} não encontrado no localStorage 'meusProdutos'. Removendo do carrinho.`);
              delete carrinho[id];
              salvarCarrinho();
              renderizarCarrinho(); // Re-renderiza após remover item inválido
              return;
          }

          const subtotal = produto.preco * quantidade;

          const itemDiv = document.createElement('div');
          itemDiv.className = 'item-carrinho-detalhado';
          itemDiv.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}">
            <div class="item-info">
              <h3>${produto.nome}</h3>
              <p class="item-preco-unitario">Preço Unitário: ${formataPreco(produto.preco)}</p>
            </div>
            <div class="item-quantidade-controles">
              <button onclick="mudarQuantidade(${produto.id}, -1)" ${quantidade <= 1 ? 'disabled' : ''}>-</button>
              <span>${quantidade}</span>
              <button onclick="mudarQuantidade(${produto.id}, 1)">+</button>
            </div>
            <div class="item-subtotal">${formataPreco(subtotal)}</div>
            <div class="item-remover">
              <button onclick="removerItem(${produto.id})" title="Remover Item">&times;</button>
            </div>
          `;
          containerItens.appendChild(itemDiv);
        });

        // Atualiza o total geral
        totalCarrinhoEl.textContent = 'Total: ' + formataPreco(calcularTotal());
      }
    }

    function mudarQuantidade(id, delta) {
      if (carrinho[id]) {
        carrinho[id] += delta;
        if (carrinho[id] <= 0) {
          delete carrinho[id]; // Remove se a quantidade for zero ou menos
        }
        salvarCarrinho();
        renderizarCarrinho(); // Re-renderiza a lista e o total
      }
    }

    function removerItem(id) {
      if (carrinho[id]) {
        // Confirmação opcional
        if (confirm(`Tem certeza que deseja remover ${todosProdutos.find(p => p.id == id)?.nome || 'este item'} do carrinho?`)) {
            delete carrinho[id];
            salvarCarrinho();
            renderizarCarrinho(); // Re-renderiza a lista e o total
        }
      }
    }

    function finalizarCompra() {
        // Aqui você adicionaria a lógica para processar o pagamento
        // Por enquanto, apenas limpa o carrinho e exibe uma mensagem
        alert('Compra finalizada com sucesso! (Simulação)');
        carrinho = {}; // Esvazia o objeto carrinho
        salvarCarrinho(); // Salva o carrinho vazio no localStorage
        renderizarCarrinho(); // Atualiza a exibição
    }

    // Executa a renderização inicial quando a página carrega
    document.addEventListener('DOMContentLoaded', renderizarCarrinho);
