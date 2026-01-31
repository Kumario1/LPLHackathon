.PHONY: install test lint format run clean

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

test:
	pytest -c backend/pytest.ini -v

lint:
	ruff check backend/
	mypy backend/ || true

format:
	black backend/
	isort backend/
	cd frontend && npm run format

run:
	uvicorn backend.main:app --reload

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
