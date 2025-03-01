# Makefile for a Yarn-based project with frontend and backend

# Install dependencies for both frontend and backend
install:
	cd frontend && yarn install
	cd backend && yarn install

# Start the development servers
start:
	cd frontend && yarn start &
	cd backend && yarn start

# Build both frontend and backend
build:
	cd frontend && yarn build
	cd backend && yarn build

# Run tests for both frontend and backend
test:
	cd frontend && yarn test
	cd backend && yarn test

# Lint the code for both frontend and backend
lint:
	cd frontend && yarn lint
	cd backend && yarn lint

# Clean node_modules and reinstall dependencies
clean:
	rm -rf frontend/node_modules backend/node_modules && install

# Remove build artifacts
clean-build:
	rm -rf frontend/dist frontend/build backend/dist backend/build

# Full reset of the project
reset: clean clean-build
	install

