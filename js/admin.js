document.addEventListener('DOMContentLoaded', () => {
    const formAdicionarProduto = document.getElementById('form-adicionar-produto');
    const listaDeProdutosDiv = document.getElementById('lista-de-produtos');
    const editarProdutoContainer = document.getElementById('editar-produto-container');
    const formEditarProduto = document.getElementById('form-editar-produto');
    const cancelarEdicaoBtn = document.getElementById('cancelar-edicao');

    let produtosCarregados = [];

    // Função para formatar números como moeda brasileira (BRL)
    function formataPreco(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Função para carregar e exibir a lista de produtos
    async function carregarProdutos() {
        listaDeProdutosDiv.innerHTML = '<p>Carregando produtos...</p>';
        try {
            const response = await fetch('http://localhost:5001/api/produtos');
            if (response.ok) {
                produtosCarregados = await response.json();
                renderizarListaDeProdutos(produtosCarregados);
            } else {
                listaDeProdutosDiv.innerHTML = '<p>Erro ao carregar produtos.</p>';
                console.error('Erro ao carregar produtos:', response.status);
            }
        } catch (error) {
            listaDeProdutosDiv.innerHTML = '<p>Erro de rede ao carregar produtos.</p>';
            console.error('Erro de rede:', error);
        }
    }

    function renderizarListaDeProdutos(produtos) {
        listaDeProdutosDiv.innerHTML = '';
        if (produtos.length === 0) {
            listaDeProdutosDiv.innerHTML = '<p>Nenhum produto cadastrado.</p>';
            return;
        }
        const ul = document.createElement('ul');
        produtos.forEach(produto => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${produto.nome} - ${formataPreco(produto.preco)} - Categoria: ${produto.categoriaId}
                <button class="editar-btn" data-id="${produto.id}">Editar</button>
                <button class="excluir-btn" data-id="${produto.id}">Excluir</button>
            `;
            ul.appendChild(li);
        });
        listaDeProdutosDiv.appendChild(ul);

        // Adiciona listeners para os botões de editar e excluir APÓS a renderização
        document.querySelectorAll('.editar-btn').forEach(button => {
            button.addEventListener('click', function() {
                const produtoId = parseInt(this.dataset.id);
                carregarProdutoParaEdicao(produtoId);
            });
        });

        document.querySelectorAll('.excluir-btn').forEach(button => {
            button.addEventListener('click', function() {
                const produtoId = parseInt(this.dataset.id);
                excluirProduto(produtoId);
            });
        });
    }

    // Adicionar Novo Produto
    if (formAdicionarProduto) {
        formAdicionarProduto.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nome = document.getElementById('nome').value;
            const preco = parseFloat(document.getElementById('preco').value);
            const imagem = document.getElementById('imagem').value;
            const categoria = document.getElementById('categoria').value.toLowerCase();
            const novoProduto = { nome, preco, imagem, categoriaId: categoria };
            try {
                const response = await fetch('http://localhost:5001/api/produtos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoProduto),
                });
                if (response.ok) {
                    alert('Produto adicionado com sucesso!');
                    formAdicionarProduto.reset();
                    carregarProdutos();
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao adicionar produto: ${errorData.message || 'Erro desconhecido'}`);
                    console.error('Erro ao adicionar produto:', errorData);
                }
            } catch (error) {
                alert(`Erro de rede ao adicionar produto: ${error.message}`);
                console.error('Erro de rede:', error);
            }
        });
    }

    // Carregar produto para edição
    async function carregarProdutoParaEdicao(id) {
        const produto = produtosCarregados.find(p => p.id === id);
        if (produto) {
            document.getElementById('editar-id').value = produto.id;
            document.getElementById('editar-nome').value = produto.nome;
            document.getElementById('editar-preco').value = produto.preco;
            document.getElementById('editar-imagem').value = produto.imagem || '';
            document.getElementById('editar-categoria').value = produto.categoriaId;
            editarProdutoContainer.style.display = 'block';
        }
    }

    // Salvar Edições do Produto
    if (formEditarProduto) {
        formEditarProduto.addEventListener('submit', async (event) => {
            event.preventDefault();
            const id = parseInt(document.getElementById('editar-id').value);
            const nome = document.getElementById('editar-nome').value;
            const preco = parseFloat(document.getElementById('editar-preco').value);
            const imagem = document.getElementById('editar-imagem').value;
            const categoriaId = document.getElementById('editar-categoria').value.toLowerCase();
            const produtoEditado = { id, nome, preco, imagem, categoriaId };

            try {
                const response = await fetch(`http://localhost:5001/api/produtos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(produtoEditado),
                });
                if (response.ok) {
                    alert('Produto atualizado com sucesso!');
                    editarProdutoContainer.style.display = 'none';
                    carregarProdutos();
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao atualizar produto: ${errorData.message || 'Erro desconhecido'}`);
                    console.error('Erro ao atualizar produto:', errorData);
                }
            } catch (error) {
                alert(`Erro de rede ao atualizar produto: ${error.message}`);
                console.error('Erro de rede:', error);
            }
        });
    }

    // Cancelar Edição
    if (cancelarEdicaoBtn) {
        cancelarEdicaoBtn.addEventListener('click', () => {
            editarProdutoContainer.style.display = 'none';
        });
    }

    // Excluir Produto
    async function excluirProduto(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/produtos/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert('Produto excluído com sucesso!');
                    carregarProdutos();
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao excluir produto: ${errorData.message || 'Erro desconhecido'}`);
                    console.error('Erro ao excluir produto:', errorData);
                }
            } catch (error) {
                alert(`Erro de rede ao excluir produto: ${error.message}`);
                console.error('Erro de rede:', error);
            }
        }
    }

    // Carrega os produtos ao iniciar a página
    carregarProdutos();
});

const API_BASE_URL = 'http://localhost:5001/api';

// Carregar usuários ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarios();

    // Botão para abrir modal de adicionar usuário
    document.getElementById('btn-adicionar-usuario').addEventListener('click', () => {
        limparFormularioUsuario();
        document.getElementById('titulo-editar-usuario').textContent = 'Adicionar Usuário';
        document.getElementById('campo-senha').style.display = 'block';
        document.getElementById('editar-usuario-container').style.display = 'block';
    });

    // Submissão do formulário de adicionar/editar usuário
    document.getElementById('form-editar-usuario').addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('editar-id').value;
        const nome = document.getElementById('editar-nome').value;
        const email = document.getElementById('editar-email').value;
        const endereco = document.getElementById('editar-endereco').value;
        const telefone = document.getElementById('editar-telefone').value;
        const cpf = document.getElementById('editar-cpf').value;
        const role = document.getElementById('editar-role').value;

        const resp = await fetch(`${API_BASE_URL}/usuario/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, endereco, telefone, cpf, role })
        });
        if (resp.ok) {
            alert('Usuário atualizado!');
            document.getElementById('editar-usuario-container').style.display = 'none';
            carregarUsuarios();
        } else {
            alert('Erro ao atualizar usuário!');
        }
    });
});


 const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('usuarioEmail');
            localStorage.removeItem('usuarioEndereco');
            localStorage.removeItem('usuarioTelefone');
            localStorage.removeItem('usuarioCpf');
            localStorage.removeItem('usuarioRole'); // <-- Remova a role
            window.location.href = 'index.html';
        });
    }
    
