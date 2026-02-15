from ai.db.base import Base
from ai.db.session import engine
from ai.db.models import user, qa

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
