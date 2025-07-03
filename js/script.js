// URL base do seu backend (você precisará ajustar isso)
const API_BASE_URL = 'http://localhost:5001/api'; // Exemplo de URL

// Função para formatar números como moeda brasileira (BRL)
function formataPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para renderizar os cards de produto em um container específico
function renderProdutosEmContainer(produtosParaRenderizar, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!produtosParaRenderizar || produtosParaRenderizar.length === 0) {
        container.innerHTML = `<p class="text-center col-span-full">Nenhum produto encontrado nesta categoria.</p>`;
        return;
    }

    produtosParaRenderizar.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <img src="${prod.imagem}" alt="${prod.nome}" />
            <h3>${prod.nome}</h3>
            <div class="produto_preco">${formataPreco(prod.preco)}</div>
            <button class="adicionar" onclick="adicionarAoCarrinho(${prod.id});event.stopPropagation();">Adicionar</button>
        `;
        // Redireciona ao clicar no card
        card.addEventListener('click', function() {
            window.location.href = `produto.html?id=${prod.id}`;
        });
        container.appendChild(card);
    });
}

// Função para buscar todos os produtos do backend e distribuí-los por categoria
async function buscarEExibirProdutosPorCategoria() {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const produtos = await response.json();

        // Agrupa os produtos por categoriaId
        const produtosPorCategoria = produtos.reduce((acc, prod) => {
            if (!acc[prod.categoriaId]) {
                acc[prod.categoriaId] = [];
            }
            acc[prod.categoriaId].push(prod);
            return acc;
        }, {});

        // Renderiza os produtos em suas respectivas seções
        for (const categoriaId in produtosPorCategoria) {
            const containerId = `${categoriaId}-lista`;
            renderProdutosEmContainer(produtosPorCategoria[categoriaId], containerId);
        }

    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        // Aqui você pode mostrar uma mensagem de erro para o usuário
    }
}

// Função para renderizar os botões de filtro de categoria
function renderizarFiltrosCategoria(categorias) {
    const containerFiltros = document.getElementById('filtros-categoria');
    if (!containerFiltros) {
        console.warn("Elemento com ID 'filtros-categoria' não encontrado. Nenhum filtro será renderizado.");
        return;
    }
    containerFiltros.innerHTML = ''; // Limpa filtros existentes

    // Botão para mostrar todos os produtos (agora busca e exibe por seção)
    const btnTodos = document.createElement('button');
    btnTodos.textContent = 'Todos';
    btnTodos.className = 'filtro-btn'; // Adicione classes para estilização
    btnTodos.onclick = buscarEExibirProdutosPorCategoria;
    containerFiltros.appendChild(btnTodos);

    // Botões para cada categoria (agora filtra os produtos já carregados no frontend)
    categorias.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat.nome;
        btn.className = 'filtro-btn'; // Adicione classes para estilização
        btn.onclick = () => filtrarProdutosPorCategoria(cat.id);
        containerFiltros.appendChild(btn);
    });
}

// Mantém uma cópia de todos os produtos carregados
let todosOsProdutos = [];

// Função para buscar todos os produtos e armazenar
async function buscarTodosOsProdutosParaFiltro() {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        todosOsProdutos = await response.json();
        buscarEExibirProdutosPorCategoria(); // Exibe os produtos iniciais
    } catch (error) {
        console.error("Erro ao buscar todos os produtos para filtro:", error);
    }
}

// Função para filtrar os produtos já carregados e exibir em #produtos
function filtrarProdutosPorCategoria(categoriaIdFiltro) {
    const produtosFiltrados = todosOsProdutos.filter(prod => prod.categoriaId === categoriaIdFiltro);
    renderProdutosEmContainer(produtosFiltrados, 'produtos'); // Renderiza na seção geral 'produtos'
}

// Função para buscar as categorias do backend e renderizar os filtros
async function buscarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderizarFiltrosCategoria(data);
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
    }
}

// Função para SALVAR o estado atual do carrinho no localStorage
function salvarCarrinho() {
    localStorage.setItem('meuCarrinho', JSON.stringify(carrinho));
    atualizarBadgeCarrinho();
}

// Função para ATUALIZAR o contador (badge) no ícone do carrinho no header
function atualizarBadgeCarrinho() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const totalItens = Object.values(carrinho).reduce((soma, qtd) => soma + qtd, 0);

    if (totalItens > 0) {
        badge.textContent = totalItens;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Função chamada quando o botão "Adicionar" de um produto é clicado
function adicionarAoCarrinho(idProduto) {
    if (carrinho[idProduto]) {
        carrinho[idProduto]++;
    } else {
        carrinho[idProduto] = 1;
    }
    salvarCarrinho();
}

window.adicionarAoCarrinho = adicionarAoCarrinho; // <-- Torna global

// --- Inicialização quando a página carrega ---
let carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || {};
atualizarBadgeCarrinho();
buscarCategorias();
buscarTodosOsProdutosParaFiltro(); // Busca todos e exibe por categoria

document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const usuarioRole = localStorage.getItem('usuarioRole');
    if (usuarioLogado && usuarioRole === 'admin') {
        window.location.href = 'admin.html';
        return;
    }

    // O restante do seu código que configura os links de login/perfil
    // e outras funcionalidades para usuários comuns ou não logados.
    const loginLink = document.getElementById('login-link');
    const nomeUsuarioSpan = document.getElementById('nome-usuario');
    const registrarPerfilLink = document.getElementById('registrar-perfil-link');

    if (usuarioLogado) {
        if (loginLink) loginLink.style.display = 'none';
        if (nomeUsuarioSpan) {
            nomeUsuarioSpan.textContent = `Olá, ${usuarioLogado}!`;
            nomeUsuarioSpan.style.display = 'inline';
        }
        if (registrarPerfilLink) {
            registrarPerfilLink.textContent = 'Meu Perfil';
            registrarPerfilLink.href = 'perfil.html';
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline';
        if (nomeUsuarioSpan) nomeUsuarioSpan.style.display = 'none';
        if (registrarPerfilLink) {
            registrarPerfilLink.textContent = 'Registrar';
            registrarPerfilLink.href = 'cadastro.html';
        }
    }

    // ... (o restante do seu código para formulários, perfil, busca, etc.) ...
});

document.addEventListener('DOMContentLoaded', () => {
    // Event listener para o formulário de login, se estiver na página de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha }),
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('usuarioLogado', data.nome);
                    localStorage.setItem('usuarioEmail', data.email);
                    localStorage.setItem('usuarioRole', data.role); // Salva a role

                    // Redireciona para admin se for admin, senão para index
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert(data.erro || 'Erro ao fazer login');
                }
            } catch (error) {
                alert('Erro ao conectar ao servidor.');
            }
        });
    }

    // Event listener para o formulário de cadastro, se estiver na página de cadastro
    const cadastroForm = document.getElementById('cadastro-form');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;

            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/registrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Cadastro realizado com sucesso!');
                    window.location.href = 'login.html';
                } else {
                    alert(`Erro no cadastro: ${data.erro}`);
                }
            } catch (error) {
                alert('Erro ao cadastrar. Tente novamente.');
            }
        });
    }

    // --- Lógica para a página de perfil ---
    if (window.location.pathname.includes('perfil.html')) {
        const perfilForm = document.getElementById('perfil-form');
        const perfilInfo = document.getElementById('perfil-info');
        const mensagemPerfil = document.getElementById('mensagem-perfil');
        const editarPerfilBtn = document.getElementById('editar-perfil-btn');

        // Função para mostrar dados e esconder formulário
        function mostrarPerfil(dados) {
            document.getElementById('perfil-nome').textContent = localStorage.getItem('usuarioLogado') || '';
            document.getElementById('perfil-email').textContent = localStorage.getItem('usuarioEmail') || '';
            document.getElementById('perfil-endereco').textContent = dados.endereco || '';
            document.getElementById('perfil-telefone').textContent = dados.telefone || '';
            document.getElementById('perfil-cpf').textContent = dados.cpf || '';
            perfilInfo.style.display = 'block';
            perfilForm.style.display = 'none';
        }

        // Função para mostrar formulário preenchido e esconder dados
        function editarPerfil(dados) {
            document.getElementById('endereco').value = dados.endereco || '';
            document.getElementById('telefone').value = dados.telefone || '';
            document.getElementById('cpf').value = dados.cpf || '';
            perfilInfo.style.display = 'none';
            perfilForm.style.display = 'block';
        }

        // Carregar dados do perfil ao abrir a página
        async function carregarPerfil() {
            const email = localStorage.getItem('usuarioEmail');
            if (!email) return;
            try {
                const response = await fetch(`${API_BASE_URL}/perfil?email=${encodeURIComponent(email)}`);
                const data = await response.json();
                if (response.ok) {
                    mostrarPerfil(data);
                    // Atualiza localStorage (opcional)
                    localStorage.setItem('usuarioEndereco', data.endereco || '');
                    localStorage.setItem('usuarioTelefone', data.telefone || '');
                    localStorage.setItem('usuarioCpf', data.cpf || '');
                } else {
                    editarPerfil({});
                }
            } catch (error) {
                editarPerfil({});
            }
        }

        carregarPerfil();

        // Event listener para editar perfil
        if (editarPerfilBtn) {
            editarPerfilBtn.addEventListener('click', function () {
                editarPerfil({
                    endereco: localStorage.getItem('usuarioEndereco') || '',
                    telefone: localStorage.getItem('usuarioTelefone') || '',
                    cpf: localStorage.getItem('usuarioCpf') || ''
                });
                mensagemPerfil.textContent = '';
            });
        }

        // Event listener para salvar perfil
        if (perfilForm) {
            perfilForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const endereco = document.getElementById('endereco').value;
                const telefone = document.getElementById('telefone').value;
                const cpf = document.getElementById('cpf').value;
                const email = localStorage.getItem('usuarioEmail');

                try {
                    const response = await fetch(`${API_BASE_URL}/atualizar-perfil`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, endereco, telefone, cpf })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        localStorage.setItem('usuarioEndereco', endereco);
                        localStorage.setItem('usuarioTelefone', telefone);
                        localStorage.setItem('usuarioCpf', cpf);
                        mostrarPerfil({ endereco, telefone, cpf });
                        mensagemPerfil.textContent = 'Dados salvos com sucesso!';
                    } else {
                        mensagemPerfil.textContent = data.erro || 'Erro ao salvar dados!';
                    }
                } catch (error) {
                    mensagemPerfil.textContent = 'Erro ao conectar ao servidor!';
                }
            });
        }
    }

    // Atualiza a mensagem de boas-vindas e o link de registrar/perfil na página principal
    const usuarioLogadoIndex = localStorage.getItem('usuarioLogado');
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        const loginLinkIndex = document.getElementById('login-link');
        const nomeUsuarioSpanIndex = document.getElementById('nome-usuario');
        const registrarPerfilLinkIndex = document.getElementById('registrar-perfil-link');

        if (usuarioLogadoIndex) {
            if (loginLinkIndex) loginLinkIndex.style.display = 'none';
            if (nomeUsuarioSpanIndex) {
                nomeUsuarioSpanIndex.textContent = `Olá, ${usuarioLogadoIndex}!`;
                nomeUsuarioSpanIndex.style.display = 'inline';
            }
            if (registrarPerfilLinkIndex) {
                registrarPerfilLinkIndex.textContent = 'Meu Perfil';
                registrarPerfilLinkIndex.href = 'perfil.html';
            }
        } else {
            if (loginLinkIndex) loginLinkIndex.style.display = 'inline';
            if (nomeUsuarioSpanIndex) nomeUsuarioSpanIndex.style.display = 'none';
            if (registrarPerfilLinkIndex) {
                registrarPerfilLinkIndex.textContent = 'Registrar';
                registrarPerfilLinkIndex.href = 'cadastro.html'; // Link para a página de cadastro
            }
        }
    }

    // --- Buscador de produtos na navbar ---
    const buscaNavbarForm = document.getElementById('busca-navbar');
    const inputBuscaNavbar = document.getElementById('input-busca-navbar');
    if (buscaNavbarForm && inputBuscaNavbar) {
        buscaNavbarForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const termo = inputBuscaNavbar.value.trim().toLowerCase();

            // Limpa as seções de categorias
            document.getElementById('calcados-lista').innerHTML = '';
            document.getElementById('camisas-lista').innerHTML = '';
            document.getElementById('acessorios-lista').innerHTML = '';
            document.getElementById('agasalhos-lista').innerHTML = '';

            if (!termo) {
                buscarEExibirProdutosPorCategoria(); // Se vazio, recarrega todas as seções
                return;
            }
            // Filtra produtos pelo nome (case insensitive)
            const produtosFiltrados = todosOsProdutos.filter(prod =>
                prod.nome && prod.nome.toLowerCase().includes(termo)
            );
            // Renderiza os resultados na seção geral 'produtos'
            renderProdutosEmContainer(produtosFiltrados, 'produtos');
        });
    }

    // Supondo que você já tem o nome/email salvos no localStorage
    const perfilForm = document.getElementById('perfil-form');
    const perfilInfo = document.getElementById('perfil-info');
    const mensagemPerfil = document.getElementById('mensagem-perfil');
    const editarPerfilBtn = document.getElementById('editar-perfil-btn');

    // Função para mostrar dados e esconder formulário
    function mostrarPerfil(dados) {
        document.getElementById('perfil-nome').textContent = localStorage.getItem('usuarioLogado') || '';
        document.getElementById('perfil-email').textContent = localStorage.getItem('usuarioEmail') || '';
        document.getElementById('perfil-endereco').textContent = dados.endereco || '';
        document.getElementById('perfil-telefone').textContent = dados.telefone || '';
        document.getElementById('perfil-cpf').textContent = dados.cpf || '';
        perfilInfo.style.display = 'block';
        perfilForm.style.display = 'none';
    }

    // Função para mostrar formulário preenchido e esconder dados
    function editarPerfil(dados) {
        document.getElementById('endereco').value = dados.endereco || '';
        document.getElementById('telefone').value = dados.telefone || '';
        document.getElementById('cpf').value = dados.cpf || '';
        perfilInfo.style.display = 'none';
        perfilForm.style.display = 'block';
    }

    // Botão para editar novamente
    if (editarPerfilBtn) {
        editarPerfilBtn.addEventListener('click', function () {
            editarPerfil({
                endereco: localStorage.getItem('usuarioEndereco') || '',
                telefone: localStorage.getItem('usuarioTelefone') || '',
                cpf: localStorage.getItem('usuarioCpf') || ''
            });
            mensagemPerfil.textContent = '';
        });
    }

    // Ao carregar a página, tente buscar dados do perfil (exemplo: do localStorage ou backend)
    document.addEventListener('DOMContentLoaded', () => {
        // Exemplo: buscar do localStorage (ajuste para buscar do backend se preferir)
        const dadosPerfil = {
            endereco: localStorage.getItem('usuarioEndereco') || '',
            telefone: localStorage.getItem('usuarioTelefone') || '',
            cpf: localStorage.getItem('usuarioCpf') || ''
        };

        if (dadosPerfil.endereco || dadosPerfil.telefone || dadosPerfil.cpf) {
            mostrarPerfil(dadosPerfil);
        } else {
            editarPerfil(dadosPerfil);
        }
    });

    // Ao salvar o formulário, salve os dados e mostre o perfil
    perfilForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const endereco = document.getElementById('endereco').value;
        const telefone = document.getElementById('telefone').value;
        const cpf = document.getElementById('cpf').value;
        const email = localStorage.getItem('usuarioEmail'); // Identificador do usuário

        try {
            const response = await fetch(`${API_BASE_URL}/atualizar-perfil`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, endereco, telefone, cpf })
            });
            const data = await response.json();
            if (response.ok) {
                // Atualiza localStorage para manter experiência rápida
                localStorage.setItem('usuarioEndereco', endereco);
                localStorage.setItem('usuarioTelefone', telefone);
                localStorage.setItem('usuarioCpf', cpf);
                mostrarPerfil({ endereco, telefone, cpf });
                mensagemPerfil.textContent = 'Dados salvos com sucesso!';
            } else {
                mensagemPerfil.textContent = data.erro || 'Erro ao salvar dados!';
            }
        } catch (error) {
            mensagemPerfil.textContent = 'Erro ao conectar ao servidor!';
        }
    });

    // Botão para editar novamente
    if (editarPerfilBtn) {
        editarPerfilBtn.addEventListener('click', function () {
            editarPerfil({
                endereco: localStorage.getItem('usuarioEndereco') || '',
                telefone: localStorage.getItem('usuarioTelefone') || '',
                cpf: localStorage.getItem('usuarioCpf') || ''
            });
            mensagemPerfil.textContent = '';
        });
    }

    // Ao carregar a página de perfil, busque do backend
    document.addEventListener('DOMContentLoaded', async () => {
        if (window.location.pathname.includes('perfil.html')) {
            const email = localStorage.getItem('usuarioEmail');
            if (!email) return;

            try {
                const response = await fetch(`${API_BASE_URL}/perfil?email=${encodeURIComponent(email)}`);
                const data = await response.json();
                if (response.ok) {
                    mostrarPerfil({
                        endereco: data.endereco,
                        telefone: data.telefone,
                        cpf: data.cpf
                    });
                    // Atualiza localStorage para experiência rápida (opcional)
                    localStorage.setItem('usuarioEndereco', data.endereco || '');
                    localStorage.setItem('usuarioTelefone', data.telefone || '');
                    localStorage.setItem('usuarioCpf', data.cpf || '');
                } else {
                    editarPerfil({}); // Se não encontrar, mostra formulário vazio
                }
            } catch (error) {
                editarPerfil({});
            }
        }
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

    document.getElementById('form-editar-usuario').addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('editar-id').value;
        const nome = document.getElementById('editar-nome').value;
        const email = document.getElementById('editar-email').value;
        const endereco = document.getElementById('editar-endereco').value;
        const telefone = document.getElementById('editar-telefone').value;
        const cpf = document.getElementById('editar-cpf').value;

        const resp = await fetch(`${API_BASE_URL}/usuario/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, endereco, telefone, cpf })
        });
        if (resp.ok) {
            alert('Usuário atualizado com sucesso!');
            document.getElementById('editar-usuario-container').style.display = 'none';
            carregarUsuarios(); // Atualiza a tabela
        } else {
            alert('Erro ao atualizar usuário!');
        }
    });
});



