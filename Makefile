.PHONY: fe be dev setup install-fe install-be

setup: install-fe install-be

install-fe:
	npm ci || npm install

install-be:
	cd backend && python -m venv .venv || true
	cd backend && . .venv/bin/activate && pip install -U pip && pip install -r requirements.txt

fe:
	npm run frontend:dev

be:
	cd backend && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

dev:
	@echo "Run backend and frontend in two terminals:"
	@echo "  make be"
	@echo "  make fe"
