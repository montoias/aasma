npm:
	cd proj/; \
	npm install; \
	cd node_modules; \
	rm -rf mineflayer; \
	git clone https://github.com/andrewrk/mineflayer; \
	cd mineflayer; \
	git reset --hard 3fa3141dc54f2e74b4bce291511ab6b67c1e11f2; \
	npm install; \