// Função para carregar usuários e preencher tabela
async function carregarUsuarios() {
    const tbody = document.getElementById('usuarios-tbody');
    tbody.innerHTML = '<tr><td colspan="7">Carregando...</td></tr>';
    try {
        const resp = await fetch(`${API_BASE_URL}/usuarios`);
        const usuarios = await resp.json();
        tbody.innerHTML = '';
        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.endereco || ''}</td>
                <td>${usuario.telefone || ''}</td>
                <td>${usuario.cpf || ''}</td>
                <td>${usuario.role === 'admin' ? 'Administrador' : 'Usuário'}</td>
                <td>
                    <button onclick="editarUsuario(${usuario.id})">Editar</button>
                    <button onclick="excluirUsuario(${usuario.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar usuários.</td></tr>';
    }
}

// Função para limpar formulário
function limparFormularioUsuario() {
    document.getElementById('form-editar-usuario').reset();
    document.getElementById('editar-id').value = '';
    document.getElementById('campo-senha').style.display = 'block';
    document.getElementById('editar-senha').value = '';
}

// Função para editar usuário (preencher formulário)
window.editarUsuario = async function(id) {
    const resp = await fetch(`${API_BASE_URL}/usuario/${id}`);
    if (resp.ok) {
        const usuario = await resp.json();
        document.getElementById('editar-id').value = usuario.id;
        document.getElementById('editar-nome').value = usuario.nome;
        document.getElementById('editar-email').value = usuario.email;
        document.getElementById('editar-endereco').value = usuario.endereco || '';
        document.getElementById('editar-telefone').value = usuario.telefone || '';
        document.getElementById('editar-cpf').value = usuario.cpf || '';
        document.getElementById('editar-role').value = usuario.role || 'user';
        document.getElementById('campo-senha').style.display = 'none'; // Não mostra senha ao editar
        document.getElementById('titulo-editar-usuario').textContent = 'Editar Usuário';
        document.getElementById('editar-usuario-container').style.display = 'block';
    } else {
        alert('Erro ao buscar usuário!');
    }
}

// Função para excluir usuário
window.excluirUsuario = async function(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        const resp = await fetch(`${API_BASE_URL}/usuario/${id}`, {
            method: 'DELETE'
        });
        if (resp.ok) {
            alert('Usuário excluído!');
            carregarUsuarios();
        } else {
            alert('Erro ao excluir usuário!');
        }
    }
}