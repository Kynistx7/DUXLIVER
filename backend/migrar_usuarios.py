import sqlite3

# Caminhos dos bancos
banco_origem = 'banco_antigo.db'   # Altere para o nome do seu banco antigo
banco_destino = 'banco.db'         # O novo banco, já com a coluna 'role'

# Conexão com os bancos
conn_origem = sqlite3.connect(banco_origem)
conn_destino = sqlite3.connect(banco_destino)

cursor_origem = conn_origem.cursor()
cursor_destino = conn_destino.cursor()

# Busca os dados da tabela de origem
cursor_origem.execute("SELECT id, nome, email, senha_hash, endereco, telefone, cpf FROM usuarios")
usuarios = cursor_origem.fetchall()

# Insere os dados no banco de destino
for usuario in usuarios:
    # Adiciona o valor padrão 'user' para a coluna 'role'
    cursor_destino.execute(
        "INSERT INTO usuarios (id, nome, email, senha_hash, endereco, telefone, cpf, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (*usuario, 'user')
    )

conn_destino.commit()
print(f"{len(usuarios)} usuários migrados com sucesso!")

conn_origem.close()
conn_destino.close()