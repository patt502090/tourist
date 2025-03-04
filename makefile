.PHONY: install start build test lint clean clean-build reset deploy docker-build docker-push

install:
	cd ./frontend && yarn install
	cd ./backend && yarn install

start:
	cd ./frontend && yarn dev & \
	cd ./backend && yarn start:dev

build:
	cd ./frontend && yarn build
	cd ./backend && yarn build

test:
	cd ./frontend && yarn test || echo "No tests in frontend"
	cd ./backend && yarn test || echo "No tests in backend"

lint:
	cd ./frontend && yarn lint
	cd ./backend && yarn lint

clean:
	rm -rf ./frontend/node_modules ./backend/node_modules
	$(MAKE) install

clean-build:
	rm -rf ./frontend/dist ./frontend/build ./backend/dist ./backend/build

reset: clean clean-build
	$(MAKE) install

docker-build:
	docker build -t asia-southeast1-docker.pkg.dev/tourist-452409/tourist-repo/frontend:latest \
		--build-arg VITE_API_BASE_URL="https://porametix.online" \
		--build-arg VITE_JUDGEAPI_BASE_URL="https://judge0-ce.p.rapidapi.com" \
		--build-arg VITE_JUDGEAPI_API_KEY="your-api-key" \
		--build-arg VITE_JUDGEAPI_HOST="judge0-ce.p.rapidapi.com" \
		--build-arg VITE_GUEST_USER_PASSWORD="GuestGuest" \
		--build-arg VITE_GUEST_USER_EMAIL="Guest@Guest.com" \
		-f ./frontend/Dockerfile ./frontend
	docker build -t asia-southeast1-docker.pkg.dev/tourist-452409/tourist-repo/backend:latest -f ./backend/Dockerfile ./backend

docker-push: docker-build
	gcloud auth configure-docker asia-southeast1-docker.pkg.dev
	docker push asia-southeast1-docker.pkg.dev/tourist-452409/tourist-repo/frontend:latest
	docker push asia-southeast1-docker.pkg.dev/tourist-452409/tourist-repo/backend:latest

deploy:
	gcloud container clusters get-credentials tourist-cluster --region asia-southeast1
	kubectl apply -f ./k8s/backend-deployment.yaml
	kubectl apply -f ./k8s/frontend-deployment.yaml
	kubectl apply -f ./k8s/cluster-issuer.yaml