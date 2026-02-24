from backend.db.base import Base
from backend.db.session import engine
from backend.db.models import user, qa

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
