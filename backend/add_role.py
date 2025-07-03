import sqlite3

conn = sqlite3.connect('banco.db')
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE usuarios ADD COLUMN role VARCHAR(20) DEFAULT 'user';")
    print("Coluna 'role' adicionada com sucesso!")
except Exception as e:
    print("Erro ao adicionar coluna:", e)
conn.commit()
conn.close()