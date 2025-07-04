import os
from flask import Flask, jsonify, request
from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuração do banco de dados
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///banco.db")
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Definição dos modelos do banco de dados
class Usuario(Base):
    __tablename__ = 'usuarios'
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    senha_hash = Column(String(128), nullable=False)
    endereco = Column(String(200))
    telefone = Column(String(20))
    cpf = Column(String(20))
    role = Column(String(20), default='user')

    # Outros campos como telefone, etc.

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(String, primary_key=True, index=True)
    nome = Column(String(50))
    produtos = relationship("Produto", back_populates="categoria")

class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), index=True)  # Adicionado index
    preco = Column(Float)
    imagem = Column(String(200))
    categoria_id = Column(String, ForeignKey("categorias.id"), index=True) # Adicionado index
    categoria = relationship("Categoria", back_populates="produtos")


# Função para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Rotas da API
@app.route('/api/registrar', methods=['POST'])
def registrar_usuario():
    with SessionLocal() as db:
        data = request.get_json()
        nome = data['nome']
        email = data['email']
        senha = data['senha']
        endereco = data.get('endereco', '')
        telefone = data.get('telefone', '')
        cpf = data.get('cpf', '')
        role = data.get('role', 'user')  # <-- Adicione esta linha

        if not nome or not email or not senha:
            return jsonify({'erro': 'Nome, email e senha são obrigatórios'}), 400

        if db.query(Usuario).filter_by(email=email).first():
            return jsonify({'erro': 'Email já cadastrado'}), 400

        senha_hash = generate_password_hash(senha)
        novo_usuario = Usuario(
            nome=nome, email=email, senha_hash=senha_hash,
            endereco=endereco, telefone=telefone, cpf=cpf, role=role  # <-- Inclua role aqui
        )
        db.add(novo_usuario)
        db.commit()
        return jsonify({'mensagem': 'Usuário registrado com sucesso'}), 201

@app.route('/api/login', methods=['POST'])
def login_usuario():
    with SessionLocal() as db:
        data = request.get_json()
        email = data['email']
        senha = data['senha']

        usuario = db.query(Usuario).filter_by(email=email).first()
        if not usuario or not check_password_hash(usuario.senha_hash, senha):
            return jsonify({'erro': 'Email ou senha incorretos'}), 401
        return jsonify({
            'mensagem': 'Login realizado com sucesso',
            'nome': usuario.nome,
            'email': usuario.email,
            'role': usuario.role  # <-- Inclua a role aqui
        }), 200

@app.route("/api/categorias", methods=["GET"])
def get_categorias():
    with SessionLocal() as db:
        categorias = db.query(Categoria).all()
        return jsonify([{"id": c.id, "nome": c.nome} for c in categorias])

@app.route("/api/produtos", methods=["GET"])
def get_produtos():
    with SessionLocal() as db:
        produtos = db.query(Produto).all()
        return jsonify([{"id": p.id, "nome": p.nome, "preco": p.preco, "imagem": p.imagem, "categoriaId": p.categoria_id} for p in produtos])

@app.route("/api/produtos", methods=["POST"])
def adicionar_produto():
    with SessionLocal() as db:
        data = request.get_json()
        nome = data.get('nome')
        preco = data.get('preco')
        imagem = data.get('imagem')
        categoria_id = data.get('categoriaId')

        if not all([nome, preco, categoria_id]):
            return jsonify({"message": "Nome, preço e categoria são obrigatórios."}), 400

        try:
            novo_produto = Produto(nome=nome, preco=preco, imagem=imagem, categoria_id=categoria_id)
            db.add(novo_produto)
            db.commit()
            return jsonify({"message": "Produto adicionado com sucesso!", "id": novo_produto.id}), 201
        except Exception as e:
            db.rollback()
            return jsonify({"message": f"Erro ao adicionar produto: {str(e)}"}), 500

@app.route("/api/produtos/<int:produto_id>", methods=["PUT"])
def editar_produto(produto_id):
    with SessionLocal() as db:
        data = request.get_json()
        nome = data.get('nome')
        preco = data.get('preco')
        imagem = data.get('imagem')
        categoria_id = data.get('categoriaId')

        if not all([nome, preco, categoria_id]):
            return jsonify({"message": "Nome, preço e categoria são obrigatórios."}), 400

        try:
            produto = db.query(Produto).filter_by(id=produto_id).first()
            if produto:
                produto.nome = nome
                produto.preco = preco
                produto.imagem = imagem
                produto.categoria_id = categoria_id
                db.commit()
                return jsonify({"message": "Produto atualizado com sucesso!"}), 200
            else:
                return jsonify({"message": "Produto não encontrado."}), 404
        except Exception as e:
            db.rollback()
            return jsonify({"message": f"Erro ao atualizar produto: {str(e)}"}), 500

