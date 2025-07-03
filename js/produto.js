const API_BASE_URL = 'http://localhost:5001/api';

function getIdProduto() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function mostrarDetalhesProduto(produto) {
    const container = document.getElementById('detalhes-produto');
    if (!produto) {
        container.innerHTML = "<p>Produto não encontrado.</p>";
        return;
    }
    container.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}">
        <h1>${produto.nome}</h1>
        <p><strong>Categoria:</strong> ${produto.categoria || ''}</p>
        <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}</p>
        <div id="tamanhos-disponiveis">
            <strong>Tamanhos disponíveis:</strong>
            <span class="tamanhos-em-breve">(em breve)</span>
        </div>
        <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao carrinho</button>
    `;
}

function adicionarAoCarrinho(id) {
    alert("Produto " + id + " adicionado ao carrinho!");
}

document.addEventListener('DOMContentLoaded', async () => {
    const id = getIdProduto();
    if (!id) {
        mostrarDetalhesProduto(null);
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
        if (!response.ok) throw new Error('Produto não encontrado');
        const produto = await response.json();
        mostrarDetalhesProduto(produto);
    } catch (e) {
        mostrarDetalhesProduto(null);
    }
});