document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuarioLogado');
    const iconePerfil = document.getElementById('icone-perfil');
    const loginLink = document.getElementById('login-link');
    const registrarLink = document.getElementById('registrar-link');

    if (usuario) {
        if (iconePerfil) iconePerfil.style.display = 'inline-block';
        if (loginLink) loginLink.style.display = 'none';
        if (registrarLink) registrarLink.style.display = 'none';
    } else {
        if (iconePerfil) iconePerfil.style.display = 'none';
        if (loginLink) loginLink.style.display = 'inline-block';
        if (registrarLink) registrarLink.style.display = 'inline-block';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuarioLogado');
    if (usuario) {
        const mensagem = document.getElementById('mensagem-boas-vindas');
        if (mensagem) {
            mensagem.textContent = `Bem-vindo, ${usuario}!`;
        }
        // Exemplo de mostrar perfil (opcional)
        const perfil = document.getElementById('perfil-usuario');
        if (perfil) {
            perfil.textContent = `Perfil: ${usuario}`;
        }
        // Esconde link de login e mostra nome
        const loginLink = document.getElementById('login-link');
        const nomeUsuario = document.getElementById('nome-usuario');
        if (loginLink && nomeUsuario) {
            loginLink.style.display = 'none';
            nomeUsuario.style.display = 'inline';
            nomeUsuario.textContent = usuario;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const email = localStorage.getItem('usuarioEmail');
    if (email) {
        document.getElementById('perfil-usuario').textContent = `Seu e-mail: ${email}`;
    }
});