@app.route("/api/produtos/<int:produto_id>", methods=["DELETE"])
def excluir_produto(produto_id):
    with SessionLocal() as db:
        try:
            produto = db.query(Produto).filter_by(id=produto_id).first()
            if produto:
                db.delete(produto)
                db.commit()
                return jsonify({"message": "Produto excluído com sucesso!"}), 200
            else:
                return jsonify({"message": "Produto não encontrado."}), 404
        except Exception as e:
            db.rollback()
            return jsonify({"message": f"Erro ao excluir produto: {str(e)}"}), 500

@app.route("/api/categorias/<categoria_id>/produtos", methods=["GET"])
def get_produtos_por_categoria(categoria_id):
    with SessionLocal() as db:
        produtos = db.query(Produto).filter(Produto.categoria_id == categoria_id).all()
        return jsonify([{"id": p.id, "nome": p.nome, "preco": p.preco, "imagem": p.imagem, "categoriaId": p.categoria_id} for p in produtos])

@app.route('/api/atualizar-perfil', methods=['POST'])
def atualizar_perfil():
    with SessionLocal() as db:
        data = request.get_json()
        email = data.get('email')  # Use o email do usuário logado para identificar

        usuario = db.query(Usuario).filter_by(email=email).first()
        if not usuario:
            return jsonify({'erro': 'Usuário não encontrado'}), 404

        usuario.endereco = data.get('endereco', usuario.endereco)
        usuario.telefone = data.get('telefone', usuario.telefone)
        usuario.cpf = data.get('cpf', usuario.cpf)
        db.commit()
        return jsonify({'mensagem': 'Perfil atualizado com sucesso'})

@app.route('/api/perfil', methods=['GET'])
def get_perfil():
    with SessionLocal() as db:
        email = request.args.get('email')
        usuario = db.query(Usuario).filter_by(email=email).first()
        if not usuario:
            return jsonify({'erro': 'Usuário não encontrado'}), 404
        return jsonify({
            'nome': usuario.nome,
            'email': usuario.email,
            'endereco': usuario.endereco,
            'telefone': usuario.telefone,
            'cpf': usuario.cpf
        })

@app.route('/api/usuarios', methods=['GET'])
def listar_usuarios():
    with SessionLocal() as db:
        usuarios = db.query(Usuario).all()
        return jsonify([
            {
                "id": u.id,
                "nome": u.nome,
                "email": u.email,
                "endereco": u.endereco,
                "telefone": u.telefone,
                "cpf": u.cpf,
                "role": u.role  # <-- Adicione esta linha
            } for u in usuarios
        ])

@app.route('/api/usuario/<int:id>', methods=['GET', 'PUT'])
def usuario(id):
    with SessionLocal() as db:
        usuario = db.query(Usuario).filter_by(id=id).first()
        if not usuario:
            return jsonify({'erro': 'Usuário não encontrado'}), 404

        if request.method == 'GET':
            return jsonify({
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
                "endereco": usuario.endereco,
                "telefone": usuario.telefone,
                "cpf": usuario.cpf,
                "role": usuario.role  # <-- Adicione esta linha
            })
        elif request.method == 'PUT':
            data = request.get_json()
            usuario.nome = data.get('nome', usuario.nome)
            usuario.email = data.get('email', usuario.email)
            usuario.endereco = data.get('endereco', usuario.endereco)
            usuario.telefone = data.get('telefone', usuario.telefone)
            usuario.cpf = data.get('cpf', usuario.cpf)
            usuario.role = data.get('role', usuario.role)
            db.commit()
            return jsonify({'mensagem': 'Usuário atualizado com sucesso'})

@app.route('/api/usuario/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    with SessionLocal() as db:
        usuario = db.query(Usuario).filter_by(id=id).first()
        if not usuario:
            return jsonify({'erro': 'Usuário não encontrado'}), 404
        db.delete(usuario)
        db.commit()
        return jsonify({'mensagem': 'Usuário excluído com sucesso'})

@app.route('/api/produtos/<int:id>', methods=['GET'])
def get_produto(id):
    with SessionLocal() as db:
        produto = db.query(Produto).filter_by(id=id).first()
        if not produto:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        return jsonify({
            "id": produto.id,
            "nome": produto.nome,
            "categoria": produto.categoria.nome if produto.categoria else None,
            "categoriaId": produto.categoria_id,
            "preco": produto.preco,
            "imagem": produto.imagem
        })

Base.metadata.create_all(engine)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
